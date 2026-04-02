import { v } from "convex/values"
import { mutation } from "./_generated/server"
import RateLimiter from "@convex-dev/rate-limiter"
import { components } from "./_generated/api"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    addToCart: {
        kind: "token bucket",
        rate: 10,
        period: 60000,
        capacity: 20
    }
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

        if (args.quantity < 1) return { success: false, message: "Quantity must be at least 1." }

        const { h, w, d } = args.dimensions
        if (h <= 0 || w <= 0 || d <= 0) return { success: false, message: "Dimensions must be greater than zero." }

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

        if (proposedQty > product.stock) {
            return { success: false, message: `Only ${product.stock} items available in stock.` }
        }

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