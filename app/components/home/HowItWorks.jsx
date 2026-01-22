"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useTranslations } from "use-intl"
import { CheckCircle, Hammer, Ruler } from "lucide-react"
import Image from "next/image"

export default function HowItWorks() {
    const t = useTranslations("process")

    const steps = [
        {
            number: '01',
            icon: Ruler,
            title: t('step1Title'),
            description: t('step1Desc'),
            image: "/process-1.jpg",
        },
        {
            number: '02',
            icon: Hammer,
            title: t('step2Title'),
            description: t('step2Desc'),
            image: "/process-2.jpg",
        },
        {
            number: '03',
            icon: CheckCircle,
            title: t('step3Title'),
            description: t('step3Desc'),
            image: "/process-3.jpg",
        }
    ];

    return (
        <section className="w-full bg-background py-16 md:py-24 overflow-hidden">
            <ContentWrapper>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24"
                >
                    <span className="text-orange-500 font-mono text-sm tracking-widest block uppercase">
                        {t('sub')}
                    </span>
                    <span className="font-heading font-extrabold uppercase text-4xl md:text-6xl text-foreground mt-4 block">
                        {t('title1')}<br />{t('title2')}
                    </span>
                </motion.div>

                {/* Steps Container */}
                <div className="space-y-24 md:space-y-32">
                    {steps.map((step, idx) => {
                        const isEven = idx % 2 === 1

                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-18 items-center"
                            >
                                {/* 1. Image */}
                                <div className={`relative w-full ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                                    {/* Decorative Background Frames */}
                                    <div className="absolute inset-0 bg-orange-100/60 rounded-2xl transform translate-x-4 translate-y-4 -z-10" />
                                    <div className="absolute inset-0 bg-orange-50/40 rounded-2xl transform translate-x-8 translate-y-8 -z-20" />

                                    <div className="relative">
                                        {/* Step Number Badge */}
                                        <div className="absolute -top-4 -left-4 z-10 w-14 h-14 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="font-mono text-xl font-bold text-white">{step.number}</span>
                                        </div>

                                        {/* Image wrapper with forced aspect ratio */}
                                        <div className="relative aspect-[1.35/1] w-full overflow-hidden rounded-xl shadow-2xl">
                                            <Image 
                                                src={step.image}
                                                alt={step.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover"
                                                priority={idx === 0}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col space-y-4 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                                    {/* Icon */}
                                    <div className="w-13 h-13 bg-neutral-100 border border-foreground/10 flex items-center justify-center mb-8">
                                        <step.icon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <span className="font-extrabold uppercase text-2xl md:text-3xl text-foreground mb-4">
                                        {step.title}
                                    </span>
                                    <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                                        {step.description}
                                    </p>
                                    {/* Progress Indicators */}
                                    <div className="flex gap-2 mt-6">
                                        {steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 transition-all ${
                                                    i === idx ? 'w-10 bg-orange-500' : 'w-6 bg-foreground/20'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </ContentWrapper>
        </section>
    )
}