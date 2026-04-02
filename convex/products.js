import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { PRODUCT_FILTERS } from "@/constants"
import RateLimiter from "@convex-dev/rate-limiter"
import { components } from "./_generated/api"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    wishlist: {
        kind: "token bucket",
        rate: 10,       
        period: 60000,  
        capacity: 20    
    }
})

export const getProductById = query({
    args: { id: v.string() }, 
    handler: async (ctx, args) => {
        const validId = ctx.db.normalizeId("products", args.id)
        if (!validId) return null

        const product = await ctx.db.get(validId)
        if (!product || product?.status !== "active") return null

        let categoryDetails = null
        if (product.categoryId) {
            categoryDetails = await ctx.db.get(product.categoryId)
        } else {
            return null
        }

        let relatedProducts = await ctx.db
            .query("products")
            .withIndex("by_category_status", (q) => 
                q.eq("categoryId", product.categoryId).eq("status", "active")
            )
            .filter((q) => q.neq(q.field("_id"), product._id))
            .take(4)

        if (relatedProducts.length < 4) {
            const neededCount = 4 - relatedProducts.length
            
            const excludeIds = new Set(relatedProducts.map(p => p._id))
            excludeIds.add(product._id)

            const potentialFillers = await ctx.db
                .query("products")
                .withIndex("by_status", (q) => q.eq("status", "active"))
                .take(neededCount + excludeIds.size)

            const validFillers = potentialFillers
                .filter(p => !excludeIds.has(p._id))
                .slice(0, neededCount)

            relatedProducts = [...relatedProducts, ...validFillers]
        }

        return {
            ...product,
            categoryDetails,
            relatedProducts
        }
    }
})

export const searchForProduct = query({
    args: { 
        query: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.query === "") {
            return []
        }

        return await ctx.db
            .query("products")
            .withSearchIndex("search_all", (q) => 
                q.search("searchTexts", args.query)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .take(20)
    }
})

export const getLandingPageData = query({
    handler: async (ctx) => {
        const categories = await ctx.db.query("categories").collect()

        const sections = await Promise.all(
            categories.map(async (cat) => {
                const previewProducts = await ctx.db
                    .query("products")
                    .withIndex("by_category_status", (q) => 
                        q.eq("categoryId", cat._id).eq("status", "active")
                    )
                    .order("desc")
                    .take(4)

                const allActiveProducts = await ctx.db
                    .query("products")
                    .withIndex("by_category_status", (q) => 
                        q.eq("categoryId", cat._id).eq("status", "active")
                    )
                    .collect() 

                return {
                    category: cat,
                    products: previewProducts,
                    totalCount: allActiveProducts.length, 
                }
            })
        )

        return sections
    }
})

export const getFilteredProducts = query({
    args: {
        page: v.number(),
        pageSize: v.number(),
        categoryId: v.optional(v.string()), 
        materialEn: v.optional(v.string()),
        colorEn: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const sPage = Math.max(1, args.page)
        const sPageSize = Math.min(Math.max(args.pageSize, 1), 100)

        const validCategoryId = args.categoryId 
            ? ctx.db.normalizeId("categories", args.categoryId) 
            : null;

        const searchMaterial = args.materialEn && PRODUCT_FILTERS.materials.some(
            (m) => m.en.toLowerCase() === args.materialEn?.toLowerCase()
        ) ? args.materialEn.toLowerCase() : undefined

        const searchColor = args.colorEn && PRODUCT_FILTERS.colors.some(
            (c) => c.en.toLowerCase() === args.colorEn?.toLowerCase()
        ) ? args.colorEn.toLowerCase() : undefined

        let productQuery = ctx.db.query("products")

        if (validCategoryId) {
            productQuery = productQuery.withIndex("by_category_status", (q) =>
                q.eq("categoryId", validCategoryId).eq("status", "active")
            )
        } else {
            productQuery = productQuery.withIndex("by_status", (q) => q.eq("status", "active"))
        }

        const allActiveProducts = await productQuery.order("desc").collect()

        const filtered = allActiveProducts.filter((product) => {
            const matchesMaterial = !searchMaterial || 
                (product.details?.material?.en || "").toLowerCase().includes(searchMaterial)

            const matchesColor = !searchColor || 
                (product.colors || []).some(c => 
                    (c.name?.en || "").toLowerCase().includes(searchColor)
                )

            return matchesMaterial && matchesColor
        })

        const totalCount = filtered.length
        const skip = (sPage - 1) * sPageSize

        return {
            products: filtered.slice(skip, skip + sPageSize),
            totalCount,
            totalPages: Math.ceil(totalCount / sPageSize),
            currentPage: sPage
        }
    }
})

