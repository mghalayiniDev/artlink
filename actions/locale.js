"use server"

import { cookies } from "next/headers"

const SUPPORTED_LOCALES = ["en", "ar"]

export async function setUserLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
        locale = 'en'
    }
    const cookieStore = await cookies()
    cookieStore.set("locale", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
    })
}