"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useTranslations } from "use-intl"
import { Star } from "lucide-react"
import Image from "next/image"

function RatingStars({ rating }) {
    return (
        <div className="flex items-center gap-0.5 select-none" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={
                        i < rating
                            ? "h-[15px] w-[15px] fill-orange-500 text-orange-500"
                            : "h-[15px] w-[15px] fill-gray-200 text-gray-200"
                    }
                    aria-hidden
                />
            ))}
        </div>
    )
}

export default function Testimonial() {
    const t = useTranslations("testimonial")

    const testimonials = [
        { name: t("name1"), description: t("testimonial1"), rating: 5, image: "/testimonial1.png" },
        { name: t("name2"), description: t("testimonial2"), rating: 5, image: "/testimonial2.png" },
    ]

    return (
        <section className="bg-neutral-100/70 border-t border-b border-gray-200 py-24 md:py-32">

            <ContentWrapper>

                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-flex items-center gap-2.5 text-orange-500 font-bold text-xs tracking-[0.2em] uppercase mb-5">
                        <span className="h-px w-8 bg-orange-400/60" />
                        {t("sub")}
                        <span className="h-px w-8 bg-orange-400/60" />
                    </span>
                    <span className="block font-heading font-extrabold uppercase text-4xl md:text-[3.125rem] text-gray-900 leading-tight">
                        {t("title")}
                    </span>
                </motion.div>

                {/* Cards */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {testimonials.map((test, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.13 }}
                            className="relative flex flex-col gap-7 overflow-hidden rounded-3xl
                                       border border-gray-100 bg-white p-8 md:p-10
                                       shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
                        >
                            {/* Stars */}
                            <RatingStars rating={test.rating} />

                            {/* Quote body */}
                            <p className="relative text-gray-700 text-[1.05rem] md:text-[1.1rem] leading-[1.8] font-medium">
                                {test.description}
                            </p>

                            {/* Divider */}
                            <div className="h-px bg-gray-100" />

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <Image
                                        src={test.image}
                                        alt={test.name}
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover ring-2 ring-orange-100 ring-offset-2"
                                        loading="lazy"
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-orange-500 ring-2 ring-white">
                                        <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-[0.9rem] tracking-wide">
                                        {test.name}
                                    </p>
                                    <p className="text-[0.75rem] text-orange-500 font-semibold mt-0.5">
                                        {t("verified")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Google Reviews attribution */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-20 flex flex-col items-center gap-2 select-none"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[1.1rem] font-bold text-gray-800">4.7</span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4].map((i) => (
                                <Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" aria-hidden />
                            ))}
                            <span className="relative inline-flex">
                                <Star className="h-4 w-4 fill-gray-200 text-gray-200" aria-hidden />
                                <span className="absolute inset-0 overflow-hidden w-[70%]">
                                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" aria-hidden />
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-[0.72rem] text-gray-400 font-medium">
                            {t("googleReviews")}
                        </span>
                    </div>
                </motion.div>

            </ContentWrapper>
        </section>
    )
}
