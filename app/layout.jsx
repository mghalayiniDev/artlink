import { Amiri, Cairo, Inter, Playfair_Display } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from "next-intl/server"
import "./globals.css"

const inter = Inter({
    subsets: ["latin"], 
    variable: "--font-inter" 
})

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
})

const amiri = Amiri({ 
    subsets: ["arabic"], 
    weight: ['400', '700'],
    variable: "--font-amiri" 
})

const cairo = Cairo({ 
    subsets: ["arabic"], 
    variable: "--font-cairo" 
})

export const metadata = {
    title: "Art Link Premium Doors",
    description: "Art Link specializes in high-quality doors, handrails, and pergolas using modern technologies and a variety of materials tailored to client needs"
}

export default async function RootLayout({ children }) {
    const locale = await getLocale()
    const messages = await getMessages()

    const fonts = `${inter.variable} ${playfairDisplay.variable} ${amiri.variable} ${cairo.variable}`;

    return (
        <html
            lang={locale}
            dir={locale === "ar" ? "rtl" : "ltr"}
        >
            <body
                className={fonts}
            >
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    )
}