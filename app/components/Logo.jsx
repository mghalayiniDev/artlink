"use client"

import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

export default function Logo({ variant = "dark" }) {
    const t = useTranslations("logo")
    const locale = useLocale()
    const isLight = variant === "light"

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
                className={`text-[1.175rem] md:text-2xl tracking-tighter uppercase font-extrabold ${locale === "ar" ? "font-cairo" : "font-mono"}`}
                style={{ color: isLight ? "#111827" : "white" }}
            >
                {t("main")}
            </span>
        </Link>
    )
}