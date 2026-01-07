import { Amiri, Cairo, Inter, JetBrains_Mono, Playfair_Display } from "next/font/google"

export const inter = Inter({
    subsets: ["latin"], 
    variable: "--font-inter" 
})

export const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
})

export const amiri = Amiri({ 
    subsets: ["arabic"], 
    weight: ['400', '700'],
    variable: "--font-amiri" 
})

export const cairo = Cairo({ 
    subsets: ["arabic"], 
    variable: "--font-cairo" 
})

export const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"], 
    variable: "--font-mono" 
})