"use client"

import { motion } from "framer-motion"
import { Eye } from "lucide-react" 
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import Link from "next/link" 

export default function ProductCard({ product, idx }) {
    const [hovered, setHovered] = useState(false)
    const locale = useLocale()
    const t = useTranslations("productcategory")

    const handleButtonClick = (e, action) => {
        e.preventDefault() 
        e.stopPropagation() 
        console.log(action)
    }

    return (
        <Link href={`/product/${product._id}`} passHref>
            <motion.div
                key={product._id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group cursor-pointer relative flex flex-col h-full"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <div className="relative aspect-3/4 border border-foreground/10 overflow-hidden bg-neutral-100">
                    <img 
                        src={product.thumbnail}
                        alt={product.name[locale] || product.name["en"]}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <motion.button
                        type="button"
                        onClick={(e) => handleButtonClick(e, "QuickView")}
                        initial={{ y: '100%' }}
                        animate={{ y: hovered ? '0%' : '100%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 right-0 bg-foreground text-background py-3 text-center font-bold uppercase 
                        text-[0.8rem] tracking-wide flex items-center justify-center gap-2.5 font-mono cursor-pointer z-20"
                    >
                        <Eye className="w-4 h-4" />
                        {t('quickView')}
                    </motion.button>
                </div> 
                
                <div className="mt-4.5">
                    <span className="font-bold uppercase text-[0.8rem] md:text-[0.85rem] text-foreground leading-normal block">
                        {product.name[locale] || product.name["en"]}
                    </span>
                    <p className="font-mono text-muted-foreground mt-1.75 text-[0.9rem] font-medium">
                        {product.price.toLocaleString()} {t('currency')}
                    </p>
                </div>
            </motion.div>
        </Link>
    )
}