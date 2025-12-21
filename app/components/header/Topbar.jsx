"use client"

import { ChevronLeft, ChevronRight, Phone } from "lucide-react"
import ContentWrapper from "../ContentWrapper"
import { useState } from "react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useLocale, useTranslations } from "next-intl"
import Languagedropdown from "./LanguageDropdown"

export default function Topbar({ isScrolled }) {
    const t = useTranslations("header")
    const [api, setApi] = useState(null)
    const locale = useLocale()
    const headerItems = [
        t("headers.header_one"), 
        t("headers.header_two"), 
        t("headers.header_three")
    ]
    const scrollPrev = () => api?.scrollPrev()
    const scrollNext = () => api?.scrollNext()

    return (
        <div className={`bg-[#1a1a1a] text-white/80 py-2 ${isScrolled ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}>
            <ContentWrapper className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <span 
                    className={`${locale === "ar" && "ml-auto"} items-center gap-4 text-[0.8rem] hidden md:flex`}
                    style={{ direction: "ltr" }}
                >
                    <Phone className="w-3 h-3" />
                    +971 55 466 7720 
                </span>
                <div 
                    className="items-center gap-4 flex justify-center" 
                    style={{ direction: "ltr" }}
                >
                    <button onClick={scrollPrev}>
                        <ChevronLeft
                            width={17}
                            height={17}
                            className="text-white/80 cursor-pointer"
                        />
                    </button>
                    <Carousel
                        setApi={setApi}
                        opts={{ loop: true }}
                        className="w-full max-w-42 md:max-w-52.25!"
                    >
                        <CarouselContent className="mx-0!">
                            {headerItems.map((header, idx) => (
                                <CarouselItem
                                    key={idx}
                                    className="basis-full p-0! text-center text-[0.825rem] select-none"
                                >
                                    {header}
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel >
                    <button onClick={scrollNext}>
                        <ChevronRight 
                            width={17}
                            height={17}
                            className="text-white/80 cursor-pointer"
                        />
                    </button>
                </div>
                <div className="hidden md:block">
                    <Languagedropdown />
                </div>
            </ContentWrapper>
        </div>
    )
}