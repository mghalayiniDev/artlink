import RateLimiter from "@convex-dev/rate-limiter"
import { mutation } from "./_generated/server"
import { components } from "./_generated/api"
import { v } from "convex/values"
import { resend } from "./resend"
import { buildEmailHtml, escapeHtml } from "../lib/emailUtils"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    // Per-email: blocks same-address hammering
    subscribePerEmail: {
        kind: "token bucket",
        rate: 1,
        period: 60000,
        capacity: 2,
    },
    // Global: caps total volume regardless of email — limits spam-bombing attacks
    subscribeGlobal: {
        kind: "token bucket",
        rate: 8,
        period: 60000,
        capacity: 15,
    },
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function buildConfirmationEmail(confirmUrl) {
    const safeUrl = escapeHtml(confirmUrl)
    const btn = `display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;`

    const body = `
        <!-- English -->
        <p>Thank you for subscribing to the <strong>Artlink Newsletter</strong>.</p>
        <p>Click the button below to confirm your email address and start receiving updates on our latest premium door collections.</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="${safeUrl}" style="${btn}">Confirm Subscription &rarr;</a>
        </div>
        <p style="font-size:13px;color:#9ca3af;text-align:center;">
            This link is valid for 48 hours.<br>
            If you didn't request this, you can safely ignore this email — you won't be subscribed.
        </p>

        <!-- Divider -->
        <div style="margin:32px 0;border-top:1px solid #e5e7eb;"></div>

        <!-- Arabic -->
        <div dir="rtl" style="text-align:right;">
            <p>شكراً لاشتراكك في <strong>نشرة آرت لينك البريدية</strong>.</p>
            <p>انقر على الزر أدناه لتأكيد بريدك الإلكتروني والبدء في تلقي آخر أخبار مجموعاتنا من الأبواب الفاخرة.</p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${safeUrl}" style="${btn}">&larr; تأكيد الاشتراك</a>
            </div>
            <p style="font-size:13px;color:#9ca3af;text-align:center;">
                هذا الرابط صالح لمدة 48 ساعة.<br>
                إذا لم تطلب هذا، يمكنك تجاهل هذا البريد بأمان — لن تكون مشتركاً.
            </p>
        </div>
    `
    return buildEmailHtml(
        "Confirm your subscription | تأكيد اشتراكك في نشرة آرت لينك",
        body,
        ""
    )
}

export const subscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const from = process.env.NEWSLETTER_FROM
        if (!from) {
            console.error("Newsletter subscribe: NEWSLETTER_FROM env var not set")
            return { success: false, messageKey: "subscribeError" }
        }

        const normalizedEmail = args.email.toLowerCase().trim()

        if (!EMAIL_RE.test(normalizedEmail)) {
            return { success: false, messageKey: "subscribeInvalidEmail" }
        }

        // Global cap first — stops mass different-email attacks from burning Resend quota
        const globalStatus = await rateLimiter.limit(ctx, "subscribeGlobal")
        if (!globalStatus.ok) return { success: false, messageKey: "subscribeRateLimit" }

        // Per-email cap — stops same-address hammering
        const emailStatus = await rateLimiter.limit(ctx, "subscribePerEmail", { key: normalizedEmail })
        if (!emailStatus.ok) return { success: false, messageKey: "subscribeRateLimit" }

        const existing = await ctx.db
            .query("newsletterSubscribers")
            .withIndex("by_email", q => q.eq("email", normalizedEmail))
            .unique()

        // Already confirmed and active — nothing to do
        if (existing?.isActive) {
            return { success: false, messageKey: "subscribeAlreadyActive" }
        }

        const hostUrl = process.env.HOST_URL ?? "https://artlink.ae"
        let verificationToken

        if (existing) {
            // Previously unsubscribed OR pending confirmation — reuse or issue a fresh token
            verificationToken = existing.verificationToken ?? crypto.randomUUID()
            await ctx.db.patch(existing._id, { verificationToken })
        } else {
            verificationToken = crypto.randomUUID()
            await ctx.db.insert("newsletterSubscribers", {
                email: normalizedEmail,
                isActive: false,
                createdAt: Date.now(),
                verificationToken,
            })
        }

        const confirmUrl = `${hostUrl}/newsletter/confirm?token=${verificationToken}`
        const html = buildConfirmationEmail(confirmUrl)

        await resend.sendEmail(ctx, {
            from,
            to: normalizedEmail,
            subject: "Confirm your Artlink newsletter subscription",
            html,
        })

        return { success: true, messageKey: "subscribeCheckInbox" }
    },
})

export const confirmSubscription = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        if (!token || token.length < 8) return { success: false }

        const subscriber = await ctx.db
            .query("newsletterSubscribers")
            .withIndex("by_verification_token", q => q.eq("verificationToken", token))
            .unique()

        if (!subscriber) return { success: false }

        // Idempotent — already confirmed
        if (subscriber.isActive) return { success: true, alreadyConfirmed: true }

        await ctx.db.patch(subscriber._id, {
            isActive: true,
            verificationToken: undefined,
            unsubscribeToken: crypto.randomUUID(),
        })

        return { success: true }
    },
})

export const unsubscribeByToken = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        if (!token || token.length < 8) return { success: false }

        const subscriber = await ctx.db
            .query("newsletterSubscribers")
            .withIndex("by_token", q => q.eq("unsubscribeToken", token))
            .unique()

        if (!subscriber) return { success: false }
        if (!subscriber.isActive) return { success: true, alreadyUnsubscribed: true }

        await ctx.db.patch(subscriber._id, { isActive: false })
        return { success: true }
    },
})
