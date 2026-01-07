"use client"

import { products } from "@/sample"
import { AnimatePresence, motion } from "framer-motion"
import { Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import SearchResult from "./searchbar/searchResult"

export default function Searchbar() {
    const [searchQuery, setSearchQuery] = useState('') 
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const locale = useLocale()
    const t = useTranslations("header")

    const filteredProducts = searchQuery.trim ()
        ? products.filter(product =>
            product.name["en"].toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
            product.name["ar"].toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
        ) : []

    useEffect(() => {
        if (!isSearchFocused) {
            setSearchQuery('')
        }
    }, [isSearchFocused])

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 80 && isSearchFocused) {
                        setIsSearchFocused(false)
                        setSearchQuery('')
                    }
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [isSearchFocused])

    return (
        <div className="flex relative w-full">
            <div className="relative w-full">
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder={t('search')}
                    className={`w-full h-10 px-4 ${locale === "ar" ? "pl-10" : "pr-10"} py-2 border border-foreground bg-transparent text-foreground placeholder:text-muted-foreground 
                    placeholder:uppercase placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono font-semibold`}
                />
                <Search className={`absolute ${locale === "ar" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
            </div>
            <AnimatePresence>
                {(isSearchFocused && filteredProducts.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-background border border-foreground z-50 max-h-60 overflow-y-auto overflow-x-hidden"
                    >
                        {filteredProducts.map((product, idx) => (
                            <SearchResult product={product} key={idx} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}