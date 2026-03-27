"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"

const bgColors = [
    "from-[#1c2840]/80",  
    "from-foreground/70", 
    "from-[#1c2840]/80", 
]

export default function CategoryCard({ index, category, totalColumns }) {
    const locale = useLocale()
    const t = useTranslations("categories")

    const gradientColor = bgColors[index % bgColors.length]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className={totalColumns >= 3 && index === 2 ? "md:col-span-2 lg:col-span-1" : ""}
        >
            <Link
                href={`/shop?category=${category.category._id}`}
                className="group relative rounded-xl overflow-hidden block min-h-[38vh]" 
            >
                <img 
                    src={category.category.thumbnail} 
                    alt={category.category.name[locale] || category.category.name["en"]} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className={`absolute inset-0 bg-linear-to-t ${gradientColor} to-transparent`} />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                    <div>
                        <span className="block font-bold text-background text-[1.425rem]">
                            {category.category.name[locale]|| category.name["en"]}
                        </span>
                        <p className="text-xs text-background/60">
                            {category.totalCount} {category.totalCount === 1 ? t("product") : t("products")}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={14} className="text-background" />
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}