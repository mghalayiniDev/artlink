"use client"

import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import { useState } from "react"

export default function CategoryCard({ cat, height=null, index, span }) {
    const [hover, setOnHover] = useState(false)
    const locale = useLocale()

    return (
        <motion.a
            href={`/shop?category=${cat.id}`}
            className={`relative overflow-hidden cursor-pointer group ${span} ${height}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onHoverStart={() => setOnHover(true)}
            onHoverEnd={() => setOnHover(false)}
        >
            {/* Image */}
            <motion.img 
                src={cat.image}
                alt={cat.name[locale] || cat.name['en']}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{ scale: hover ? 1.05 : 1 }}
                transition={{ duration: 0.4 }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-foreground/35" />
            
            {/* Hover Border */}
            <motion.div
                className="absolute inset-2 border border-background pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: hover ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Text - Outlined */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
                <span
                    className="font-extrabold text-[3rem] md:text-[3.125rem] lg:text-[2.65rem] uppercase tracking-tighter 
                    text-center px-4 transition-colors duration-300 font-mono text-white"
                    style={{
                        WebkitTextStroke: locale !== "ar" && '2px white',
                        color: locale !== "ar" && 'transparent',
                    }}
                >
                    {cat.name[locale] || cat.name['en']}
                </span>
            </div>
        </motion.a>
    )
}