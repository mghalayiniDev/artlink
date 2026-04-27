import { internalMutation } from "./_generated/server"
import { v } from "convex/values"

// Increment or decrement a counter field on the singleton dashboardStats document.
// If the document doesn't exist yet (before initDashboardStats runs), this is a no-op —
// the init mutation will compute correct values from raw data when first called.
export const patch = internalMutation({
    args: {
        totalUsers:    v.optional(v.number()),
        totalProducts: v.optional(v.number()),
        totalOrders:   v.optional(v.number()),
        totalRevenue:  v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.query("dashboardStats").first()
        if (!doc) return

        const updates = {}
        if (args.totalUsers    !== undefined) updates.totalUsers    = Math.max(0, doc.totalUsers    + args.totalUsers)
        if (args.totalProducts !== undefined) updates.totalProducts = Math.max(0, doc.totalProducts + args.totalProducts)
        if (args.totalOrders   !== undefined) updates.totalOrders   = Math.max(0, doc.totalOrders   + args.totalOrders)
        if (args.totalRevenue  !== undefined) updates.totalRevenue  = doc.totalRevenue + args.totalRevenue

        await ctx.db.patch(doc._id, updates)
    },
})
