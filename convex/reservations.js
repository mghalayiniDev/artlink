import { v } from "convex/values"
import { action, internalMutation } from "./_generated/server"
import { internal } from "./_generated/api"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
})

// Called inside createPaymentCheckout (action) after the Stripe session is created.
// Re-validates stock against live DB values and atomically decrements it.
// Because Convex mutations are serialized, two concurrent checkouts for the last
// unit safely resolve: the first claims it, the second gets an error.
export const createStockReservations = internalMutation({
    args: {
        stripeSessionId: v.string(),
        userId:          v.string(),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity:  v.number(),
        })),
        expiresAt: v.number(),
    },
    handler: async (ctx, args) => {
        // Idempotency: skip if reservations for this session already exist
        const existing = await ctx.db
            .query("stockReservations")
            .withIndex("by_session", q => q.eq("stripeSessionId", args.stripeSessionId))
            .first()
        if (existing) return

        for (const item of args.items) {
            const product = await ctx.db.get(item.productId)
            if (!product) {
                throw new Error("A product in your cart is no longer available. Please update your cart.")
            }
            if (product.stock < item.quantity) {
                throw new Error(
                    `"${product.name.en}" only has ${product.stock} unit(s) left. Please update your cart.`
                )
            }
            await ctx.db.patch(product._id, { stock: product.stock - item.quantity })
            await ctx.db.insert("stockReservations", {
                stripeSessionId: args.stripeSessionId,
                userId:          args.userId,
                productId:       item.productId,
                quantity:        item.quantity,
                expiresAt:       args.expiresAt,
                status:          "active",
                createdAt:       Date.now(),
            })
        }
    },
})

// Called when a Stripe session expires via webhook — returns held stock back.
export const releaseStockReservations = internalMutation({
    args: { stripeSessionId: v.string() },
    handler: async (ctx, args) => {
        const reservations = await ctx.db
            .query("stockReservations")
            .withIndex("by_session", q => q.eq("stripeSessionId", args.stripeSessionId))
            .collect()

        for (const r of reservations) {
            if (r.status !== "active") continue
            const product = await ctx.db.get(r.productId)
            if (product) {
                await ctx.db.patch(product._id, { stock: product.stock + r.quantity })
            }
            await ctx.db.patch(r._id, { status: "released" })
        }
    },
})

// Called when a user explicitly cancels checkout — finds ALL their active
// reservations by userId, restores stock immediately, then expires each
// Stripe session so the user cannot accidentally pay on a stale tab.
export const releaseUserActiveReservations = internalMutation({
    args: { userId: v.string() },
    returns: v.array(v.string()),
    handler: async (ctx, args) => {
        const reservations = await ctx.db
            .query("stockReservations")
            .withIndex("by_user_status", q =>
                q.eq("userId", args.userId).eq("status", "active")
            )
            .collect()

        const sessionIds = new Set()
        for (const r of reservations) {
            const product = await ctx.db.get(r.productId)
            if (product) {
                await ctx.db.patch(product._id, { stock: product.stock + r.quantity })
            }
            await ctx.db.patch(r._id, { status: "released" })
            sessionIds.add(r.stripeSessionId)
        }

        return [...sessionIds]
    },
})

// Called by the cron job every 5 minutes.
// Releases any active reservation whose expiresAt has passed —
// covers abandoned checkouts, closed browsers, dead batteries, etc.
export const releaseExpiredReservations = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now()
        const expired = await ctx.db
            .query("stockReservations")
            .withIndex("by_status_expires", q =>
                q.eq("status", "active").lt("expiresAt", now)
            )
            .collect()

        for (const r of expired) {
            const product = await ctx.db.get(r.productId)
            if (product) {
                await ctx.db.patch(product._id, { stock: product.stock + r.quantity })
            }
            await ctx.db.patch(r._id, { status: "released" })
        }
    },
})

// Public action called from the cancel route.
// Releases stock directly (no webhook needed) then expires the Stripe sessions.
export const releaseAndExpireMyReservations = action({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return

        const sessionIds = await ctx.runMutation(
            internal.reservations.releaseUserActiveReservations,
            { userId: identity.subject }
        )

        // Expire each open Stripe session so the user cannot accidentally complete
        // payment on a stale browser tab after returning to cart.
        for (const sessionId of sessionIds) {
            await stripe.checkout.sessions.expire(sessionId).catch(() => {})
        }
    },
})
