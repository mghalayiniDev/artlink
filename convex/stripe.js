import { v } from "convex/values"
import { action, internalQuery } from "./_generated/server"
import Stripe from "stripe"
import { components, internal } from "./_generated/api"
import RateLimiter from "@convex-dev/rate-limiter"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil"
})

const rateLimiter = new RateLimiter(components.rateLimiter, {
    createPaymentCheckout: {
        kind: "token bucket",
        rate: 3,       
        period: 60000,  
        capacity: 5    
    }
})

export const validateCartForCheckout = internalQuery({
    args: {
        locale: v.string() 
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Not authenticated")
            
        const locales = ["en", "ar"]
        const locale = locales.includes(args.locale) ? args.locale : "en"
        
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user || !user.cart || user.cart.length === 0) return { success: false, message: "Your cart is empty" }

        const validatedItems = []
        let subtotal = 0

        for (const item of user.cart) {
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                return { success: false, message: "Invalid item quantity detected in cart" }
            }

            const { h, w, d } = item.dimensions
            if (h <= 0 || w <= 0 || d <= 0 || h > 500 || w > 500 || d > 100) {
                return { success: false, message: "Invalid product dimensions detected in cart" }
            }

            const product = await ctx.db.get(item.productId)

            if (!product || product.status !== "active") {
                return { success: false, message: "A product in your cart is no longer available. Please update your cart." }
            }

            const totalOfThisProductInCart = user.cart
                .filter(i => i.productId === item.productId)
                .reduce((sum, i) => sum + i.quantity, 0)

            if (totalOfThisProductInCart > product.stock) {
                return { success: false, message: `Not enough stock for ${product.name.en}.` }
            }

            const colorExists = product.colors.find(c => c.code === item.color.code)
            if (!colorExists) {
                return { success: false, message: `The color ${item.color.name.en} for ${product.name.en} is no longer available.` }
            }

            const discountRate = product.discount || 0
            const activePrice = product.price * (1 - (discountRate / 100))
            subtotal += (activePrice * item.quantity)

            validatedItems.push({
                productId: item.productId, 
                color: item.color,
                name: product.name[locale],
                thumbnail: product.thumbnail,
                colorName: item.color.name[locale],
                dimensions: item.dimensions,
                quantity: item.quantity,
                activePrice: activePrice
            })
        }

        return { validatedItems, subtotal }
    }
})

export const createPaymentCheckout = action({
    args: {
        locale: v.string() 
    },
    returns: v.object({
        success: v.optional(v.boolean()),
        message: v.optional(v.string()),
        sessionId: v.optional(v.string()),
        url: v.optional(v.union(v.string(), v.null())) 
    }),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Not authenticated")

        const status = await rateLimiter.limit(ctx, "createPaymentCheckout", { 
            key: identity.subject 
        })

        if (!status.ok) {
            return { success: false, message: "Too many requests. Please wait a moment" }
        }

        const locales = ["en", "ar"]
        const locale = locales.includes(args.locale) ? args.locale : "en"

        const cartCheck = await ctx.runQuery(internal.stripe.validateCartForCheckout, { locale })

        if (cartCheck.success === false) {
            return { success: false, message: cartCheck.message }
        }

        const { validatedItems, subtotal } = cartCheck

        const line_items = validatedItems.map(item => ({
            price_data: {
                currency: "aed",
                product_data: {
                    name: item.name,
                    images: [item.thumbnail],
                    description: `Color: ${item.colorName} | Size: ${item.dimensions.h}x${item.dimensions.w}x${item.dimensions.d}cm`,
                },
                unit_amount: Math.round(item.activePrice * 100),
            },
            quantity: item.quantity,
        }))

        const vatAmount = subtotal * 0.05;
        line_items.push({
            price_data: {
                currency: "aed",
                product_data: {
                    name: "VAT (5%)",
                    description: "Value Added Tax",
                },
                unit_amount: Math.round(vatAmount * 100),
            },
            quantity: 1,
        })

        const minimalCartItems = validatedItems.map(item => ({
            id: item.productId, 
            q: item.quantity,
            c: item.color.code, 
            dim: [item.dimensions.h, item.dimensions.w, item.dimensions.d] 
        }))

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            customer_email: identity.email,
            shipping_address_collection: {
                allowed_countries: ["AE"], 
            },
            locale: "auto",
            phone_number_collection: {
                enabled: true, 
            },
            allow_promotion_codes: true,
            metadata: {
                userId: identity.subject,
                cartItems: JSON.stringify(minimalCartItems)
            },
            success_url: `${process.env.HOST_URL}/orders?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.HOST_URL}/cart`,
            invoice_creation: {
                enabled: true
            }
        })

        return {
            sessionId: session.id,
            url: session.url,
        }
    }
})