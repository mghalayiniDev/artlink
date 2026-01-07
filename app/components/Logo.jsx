"use client"

import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

export default function Logo({ color="white" }) {
    const t = useTranslations("logo")
    const locale = useLocale()

    return (
        <Link
            href="/"
            className="w-fit flex items-center gap-3.5 select-none"
        >
            <Image 
                src="/artlink.png"
                alt="Artlink"
                width={36}
                height={36}
            />
            <span 
                className={`text-[1.175rem] md:text-2xl tracking-tighter uppercase text-foreground 
                font-extrabold ${locale === "ar" ? "font-cairo" : "font-mono"} text-${color} uppercase`}
            >
                {t("main")}
            </span>
        </Link>
    )
}