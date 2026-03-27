"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Search, Loader2, Inbox } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import SearchResult from "./searchbar/searchResult"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useDebounce } from "@/hooks/useDebounce"

export default function Searchbar() {
    const [searchQuery, setSearchQuery] = useState('') 
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const locale = useLocale()
    const t = useTranslations("header")

    const debouncedQuery = useDebounce(searchQuery, 500)

    const filteredProducts = useQuery(
        api.products.searchForProduct, 
        debouncedQuery.trim().length >= 2 ? { query: debouncedQuery } : "skip"
    )

    const isDebouncing = searchQuery !== debouncedQuery && searchQuery.trim().length >= 2
    const isLoading = filteredProducts === undefined && debouncedQuery.trim().length >= 2
    const hasResults = Array.isArray(filteredProducts) && filteredProducts.length > 0
    const noResults = Array.isArray(filteredProducts) && filteredProducts.length === 0 && debouncedQuery.trim().length >= 2

    useEffect(() => {
        if (!isSearchFocused) {
            const timer = setTimeout(() => setSearchQuery(''), 500)
            return () => clearTimeout(timer)
        }
    }, [isSearchFocused])

    return (
        <div className="flex relative w-full">
            <div className="relative w-full">
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 400)}
                    placeholder={t('search')}
                    className={`w-full h-10 px-4 ${locale === "ar" ? "pl-10" : "pr-10"} py-2 border border-foreground bg-transparent text-foreground 
                    placeholder:text-muted-foreground placeholder:uppercase placeholder:text-xs focus:outline-none focus:ring-1 
                    focus:ring-foreground font-mono font-semibold transition-all duration-200`}
                />
                
                <div className={`absolute ${locale === "ar" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}>
                    {(isDebouncing || isLoading) ? (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-background border border-foreground z-50 max-h-64 overflow-y-auto shadow-xl"
                    >
                        {(isDebouncing || isLoading) && (
                            <div className="flex items-center gap-3 px-4 py-6 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-mono uppercase tracking-wider">{t('searching')}...</span>
                            </div>
                        )}

                        {(!isDebouncing && hasResults) && (
                            <div className="flex flex-col">
                                {filteredProducts.map((product) => (
                                    <SearchResult product={product} key={product._id} />
                                ))}
                            </div>
                        )}

                        {(!isDebouncing && !isLoading && noResults) && (
                            <div className="flex flex-col items-center justify-center px-4 py-8 text-muted-foreground gap-2">
                                <Inbox className="w-6 h-6 opacity-20" />
                                <div className="text-center">
                                    <p className="text-xs font-bold uppercase">{t('noResultsTitle')}</p>
                                    <p className="text-[10px] opacity-60 mt-1">"{debouncedQuery}"</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}