import RateLimiter from "@convex-dev/rate-limiter"
import { mutation } from "./_generated/server"
import { components } from "./_generated/api"
import { v } from "convex/values"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    subscribe: {
        kind: "token bucket",
        rate: 1,
        period: 60000,
        capacity: 2
    }
})

export const subscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return { success: false, message: "You must be logged in to subscribe to the newsletter" }

        const status = await rateLimiter.limit(ctx, "subscribe", { key: identity.subject })
        if (!status.ok) return { success: false, message: "Too many requests. Please wait a moment." }

        const normalizedEmail = args.email.toLowerCase().trim()

        const registeredUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .unique()

        if (!registeredUser) {
            return { 
                success: false, 
                message: "This email is not registered. Please use an account email." 
            }
        }

        const existingSubscriber = await ctx.db
            .query("newsletterSubscribers")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .unique()

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return { 
                    success: false, 
                    message: "This email is already on our list!" 
                };
            } else {
                await ctx.db.patch(existingSubscriber._id, { isActive: true })
                return { 
                    success: true, 
                    message: "Welcome back! You've been resubscribed." 
                }
            }
        }

        await ctx.db.insert("newsletterSubscribers", {
            email: normalizedEmail,
            isActive: true,
            createdAt: Date.now(),
        })

        return { 
            success: true, 
            message: "Thanks for subscribing!" 
        }
    }
})