import { paginationOptsValidator } from "convex/server"
import { internalMutation, internalQuery, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { components, internal } from "./_generated/api"
import RateLimiter from "@convex-dev/rate-limiter"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    updateOrderStatus: {
        kind: "token bucket",
        rate: 30,
        period: 60000,
        capacity: 30,
    },
})

export const getDashboardData = query({
    args: {},
    handler: async (ctx) => {
        // 1. Auth check
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const admin = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!admin || admin.role !== "admin") throw new Error("Unauthorized")

        const now = new Date()
        const currentYear = now.getFullYear()
        const yearStart = new Date(currentYear, 0, 1).getTime()
        const yearEnd   = new Date(currentYear + 1, 0, 1).getTime()

        // 2. Parallel: pre-computed stats + current-year orders + active products + recent docs
        const [statsDoc, currentYearOrders, activeProducts, recentOrderDocs, recentUserDocs] = await Promise.all([
            ctx.db.query("dashboardStats").first(),
            ctx.db.query("orders")
                .withIndex("by_created_at", (q) => q.gte("createdAt", yearStart).lt("createdAt", yearEnd))
                .collect(),
            ctx.db.query("products")
                .withIndex("by_status", (q) => q.eq("status", "active"))
                .collect(),
            ctx.db.query("orders")
                .withIndex("by_created_at", (q) => q.gte("createdAt", 0))
                .order("desc")
                .take(5),
            ctx.db.query("users").order("desc").take(5),
        ])

        // 3. Stats: fast path if statsDoc exists, otherwise count from raw data (pre-init fallback)
        let totalRevenue, totalOrders, totalProducts, totalUsers, needsInit
        if (statsDoc) {
            totalRevenue  = statsDoc.totalRevenue
            totalOrders   = statsDoc.totalOrders
            totalProducts = statsDoc.totalProducts
            totalUsers    = statsDoc.totalUsers
            needsInit     = false
        } else {
            const [allOrdersFb, allUsersFb, allProductsFb] = await Promise.all([
                ctx.db.query("orders").collect(),
                ctx.db.query("users").collect(),
                ctx.db.query("products").collect(),
            ])
            totalRevenue  = allOrdersFb.reduce((acc, o) => acc + o.totalAmount, 0)
            totalOrders   = allOrdersFb.length
            totalUsers    = allUsersFb.length
            totalProducts = allProductsFb.length
            needsInit     = true
        }

        // 4a. Order status breakdown (year-to-date, free — derived from already-loaded data)
        const statusBreakdown = { paid: 0, processing: 0, delivering: 0, delivered: 0, cancelled: 0, refunded: 0 }
        currentYearOrders.forEach(o => { if (statusBreakdown[o.status] !== undefined) statusBreakdown[o.status]++ })

        // 4b. Month-over-month deltas for revenue and orders (free — derived from already-loaded data)
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()
        const thisMonthOrders = currentYearOrders.filter(o => o.createdAt >= thisMonthStart)
        const lastMonthOrders = currentYearOrders.filter(o => o.createdAt >= lastMonthStart && o.createdAt < thisMonthStart)
        const momRevThis = thisMonthOrders.reduce((s, o) => o.status !== "refunded" ? s + o.totalAmount : s, 0)
        const momRevLast = lastMonthOrders.reduce((s, o) => o.status !== "refunded" ? s + o.totalAmount : s, 0)
        const momPct = (curr, prev) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100)
        const momDeltas = {
            revenue: momPct(momRevThis, momRevLast),
            orders:  momPct(thisMonthOrders.length, lastMonthOrders.length),
        }

        // 4c. Top products + categories (year-to-date, zero extra reads for products,
        //     at most 5 targeted category reads for names)
        const productCategoryMap = {}
        activeProducts.forEach(p => { productCategoryMap[p._id] = p.categoryId })

        const productSalesMap  = {}
        const categorySalesMap = {}
        currentYearOrders.forEach(order => {
            if (order.status === "refunded") return
            order.products.forEach(item => {
                const catId = productCategoryMap[item.productId]
                if (!productSalesMap[item.productId])
                    productSalesMap[item.productId] = { name: item.nameAtPurchase, units: 0 }
                productSalesMap[item.productId].units += item.quantity
                if (catId) {
                    if (!categorySalesMap[catId]) categorySalesMap[catId] = { revenue: 0 }
                    categorySalesMap[catId].revenue += item.priceAtPurchase * item.quantity
                }
            })
        })

        const topProductEntries  = Object.entries(productSalesMap).sort((a, b) => b[1].units - a[1].units).slice(0, 5)
        const topCategoryEntries = Object.entries(categorySalesMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5)

        const topCatDocs = await Promise.all(topCategoryEntries.map(([id]) => ctx.db.get(id)))
        const topCatNameMap = {}
        topCatDocs.forEach(doc => { if (doc) topCatNameMap[doc._id] = doc.name })

        const topSellingProducts = topProductEntries.map(([, d]) => ({ name: d.name.en, value: d.units }))
        const topCategories      = topCategoryEntries.map(([id, d]) => ({
            name:  topCatNameMap[id]?.en ?? "Other",
            value: Math.round(d.revenue * 100) / 100,
        }))

        // 4. Revenue history — exclude refunded orders so the chart matches the stat card
        const revenueHistory = Array.from({ length: 12 }, (_, i) => {
            const monthName = new Date(currentYear, i).toLocaleDateString("en-US", { month: "short" })
            const revenue = currentYearOrders.reduce((acc, order) => {
                if (order.status === "refunded") return acc
                return new Date(order.createdAt).getMonth() === i ? acc + order.totalAmount : acc
            }, 0)
            return { name: monthName, revenue }
        })

        // 5. Top 5 buyers this year — exclude refunded orders from spend totals
        const buyerMap = {}
        currentYearOrders.forEach(order => {
            if (order.status === "refunded") return
            const uid = order.userId
            if (!buyerMap[uid]) buyerMap[uid] = { totalSpent: 0, orderCount: 0 }
            buyerMap[uid].totalSpent  += order.totalAmount
            buyerMap[uid].orderCount++
        })

        const topBuyerEntries = Object.entries(buyerMap)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
            .slice(0, 5)

        // 6. Fetch only the specific users we actually need (max ~10 targeted reads)
        const neededUserIds = [
            ...new Set([
                ...topBuyerEntries.map(([uid]) => uid),
                ...recentOrderDocs.map(o => o.userId),
            ])
        ]
        const fetchedUsers = await Promise.all(neededUserIds.map(id => ctx.db.get(id)))
        const userLookup = {}
        fetchedUsers.forEach(u => { if (u) userLookup[u._id] = u })

        // 7. Top buyers with names
        const topBuyers = topBuyerEntries.map(([uid, stats]) => {
            const u = userLookup[uid]
            return {
                userId:      uid,
                name:        u?.name     ?? "Unknown",
                email:       u?.email    ?? "",
                imageURL:    u?.imageURL ?? "",
                totalOrders: stats.orderCount,
                totalSpent:  stats.totalSpent,
            }
        })

        // 8. Low stock from active products only (no draft/inactive products loaded)
        const lowStockRaw = activeProducts
            .filter(p => p.stock < 10)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 10)

        const uniqueCatIds = [...new Set(lowStockRaw.map(p => p.categoryId))]
        const catDocs      = await Promise.all(uniqueCatIds.map(id => ctx.db.get(id)))
        const catLookup    = {}
        catDocs.forEach(doc => { if (doc) catLookup[doc._id] = doc.name })

        const lowStockProducts = lowStockRaw.map(p => ({
            _id:          p._id,
            name:         p.name,
            thumbnail:    p.thumbnail,
            stock:        p.stock,
            categoryName: catLookup[p.categoryId] ?? { en: "Uncategorized", ar: "بدون تصنيف" },
        }))

        // 9. Recent orders enriched with buyer name
        const recentOrders = recentOrderDocs.map(order => ({
            _id:         order._id,
            userName:    userLookup[order.userId]?.name ?? "Unknown",
            totalAmount: order.totalAmount,
            status:      order.status,
            createdAt:   order.createdAt,
            itemCount:   order.products.length,
        }))

        // 10. Recent users sanitized
        const recentUsers = recentUserDocs.map(u => ({
            _id:      u._id,
            name:     u.name,
            email:    u.email,
            role:     u.role,
            imageURL: u.imageURL,
            joinedAt: u._creationTime,
        }))

        // 11. Recent notifications
        const recentNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_created_at")
            .order("desc")
            .take(5)

        return {
            stats: { totalRevenue, totalOrders, totalProducts, totalUsers },
            revenueHistory,
            statusBreakdown,
            momDeltas,
            topSellingProducts,
            topCategories,
            lowStockProducts,
            topBuyers,
            recentOrders,
            recentUsers,
            recentNotifications,
            needsInit,
        }
    },
})

