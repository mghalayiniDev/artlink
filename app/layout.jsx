import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from "next-intl/server"
import { amiri, cairo, inter, jetBrainsMono, playfairDisplay } from '@/fonts'
import Providers from "./components/Providers"
import "./globals.css"

export const metadata = {
    title: "Art Link Premium Doors",
    description: "Art Link specializes in high-quality doors, handrails, and pergolas using modern technologies and a variety of materials tailored to client needs"
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
            </body>
        </html>
    )
}