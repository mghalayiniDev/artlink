"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useTranslations } from "use-intl"
import { Shield, Tag, Truck, Wrench } from "lucide-react"

export default function WhyChooseUs() {
    const t= useTranslations("whyChooseUs")

    const features = [
        {
            icon: Shield,
            title: t('qualityTitle'),
            description: t('qualityDesc'),
        },
        {
            icon: Tag,
            title: t('valueTitle'),
            description: t('valueDesc'),
        },
        {
            icon: Wrench,
            title: t('customTitle'),
            description: t('customDesc'),
        },
        {
            icon: Truck,
            title: t('deliveryTitle'),
            description: t('deliveryDesc'),
        },
    ]

    return (
        <section className="-full bg-foreground py-16 md:py-24 relative overflow-hidden">
            {/* Grid Overlay */}
            <div 
                className="absolute inset-0 opacity-5"
                style={{
                backgroundImage: `
                    linear-gradient(to right, white 1px, transparent 1px),
                    linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                }}
            />

            <ContentWrapper className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-orange-500 font-mono text-sm tracking-widest uppercase block">{t('tag')}</span>
                        <span className="font-extrabold uppercase text-4xl md:text-5xl text-background mt-4 mb-6 block">
                            {t('title')}<br />{t('title2')}
                        </span>
                        <p className="text-background/60 text-lg mb-10 max-w-105">
                            {t('desc')}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 md:gap-12">
                            <div>
                                <span className="font-mono text-3xl md:text-4xl font-bold text-orange-500">10+</span>
                                <p className="text-xs text-background/60 uppercase mt-1">{t('years')}</p>
                            </div>
                            <div className="w-px bg-background/20"></div>
                            <div>
                                <span className="font-mono text-3xl md:text-4xl font-bold text-orange-500">10K+</span>
                                <p className="text-xs text-background/60 uppercase mt-1">{t('projects')}</p>
                            </div>
                            <div className="w-px bg-background/20"></div>
                            <div>
                                <span className="font-mono text-3xl md:text-4xl font-bold text-orange-500">90%</span>
                                <p className="text-xs text-background/60 uppercase mt-1">{t('satisfaction')}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - Feature Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="group bg-transparent border border-background/20 p-6 border-t-2 hover:border-t-orange-500 hover:border-t-2 transition-all duration-300"
                            >
                                <feature.icon 
                                    className="w-8 h-8 text-background/60 stroke-1 mb-4 group-hover:text-orange-500 transition-colors"
                                />
                                <span className="font-bold uppercase text-background text-sm mb-2">
                                    {feature.title}
                                </span>
                                <p className="text-background/50 text-sm">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ContentWrapper>
        </section>
    )
}