export const getAdminNotifications = query({
    args: {
        paginationOpts: paginationOptsValidator,
        search: v.optional(v.string()),
        typeFilter: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Get the authenticated person's Clerk ID
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user || user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required")
        }

        const typeFilters = ["order_status", "promotion", "alert", "inventory"]

        if (args.search && args.search.trim().length > 200) throw new Error("Search query too long")

        // 2. SEARCH MODE
        // If user typed something, use the Search Index
        if (args.search && args.search.trim().length > 0) {
            return await ctx.db
                .query("notifications")
                .withSearchIndex("search_all", (q) => {
                    // Search across the combined field now
                    const search = q.search("searchTexts", args.search)
                    if (args.typeFilter && typeFilters.includes(args.typeFilter)) {
                        return search.eq("type", args.typeFilter)
                    }
                    return search
                })
                .paginate(args.paginationOpts)
        }

        // 3. REGULAR LISTING MODE
        // If no search, use standard indexes to allow .order("desc") by date
        let notificationQuery

        if (args.typeFilter && typeFilters.includes(args.typeFilter)) {
            notificationQuery = ctx.db
                .query("notifications")
                .withIndex("by_type_and_created", (q) =>
                q.eq("type", args.typeFilter)
            )
        } else {
            notificationQuery = ctx.db
                .query("notifications")
                .withIndex("by_created_at")
        }

        return await notificationQuery
            .order("desc") 
            .paginate(args.paginationOpts)
    }
})

