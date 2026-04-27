import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from "next-intl/server"
import { amiri, cairo, inter, jetBrainsMono, playfairDisplay } from '@/fonts'
import Providers from "./components/Providers"
import "./globals.css"
import { Toaster } from 'sonner'

const BASE_URL = process.env.HOST_URL ?? "https://artlink.ae"

export const metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Artlink — Premium Architectural Doors",
        template: "%s | Artlink",
    },
    description: "Artlink specializes in high-quality doors, handrails, and pergolas using modern technologies and a variety of premium materials tailored to client needs.",
    keywords: ["premium doors", "architectural doors", "luxury doors", "UAE doors", "pivot doors", "interior doors", "exterior doors", "Sharjah"],
    openGraph: {
        type: "website",
        locale: "en_AE",
        url: BASE_URL,
        siteName: "Artlink",
        title: "Artlink — Premium Architectural Doors",
        description: "High-performance doors engineered for prestige and presence. Crafted in the UAE.",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Artlink Premium Doors" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Artlink — Premium Architectural Doors",
        description: "High-performance doors engineered for prestige and presence. Crafted in the UAE.",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
}

export default async function RootLayout({ children }) {
    const locale = await getLocale()
    const messages = await getMessages()

    const fonts = `${inter.variable} ${playfairDisplay.variable} ${amiri.variable} ${cairo.variable} ${jetBrainsMono.variable}`;

    return (
        <html
            lang={locale}
            dir={locale === "ar" ? "rtl" : "ltr"}
            suppressHydrationWarning
        >
            <body
                className={fonts}
                suppressHydrationWarning
            >
                <Providers
                    locale={locale}
                >
                    <NextIntlClientProvider messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </Providers>
                <Toaster 
                    position='top-center'
                    className='shadow-none'
                />
            </body>
        </html>
    )
}