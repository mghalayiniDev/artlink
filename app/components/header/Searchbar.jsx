"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Search, Loader2, Inbox, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import SearchResult from "./searchbar/searchResult"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useDebounce } from "@/hooks/useDebounce"
import ContentWrapper from "../ContentWrapper"

export default function Searchbar({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState("")
    const inputRef = useRef(null)
    const locale = useLocale()
    const t = useTranslations("header")

    const debouncedQuery = useDebounce(searchQuery, 400)

    const filteredProducts = useQuery(
        api.products.searchForProduct,
        debouncedQuery.trim().length >= 2 ? { query: debouncedQuery } : "skip"
    )

    const isDebouncing = searchQuery !== debouncedQuery && searchQuery.trim().length >= 2
    const isLoading = filteredProducts === undefined && debouncedQuery.trim().length >= 2
    const hasResults = Array.isArray(filteredProducts) && filteredProducts.length > 0
    const noResults = Array.isArray(filteredProducts) && filteredProducts.length === 0 && debouncedQuery.trim().length >= 2

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 80)
        } else {
            setTimeout(() => setSearchQuery(""), 300)
        }
    }, [isOpen])

    // Close on ESC
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose() }
        if (isOpen) window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen, onClose])

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    const showResults = searchQuery.trim().length >= 2

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="search-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Search panel */}
                    <motion.div
                        key="search-panel"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl"
                    >
                        <ContentWrapper>
                            {/* Input row */}
                            <div className="flex items-center gap-4 h-18 border-b border-gray-100">
                                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t("search")}
                                    className="flex-1 h-full text-base font-medium text-gray-900
                                    placeholder:text-gray-400 bg-transparent outline-none"
                                />
                                {(isDebouncing || isLoading) && (
                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl
                                    text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Results */}
                            {showResults && (
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {(isDebouncing || isLoading) && (
                                        <div className="flex items-center gap-3 px-1 py-8 text-gray-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">{t("searching")}…</span>
                                        </div>
                                    )}

                                    {(!isDebouncing && hasResults) && (
                                        <div className="py-3">
                                            {filteredProducts.map((product) => (
                                                <SearchResult product={product} key={product._id} />
                                            ))}
                                            <div className="pt-2 pb-1 border-t border-gray-50 mt-2">
                                                <Link
                                                    href={`/shop?q=${encodeURIComponent(debouncedQuery)}`}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-500
                                                    hover:text-orange-600 transition-colors px-1 py-2"
                                                >
                                                    {t("viewAll")}
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {(!isDebouncing && !isLoading && noResults) && (
                                        <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-3">
                                            <Inbox className="w-8 h-8 opacity-30" />
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-500">{t("noResultsTitle")}</p>
                                                <p className="text-xs text-gray-400 mt-1">{t("noResultsDesc")} &ldquo;{debouncedQuery}&rdquo;</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hint when empty */}
                            {!showResults && (
                                <div className="py-8 flex items-center gap-2 text-gray-300">
                                    <Search className="w-4 h-4" />
                                    <span className="text-sm">Type at least 2 characters to search…</span>
                                </div>
                            )}
                        </ContentWrapper>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
