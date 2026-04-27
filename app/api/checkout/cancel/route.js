import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
    // Cancel redirects come from the user's own Stripe checkout — require auth
    // so random unauthenticated requests cannot cancel arbitrary sessions.
    const { userId } = await auth()
    if (!userId) return NextResponse.redirect(new URL("/cart", request.url))

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
        // STRIPE_SECRET_KEY lives in Convex env vars, not Next.js.
        // POST to the Convex HTTP action which has the key and does the release.
        // Convex HTTP URL = NEXT_PUBLIC_CONVEX_URL with .cloud → .site (standard Convex scheme).
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
        if (convexUrl) {
            const siteUrl = convexUrl.replace(".convex.cloud", ".convex.site")
            await fetch(`${siteUrl}/checkout-cancel?session_id=${encodeURIComponent(sessionId)}`, {
                method: "POST",
            }).catch(() => {})
        }
    }

    return NextResponse.redirect(new URL("/cart", request.url))
}
