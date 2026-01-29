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
            v.literal("alert")
        )
    },
    handler: async (ctx, args) => {
        // Insert into notifcations
        await ctx.db.insert("notifications", {
            userId: args.userId,
            title: args.title,
            body: args.body,
            type: args.type,
            createdAt: Date.now()
        })
    }
})