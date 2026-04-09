import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import RateLimiter from "@convex-dev/rate-limiter"
import { components } from "./_generated/api"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    addToCart: {
        kind: "token bucket",
        rate: 10,
        period: 60000,
        capacity: 20
    },
    updateCartQuantity: {
        kind: "token bucket",
        rate: 10,
        period: 60000,
        capacity: 20
    },
    removeFromCart: {
        kind: "token bucket",
        rate: 10,
        period: 60000,
        capacity: 20
    }
})

export const getCartItems = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return null

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user || !user.cart || user.cart.length === 0) return []

        const productIds = user.cart.map((item) => item.productId)
        const productsRaw = await Promise.all(
            productIds.map((id) => ctx.db.get(id))
        )

        const productMap = new Map()
        productsRaw.forEach((p) => {
            if (p && p.status === "active") productMap.set(p._id, p)
        })

        return user.cart.map((item) => {
            const product = productMap.get(item.productId)
            if (!product) return null

            return {
                ...item,
                product: {
                    name: product.name,
                    thumbnail: product.thumbnail,
                    price: product.price,
                    discount: product.discount || 0,
                    stock: product.stock,
                },
            };
        }).filter((item) => item !== null)
    },
})

export const addToCart = mutation({
    args: {
        productId: v.string(),
        quantity: v.number(),
        dimensions: v.object({ h: v.number(), w: v.number(), d: v.number() }),
        color: v.object({
            code: v.string(),
            name: v.object({ en: v.string(), ar: v.string() })
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { success: false, message: "You must be logged in to add items to the cart." }

        const status = await rateLimiter.limit(ctx, "addToCart", { key: identity.subject })
        if (!status.ok) return { success: false, message: "Too many requests. Please wait a moment." }

        const validId = ctx.db.normalizeId("products", args.productId)
        if (!validId) return { success: false, message: "Invalid product ID." }

        if (!Number.isInteger(args.quantity) || args.quantity < 1) return { success: false, message: "Quantity must be a whole number of at least 1." }

        const { h, w, d } = args.dimensions
        if (h <= 0 || w <= 0 || d <= 0) return { success: false, message: "Dimensions must be greater than zero." }
        if (h <= 0 || w <= 0 || d <= 0 || h > 500 || w > 500 || d > 100) return { success: false, message: "Dimensions are invalid or exceed factory limits." }

        if (args.color.code.length > 50 || args.color.name.en.length > 100 || args.color.name.ar.length > 100) {
            return { success: false, message: "Invalid color format." }
        }

        const product = await ctx.db.get(validId)
        if (!product) return { success: false, message: "Product not found." }
        if (product.status !== "active") return { success: false, message: "This product is currently unavailable." }
        if (product.stock < 1) return { success: false, message: "This product is out of stock." }

        const matchingColor = product.colors.find((c) => c.code === args.color.code)
        if (!matchingColor) return { success: false, message: "Invalid color selection for this product." }
        if (matchingColor.name.en !== args.color.name.en || matchingColor.name.ar !== args.color.name.ar) {
            return { success: false, message: "Color data mismatch. Request rejected." }
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()
        if (!user) return { success: false, message: "User not found." }

        const existingCart = user.cart ?? []

        const currentTotalOfAllVariants = existingCart
            .filter(item => item.productId === validId)
            .reduce((sum, item) => sum + item.quantity, 0)

        if (currentTotalOfAllVariants + args.quantity > product.stock) {
            return { 
                success: false, 
                message: `Cannot add ${args.quantity}. You already have ${currentTotalOfAllVariants} in your cart, and only ${product.stock} are available.` 
            }
        }

        const existingIdx = existingCart.findIndex((item) =>
            item.productId === validId && 
            item.color.code === args.color.code &&
            item.dimensions.h === h &&
            item.dimensions.w === w &&
            item.dimensions.d === d
        )

        if (existingCart.length >= 50 && existingIdx === -1) {
            return { success: false, message: "Your cart is full. Please checkout or remove items." }
        }

        const currentQty = existingIdx !== -1 ? existingCart[existingIdx].quantity : 0
        const proposedQty = currentQty + args.quantity

        const updatedCart = existingIdx !== -1
            ? existingCart.map((item, idx) =>
                idx === existingIdx ? { ...item, quantity: proposedQty } : item
            )
            : [...existingCart, {
                productId: validId, 
                quantity: args.quantity,
                color: args.color,
                dimensions: args.dimensions,
            }]

        await ctx.db.patch(user._id, { cart: updatedCart })
        return { success: true }
    }
})

export const updateCartQuantity = mutation({
    args: {
        productId: v.string(),
        dimensions: v.object({ h: v.number(), w: v.number(), d: v.number() }),
        colorCode: v.string(),
        newQuantity: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { success: false, message: "Unauthorized" }

        const status = await rateLimiter.limit(ctx, "updateCartQuantity", { key: identity.subject })
        if (!status.ok) return { success: false, message: "Too many requests. Please wait a moment." }

        const validId = ctx.db.normalizeId("products", args.productId)
        if (!validId) return { success: false, message: "Invalid product ID." }

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user) return { success: false, message: "User not found." }

        const existingCart = user.cart ?? []

        const itemIdx = existingCart.findIndex((item) => 
            item.productId === validId && 
            item.color.code === args.colorCode &&
            item.dimensions.h === args.dimensions.h &&
            item.dimensions.w === args.dimensions.w &&
            item.dimensions.d === args.dimensions.d
        )

        if (itemIdx === -1) return { success: false, message: "Item not found in cart." }

        if (!Number.isInteger(args.newQuantity)) return { success: false, message: "Quantity must be a whole number." }
        if (args.newQuantity < 1) {
            const updatedCart = existingCart.filter((_, idx) => idx !== itemIdx)
            await ctx.db.patch(user._id, { cart: updatedCart });
            return { success: true, message: "Item removed from cart." }
        }

        const product = await ctx.db.get(validId)  
        if (!product || product.status !== "active") {
            return { success: false, message: "Product is no longer available." }
        }

        const otherVariantsTotal = existingCart
            .filter((item, idx) => item.productId === validId && idx !== itemIdx)
            .reduce((sum, item) => sum + item.quantity, 0)

        if (otherVariantsTotal + args.newQuantity > product.stock) {
            return { 
                success: false, 
                message: `Total stock exceeded` 
            }
        }

        const updatedCart = [...existingCart]
        updatedCart[itemIdx] = { ...updatedCart[itemIdx], quantity: args.newQuantity }

        await ctx.db.patch(user._id, { cart: updatedCart })
        return { success: true }
    }
})

export const removeFromCart = mutation({
    args: {
        productId: v.string(),
        dimensions: v.object({ h: v.number(), w: v.number(), d: v.number() }),
        colorCode: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { success: false, message: "Unauthorized" }

        const status = await rateLimiter.limit(ctx, "removeFromCart", { key: identity.subject })
        if (!status.ok) return { success: false, message: "Too many requests. Please wait a moment." }

        const validId = ctx.db.normalizeId("products", args.productId)
        if (!validId) return { success: false, message: "Invalid product ID." }

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user) return { success: false, message: "User not found." }

        const updatedCart = (user.cart ?? []).filter((item) => 
            !(item.productId === validId && 
              item.color.code === args.colorCode &&
              item.dimensions.h === args.dimensions.h && 
              item.dimensions.w === args.dimensions.w && 
              item.dimensions.d === args.dimensions.d)
        )

        await ctx.db.patch(user._id, { cart: updatedCart })
        return { success: true, message: "Item removed" }
    }
})