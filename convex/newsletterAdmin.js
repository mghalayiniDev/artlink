import { paginationOptsValidator } from "convex/server"
import { internalMutation, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { resend } from "./resend"
import { sanitizeEmailBody, buildEmailHtml, escapeHtml } from "../lib/emailUtils"

async function assertAdmin(ctx) {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")
    const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", q => q.eq("userId", identity.subject))
        .unique()
    if (!user || user.role !== "admin") throw new Error("Unauthorized")
}

export const getSubscriberStats = query({
    args: {},
    handler: async (ctx) => {
        await assertAdmin(ctx)
        const [active, inactive, allCampaigns] = await Promise.all([
            ctx.db.query("newsletterSubscribers").withIndex("by_status", q => q.eq("isActive", true)).collect(),
            ctx.db.query("newsletterSubscribers").withIndex("by_status", q => q.eq("isActive", false)).collect(),
            ctx.db.query("newsletterCampaigns").collect(),
        ])
        const totalEmailsSent = allCampaigns.reduce((sum, c) => sum + (c.sentCount ?? 0), 0)
        return {
            active: active.length,
            total: active.length + inactive.length,
            totalEmailsSent,
        }
    },
})

export const getSubscribers = query({
    args: {
        paginationOpts: paginationOptsValidator,
        activeOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        const q = args.activeOnly
            ? ctx.db.query("newsletterSubscribers").withIndex("by_status", q => q.eq("isActive", true))
            : ctx.db.query("newsletterSubscribers")
        return await q.order("desc").paginate(args.paginationOpts)
    },
})

export const getCampaigns = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        return await ctx.db
            .query("newsletterCampaigns")
            .withIndex("by_created_at")
            .order("desc")
            .paginate(args.paginationOpts)
    },
})

export const createCampaign = mutation({
    args: {
        subject: v.string(),
        body: v.string(),
        scheduledAt: v.number(),
    },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)

        // Guard: require the from-address to be configured before creating any campaign
        if (!process.env.NEWSLETTER_FROM) {
            return { success: false, error: "NEWSLETTER_FROM environment variable is not set. Configure it in your Convex dashboard before sending campaigns." }
        }

        const subject = args.subject.trim()
        const body = args.body.trim()
        if (!subject) return { success: false, error: "Subject is required" }
        if (subject.length > 200) return { success: false, error: "Subject must be under 200 characters" }
        if (!body) return { success: false, error: "Body is required" }
        if (body.length > 50_000) return { success: false, error: "Body must be under 50,000 characters" }

        const now = Date.now()

        if (args.scheduledAt > now + 30 * 24 * 60 * 60 * 1000) {
            return { success: false, error: "Cannot schedule more than 30 days in advance" }
        }
        if (args.scheduledAt < now - 60_000) {
            return { success: false, error: "Cannot schedule in the past" }
        }

        const sending = await ctx.db
            .query("newsletterCampaigns")
            .withIndex("by_status", q => q.eq("status", "sending"))
            .first()
        if (sending) {
            return { success: false, error: "Another campaign is currently sending. Please wait for it to finish." }
        }

        // Daily limit: max 3 non-cancelled campaigns per 24 hours
        const dayAgo = now - 24 * 60 * 60 * 1000
        const recentCampaigns = await ctx.db
            .query("newsletterCampaigns")
            .withIndex("by_created_at", q => q.gte("createdAt", dayAgo))
            .collect()
        const activeCampaigns = recentCampaigns.filter(c => c.status !== "cancelled")
        if (activeCampaigns.length >= 3) {
            return { success: false, error: "Daily campaign limit reached (3 per 24 hours)" }
        }

        const subscribers = await ctx.db
            .query("newsletterSubscribers")
            .withIndex("by_status", q => q.eq("isActive", true))
            .collect()

        if (subscribers.length === 0) {
            return { success: false, error: "No active subscribers to send to" }
        }

        const recipients = subscribers.map(s => s.email)
        const safeBody = sanitizeEmailBody(body)

        const campaignId = await ctx.db.insert("newsletterCampaigns", {
            subject,
            safeBody,
            status: "scheduled",
            scheduledAt: args.scheduledAt,
            recipients,
            totalRecipients: recipients.length,
            sentCount: 0,
            failedCount: 0,
            currentIndex: 0,
            createdAt: now,
        })

        const delay = Math.max(0, args.scheduledAt - now)
        await ctx.scheduler.runAfter(delay, internal.newsletterAdmin.sendCampaignEmail, {
            campaignId,
            index: 0,
        })

        return { success: true, campaignId }
    },
})