export const getAllUsers = query({
    args: {
        paginationOpts: paginationOptsValidator,
        search: v.optional(v.string()),
        roleFilter: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Admin access required")
        }

        const roleFilters = ["user", "admin"]
        const searchTerm = args.search?.trim()
        if (searchTerm && searchTerm.length > 200) throw new Error("Search query too long")

        // 2. SEARCH MODE
        if (searchTerm && searchTerm.length > 0) {
            return await ctx.db
                .query("users")
                .withSearchIndex("search_all", (q) => {
                    const search = q.search("email", searchTerm)
                    if (args.roleFilter && roleFilters.includes(args.roleFilter)) {
                        return search.eq("role", args.roleFilter)
                    }
                    return search
                })
                .paginate(args.paginationOpts)
        }

        // 3. REGULAR LISTING MODE
        let userQuery

        if (args.roleFilter && roleFilters.includes(args.roleFilter)) {
            userQuery = ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", args.roleFilter))
        } else {
            // Use the default order (usually by creation time)
            userQuery = ctx.db.query("users")
        }

        return await userQuery
            .order("desc")
            .paginate(args.paginationOpts)
    }
})

const VALID_TRANSITIONS = {
    paid:       ["processing", "cancelled"],
    processing: ["delivering", "cancelled"],
    delivering: ["delivered"],
    delivered:  [],
    cancelled:  [],
    refunded:   [],
}

export const getOrderDetails = query({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return null

        const admin = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()
        if (!admin || admin.role !== "admin") return null

        const validId = ctx.db.normalizeId("orders", args.orderId)
        if (!validId) return null

        const order = await ctx.db.get(validId)
        if (!order) return null

        const customer = await ctx.db.get(order.userId)

        return {
            ...order,
            customerName:  customer?.name     ?? "Unknown",
            customerEmail: customer?.email    ?? "",
            customerImage: customer?.imageURL ?? "",
        }
    },
})

