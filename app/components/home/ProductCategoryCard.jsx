"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { products } from "@/sample"
import ProductCard from "../ProductCard"

export default function ProductCategoryCard({ category, idx }) {
    const locale = useLocale()
    const t = useTranslations("productcategory")

    const categoryProducts = 
        products.filter(p => p.categoryId === category.id).slice(0, 4) || []

    return (
        categoryProducts.length === 0 ? null : (
            <div 
                className={`w-full py-16 md:py-24 ${idx % 2 === 1 ? 'bg-gray-100' : 'bg-white'}`}
            >
                <ContentWrapper>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row md:items-end md:justify-between mb-14"
                    >
                        <span className="font-extrabold uppercase text-4xl md:text-[2.65rem] text-foreground mt-2">
                            {category.name[locale] || category.name["en"]}
                        </span>
                        <Link 
                            href={`/products?category=${category.id}`}
                            className="text-[0.8rem] font-bold uppercase tracking-wide text-foreground 
                            hover:text-orange-500 transition-colors mt-4 md:mt-0 flex items-center gap-2.5"
                        >
                            {t("viewAll")} 
                            <ArrowRight 
                                width={12}
                                height={12}
                                className={`${locale === "ar" ? "rotate-180" : ""}`}
                            />
                        </Link>
                    </motion.div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryProducts.map((product, idx) => (
                            <ProductCard 
                                key={idx}
                                product={product}
                                idx={idx}
                            />
                        ))}
                    </div>
                </ContentWrapper>
            </div>
        )
    )
}