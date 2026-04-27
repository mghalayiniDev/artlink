"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import ProductCard from "@/app/components/ProductCard"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { motion } from "framer-motion"
import { ArrowRight, ChevronRight, Heart, ShoppingCart } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function WishList() {
    const t = useTranslations("wishlist")

    const wishlistedProducts = useQuery(api.products.getWishlistAndRecommendations)
    const wishlistLoading = wishlistedProducts === undefined
    const wishlistError   = wishlistedProducts === null

    const count = wishlistedProducts?.wishlist?.length ?? 0

    return (
        <section className="min-h-[70vh] bg-white">

            {/* ── Header band ── */}
            <div className="bg-neutral-100/70 border-b border-gray-200">
                <ContentWrapper className="py-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-3">
                        <Link href="/" className="hover:text-gray-700 transition-colors">{t("home")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-orange-500 font-semibold">{t("wishlist")}</span>
                    </div>
                    <span className="block text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                        {t("header")}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">
                        {wishlistLoading ? "—" : `${count} ${count === 1 ? t("item") : t("items")} ${t("saved")}`}
                    </p>
                </ContentWrapper>
            </div>

            <ContentWrapper className="py-10">

                {/* ── Skeleton ── */}
                {wishlistLoading && (
                    <div className="animate-pulse">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-3/4 bg-neutral-100 rounded-xl" />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Empty state ── */}
                {!wishlistLoading && (wishlistError || count === 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                                <Heart className="w-9 h-9 text-orange-300" />
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                        </div>
                        <p className="text-xl font-extrabold uppercase tracking-tight text-gray-900">{t("titleError")}</p>
                        <p className="text-sm text-gray-400 mt-2 max-w-sm leading-relaxed">{t("descError")}</p>
                        <div className="flex items-center gap-3 mt-7">
                            <Link href="/shop" className="inline-flex items-center gap-2 px-7 h-11 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-colors">
                                {t("btnError")} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link href="/cart" className="inline-flex items-center gap-2 px-7 h-11 border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 text-xs font-semibold rounded-xl transition-colors">
                                <ShoppingCart className="w-3.5 h-3.5" /> {t("btnError2")}
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ── Wishlist items ── */}
                {!wishlistLoading && count > 0 && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {wishlistedProducts.wishlist.map((prod, idx) => (
                                <ProductCard key={prod._id} product={prod} idx={idx} />
                            ))}
                        </div>

                        {wishlistedProducts.recommendations.length > 0 && (
                            <div className="mt-16">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">
                                        {t("youMightLikeHeader")}
                                    </span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {wishlistedProducts.recommendations.map((prod, idx) => (
                                        <ProductCard key={prod._id} product={prod} idx={idx} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </ContentWrapper>
        </section>
    )
}
