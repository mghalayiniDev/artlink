import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import arcjet, { shield, tokenBucket, slidingWindow, detectBot } from "@arcjet/next"
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isUserRoute  = createRouteMatcher(['/cart', '/wishlist', '/orders(.*)', '/order(.*)'])
const isAuthRoute  = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

const ajAuth = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({ mode: "LIVE", allow: [] }),
        slidingWindow({ mode: "LIVE", interval: "10m", max: 10 }),
    ],
})

const ajAdmin = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
        // Block all bots on admin — no monitor/preview exceptions
        detectBot({ mode: "LIVE", allow: [] }),
        tokenBucket({ mode: "LIVE", refillRate: 60, interval: "1m", capacity: 60 }),
    ],
})

const ajUser = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
        tokenBucket({ mode: "LIVE", refillRate: 20, interval: "1m", capacity: 40 }),
    ],
})

const ajGeneral = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:MONITOR",
                "CATEGORY:PREVIEW",
            ],
        }),
        tokenBucket({ mode: "LIVE", refillRate: 100, interval: "1m", capacity: 200 }),
    ],
})

export default clerkMiddleware(async (auth, req) => {
    let decision

    if (isAdminRoute(req)) {
        decision = await ajAdmin.protect(req, { requested: 1 })
    } else if (isAuthRoute(req)) {
        decision = await ajAuth.protect(req, { requested: 1 })
    } else if (isUserRoute(req)) {
        decision = await ajUser.protect(req, { requested: 1 })
    } else {
        decision = await ajGeneral.protect(req, { requested: 1 })
    }

    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return NextResponse.json(
                { error: "Too many requests. Please slow down." },
                { status: 429, headers: { "Retry-After": "60" } }
            )
        }
        if (decision.reason.isBot()) {
            return NextResponse.json(
                { error: "Bot traffic is not allowed." },
                { status: 403 }
            )
        }
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const authObj = await auth()

    // Redirect already-authenticated users away from auth pages
    if (isAuthRoute(req) && authObj.userId) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // Admin: redirect unauthenticated to sign-in, non-admin to home
    if (isAdminRoute(req)) {
        if (!authObj.userId) {
            const signIn = new URL('/sign-in', req.url)
            signIn.searchParams.set('redirect_url', req.nextUrl.pathname)
            return NextResponse.redirect(signIn)
        }
        if (authObj.sessionClaims?.metadata?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url))
        }
    }

    // Protected user routes require authentication
    if (isUserRoute(req) && !authObj.userId) {
        return NextResponse.rewrite(new URL('/404', req.url))
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ]
}