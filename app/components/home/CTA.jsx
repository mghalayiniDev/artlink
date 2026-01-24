"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import ContentWrapper from "../ContentWrapper"

export default function CTA() {
    const t = useTranslations("cta")

    return (
        <section className="w-full relative min-h-110 md:min-h-135 flex items-center justify-center 
        overflow-hidden bg-[url(/cta-bg.jpg)] bg-center">
            <div className="absolute inset-0 bg-foreground/75"></div>
            {/* Content */}
            <ContentWrapper>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center"
                >
                    <span className="font-extrabold uppercase text-4xl md:text-6xl lg:text-7xl text-background mb-10 block">
                        {t('title')}<br />{t('title2')}
                    </span>
                    <button className="px-10 md:px-12 py-3.75 md:py-4.5 bg-linear-to-r from-orange-500 to-orange-700 text-background 
                    font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer text-sm md:text-[1rem]">
                        {t('shopButton')}
                    </button>
                </motion.div>
            </ContentWrapper>
        </section>
    )
}