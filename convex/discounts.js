import { paginationOptsValidator } from "convex/server"
import { internalMutation, internalQuery, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import RateLimiter from "@convex-dev/rate-limiter"
import { components } from "./_generated/api"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    validateCode: {
        kind: "token bucket",
        rate: 5,
        period: 60000,  // 5 checks per minute per user — prevents enumeration
        capacity: 8,
    },
})

async function assertAdmin(ctx) {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")
    const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", q => q.eq("userId", identity.subject))
        .unique()
    if (!user || user.role !== "admin") throw new Error("Unauthorized")
}

// Normalize: uppercase, alphanumeric + hyphens only
function normalizeCode(raw) {
    return raw.toUpperCase().trim().replace(/[^A-Z0-9-]/g, "")
}

function calcDiscount(type, value, subtotal) {
    if (type === "percentage") {
        return Math.round(subtotal * (value / 100) * 100) / 100
    }
    return Math.min(value, subtotal) // fixed — can't exceed subtotal
}

// ─── Core validation logic shared by public + internal callers ────────────────
// strict=false (cart page): maxUses counts only confirmed → never blocks other users mid-checkout
// strict=true  (checkout):  maxUses counts confirmed + active pending → catches simultaneous race
async function validateCodeCore(ctx, { code, subtotal, userId, strict = false }) {
    const discountCode = await ctx.db
        .query("discountCodes")
        .withIndex("by_code", q => q.eq("code", code))
        .unique()

    if (!discountCode)          return { valid: false, error: "Invalid discount code" }
    if (!discountCode.isActive) return { valid: false, error: "This discount code is no longer active" }

    const now = Date.now()
    if (discountCode.expiresAt && discountCode.expiresAt < now)
        return { valid: false, error: "This discount code has expired" }

    if (discountCode.minOrderAmount != null && subtotal < discountCode.minOrderAmount)
        return {
            valid: false,
            error: `Minimum order of ${discountCode.minOrderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED required`,
        }

    if (discountCode.maxUses != null) {
        const usages = await ctx.db
            .query("discountUsages")
            .withIndex("by_code", q => q.eq("codeId", discountCode._id))
            .collect()
        const count = strict
            // Checkout: count confirmed + non-expired pending — closes the simultaneous race window
            ? usages.filter(u =>
                u.status === "confirmed" ||
                (u.status === "pending" && (!u.expiresAt || u.expiresAt > now))
            ).length
            // Cart display: count only confirmed — doesn't block other users during their checkout
            : usages.filter(u => u.status === "confirmed").length
        if (count >= discountCode.maxUses)
            return { valid: false, error: "This discount code has reached its maximum uses" }
    }

    // Per-user limit: count confirmed + non-expired pending BY THIS USER — prevents
    // the same person from holding multiple simultaneous sessions with the same code.
    if (discountCode.maxUsesPerUser != null) {
        const userUsages = await ctx.db
            .query("discountUsages")
            .withIndex("by_code_user", q => q.eq("codeId", discountCode._id).eq("userId", userId))
            .collect()
        const activeUserCount = userUsages.filter(u =>
            u.status === "confirmed" ||
            (u.status === "pending" && (!u.expiresAt || u.expiresAt > now))
        ).length
        if (activeUserCount >= discountCode.maxUsesPerUser)
            return { valid: false, error: "You have already used this code the maximum number of times" }
    }

    const discountAmount = calcDiscount(discountCode.type, discountCode.value, subtotal)

    return {
        valid: true,
        code:           discountCode.code,
        codeId:         discountCode._id,
        type:           discountCode.type,
        value:          discountCode.value,
        discountAmount,
        description:    discountCode.description,
    }
}

