import { paginationOptsValidator } from "convex/server"
import { internalMutation, internalQuery, query } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

export const getDashboardData = query({
    args: {},
    handler: async (ctx) => {
        // 1. Auth and Admin Check
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthenticated")

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user || user.role !== "admin") {
            throw new Error("Unauthorized")
        }

        // 2. Fetch Base Data
        const allOrders = await ctx.db.query("orders").collect();
        
        const now = new Date();
        const currentYear = now.getFullYear();

        const revenueHistory = [...Array(12)].map((_, i) => {
            const monthDate = new Date(currentYear, i)
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })

            const monthOrders = allOrders.filter(order => {
                const orderDate = new Date(order._creationTime)
                return (
                    orderDate.getMonth() === i && 
                    orderDate.getFullYear() === currentYear
                )
            })

            const monthlyRevenue = monthOrders.reduce((acc, order) => acc + order.totalAmount, 0)

            return {
                name: monthName,
                revenue: monthlyRevenue 
            }
        })

        // 4. Totals and Recents
        const totalRevenue = allOrders.reduce((acc, order) => acc + order.totalAmount, 0)
        const totalOrders = allOrders.length
        const totalProducts = (await ctx.db.query("products").collect()).length
        const totalUsers = (await ctx.db.query("users").collect()).length

        const recentNotifications = await ctx.db.query("notifications").order("desc").take(5)
        const recentUsers = await ctx.db.query("users").order("desc").take(5)
        const recentOrders = await ctx.db.query("orders").order("desc").take(5)

        return {
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers
            },
            revenueHistory,
            recentOrders,
            recentNotifications,
            recentUsers
        }
    }
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

        const typeFilters = ["order_status", "promotion", "alert"]

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

        // 2. SEARCH MODE
        if (searchTerm && searchTerm.length > 0) {
            return await ctx.db
                .query("users")
                .withSearchIndex("search_all", (q) => {
                    const search = q.search("email", searchTerm)
                    // FIX: Use "role" instead of "type"
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
        slug: v.string()
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
            slug: args.slug
        })

        await ctx.runMutation(internal.notifications.notifyAdmins, {
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
        })
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