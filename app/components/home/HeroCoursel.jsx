"use client"

import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import ContentWrapper from "../ContentWrapper"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function HeroCoursel() {
    const t = useTranslations("heroCarousel")
    const locale = useLocale()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(0)

    const slides = [
        {
            title: t("one.title"),
            subtitle: t("one.subtitle"),
            description: t("one.description"),
            image: "/hero-bg-one.jpg"
        },
        {
            title: t("two.title"),
            subtitle: t("two.subtitle"),
            description: t("two.description"),
            image: "/hero-bg-two.jpg"
        },
        {
            title: t("three.title"),
            subtitle: t("three.subtitle"),
            description: t("three.description"),
            image: "/hero-bg-three.jpg"
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1)
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [currentSlide, slides.length])

    const goToSlide = (index) => {
        setDirection(index > currentSlide ? 1 : -1)
        setCurrentSlide(index)
    }

     const nextSlide = () => {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setDirection(-1)
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const slide = slides[currentSlide]

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
            center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    }

    return (
        <section className="relative w-full h-[85vh] min-h-150 max-h-225 overflow-hidden bg-foreground">
            {/* Background Images */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                >
                    <Image 
                        fill
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover select-none"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-foreground/70"></div>
                </motion.div>
            </AnimatePresence>

            {/* Corner Decorative Elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-background/30"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-background/30 md:hidden"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-background/30"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-background/30"></div>

            <div className={`absolute ${locale === "ar" ? "left-8" : "right-8"} top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-20`}>
                <div className="w-px h-16 bg-background/30"></div>
                <span
                    className="font-mono uppercase text-xs text-background/60 tracking-[0.3em] whitespace-nowrap select-none"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    {t("side")}
                </span>
                <div className="w-px h-16 bg-background/30"></div>
            </div>

            {/* Main Content */}
            <ContentWrapper className="relative z-10 h-full flex flex-col justify-center items-start text-white">
                <div className="max-w-2xl">
                    {/* Subtitle */}
                    <AnimatePresence mode="wait">
                          <motion.span
                            key={`tag-${currentSlide}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block text-orange-500 font-mono text-sm tracking-[0.3em] uppercase mb-6"
                        >
                            {slide.subtitle}
                        </motion.span>
                    </AnimatePresence>

                    {/* Title */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`title-${currentSlide}`}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <span className="font-extrabold uppercase text-3xl md:text-4xl lg:text-5xl 
                            text-background leading-[1.1] mb-2 tracking-tight">
                                {slide.title}
                            </span>
                        </motion.div>
                    </AnimatePresence>

                    {/* Description */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`desc-${currentSlide}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-background/70 text-lg mt-6 mb-10 max-w-lg leading-relaxed"
                        >
                            {slide.description}
                        </motion.p>
                    </AnimatePresence>

                    {/* Buttons */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`btns-${currentSlide}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                href="/shop"
                                className="px-8 py-4 bg-orange-500 text-background font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-colors md:max-w-57.5 text-center w-full"
                            >
                                {t('btn')}
                            </Link>

                            <Link
                                href="#about"
                                className="px-8 py-4 border border-background text-background font-bold uppercase tracking-wider text-sm hover:bg-background hover:text-foreground transition-colors md:max-w-57.5 text-center w-full"
                            >
                                {t('subbtn')}
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </ContentWrapper>

            {/* Navigation Arrows */}
            <div className="absolute left-8 bottom-8 hidden md:flex gap-2 z-20">
                 <button
                    onClick={prevSlide}
                    className="w-12 h-12 border border-background/30 flex items-center justify-center
                    text-background/60 hover:bg-background hover:text-foreground transition-all cursor-pointer"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className={`w-5 h-5 ${locale === "ar" ? "rotate-180" : ""}`}/>
                </button>
                <button
                    onClick={nextSlide}
                    className="w-12 h-12 border border-background/30 flex items-center justify-center 
                    text-background/60 hover:bg-background hover:text-foreground transition-all cursor-pointer"
                    aria-label="Next slide"
                >
                    <ChevronRight className={`w-5 h-5 ${locale === "ar" ? "rotate-180" : ""}`}/>
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1 transition-all duration-300 cursor-pointer ${
                        index === currentSlide 
                            ? 'w-10 bg-orange-500' 
                            : 'w-6 bg-background/40 hover:bg-background/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    )
}