// ─── Public: validate a code (called from cart page) ─────────────────────────
// Using mutation so we can run the rate limiter.
export const validateDiscountCode = mutation({
    args: {
        code:     v.string(),
        subtotal: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { valid: false, error: "You must be logged in to use a discount code" }

        const rl = await rateLimiter.limit(ctx, "validateCode", { key: identity.subject })
        if (!rl.ok) return { valid: false, error: "Too many attempts. Please wait a moment." }

        const code = normalizeCode(args.code)
        if (!code || code.length < 3 || code.length > 30)
            return { valid: false, error: "Invalid code format" }

        return validateCodeCore(ctx, { code, subtotal: args.subtotal, userId: identity.subject })
    },
})

// ─── Internal: re-validate during checkout (no rate limit — already in action) ─
export const getDiscountForCheckout = internalQuery({
    args: {
        code:     v.string(),
        userId:   v.string(),
        subtotal: v.number(),
    },
    handler: async (ctx, args) => {
        const code = normalizeCode(args.code)
        if (!code) return null
        const result = await validateCodeCore(ctx, {
            code,
            subtotal: args.subtotal,
            userId:   args.userId,
            strict:   true, // counts pending — prevents simultaneous race at checkout time
        })
        return result.valid ? result : { valid: false, error: result.error }
    },
})

// ─── Internal: reserve a slot when Stripe session is created ─────────────────
// Called inside createPaymentCheckout. Prevents the same code being used in
// two parallel checkout sessions simultaneously.
export const reserveDiscountUsage = internalMutation({
    args: {
        codeId:          v.id("discountCodes"),
        userId:          v.string(),
        stripeSessionId: v.string(),
        discountAmount:  v.number(),
        expiresAt:       v.number(),  // Stripe session TTL (~24h)
    },
    handler: async (ctx, args) => {
        // Cancel any stale pending reservations by the same user for this code
        // (handles the case where they abandoned a previous session)
        const stale = await ctx.db
            .query("discountUsages")
            .withIndex("by_code_user", q => q.eq("codeId", args.codeId).eq("userId", args.userId))
            .collect()
        for (const u of stale) {
            if (u.status === "pending") {
                await ctx.db.patch(u._id, { status: "cancelled" })
            }
        }

        await ctx.db.insert("discountUsages", {
            codeId:          args.codeId,
            userId:          args.userId,
            stripeSessionId: args.stripeSessionId,
            discountAmount:  args.discountAmount,
            status:          "pending",
            appliedAt:       Date.now(),
            expiresAt:       args.expiresAt,
        })
    },
})

// ─── Internal: confirm reservation after payment succeeds ─────────────────────
export const confirmDiscountUsage = internalMutation({
    args: {
        stripeSessionId: v.string(),
        orderId:         v.id("orders"),
        codeId:          v.id("discountCodes"),
        userId:          v.string(),
        discountAmount:  v.number(),
    },
    handler: async (ctx, args) => {
        // Find the pending reservation for this session
        const pending = await ctx.db
            .query("discountUsages")
            .withIndex("by_session", q => q.eq("stripeSessionId", args.stripeSessionId))
            .first()

        if (pending && pending.status === "pending") {
            // Confirm the existing reservation
            await ctx.db.patch(pending._id, {
                status:  "confirmed",
                orderId: args.orderId,
            })
        } else {
            // No reservation found (edge case) — create confirmed record directly
            await ctx.db.insert("discountUsages", {
                codeId:          args.codeId,
                userId:          args.userId,
                orderId:         args.orderId,
                stripeSessionId: args.stripeSessionId,
                discountAmount:  args.discountAmount,
                status:          "confirmed",
                appliedAt:       Date.now(),
            })
        }

        // Increment the denormalized confirmed count.
        // Re-check maxUses here to catch the rare simultaneous-payment race
        // between two different users (payment already processed — we record it
        // but log the over-redemption for admin review).
        const code = await ctx.db.get(args.codeId)
        if (code) {
            if (code.maxUses != null && code.usedCount >= code.maxUses) {
                console.warn(
                    `[discounts] Over-redemption detected on code "${code.code}" ` +
                    `(confirmed=${code.usedCount}, maxUses=${code.maxUses}). ` +
                    `Order ${args.orderId} — payment already collected, recording for audit.`
                )
            }
            await ctx.db.patch(args.codeId, { usedCount: code.usedCount + 1 })
        }
    },
})

