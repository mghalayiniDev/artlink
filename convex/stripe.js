import { v } from "convex/values"
import { action, internalMutation, internalQuery } from "./_generated/server"
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
        capacity: 5,
    },
    refundOrder: {
        kind: "token bucket",
        rate: 10,
        period: 60000,
        capacity: 10,
    },
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
            if (h <= 0 || w <= 0 || d <= 0) {
                return { success: false, message: "Invalid product dimensions detected in cart" }
            }

            const product = await ctx.db.get(item.productId)

            if (!product || product.status !== "active") {
                return { success: false, message: "A product in your cart is no longer available. Please update your cart." }
            }

            if (product.dimensionRange) {
                const dr = product.dimensionRange
                if (h < dr.h.min || h > dr.h.max) {
                    return { success: false, message: `Height for "${product.name.en}" must be between ${dr.h.min} and ${dr.h.max} cm.` }
                }
                if (w < dr.w.min || w > dr.w.max) {
                    return { success: false, message: `Width for "${product.name.en}" must be between ${dr.w.min} and ${dr.w.max} cm.` }
                }
                if (d < dr.d.min || d > dr.d.max) {
                    return { success: false, message: `Depth for "${product.name.en}" must be between ${dr.d.min} and ${dr.d.max} cm.` }
                }
            } else if (h > 500 || w > 500 || d > 100) {
                return { success: false, message: `Dimensions for "${product.name.en}" exceed factory limits.` }
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
        locale:    v.string(),
        promoCode: v.optional(v.string()),
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

        // ── Promo code: strict server-side re-validation at checkout time ──
        let appliedDiscount = null
        if (args.promoCode?.trim()) {
            const codeCheck = await ctx.runQuery(internal.discounts.getDiscountForCheckout, {
                code:     args.promoCode.trim(),
                userId:   identity.subject,
                subtotal,
            })
            if (!codeCheck || !codeCheck.valid) {
                // Code was valid on the cart page but failed the stricter checkout check
                // (expired, exhausted, or taken by a concurrent session). Block checkout
                // so the user isn't charged full price without knowing their code failed.
                return {
                    success: false,
                    message: codeCheck?.error ?? "Your discount code is no longer valid. Please go back and remove it.",
                }
            }
            appliedDiscount = codeCheck
        }

        const discountAmount    = appliedDiscount?.discountAmount ?? 0
        const discountedSubtotal = subtotal - discountAmount
        const vatAmount          = discountedSubtotal * 0.05

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

        // Create a single-use Stripe coupon for the validated promo code
        let stripeCouponId = undefined
        if (appliedDiscount && discountAmount > 0) {
            const coupon = await stripe.coupons.create({
                name:             appliedDiscount.code,
                amount_off:       Math.round(discountAmount * 100), // in fils (AED smallest unit)
                currency:         "aed",
                duration:         "once",
                max_redemptions:  1,
            })
            stripeCouponId = coupon.id
        }

        // Stripe does not allow allow_promotion_codes and discounts together —
        // not even allow_promotion_codes: false. Include one or the other only.
        // 30 minutes — minimum Stripe allows. Keeps the reservation window short
        // so abandoned checkouts don't lock stock for hours.
        const SESSION_TTL_SECONDS = 30 * 60
        const SESSION_TTL_MS      = SESSION_TTL_SECONDS * 1000

        const sessionParams = {
            mode: "payment",
            line_items,
            customer_email: identity.email,
            shipping_address_collection: { allowed_countries: ["AE"] },
            locale: "auto",
            phone_number_collection: { enabled: true },
            expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
            metadata: {
                userId:    identity.subject,
                cartItems: JSON.stringify(minimalCartItems),
                ...(appliedDiscount && {
                    promoCodeId:    appliedDiscount.codeId,
                    promoCode:      appliedDiscount.code,
                    discountAmount: discountAmount.toFixed(2),
                }),
            },
            success_url: `${process.env.HOST_URL}/order/{CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.HOST_URL}/api/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
            invoice_creation: { enabled: true },
        }

        if (stripeCouponId) {
            // Apply our managed discount — Stripe forbids allow_promotion_codes here
            sessionParams.discounts = [{ coupon: stripeCouponId }]
        } else {
            // No managed code applied — allow Stripe's native promotion codes as fallback
            sessionParams.allow_promotion_codes = true
        }

        const session = await stripe.checkout.sessions.create(sessionParams)

        // Atomically reserve stock using the live DB values inside a serialized
        // Convex mutation. Two concurrent checkouts for the last unit safely
        // resolve: the first claims it, the second gets an error here.
        const stockByProduct = {}
        for (const item of validatedItems) {
            stockByProduct[item.productId] = (stockByProduct[item.productId] || 0) + item.quantity
        }
        try {
            await ctx.runMutation(internal.reservations.createStockReservations, {
                stripeSessionId: session.id,
                userId:          identity.subject,
                items: Object.entries(stockByProduct).map(([productId, quantity]) => ({ productId, quantity })),
                expiresAt: Date.now() + SESSION_TTL_MS,
            })
        } catch (err) {
            // Stock was grabbed by a concurrent session between cart validation and now.
            // Expire the just-created Stripe session so the user cannot pay for unavailable stock.
            await stripe.checkout.sessions.expire(session.id).catch(() => {})
            // Clean up the Stripe coupon if one was created for this session.
            if (stripeCouponId) await stripe.coupons.del(stripeCouponId).catch(() => {})
            return {
                success: false,
                message: err.message || "One or more items in your cart are no longer available. Please update your cart.",
            }
        }

        // Reserve the discount slot immediately — prevents double-redemption
        // across parallel sessions before the webhook fires.
        if (appliedDiscount && discountAmount > 0) {
            await ctx.runMutation(internal.discounts.reserveDiscountUsage, {
                codeId:          appliedDiscount.codeId,
                userId:          identity.subject,
                stripeSessionId: session.id,
                discountAmount,
                expiresAt:       Date.now() + SESSION_TTL_MS,
            })
        }

        return {
            sessionId: session.id,
            url: session.url,
        }
    }
})

// ─── Refund helpers ───────────────────────────────────────────────────────────

const REFUNDABLE_STATUSES = new Set(["paid", "processing", "delivering", "delivered", "cancelled"])

export const getAdminForRefund = internalQuery({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .unique()
        if (!user || user.role !== "admin") return null
        return { name: user.name }
    },
})

export const getOrderForRefund = internalQuery({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => ctx.db.get(args.orderId),
})

export const finalizeRefund = internalMutation({
    args: {
        orderId:      v.id("orders"),
        reason:       v.string(),
        adminUserId:  v.string(),
        adminName:    v.string(),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId)
        if (!order) throw new Error("Order not found")

        await ctx.db.patch(args.orderId, {
            status:       "refunded",
            refundReason: args.reason,
        })

        // Subtract refunded amount from the pre-computed revenue stat
        await ctx.runMutation(internal.stats.patch, { totalRevenue: -order.totalAmount })

        await ctx.runMutation(internal.notifications.notifyAdmins, {
            userId: args.adminUserId,
            title: {
                en: "Refund Processed 💸",
                ar: "تمت معالجة الاسترداد 💸",
            },
            body: {
                en: `Order #${args.orderId.slice(-8).toUpperCase()} refunded by ${args.adminName}. Reason: ${args.reason}`,
                ar: `تم استرداد الطلب #${args.orderId.slice(-8).toUpperCase()} بواسطة ${args.adminName}. السبب: ${args.reason}`,
            },
            type: "order_status",
        })
    },
})

