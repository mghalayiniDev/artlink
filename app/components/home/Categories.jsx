"use client"

import ContentWrapper from "../ContentWrapper"
import { motion } from "framer-motion"
import { useLocale, useTranslations } from "use-intl"
import CategoryCard from "./CategoryCard"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Categories({ categories, categoriesLoading, categoriesError }) {
    const t = useTranslations("categories")
    const locale = useLocale()

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
                <section className="relative w-full bg-background py-20 md:py-28">
                    <ContentWrapper>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mb-10"
                        >
                            <span className="text-orange-500 font-bold text-sm tracking-widest">
                                {t('subheader')}
                            </span>
                            <div className="flex flex-col gap-2.5 lg:flex-row lg:justify-between lg:items-center">
                                <span className="font-extrabold uppercase text-4xl md:text-[2.65rem] text-foreground mt-2 block">
                                    {t('header')}
                                </span>
                                <Link
                                    href="/shop"
                                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-600 hover:text-orange-500 transition-colors mt-auto w-fit"
                                >
                                    {t("viewAllCategories")}
                                    <ArrowRight width={12} height={12} className={`${locale === "ar" ? "rotate-180" : ""}`} />
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
                                className="relative rounded-xl overflow-hidden bg-foreground p-10 flex flex-col justify-center min-h-[42vh]"
                            >
                                <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold mb-3">
                                    {t('custom_subheader')}
                                </p>
                                <span className="block text-3xl md:text-4xl font-heading font-extrabold text-background leading-tight">
                                    {t('custom_title_1')}
                                    <br />{t('custom_title_2')}
                                </span>
                                <p className="text-sm text-background/50 mt-3 max-w-sm">
                                    {t('custom_desc')}
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-2 mt-6 px-8 h-11 bg-orange-500 hover:bg-orange-600
                                    text-white text-sm font-bold rounded-lg transition-colors w-fit"
                                >
                                    {t('custom_btn')} <ArrowRight size={14} className="rtl:rotate-180" />
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="relative rounded-xl overflow-hidden bg-neutral-100/70 p-10 flex flex-col justify-center min-h-[42vh] border border-gray-200"
                            >
                                <p className="text-[10px] uppercase tracking-[0.3em] text-orange-500 font-bold mb-3">
                                    {t('story_subheader')}
                                </p>
                                <span className="block text-3xl md:text-4xl font-heading font-extrabold text-gray-900 leading-tight">
                                    {t('story_title_1')}
                                    <br />{t('story_title_2')}
                                </span>
                                <p className="text-sm text-gray-500 mt-3 max-w-sm">
                                    {t('story_desc')}
                                </p>
                                <Link
                                    href="/about"
                                    className="inline-flex items-center gap-2 mt-6 px-8 h-11 bg-foreground text-background
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