// ─── Internal: release reservation when Stripe session expires ────────────────
export const cancelDiscountReservation = internalMutation({
    args: { stripeSessionId: v.string() },
    handler: async (ctx, args) => {
        const pending = await ctx.db
            .query("discountUsages")
            .withIndex("by_session", q => q.eq("stripeSessionId", args.stripeSessionId))
            .first()
        if (pending && pending.status === "pending") {
            await ctx.db.patch(pending._id, { status: "cancelled" })
        }
    },
})

// ─── Admin: paginated list with usage stats ───────────────────────────────────
export const getDiscountCodes = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        return await ctx.db
            .query("discountCodes")
            .withIndex("by_created_at")
            .order("desc")
            .paginate(args.paginationOpts)
    },
})

// ─── Admin: create ────────────────────────────────────────────────────────────
export const createDiscountCode = mutation({
    args: {
        code:           v.string(),
        description:    v.string(),
        type:           v.union(v.literal("percentage"), v.literal("fixed")),
        value:          v.number(),
        maxUses:        v.optional(v.number()),
        maxUsesPerUser: v.optional(v.number()),
        minOrderAmount: v.optional(v.number()),
        expiresAt:      v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        const identity = await ctx.auth.getUserIdentity()

        const code = normalizeCode(args.code)
        if (!code || code.length < 3 || code.length > 30)
            return { success: false, error: "Code must be 3–30 alphanumeric characters (hyphens allowed)" }
        if (!args.description.trim())
            return { success: false, error: "Description is required" }
        if (args.type === "percentage" && (args.value <= 0 || args.value > 100))
            return { success: false, error: "Percentage must be 1–100" }
        if (args.type === "fixed" && args.value <= 0)
            return { success: false, error: "Discount amount must be greater than 0 AED" }
        if (args.maxUses != null && (!Number.isInteger(args.maxUses) || args.maxUses < 1))
            return { success: false, error: "Max uses must be a positive whole number" }
        if (args.maxUsesPerUser != null && (!Number.isInteger(args.maxUsesPerUser) || args.maxUsesPerUser < 1))
            return { success: false, error: "Max uses per user must be a positive whole number" }
        if (args.minOrderAmount != null && args.minOrderAmount < 0)
            return { success: false, error: "Minimum order amount cannot be negative" }
        if (args.expiresAt != null && args.expiresAt < Date.now())
            return { success: false, error: "Expiry date must be in the future" }

        const existing = await ctx.db
            .query("discountCodes")
            .withIndex("by_code", q => q.eq("code", code))
            .unique()
        if (existing) return { success: false, error: `Code "${code}" already exists` }

        await ctx.db.insert("discountCodes", {
            code,
            description:    args.description.trim(),
            type:           args.type,
            value:          args.value,
            maxUses:        args.maxUses,
            maxUsesPerUser: args.maxUsesPerUser,
            minOrderAmount: args.minOrderAmount,
            expiresAt:      args.expiresAt,
            isActive:       true,
            usedCount:      0,
            createdAt:      Date.now(),
            createdBy:      identity.subject,
        })

        return { success: true, code }
    },
})

// ─── Admin: toggle active ─────────────────────────────────────────────────────
export const toggleDiscountCode = mutation({
    args: { codeId: v.id("discountCodes"), isActive: v.boolean() },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        await ctx.db.patch(args.codeId, { isActive: args.isActive })
        return { success: true }
    },
})

// ─── Admin: delete ────────────────────────────────────────────────────────────
export const deleteDiscountCode = mutation({
    args: { codeId: v.id("discountCodes") },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        const code = await ctx.db.get(args.codeId)
        if (!code) return { success: false, error: "Code not found" }
        // Keep usages for audit trail; just delete the code itself
        await ctx.db.delete(args.codeId)
        return { success: true }
    },
})
