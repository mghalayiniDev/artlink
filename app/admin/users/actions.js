"use server"

import { auth, clerkClient } from '@clerk/nextjs/server'

const VALID_ROLES = ["user", "admin"]

export async function updateUserRole(userId, newRole) {
    const client = await clerkClient()
    const { sessionClaims, userId: currentUserId } = await auth()

    // 1. Authorization: Only admins can call this
    if (sessionClaims?.metadata?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can manage roles")
    }

    // 2. Validation: Is the role valid?
    if (!VALID_ROLES.includes(newRole)) {
        throw new Error("Invalid role specified")
    }

    // 3. Safety: Prevent self-demotion
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

        // 4. Admin Protection: Check existing role safely
        if (targetUser.publicMetadata?.role === "admin") {
            return { 
                success: false, 
                error: "Protected: You cannot change the role of an existing admin" 
            }
        }

        // 5. Execute Update
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
    const { sessionClaims, userId: currentUserId } = await auth()

    // 1. Authorization: Only admins can delete users
    if (sessionClaims?.metadata?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can delete users")
    }

    // 2. Safety: Prevent self-deletion
    if (userId === currentUserId) {
        return { 
            success: false, 
            error: "You cannot delete your own account from the admin dashboard" 
        }
    }

    try {
        const targetUser = await client.users.getUser(userId)

        // 3. Admin Protection: Prevent accidental deletion of other admins
        if (targetUser.publicMetadata?.role === "admin") {
            return { 
                success: false, 
                error: "Protected: You cannot delete another administrator" 
            }
        }

        // 4. Execute Deletion
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