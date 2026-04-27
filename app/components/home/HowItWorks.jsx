"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useTranslations } from "use-intl"
import { CheckCircle, Hammer, Ruler } from "lucide-react"
import Image from "next/image"

export default function HowItWorks() {
    const t = useTranslations("process")

    const steps = [
        { number: '01', icon: Ruler,       title: t('step1Title'), description: t('step1Desc'), image: "/process-1.jpg" },
        { number: '02', icon: Hammer,      title: t('step2Title'), description: t('step2Desc'), image: "/process-2.jpg" },
        { number: '03', icon: CheckCircle, title: t('step3Title'), description: t('step3Desc'), image: "/process-3.jpg" },
    ]

    return (
        <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
            <ContentWrapper>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24"
                >
                    <span className="text-orange-500 font-bold text-sm tracking-widest block uppercase">
                        {t('sub')}
                    </span>
                    <span className="font-heading font-extrabold uppercase text-4xl md:text-6xl text-gray-900 mt-4 block">
                        {t('title1')}<br />{t('title2')}
                    </span>
                </motion.div>

                <div className="space-y-24 md:space-y-32">
                    {steps.map((step, idx) => {
                        const isEven = idx % 2 === 1
                        const Icon   = step.icon

                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-18 items-center"
                            >
                                {/* Image */}
                                <div className={`relative w-full ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                                    <div className="absolute inset-0 bg-orange-100/60 rounded-2xl transform translate-x-4 translate-y-4 -z-10" />
                                    <div className="absolute inset-0 bg-orange-50/40 rounded-2xl transform translate-x-8 translate-y-8 -z-20" />
                                    <div className="relative">
                                        <div className="absolute -top-4 -left-4 z-10 w-14 h-14 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                                            <span className="font-mono text-xl font-bold text-white">{step.number}</span>
                                        </div>
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
                                <div className={`relative flex flex-col space-y-5 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                                    {/* Ghost number */}
                                    <span className="absolute -top-6 -left-2 text-[8rem] md:text-[10rem] font-extrabold text-gray-100 leading-none select-none pointer-events-none -z-10">
                                        {step.number}
                                    </span>

                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-orange-500" />
                                    </div>

                                    <span className="font-extrabold uppercase text-2xl md:text-3xl text-gray-900 leading-tight">
                                        {step.title}
                                    </span>

                                    <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </ContentWrapper>
        </section>
    )
}
