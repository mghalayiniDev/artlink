"use client"

import { motion } from "framer-motion"
import { Check, Eye, Heart } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

export default function ProductCard({ product, idx }) {
    const [hovered, setHovered] = useState(false)
    const locale = useLocale()
    const t = useTranslations("productcategory")

    return (
        <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="group cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-3/4 border border-foreground/10 overflow-hidden bg-neutral-100">
                <img 
                    src={product.images[0]}
                    alt={product.name[locale] || product.name["en"]}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Favorite Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: hovered  ? 1 : 0,
                        scale: hovered ? 1 : 0.8
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-foreground flex items-center justify-center z-10 
                    cursor-pointer text-background hover:text-orange-500 transition-colors"
                >
                    <Heart className={`w-5 h-5`} />
                </motion.button>

                {/* Quick View Bar */}
                <motion.button
                    initial={{ y: '100%' }}
                    animate={{ y: hovered ? '0%' : '100%' }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 bg-foreground text-background py-3 text-center font-bold uppercase 
                    text-[0.8rem] tracking-wide flex items-center justify-center gap-2.5 font-mono cursor-pointer"
                >
                    <Eye className="w-4 h-4" />
                    {t('quickView')}
                </motion.button>
            </div>

            {/* Product Details */}
            <div className="mt-4.5">
                <span className="font-bold uppercase text-[0.8rem] md:text-[0.85rem] text-foreground leading-normal block">
                    {product.name[locale] || product.name["en"]}
                </span>
                <p className="font-mono text-muted-foreground mt-1.75 text-[0.9rem] font-medium">
                    {product.price.toLocaleString()} {t('currency')}
                </p>
            </div>
        </motion.div>
    )
}