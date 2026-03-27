"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ProductCard from "../ProductCard"

export default function ProductCategoryCard({ category, products, idx, length }) {
    const locale = useLocale()
    const t = useTranslations("productcategory")

    const distanceFromEnd = length - 1 - idx
    const bgColor = distanceFromEnd % 2 === 0 ? 'bg-gray-100' : 'bg-white'

    return (
        <div className={`w-full py-16 md:py-24 ${bgColor}`}>
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
                        href={`/products?category=${category._id}`} 
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

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product, pIdx) => (
                        <ProductCard 
                            key={product._id} 
                            product={product}
                            idx={pIdx} 
                        />
                    ))}
                </div>
            </ContentWrapper>
        </div>
    )
}