export const getWishlistAndRecommendations = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() 
        if (!identity) return null

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) =>
                q.eq("userId", identity.subject)
            )
            .unique()

        if (!user) return null

        const sourceIds = user.likedProducts || []

        if (sourceIds.length === 0) {
            return null
        }

        const wishlistRaw = await Promise.all(
            sourceIds.map((id) => ctx.db.get(id))
        )
        const wishlist = wishlistRaw.filter((p) => p !== null && p.status === "active")

        const favoriteCategoryIds = [...new Set(wishlist.map((p) => p.categoryId))]

        let recommendations = []
        for (const catId of favoriteCategoryIds) {
            const productsInCat = await ctx.db
                .query("products")
                .withIndex("by_category_status", (q) =>
                    q.eq("categoryId", catId).eq("status", "active")
                )
                .take(10); 

            recommendations.push(...productsInCat)
        }

        recommendations = recommendations.filter(
            (prod, index, self) =>
                !sourceIds.includes(prod._id) && 
                index === self.findIndex((p) => p._id === prod._id) 
        )

        if (recommendations.length < 4) {
            const currentRecIds = recommendations.map(p => p._id)
            const idsToExclude = [...sourceIds, ...currentRecIds] 
            const neededAmount = 4 - recommendations.length
            
            const fillersRaw = await ctx.db
                .query("products")
                .withIndex("by_status", (q) => q.eq("status", "active"))
                .take(20);
            
            const fillers = fillersRaw
                .filter(p => !idsToExclude.includes(p._id))
                .slice(0, neededAmount)
            
            recommendations.push(...fillers)
        }

        return {
            wishlist: wishlist,
            recommendations: recommendations.slice(0, 4)
        }
    }
})

export const addProductToWishList = mutation({
    args: { productId: v.string() }, 
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() 
        if (!identity) {
            return { success: false, message: "Please log in to add items to your wishlist." }
        }

        const status = await rateLimiter.limit(ctx, "wishlist", { 
            key: identity.subject 
        })

        if (!status.ok) {
            return { success: false, message: "Too many requests. Please wait a moment." }
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) =>
                q.eq("userId", identity.subject)
            )
            .unique()

        if (!user) {
            return { success: false, message: "User profile not found in database." }
        }

        const validId = ctx.db.normalizeId("products", args.productId)
        if (!validId) return { success: false, message: "Invalid product." }
        const product = await ctx.db.get(validId)
        if (!product) {
            return { success: false, message: "Product not found." }
        }

        const currentWishlist = user.likedProducts || []
        const isAlreadyLiked = currentWishlist.includes(args.productId)

        if (isAlreadyLiked) {
            const updatedWishlist = currentWishlist.filter(
                (id) => id !== args.productId
            )
            
            await ctx.db.patch(user._id, { likedProducts: updatedWishlist })
            return { success: true, action: "removed", message: "Removed from wishlist." }
        } else {
            await ctx.db.patch(user._id, {
                likedProducts: [...currentWishlist, args.productId],
            })
            return { success: true, action: "added", message: "Added to wishlist!" }
        }
    }
})