export const refundOrder = action({
    args: {
        orderId:      v.id("orders"),
        reason:       v.string(),
        stripeReason: v.union(
            v.literal("duplicate"),
            v.literal("fraudulent"),
            v.literal("requested_by_customer"),
        ),
    },
    handler: async (ctx, args) => {
        // 1. Auth
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { success: false, error: "Unauthenticated" }

        const admin = await ctx.runQuery(internal.stripe.getAdminForRefund, { userId: identity.subject })
        if (!admin) return { success: false, error: "Unauthorized: Admin access required" }

        const rl = await rateLimiter.limit(ctx, "refundOrder", { key: identity.subject })
        if (!rl.ok) return { success: false, error: "Too many requests. Please wait a moment." }

        // 2. Sanitise reason
        const reason = args.reason.trim()
        if (reason.length < 5)   return { success: false, error: "Reason must be at least 5 characters" }
        if (reason.length > 500) return { success: false, error: "Reason is too long (max 500 characters)" }

        // 3. Fetch & validate order
        const order = await ctx.runQuery(internal.stripe.getOrderForRefund, { orderId: args.orderId })
        if (!order)                                return { success: false, error: "Order not found" }
        if (!REFUNDABLE_STATUSES.has(order.status)) return { success: false, error: "This order cannot be refunded in its current state" }
        if (!order.stripeSessionId)                return { success: false, error: "No payment record found for this order" }

        // 4. Stripe refund
        try {
            const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, {
                expand: ["payment_intent"],
            })

            const paymentIntentId = typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id

            if (!paymentIntentId) return { success: false, error: "Payment intent not found in Stripe" }

            await stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason:         args.stripeReason,
            })
        } catch (err) {
            const msg = err?.message ?? "Unknown Stripe error"
            return { success: false, error: `Stripe error: ${msg}` }
        }

        // 5. Persist status + reason, send notification
        await ctx.runMutation(internal.stripe.finalizeRefund, {
            orderId:     args.orderId,
            reason,
            adminUserId: identity.subject,
            adminName:   admin.name,
        })

        return { success: true }
    },
})