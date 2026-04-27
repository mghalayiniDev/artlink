"use server"

import { auth, clerkClient } from '@clerk/nextjs/server'

const VALID_ROLES = ["user", "admin"]

export async function updateUserRole(userId, newRole) {
    const client = await clerkClient()
    const { userId: currentUserId, sessionClaims } = await auth()

    if (!currentUserId) {
        throw new Error("Unauthorized")
    }
    if (sessionClaims?.metadata?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    if (!VALID_ROLES.includes(newRole)) {
        throw new Error("Invalid role specified")
    }

    if (userId === currentUserId) {
        return {
            success: false,
            error: "You cannot change your own role"
        }
    }

    try {
        const targetUser = await client.users.getUser(userId)

        if (targetUser.publicMetadata?.role === newRole) {
            return { success: true }
        }

        if (targetUser.publicMetadata?.role === "admin") {
            return {
                success: false,
                error: "Protected: You cannot change the role of an existing admin"
            }
        }

        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: newRole
            }
        })

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error"
        }
    }
}

export async function deleteUser(userId) {
    const client = await clerkClient()
    const { userId: currentUserId, sessionClaims } = await auth()

    if (!currentUserId) {
        throw new Error("Unauthorized")
    }
    if (sessionClaims?.metadata?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    if (userId === currentUserId) {
        return {
            success: false,
            error: "You cannot delete your own account from the admin dashboard"
        }
    }

    try {
        const targetUser = await client.users.getUser(userId)

        if (targetUser.publicMetadata?.role === "admin") {
            return {
                success: false,
                error: "Protected: You cannot delete another administrator"
            }
        }

        await client.users.deleteUser(userId)

        return { success: true }
    } catch (error) {
        console.error("Delete User Error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error"
        }
    }
}
