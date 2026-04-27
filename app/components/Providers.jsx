"use client"

import { arSA, enUS } from "@clerk/localizations"
import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import PHProvider from "./PostHogProvider"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export default function Providers({ locale, children }) {
    const localization = locale === "ar" ? arSA : enUS

    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            localization={localization}
            appearance={{ layout: { unsafe_disableDevelopmentModeWarnings: true } }}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <PHProvider>
                    {children}
                </PHProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}