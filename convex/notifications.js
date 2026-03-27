import { v } from "convex/values"
import { internalMutation } from "./_generated/server"

export const notifyAdmins = internalMutation({
    args: {
        userId: v.string(),
        title: v.object({
            en: v.string(),
            ar: v.string()
        }),
        body: v.object({
            en: v.string(),
            ar: v.string()
        }),
        type: v.union(
            v.literal("order_status"), 
            v.literal("promotion"), 
            v.literal("alert"),
            v.literal("inventory")
        )
    },
    handler: async (ctx, args) => {
        const searchTexts = [
            args.title.en,
            args.title.ar,
            args.body.en,
            args.body.ar,
            args.userId
        ].join(" ").toLowerCase()

        // Insert into notifcations
        await ctx.db.insert("notifications", {
            userId: args.userId,
            title: args.title,
            body: args.body,
            type: args.type,
            createdAt: Date.now(),
            searchTexts: searchTexts
        })
    }
})