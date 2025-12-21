"use client"

import { Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

export default function Searchbar({ ref }) {
    const locale = useLocale()
    const t = useTranslations("header")

    return (
        <div className="relative w-full max-w-170" ref={ref}>
            <div className="relative border rounded-sm w-full bg-white">
                <input 
                    type="text"
                    placeholder={t("search")}
                    className="px-5 py-2.75 md:py-2 text-[0.825rem] md:text-[0.9rem] w-full font-medium"
                />
                <Search 
                    width={15}
                    height={15}
                    className={`absolute top-[50%] translate-y-[-50%] ${locale === "ar" ? "left-6" : "right-6"} text-gray-600`}
                />
            </div>
        </div>
    )
}