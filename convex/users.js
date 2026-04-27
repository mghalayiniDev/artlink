import { v } from "convex/values"
import { internalMutation, internalQuery, query } from "./_generated/server"
import { internal } from "./_generated/api"

export const upsertFromClerk = internalMutation({
    args: {
        userId: v.string(), 
        name: v.string(), 
        email: v.string(),
        imageURL: v.string(),
        role: v.union(v.literal("user"), v.literal("admin"))
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .unique()

        if (existingUser) {
            const roleChanged = existingUser.role !== args.role

            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                imageURL: args.imageURL,
                role: args.role
            })

            if (roleChanged) {
                await ctx.runMutation(internal.notifications.notifyAdmins, {
                    userId: args.userId,
                    title: {
                        en: "Security: Role Updated 🔐",
                        ar: "أمن النظام: تحديث الصلاحيات 🔐"
                    },
                    body: {
                        en: `User ${args.name} was changed from [${existingUser.role}] to [${args.role}].`,
                        ar: `تم تغيير صلاحيات ${args.name} من [${existingUser.role}] إلى [${args.role}].`
                    },
                    type: "alert",
                })
            }
        } else {
            await ctx.db.insert("users", {
                userId: args.userId,
                name: args.name,
                email: args.email,
                imageURL: args.imageURL,
                role: args.role,
                likedProducts: [],
                orders: [],
                cart: []
            })
            await ctx.runMutation(internal.stats.patch, { totalUsers: 1 })
        }
    }
})

export const deleteFromClerk = internalMutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // 1. Find the user in our DB so we have their email/name
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .unique()

        if (user) {
            // 2. Notify Admins
            await ctx.runMutation(internal.notifications.notifyAdmins, {
                userId: args.userId,
                title: {
                    en: "User Account Removed 🗑️",
                    ar: "تم حذف حساب مستخدم 🗑️"
                },
                body: {
                    en: `User ${user.name} (${user.email}) has been deleted.`,
                    ar: `تم حذف المستخدم ${user.name} (${user.email}).`
                },
                type: "alert",
            })

            // 3. Delete the user record
            await ctx.db.delete(user._id)
            await ctx.runMutation(internal.stats.patch, { totalUsers: -1 })
        }
    }
})

export const isAdmin = internalQuery({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .unique()
        
        return user?.role === "admin"
    }
})

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            return null
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) =>
                q.eq("userId", identity.subject)
            )
            .unique()

        return user
    },
})