export const getAllOrders = query({
    args: {
        paginationOpts: paginationOptsValidator,
        statusFilter: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const admin = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()
        if (!admin || admin.role !== "admin") throw new Error("Unauthorized")

        const validStatuses = Object.keys(VALID_TRANSITIONS)
        let orderQuery

        if (args.statusFilter && validStatuses.includes(args.statusFilter)) {
            orderQuery = ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", args.statusFilter))
        } else {
            orderQuery = ctx.db.query("orders").withIndex("by_created_at")
        }

        const page = await orderQuery.order("desc").paginate(args.paginationOpts)

        const ordersWithCustomer = await Promise.all(
            page.page.map(async (order) => {
                const user = await ctx.db.get(order.userId)
                return {
                    ...order,
                    customerName:  user?.name  ?? "Unknown",
                    customerEmail: user?.email ?? "",
                }
            })
        )

        return { ...page, page: ordersWithCustomer }
    },
})

export const updateOrderStatus = mutation({
    args: {
        orderId:        v.id("orders"),
        // "refunded" is intentionally excluded — use the refundOrder action which
        // processes the actual Stripe refund before setting this status.
        status:         v.union(
            v.literal("processing"),
            v.literal("delivering"),
            v.literal("delivered"),
            v.literal("cancelled"),
        ),
        trackingNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { success: false, error: "Unauthenticated" }

        const admin = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()
        if (!admin || admin.role !== "admin") return { success: false, error: "Unauthorized" }

        const rl = await rateLimiter.limit(ctx, "updateOrderStatus", { key: identity.subject })
        if (!rl.ok) return { success: false, error: "Too many requests. Please wait a moment." }

        const order = await ctx.db.get(args.orderId)
        if (!order) return { success: false, error: "Order not found" }

        const allowed = VALID_TRANSITIONS[order.status] ?? []
        if (!allowed.includes(args.status)) {
            return { success: false, error: `Cannot move order from "${order.status}" to "${args.status}"` }
        }

        if (args.status === "delivering" && args.trackingNumber) {
            const clean = args.trackingNumber.trim()
            if (clean.length > 100) return { success: false, error: "Tracking number is too long" }
        }

        const patch = { status: args.status }
        if (args.trackingNumber?.trim()) patch.trackingNumber = args.trackingNumber.trim()

        await ctx.db.patch(args.orderId, patch)

        await ctx.runMutation(internal.notifications.notifyAdmins, {
            userId: identity.subject,
            title: { en: `Order Status Updated: ${args.status.toUpperCase()} 📦`, ar: `تم تحديث حالة الطلب: ${args.status} 📦` },
            body: {
                en: `Order #${args.orderId.slice(-8).toUpperCase()} moved to "${args.status}" by ${admin.name}.`,
                ar:  `تم تحديث الطلب #${args.orderId.slice(-8).toUpperCase()} إلى "${args.status}" بواسطة ${admin.name}.`,
            },
            type: "order_status",
        })

        return { success: true }
    },
})

