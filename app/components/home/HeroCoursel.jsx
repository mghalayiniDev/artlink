"use client"

import { useLocale, useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import ContentWrapper from "../ContentWrapper"

export default function HeroCoursel() {
    const t = useTranslations("heroCarousel")
    const locale = useLocale()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const nextSlide = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setTimeout(() => setIsAnimating(false), 800)
    }, [isAnimating])

    useEffect(() => {
        const interval = setInterval(nextSlide, 6000)
        return () => clearInterval(interval)
    }, [nextSlide])

    const slides = [
        {
            title: t("one.title"),
            subtitle: t("one.subtitle"),
            description: t("one.description"),
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
        },
        {
            title: t("two.title"),
            subtitle: t("two.subtitle"),
            description: t("two.description"),
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
        },
        {
            title: t("three.title"),
            subtitle: t("three.subtitle"),
            description: t("three.description"),
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
        }
    ]

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Slides */}
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-1000 ${
                        idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                    {/* Background Image with Ken Burns Effect */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-12000 ease-out"
                        style={{
                            backgroundImage: `url(${slide.image})`,
                            transform: idx === currentSlide ? "scale(1.1)" : "scale(1)",
                        }}
                    />
                    {/* Multi-layer Overlay */}
                    <div className={`absolute inset-0 z-20 ${locale === "ar" ? "bg-linear-to-l" : "bg-linear-to-r"} from-[#1a1a1a]/75 via-charcoal/60 to-[#1a1a1a]/50`} />
                    <div className={`absolute inset-0 z-20 bg-linear-to-t from-[#1a1a1a]/60 via-transparent to-[#1a1a1a]/30`} />
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                        <div className="absolute top-20 left-10 w-px h-40 bg-linear-to-b from-[#bc753b]/50 to-transparent" />
                        <div className="absolute top-32 left-10 w-20 h-px bg-linear-to-r from-[#bc753b]/50 to-transparent" />
                        <div className="absolute bottom-40 right-20 w-px h-60 bg-linear-to-t from-[#bc753b]/30 to-transparent" />
                        <div className="absolute bottom-40 right-20 w-40 h-px bg-linear-to-l from-[#bc753b]/30 to-transparent" />
                        <div className="absolute top-32 right-32 w-24 h-24 border border-[#bc753b]/20 rotate-45" />
                        <div className="absolute bottom-48 left-24 w-16 h-16 border border-[#bc753b]/10 rotate-12" />
                    </div>
                    {/* Content */}
                    <ContentWrapper className="relative h-full flex items-center z-20">
                        <div className={`flex flex-col gap-3 md:gap-5 transition-all duration-1000 ${
                            idx === currentSlide 
                                ? "opacity-100 translate-y-0 visible" 
                                : "opacity-0 translate-y-10 invisible"
                        }`}>
                            <span className="inline-block text-[#d7803a] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[0.75rem] md:text-[1rem]">
                                {slide.subtitle}
                            </span>
                            
                            <h1 className="font-bold text-5xl lg:text-6xl xl:text-7xl max-w-2xl text-white leading-tight">
                                {slide.title}
                            </h1>
                            
                            <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed">
                                {slide.description}
                            </p>
                            
                            <div className="flex flex-col w-full md:flex-row items-stretch gap-5 mt-1.25">
                                <button className="px-6 py-3.25 bg-linear-to-r from-[#e88839] border-2 border-[#e88839] to-[#bc753b] rounded-sm text-neutral-50 font-medium md:max-w-62 w-full hover:brightness-115 cursor-pointer uppercase">
                                    {t("btn")}
                                </button>
                                <button className="px-6 py-3.25 bg-transparent md:max-w-62 w-full border-white border-2 rounded-sm text-neutral-50 font-medium hover:brightness-110 cursor-pointer uppercase hover:bg-white hover:text-black transition-colors">
                                    {t("subbtn")}
                                </button>
                            </div>
                        </div>
                    </ContentWrapper>
                </div>
            ))}
            {/* Vertical Text - Right Side */}
            <div 
                className={`absolute bottom-32 ${locale === "ar" ? "left-8" : "right-8"} z-20 hidden xl:flex flex-col items-center gap-4 select-none`}
            >
                <span className="text-white/40 text-xs tracking-[0.3em] uppercase writing-vertical rotate-180">
                    {t("side")}
                </span>
                <div className="w-px h-20 bg-linear-to-b from-white/40 to-transparent" />
            </div>
            {/* Slides control */}
            <div 
                className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3" 
                style={{ direction: locale === "ar" ? "rtl" : "ltr" }}
            >
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (!isAnimating && currentSlide !== index) {
                                setIsAnimating(true);
                                setCurrentSlide(index);
                                setTimeout(() => setIsAnimating(false), 800);
                            }
                        }}
                        className="relative h-1.25 overflow-hidden transition-all duration-500 cursor-pointer"
                        style={{ width: index === currentSlide ? '50px' : '26px' }}
                    >
                        <div className={`absolute inset-0 rounded-[1px] transition-colors duration-500 ${
                            index === currentSlide ? "bg-white/20" : "bg-white/40 hover:bg-white/60"
                        }`} />
                        
                        {index === currentSlide && (
                            <div 
                                key={currentSlide}
                                className={`absolute top-0 left-0 h-full bg-[#d7803a] rounded-[1px] ${
                                    locale === "ar" ? "animate-progressAr" : "animate-progress"
                                }`}
                                style={{ animationDuration: '6800ms' }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </section>
    )
}