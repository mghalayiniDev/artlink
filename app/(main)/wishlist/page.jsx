"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import ProductCard from "@/app/components/ProductCard"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { motion } from "framer-motion"
import { ArrowLeft, Heart, Loader, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function WishList() {
    const t = useTranslations("wishlist")

    const wishlistedProducts = useQuery(api.products.getWishlistAndRecommendations)
    const wishlistLoading = wishlistedProducts === undefined
    const wishlistError = wishlistedProducts === null

    return (
        <section className="min-h-[60vh] pt-14 pb-24">
            <ContentWrapper>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{t("wishlist")}</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-10">
                    <div>
                        <span className="text-3xl md:text-[2.5rem] block font-extrabold text-foreground">
                            {t("header")}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2.5">
                            {wishlistLoading ? 
                                <><Loader2 className="w-4 h-4 animate-spin" /> {t("items")} {" "} {t("saved")}</> : (
                                    <>
                                        {(wishlistError && !wishlistedProducts) ? <>0 {t("items")} {t("saved")}</> : <> 
                                            {wishlistedProducts?.wishlist?.length} {wishlistedProducts?.wishlist.length === 1 ? t("item") : t("items")} {t("saved")} 
                                        </>}
                                    </>
                                )
                            }
                        </p>
                    </div>
                </div>

                {/* Body */}
                {wishlistLoading ? (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className="w-full h-[40vh] bg-neutral-100 rounded-md" 
                                />
                            ))}
                        </div>
                        
                        <div className="flex flex-col gap-6 mt-16">
                            <div className="max-w-65 w-full h-11 bg-neutral-100" />
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className="w-full h-[40vh] bg-neutral-100 rounded-md" 
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    (wishlistError || !wishlistedProducts || wishlistedProducts?.wishlist.length === 0) ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center py-6"
                        >
                            <div className="relative mb-8">
                                <div className="w-28 h-28 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center">
                                    <Heart size={40} className="text-muted-foreground/40" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                    <span className="text-accent-foreground text-xs font-bold">0</span>
                                </div>
                            </div>
                            <span className="text-2xl block font-bold text-foreground mb-2">{t("titleError")}</span>
                            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
                                {t("descError")}
                            </p>
                            <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-7 py-3 bg-orange-500 text-accent-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                {t("btnError")}
                            </Link>
                            <Link
                                href="/cart"
                                className="inline-flex items-center gap-2 px-7 py-3 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                            >
                                {t("btnError2")}
                            </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {wishlistedProducts.wishlist.map((prod) => (
                                    <ProductCard 
                                        key={prod._id}
                                        product={prod}
                                    />
                                ))}
                            </div>
                            
                            {/* You Might Also Like */}
                            {wishlistedProducts.recommendations.length > 0 && (
                                <div className="flex flex-col gap-6 mt-16">
                                    <span className="text-2xl block font-extrabold text-foreground mb-6">{t("youMightLikeHeader")}</span>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {wishlistedProducts.recommendations.map((prod) => (
                                            <ProductCard 
                                                key={prod._id}
                                                product={prod}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )
                )}
            </ContentWrapper>
        </section>
    )
}