export const cancelCampaign = mutation({
    args: { campaignId: v.id("newsletterCampaigns") },
    handler: async (ctx, args) => {
        await assertAdmin(ctx)
        const campaign = await ctx.db.get(args.campaignId)
        if (!campaign) return { success: false, error: "Campaign not found" }
        if (campaign.status === "sent") return { success: false, error: "Campaign already fully sent" }
        if (campaign.status === "cancelled") return { success: false, error: "Already cancelled" }
        await ctx.db.patch(args.campaignId, { status: "cancelled" })
        return { success: true }
    },
})

// Internal: sends one email then schedules the next one 60s later
export const sendCampaignEmail = internalMutation({
    args: {
        campaignId: v.id("newsletterCampaigns"),
        index: v.number(),
    },
    handler: async (ctx, { campaignId, index }) => {
        const campaign = await ctx.db.get(campaignId)
        if (!campaign || campaign.status === "cancelled") return

        // Idempotency: if a Convex retry re-runs this index after it was already
        // processed, skip to avoid duplicate emails.
        if (campaign.currentIndex > index) return

        const from = process.env.NEWSLETTER_FROM
        if (!from) {
            console.error("Newsletter: NEWSLETTER_FROM env var not set — aborting campaign", campaignId)
            await ctx.db.patch(campaignId, { status: "cancelled" })
            return
        }

        const hostUrl = process.env.HOST_URL ?? "https://artlink.ae"

        if (index === 0) {
            await ctx.db.patch(campaignId, { status: "sending" })
        }

        const email = campaign.recipients[index]
        if (email === undefined) {
            await ctx.db.patch(campaignId, { status: "sent", sentAt: Date.now() })
            return
        }

        // Fetch subscriber (for unsubscribe token) and user (for name) in parallel
        const [subscriber, user] = await Promise.all([
            ctx.db.query("newsletterSubscribers").withIndex("by_email", q => q.eq("email", email)).unique(),
            ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).unique(),
        ])

        // Skip if unsubscribed after campaign was created
        if (!subscriber?.isActive) {
            await ctx.db.patch(campaignId, {
                failedCount: campaign.failedCount + 1,
                currentIndex: index + 1,
            })
            const latest = await ctx.db.get(campaignId)
            if (!latest || latest.status === "cancelled") return
            const nextIndex = index + 1
            if (nextIndex < campaign.recipients.length) {
                await ctx.scheduler.runAfter(60_000, internal.newsletterAdmin.sendCampaignEmail, { campaignId, index: nextIndex })
            } else {
                await ctx.db.patch(campaignId, { status: "sent", sentAt: Date.now() })
            }
            return
        }

        const token = subscriber.unsubscribeToken ?? ""
        const unsubscribeUrl = token ? `${hostUrl}/unsubscribe?token=${token}` : ""

        // Resolve {{name}} — use account name if they have one, else email prefix
        const recipientName = user?.name ?? email.split("@")[0]

        // Replace merge tags per recipient before wrapping in the email template
        const personalizedBody = campaign.safeBody
            .replace(/\{\{name\}\}/gi, escapeHtml(recipientName))
            .replace(/\{\{email\}\}/gi, escapeHtml(email))

        const html = buildEmailHtml(campaign.subject, personalizedBody, unsubscribeUrl)

        try {
            await resend.sendEmail(ctx, {
                from,
                to: email,
                subject: campaign.subject,
                html,
            })
            await ctx.db.patch(campaignId, {
                sentCount: campaign.sentCount + 1,
                currentIndex: index + 1,
            })
        } catch (err) {
            console.error(`Newsletter: failed to send to ${email}:`, err)
            await ctx.db.patch(campaignId, {
                failedCount: campaign.failedCount + 1,
                currentIndex: index + 1,
            })
        }

        // Re-read to check if cancelled while we were sending
        const latest = await ctx.db.get(campaignId)
        if (!latest || latest.status === "cancelled") return

        const nextIndex = index + 1
        if (nextIndex < campaign.recipients.length) {
            await ctx.scheduler.runAfter(60_000, internal.newsletterAdmin.sendCampaignEmail, {
                campaignId,
                index: nextIndex,
            })
        } else {
            await ctx.db.patch(campaignId, { status: "sent", sentAt: Date.now() })
        }
    },
})
