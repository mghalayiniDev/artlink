import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server"

export const getOrderBySessionId = query({
    args: { 
        sessionId: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized: You must be logged in to view this order.")
        }

        const order = await ctx.db
            .query("orders")
            .withIndex("by_stripe_session_id", (q) => 
                q.eq("stripeSessionId", args.sessionId)
            )
            .first()

        if (!order) return null

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .first()

        if (!currentUser || currentUser._id !== order.userId) return null

        return order
    }
})

export const getUserOrders = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .unique()

        if (!user) {
            console.warn(`User ${identity.subject} not found in database`)
            return []
        }

        return await ctx.db
            .query("orders")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect()
    }
})

export const createOrder = internalMutation({
    args: {
        stripeSession: v.any()
    },
    handler: async (ctx, args) => {
        const session = args.stripeSession

        const existingOrder = await ctx.db
            .query("orders")
            .withIndex("by_stripe_session_id", (q) => q.eq("stripeSessionId", session.id))
            .unique()

        if (existingOrder) return existingOrder._id

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", session.metadata.userId))
            .unique()

        if (!user) throw new Error(`User not found for session ${session.id}`)

        const paymentIntent = session.payment_intent
        
        const paymentData = paymentIntent?.payment_method || paymentIntent?.latest_charge?.payment_method_details
        
        const paymentMethodType = paymentData?.type ?? "unknown"

        const cardLast4 = 
            paymentData?.card?.last4 ||      
            paymentData?.link?.custom?.last4 ||  
            paymentData?.apple_pay?.card?.last4 || 
            paymentData?.google_pay?.card?.last4 ||
            "unknown"

        const invoiceUrl = session.invoice?.hosted_invoice_url ?? undefined

        const address = session.collected_information?.shipping_details?.address
        const shippingAddress = {
            city: address?.city ?? undefined,
            country: address?.country ?? undefined,
            line1: address?.line1 ?? undefined,
            line2: address?.line2 ?? undefined,
            postal_code: address?.postal_code ?? undefined,
        }

        const phone = session.customer_details?.phone ?? undefined

        const discount = session.total_details?.breakdown?.discounts?.[0]
        const discountAmount = discount ? discount.amount / 100 : undefined
        const promoCodeText = discount?.discount?.coupon?.name ?? undefined

        const totalAmount = session.amount_total / 100
        const vatCents = Math.round((session.amount_total / 1.05) * 0.05)
        const vat = vatCents / 100

        if (!session.metadata?.cartItems) {
            throw new Error(`No cart items found in metadata for session ${session.id}`)
        }

        const compressedCart = JSON.parse(session.metadata.cartItems)
        if (!compressedCart || compressedCart.length === 0) throw new Error("Cart is empty at order creation")

        const totalRequestedPerProduct = {}
        for (const item of compressedCart) {
            if (!totalRequestedPerProduct[item.id]) {
                totalRequestedPerProduct[item.id] = 0
            }
            totalRequestedPerProduct[item.id] += item.q
        }

        const productCache = {}
        for (const [productId, totalRequested] of Object.entries(totalRequestedPerProduct)) {
            const product = await ctx.db.get(productId)
            if (!product) throw new Error(`Product ${productId} not found`)
            
            productCache[productId] = product
        }

        const products = []
        for (const item of compressedCart) {
            const product = productCache[item.id]
            const discountRate = product.discount || 0
            const priceAtPurchase = product.price * (1 - (discountRate / 100))

            const fullColor = product.colors.find(c => c.code === item.c) || { 
                code: item.c, 
                name: { en: "Custom", ar: "مخصص" } 
            }

            products.push({
                productId: item.id,
                nameAtPurchase: {
                    en: product.name.en,
                    ar: product.name.ar,
                },
                priceAtPurchase,
                imageAtPurchase: product.thumbnail,
                quantity: item.q,
                color: fullColor,
                dimensions: { h: item.dim[0], w: item.dim[1], d: item.dim[2] },
            })
        }

        for (const [productId, totalRequested] of Object.entries(totalRequestedPerProduct)) {
            const product = productCache[productId]
            await ctx.db.patch(product._id, {
                stock: product.stock - totalRequested
            })
        }

        await ctx.db.insert("orders", {
            userId: user._id,
            products,
            shippingAddress,
            phone,
            paymentMethod: paymentMethodType,
            cardLast4,
            invoiceUrl,
            vat,
            totalAmount,
            discountAmount,
            promoCodeText,
            stripeSessionId: session.id,
            status: "paid",
            createdAt: Date.now(),
        })

        const purchasedProductIds = new Set(compressedCart.map(item => item.id))
        const remainingCart = user.cart.filter(item => !purchasedProductIds.has(item.productId))

        await ctx.db.patch(user._id, { cart: remainingCart })
    }
})