export const getAllProducts = query({
    args: {
        paginationOpts: paginationOptsValidator,
        search: v.optional(v.string()),
        statusFilter: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. SECURITY & ADMIN CHECK
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const currentUser = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
        .unique()

        if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
        }

        const validStatuses = ["active", "draft"]
        const searchTerm = args.search?.trim()
        if (searchTerm && searchTerm.length > 200) throw new Error("Search query too long")
        let page

        // 2. FETCH THE PRODUCTS (Search Mode or Regular Mode)
        if (searchTerm && searchTerm.length > 0) {
            page = await ctx.db
                .query("products")
                .withSearchIndex("search_all", (q) => {
                    const search = q.search("searchTexts", searchTerm)
                    if (args.statusFilter && validStatuses.includes(args.statusFilter)) {
                        return search.eq("status", args.statusFilter)
                    }
                    return search
                    })
                    .paginate(args.paginationOpts)
        } else {
            let productQuery
            if (args.statusFilter && validStatuses.includes(args.statusFilter)) {
                productQuery = ctx.db
                .query("products")
                .withIndex("by_status", (q) => q.eq("status", args.statusFilter))
            } else {
                productQuery = ctx.db.query("products")
            }
            page = await productQuery.order("desc").paginate(args.paginationOpts)
        }

        // 3. EFFICIENT CATEGORY NAME RESOLUTION
        const uniqueCategoryIds = [...new Set(page.page.map((p) => p.categoryId))]

        const categoryDocs = await Promise.all(
            uniqueCategoryIds.map((id) => ctx.db.get(id))
        )

        const categoryLookup = {}
            categoryDocs.forEach((doc) => {
            if (doc) {
                categoryLookup[doc._id] = doc.name
            }
        })

        return {
            ...page,
            page: page.page.map((product) => ({
                ...product,
                categoryName: categoryLookup[product.categoryId] || { 
                    en: "Uncategorized", 
                    ar: "بدون تصنيف" 
                },
            })),
        }
    },
})

export const getAllCategories = query({
    args: {
        paginationOpts: paginationOptsValidator,
        search: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Admin access required")
        }

        const searchTerm = args.search?.trim()
        if (searchTerm && searchTerm.length > 200) throw new Error("Search query too long")

        // 2. SEARCH MODE
        if (searchTerm && searchTerm.length > 0) {
            return await ctx.db
                .query("categories")
                .withSearchIndex("search_all", (q) => {
                    const search = q.search("searchTexts", searchTerm)
                    return search
                })
                .paginate(args.paginationOpts)
        }

        // 3. REGULAR LISTING MODE
        return await ctx.db
            .query("categories")
            .order("desc")
            .paginate(args.paginationOpts)
    }
})

export const getCategoryById = internalQuery({
    args: { id: v.id("categories") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    },
})

export const createCategoryRecord = internalMutation({
    args: {
        name: v.object({ en: v.string(), ar: v.string() }),
        description: v.object({ en: v.string(), ar: v.string() }),
        thumbnail: v.string(),
        slug: v.string(),
        userId: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("categories", {
            name: args.name,
            description: args.description,
            thumbnail: args.thumbnail,
            slug: args.slug,
            searchTexts: `${args.name.en} ${args.name.ar} ${args.description.en} ${args.description.ar}`,
            updatedAt: Date.now(),
            productCount: 0,
        })

        await ctx.runMutation(internal.notifications.notifyAdmins, {
            userId: args.userId,
            title: {
                en: "Inventory: New Category Created 📁",
                ar: "المخزون: تم إنشاء فئة جديدة 📁"
            },
            body: {
                en: `A new category "${args.name.en}" has been successfully added to the catalog.`,
                ar: `تم إضافة فئة جديدة باسم "${args.name.ar}" بنجاح إلى الكتالوج.`
            },
            type: "alert"
        })
    }
})

