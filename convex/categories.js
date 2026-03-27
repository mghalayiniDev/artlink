import { v } from "convex/values"
import { query } from "./_generated/server"

export const getCategoryById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const validId = ctx.db.normalizeId("categories", args.id)

        if (!validId) {
            return null
        }

        return await ctx.db.get(validId)
    }
})

export const getAllCategories = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("categories")
            .collect()
    }
})