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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-18 px-4 md:border rounded-lg shadow-sm"
                        >
                            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                                <Heart size={32} className="text-muted-foreground" />
                            </div>
                            <span className="text-[1.75rem] block font-extrabold text-foreground mb-2">{t("titleError")}</span>
                            <p className="text-[0.9rem] text-muted-foreground mb-6 text-center max-w-sm">
                                {t("descError")}
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <ArrowLeft size={15} />
                                {t("btnError")}
                            </Link>
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