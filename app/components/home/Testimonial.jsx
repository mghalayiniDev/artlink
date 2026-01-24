"use client"

import { motion } from "framer-motion"
import ContentWrapper from "../ContentWrapper"
import { useTranslations } from "use-intl"
import { Quote, Star } from "lucide-react"
import Image from "next/image"

function RatingStars({ rating }) {
    return (
        <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={
                        i < rating
                        ? "h-4 w-4 fill-orange-500 text-orange-500"
                        : "h-4 w-4 text-muted-foreground/40"
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
        {
            name: t("name1"),
            description: t("testimonial1"),
            rating: 5,
            image: "/testimonial1.png"
        },
        {
            name: t("name2"),
            description: t("testimonial2"),
            rating: 5,
            image: "/testimonial2.png"
        }
    ]

    return (
        <section className="bg-gray-100 py-22 md:pt-30 md:pb-36">
            <ContentWrapper>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-22"
                >
                    <span className="text-gray-600 font-mono text-sm tracking-widest block uppercase">
                        {t('sub')}
                    </span>
                    <span className="font-heading font-extrabold uppercase text-4xl md:text-[3.125rem] text-foreground mt-4 block">
                        {t('title')}
                    </span>
                </motion.div>

                <div className="grid gap-18 lg:grid-cols-2 items-stretch">
                    {testimonials.map((test, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="flex flex-col gap-12"
                        >
                            <Quote className="h-10 w-10 text-muted-foreground/40" aria-hidden />
                            <p
                                className="text-lg text-foreground md:text-[1.35rem] leading-[1.725] font-medium"
                            >
                                "{test.description}"
                            </p>
                            <div className="flex items-center gap-5.5 mt-auto">
                                <Image 
                                    src={test.image}
                                    alt={test.name}
                                    width={44}
                                    height={44}
                                    className="rounded-full shrink-0 object-cover"
                                    loading="lazy"
                                />
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold tracking-wide text-foreground">
                                        {test.name}
                                    </span>
                                    <RatingStars 
                                        rating={test.rating}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ContentWrapper>
        </section>
    )
}