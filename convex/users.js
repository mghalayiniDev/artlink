import { v } from "convex/values"
import { internalMutation } from "./_generated/server"
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
                await ctx.db.insert("notifications", {
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
                    createdAt: Date.now()
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
            })
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
            // 2. Send the Goodbye Email (using the data we just found)
            await ctx.runMutation(internal.resend.sendDeleteUserEmail, {
                email: user.email,
                name: user.name
            })

            // 3. Notify Admins
            await ctx.db.insert("notifications", {
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
                createdAt: Date.now()
            })

            // 4. FINALLY, delete the user record
            await ctx.db.delete(user._id)
        }
    }
})