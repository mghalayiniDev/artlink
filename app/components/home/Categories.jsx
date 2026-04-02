"use client"

import ContentWrapper from "../ContentWrapper"
import { motion } from "framer-motion"
import { useTranslations } from "use-intl"
import CategoryCard from "./CategoryCard"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Categories({ categories, categoriesLoading, categoriesError }) {
    const t = useTranslations("categories")

    const totalColumns = 
        categories?.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"

    return (
        categoriesLoading ? (
            <ContentWrapper className="w-full py-16 md:py-20 lg:py-24">
                <div className="flex flex-col gap-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        <div className="w-full h-[38vh] bg-neutral-100 rounded-md" />
                        <div className="w-full h-[38vh] bg-neutral-100 rounded-md" />
                        <div className="w-full h-[38vh] bg-neutral-100 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div className="w-full h-[38vh] bg-neutral-100 rounded-md" />
                        <div className="w-full h-[38vh] bg-neutral-100 rounded-md" />
                    </div>
                </div>
            </ContentWrapper>
        ) : (
            (!categoriesError && categories.length >= 2) && (
                <section className="relative w-full bg-background py-16 md:py-22 lg:py-30">
                    <ContentWrapper>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mb-20"
                        >
                            <span className="text-orange-500 font-mono text-sm tracking-widest">
                                {t('subheader')}
                            </span>
                            <div className="flex flex-col gap-2.5 lg:flex-row lg:justify-between lg:items-center">
                                <span className="font-extrabold uppercase text-4xl md:text-[2.65rem] text-foreground mt-2 block">
                                    {t('header')}
                                </span>
                                {/* Navigation Arrows */}
                                <Link
                                    href="/shop"
                                    className="font-semibold text-[0.825rem] flex items-center gap-2.5 mt-auto hover:underline w-fit"
                                >
                                    {t("viewAllCategories")}
                                    <ArrowRight width={12} height={12} />
                                </Link>
                            </div>
                        </motion.div>

                        <div className={`grid ${totalColumns} gap-7`}>
                            {categories.slice(0,3).map((category, idx) => (
                                <CategoryCard 
                                    key={idx}
                                    index={idx}
                                    category={category}
                                    totalColumns={categories.length}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-7">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="relative rounded-xl overflow-hidden bg-[#1c2840] p-8 md:p-10 flex flex-col justify-center min-h-[38vh]"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#d8b054]/10 -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#d8b054]/5 translate-y-1/2 -translate-x-1/2" />
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b054] font-bold mb-2">
                                    {t('custom_subheader')}
                                </p>
                                <span className="block text-3xl md:text-4xl font-heading font-extrabold text-background leading-tight">
                                    {t('custom_title_1')}
                                    <br />{t('custom_title_2')}
                                </span>
                                <p className="text-sm text-background/50 mt-2 max-w-xs">
                                    {t('custom_desc')}
                                </p>
                                <Link 
                                    href="/shop" 
                                    className="inline-flex items-center gap-2 mt-5 px-6 py-3  bg-linear-to-r from-[#d8b054] to-[#d8b054]/70 
                                    text-accent-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity w-fit"
                                >
                                    {t('custom_btn')} <ArrowRight size={14} className="rtl:rotate-180" />
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="relative rounded-xl overflow-hidden bg-[#f6f5f3] p-8 md:p-10 flex flex-col justify-center min-h-[38vh] border border-[#d8b054]/20"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#d8b054]/5 -translate-y-1/2 translate-x-1/2" />
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b054] font-bold mb-2">
                                    {t('story_subheader')}
                                </p>
                                <span className="block text-3xl md:text-4xl font-heading font-extrabold text-black leading-tight">
                                    {t('story_title_1')}
                                    <br />{t('story_title_2')}
                                </span>
                                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                                    {t('story_desc')}
                                </p>
                                <Link 
                                    href="/about" 
                                    className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-foreground text-background 
                                    text-sm font-bold rounded-lg hover:opacity-90 transition-opacity w-fit"
                                >
                                    {t('story_btn')} <ArrowRight size={14} className="rtl:rotate-180" />
                                </Link>
                            </motion.div>
                        </div>
                    </ContentWrapper>
                </section>
            )
        )
    )
}