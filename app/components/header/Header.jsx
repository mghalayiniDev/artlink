"use client"

import { Phone } from "lucide-react"
import ContentWrapper from "../ContentWrapper"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import Languagedropdown from "./LanguageDropdown"

export default function Header() {
    const t = useTranslations("header")
    const [currentIndex, setCurrentIndex] = useState(0)

    const tickerMessages = [
        t("headers.header_one"), 
        t("headers.header_two"), 
        t("headers.header_three")
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % tickerMessages.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [tickerMessages.length])
    
    return (
        <div className="w-full bg-foreground h-10">
            <ContentWrapper className="h-full w-full flex items-center justify-between gap-2">
                {/* Phone */}
                <div className="flex items-center gap-4">
                    <Phone className="w-3 h-2.3 text-background" />
                    <span 
                        className="text-background text-xs font-mono" 
                        dir="ltr"
                    >
                        +971 55 466 7720
                    </span>
                </div>

                {/* Ticker */}
                <div className="hidden sm:flex items-center justify-center flex-1">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-background text-xs font-bold uppercase tracking-widest"
                        >
                            {tickerMessages[currentIndex]}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Language dropdown */}
                <Languagedropdown />
            </ContentWrapper>
        </div>
    )
}