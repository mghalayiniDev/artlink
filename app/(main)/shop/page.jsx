"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { categories, products } from "@/sample"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

export default function Shop() {
    const t = useTranslations("shop")
    const locale = useLocale()

    return (
        <section className="min-h-screen">
            {/* Premium Header */}
            <div className="relative bg-foreground text-background py-24 md:py-32 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(90deg, transparent 49%, currentColor 49%, currentColor 51%, transparent 51%), linear-gradient(0deg, transparent 49%, currentColor 49%, currentColor 51%, transparent 51%)',
                        backgroundSize: '60px 60px'
                    }} />
                </div>

                <ContentWrapper className="relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-px w-12 bg-orange-500" />
                            <span className="text-orange-500 font-mono text-xs tracking-[0.3em] uppercase">
                                {t('explore')}
                            </span>
                        </div>
                        <span className="block font-extrabold uppercase text-5xl md:text-7xl leading-[0.9] tracking-tight">
                            {t('header')}
                        </span>
                        <p className="text-background/60 mt-6 text-lg max-w-xl leading-relaxed">
                            {t('desc')}
                        </p>
                        {/* Quick Category Pills */}
                        <div className="flex flex-wrap gap-3 mt-10 max-w-xl">
                            {categories.slice(0, 4).map((category, idx) => (
                                <motion.a
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                                    href={`/shop?category=${category.id}`}
                                    className="px-5 py-2.5 text-sm font-bold uppercase tracking-wide border transition-all duration-300 
                                    border-background/30 hover:border-orange-500 hover:text-orange-500"
                                >
                                    {category.name[locale] || category.name["en"]}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </ContentWrapper>

                {/* Decorative Element */}
                <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-10 hidden lg:block">
                    <div className="absolute inset-0 bg-linear-to-l from-orange-500/30 to-transparent" />
                </div>
            </div>
            
            {/* Shop Content */}
            <section className="py-16 md:py-20">
                <ContentWrapper>
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-82 shrink-0">
                            <div className="sticky top-24 bg-neutral-200/60 p-8">
                                <span className="font-extrabold uppercase text-xl mt-0.5 block">
                                    {t('filters')}
                                </span>

                                {/* Categories */}
                                <div className="my-10">
                                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-neutral-400/70">
                                        <ChevronDown className="w-4 h-4 text-orange-500" />
                                        <span className="font-bold uppercase text-sm tracking-wide bold">
                                            {t('category')}
                                        </span>
                                    </div>
                                    <div className="space-y-4.5">
                                        {categories.map((category, idx) => (
                                            <label
                                                key={idx}
                                                className="flex items-center gap-4.5 cursor-pointer group"
                                            >
                                                <Checkbox 
                                                    className="border-neutral-400/70 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                />
                                                <span className="text-sm font-medium group-hover:text-orange-500 transition-colors flex-1">
                                                    {category.name[locale] || category.name["en"]}
                                                </span>
                                                <span className="text-[0.8rem] font-medium font-mono">
                                                    {products.filter(p => p.categoryId === category.id).length}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="pt-2 mb-10">
                                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-neutral-400/70">
                                        <ChevronDown className="w-4 h-4 text-orange-500" />
                                        <span className="font-bold uppercase text-sm tracking-wide bold">
                                            {t('priceRange')}
                                        </span>
                                    </div>
                                    <div className="px-1">
                                        <Slider 
                                            min={0}
                                            max={20000}
                                            step={100}
                                            className="mb-6"
                                        />
                                        <div className="flex justify-between text-sm font-mono">
                                            <span className="bg-neutral-500/25 px-3 py-1">${"1000".toLocaleString()}</span>
                                            <span>—</span>
                                            <span className="bg-neutral-500/25 px-3 py-1">${"20000".toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </ContentWrapper>
            </section>
        </section>
    )
}