export const createProductRecord = internalMutation({
    args: {
        userId: v.string(),
        name: v.object({ en: v.string(), ar: v.string() }),
        description:  v.object({ en: v.string(), ar: v.string() }),
        thumbnail: v.string(),
        categoryId: v.id("categories"),
        price: v.number(),
        discount: v.number(),
        stock: v.number(),
        material: v.object({ en: v.string(), ar: v.string() }),
        dimensions: v.string(),
        weight: v.number(),
        features: v.array(v.object({ en: v.string(), ar: v.string() }),),
        colors: v.array(
            v.object({
                code: v.string(),
                name: v.object({
                    en: v.string(),
                    ar: v.string()
                })
            })
        ),
        slug: v.string(),
        dimensionRange: v.optional(v.object({
            h: v.object({ min: v.number(), max: v.number() }),
            w: v.object({ min: v.number(), max: v.number() }),
            d: v.object({ min: v.number(), max: v.number() }),
        })),
        leadTimeDays: v.optional(v.number()),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("products", {
            categoryId: args.categoryId,
            updatedAt: Date.now(),
            thumbnail: args.thumbnail,
            name: args.name,
            description: args.description,
            price: args.price,
            discount: args.discount,
            stock: args.stock,
            status: "active",
            details: {
                material: args.material,
                standardDimensions: args.dimensions,
                weight: args.weight
            },
            searchTexts: `${args.name.en} ${args.name.ar} ${args.description.en} ${args.description.ar}`,
            features: args.features,
            colors: args.colors,
            slug: args.slug,
            materialKey: args.material.en.toLowerCase(),
            dimensionRange: args.dimensionRange,
            leadTimeDays: args.leadTimeDays,
            isFeatured: args.isFeatured,
        })

        const category = await ctx.db.get(args.categoryId)
        if (category) {
            await ctx.db.patch(args.categoryId, {
                productCount: (category.productCount ?? 0) + 1
            })
        }

        await Promise.all([
            ctx.runMutation(internal.notifications.notifyAdmins, {
                userId: args.userId,
                title: {
                    en: "Inventory: New Product Added 📦",
                    ar: "المخزون: تم إضافة منتج جديد 📦"
                },
                body: {
                    en: `Product "${args.name.en}" has been added with ${args.stock} units in stock.`,
                    ar: `تم إضافة المنتج "${args.name.ar}" مع ${args.stock} وحدة في المخزن.`
                },
                type: "inventory"
            }),
            ctx.runMutation(internal.stats.patch, { totalProducts: 1 }),
        ])
    }
})

export const updateCategoryRecord = internalMutation({
    args: {
        id: v.id("categories"),
        name: v.optional(v.object({ en: v.string(), ar: v.string() })), 
        description: v.optional(v.object({ en: v.string(), ar: v.string() })),
        thumbnail: v.optional(v.string()),
        slug: v.optional(v.string()),
        userId: v.string()
    },
    handler: async (ctx, args) => {
        const { id, userId, ...updates } = args

        const existing = await ctx.db.get(id)
        if (!existing) throw new Error("Category not found")

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        )

        if (updates.name || updates.description) {
            const newName = updates.name ?? existing.name
            const newDesc = updates.description ?? existing.description
            filteredUpdates.searchTexts = `${newName.en} ${newName.ar} ${newDesc.en} ${newDesc.ar}`
        }

        filteredUpdates.updatedAt = Date.now()
        await ctx.db.patch(id, filteredUpdates)

        const categoryNameEn = updates.name?.en || existing.name.en
        const categoryNameAr = updates.name?.ar || existing.name.ar

        await ctx.runMutation(internal.notifications.notifyAdmins, {
            userId: userId,
            title: {
                en: "Inventory: Category Updated ✏️",
                ar: "المخزون: تم تحديث الفئة ✏️"
            },
            body: {
                en: `The category "${categoryNameEn}" has been successfully updated.`,
                ar: `تم تحديث فئة "${categoryNameAr}" بنجاح.`
            },
            type: "alert"
        })
    }
})

export const getCategoryRecord = internalQuery({
    args: { id: v.id("categories") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    }
})

export const deleteCategoryRecord = internalMutation({
    args: { id: v.id("categories"), userId: v.string() },
    handler: async (ctx, args) => {
        const category = await ctx.db.get(args.id)
        if (!category) throw new Error("Category not found")

        const products = await ctx.db
            .query("products")
            .withIndex("by_category_id", (q) => q.eq("categoryId", args.id))
            .collect()

        await Promise.all(
            products.map((p) => ctx.db.patch(p._id, { status: "draft" }))
        )

        await ctx.db.delete(args.id)

        await ctx.runMutation(internal.notifications.notifyAdmins, {
            userId: args.userId,
            title: {
                en: "Inventory: Category Deleted 🗑️",
                ar: "المخزون: تم حذف الفئة 🗑️"
            },
            body: {
                en: `Category "${category.name.en}" was deleted. ${products.length} product(s) moved to draft.`,
                ar: `تم حذف الفئة "${category.name.ar}". ${products.length} منتج تم نقله إلى المسودة.`
            },
            type: "alert"
        })
    }
})

export const getProductRecord = internalQuery({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    }
})

