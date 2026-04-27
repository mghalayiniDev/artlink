"use client"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useEffect, Suspense } from "react"

function PageViewTracker() {
    const pathname   = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!pathname) return
        const url = window.location.origin + pathname +
            (searchParams.toString() ? `?${searchParams.toString()}` : "")
        posthog.capture("$pageview", { $current_url: url })
    }, [pathname, searchParams])

    return null
}

function UserIdentifier() {
    const { user, isSignedIn } = useUser()

    useEffect(() => {
        if (isSignedIn && user) {
            posthog.identify(user.id, {
                email:      user.primaryEmailAddress?.emailAddress,
                name:       user.fullName,
                created_at: user.createdAt,
            })
        } else {
            posthog.reset()
        }
    }, [isSignedIn, user])

    return null
}

export default function PHProvider({ children }) {
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host:          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
            person_profiles:   "identified_only",
            capture_pageview:  false, // manual via PageViewTracker
            capture_pageleave: true,
            autocapture:       false, // keep it lean — no click spam
        })
    }, [])

    return (
        <PostHogProvider client={posthog}>
            <Suspense fallback={null}>
                <PageViewTracker />
                <UserIdentifier />
            </Suspense>
            {children}
        </PostHogProvider>
    )
}