export const getProductForAdmin = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return null

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user || user.role !== "admin") return null

        const validId = ctx.db.normalizeId("products", args.id)
        if (!validId) return null

        const product = await ctx.db.get(validId)
        if (!product) return null

        const category = product.categoryId ? await ctx.db.get(product.categoryId) : null

        return { ...product, categoryDetails: category }
    },
})

export const updateProductRecord = internalMutation({
    args: {
        id: v.id("products"),
        userId: v.string(),
        name:        v.optional(v.object({ en: v.string(), ar: v.string() })),
        description: v.optional(v.object({ en: v.string(), ar: v.string() })),
        categoryId:  v.optional(v.id("categories")),
        thumbnail:   v.optional(v.string()),
        price:       v.optional(v.number()),
        discount:    v.optional(v.number()),
        stock:       v.optional(v.number()),
        material:    v.optional(v.object({ en: v.string(), ar: v.string() })),
        dimensions:  v.optional(v.string()),
        weight:      v.optional(v.number()),
        features:    v.optional(v.array(v.object({ en: v.string(), ar: v.string() }))),
        colors: v.optional(v.array(v.object({
            code: v.string(),
            name: v.object({ en: v.string(), ar: v.string() }),
        }))),
        dimensionRange: v.optional(v.object({
            h: v.object({ min: v.number(), max: v.number() }),
            w: v.object({ min: v.number(), max: v.number() }),
            d: v.object({ min: v.number(), max: v.number() }),
        })),
        leadTimeDays: v.optional(v.number()),
        isFeatured:   v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...updates } = args

        const existing = await ctx.db.get(id)
        if (!existing) throw new Error("Product not found")

        const { material, dimensions, weight, ...restUpdates } = updates

        const patch = Object.fromEntries(
            Object.entries(restUpdates).filter(([, v]) => v !== undefined)
        )

        if (material !== undefined || dimensions !== undefined || weight !== undefined) {
            patch.details = {
                ...existing.details,
                ...(material !== undefined && { material }),
                ...(dimensions !== undefined && { standardDimensions: dimensions }),
                ...(weight !== undefined && { weight }),
            }
        }

        if (material) patch.materialKey = material.en.toLowerCase()

        if (updates.name || updates.description) {
            const n = updates.name ?? existing.name
            const d = updates.description ?? existing.description
            patch.searchTexts = `${n.en} ${n.ar} ${d.en} ${d.ar}`
        }

        if (updates.name) {
            patch.slug = updates.name.en
                .toLowerCase().trim()
                .replace(/[^\w ]+/g, "")
                .replace(/ +/g, "-")
        }

        patch.updatedAt = Date.now()
        await ctx.db.patch(id, patch)

        await ctx.runMutation(internal.notifications.notifyAdmins, {
            userId,
            title: { en: "Inventory: Product Updated ✏️", ar: "المخزون: تم تحديث المنتج ✏️" },
            body: {
                en: `Product "${existing.name.en}" has been updated.`,
                ar: `تم تحديث المنتج "${existing.name.ar}".`,
            },
            type: "inventory",
        })
    },
})

export const deleteProductRecord = internalMutation({
    args: { id: v.id("products"), userId: v.string() },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id)
        if (!product) throw new Error("Product not found")

        await ctx.db.delete(args.id)

        const category = await ctx.db.get(product.categoryId)
        if (category) {
            await ctx.db.patch(product.categoryId, {
                productCount: Math.max(0, (category.productCount ?? 1) - 1)
            })
        }

        await Promise.all([
            ctx.runMutation(internal.notifications.notifyAdmins, {
                userId: args.userId,
                title: {
                    en: "Inventory: Product Deleted 🗑️",
                    ar: "المخزون: تم حذف المنتج 🗑️"
                },
                body: {
                    en: `Product "${product.name.en}" has been permanently deleted.`,
                    ar: `تم حذف المنتج "${product.name.ar}" نهائياً.`
                },
                type: "alert"
            }),
            ctx.runMutation(internal.stats.patch, { totalProducts: -1 }),
        ])
    }
})