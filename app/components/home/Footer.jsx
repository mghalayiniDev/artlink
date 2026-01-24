"use client"

import { useLocale, useTranslations } from "use-intl"
import ContentWrapper from "../ContentWrapper"
import Logo from "../Logo"
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"
import { categories } from "@/sample"
import Link from "next/link"

export default function Footer() {
    const t = useTranslations("footer")
    const locale = useLocale()

    const footerLinks = {
        company: [
            {
                name: t("home"),
                href: "/"
            },
            {
                name: t("AboutUs"),
                href: "/about-us"
            },
            {
                name: t("privacy"),
                href: "/privacy"
            },
            {
                name: t("shop"),
                href: "/shop"
            },
            {
                name: t("contact"),
                href: "/"
            },
        ],
        industries: [
            t("residential"),
            t("commercial"),
            t("hotels"),
            t("offices"),
            t("villas")
        ],
        contact: [
            {
                icon: Phone,
                val: "055 466 7720"
            },
            {
                icon: Instagram,
                val: "art_link_doors"
            },
            {
                icon: MapPin,
                val: "UAE, Industrial Area 5 - Sharjah"
            }
        ]
    }

    return (
        <footer className="w-full bg-foreground pt-28 pb-8">
            <ContentWrapper>
                {/* Main Footer Grid */}
                <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-6 lg:gap-4 pb-18 border-b border-background/20">
                    {/* Logo & Newsletter - Span 2 cols */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-2">
                        <Logo />
                        <p className="text-background/60 text-[0.85rem] mt-4 mb-6 max-w-xs">
                            {t('desc')}
                        </p>
                        {/* Newsletter */}
                        <div className="flex">
                            <input
                                type="email"
                                placeholder={t("emailPlaceholder")}
                                className="flex-1 h-12 px-4 bg-transparent border border-background/30 text-background placeholder:text-background/40 
                                placeholder:text-xs placeholder:uppercase focus:outline-none focus:border-background/60 text-[0.85rem]"
                            />
                            <button className={`w-12 h-12 bg-orange-500 flex items-center justify-center hover:opacity-80 
                            transition-opacity border-y ${locale === "ar" ? "border-l" : "border-r"} border-background/30 cursor-pointer`}>
                                <ArrowRight className={`w-5 h-5 text-background ${locale === "ar" ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="lg:mx-auto">
                        <span className="block font-bold uppercase text-xs tracking-widest text-background mb-6">
                            {t("categories")}
                        </span>
                        <ul className="space-y-3.25">
                            {categories.slice(0, 5).map((category, idx) => (
                                <Link
                                    key={idx}
                                    href={`/shop?category=${category.id}`}
                                    className="text-background/60 text-[0.85rem] hover:text-background transition-colors block"
                                >
                                    {category.name[locale] || category.name["en"]}
                                </Link>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="lg:mx-auto">
                        <span className="block font-bold uppercase text-xs tracking-widest text-background mb-6">
                            {t("company")}
                        </span>
                        <ul className="space-y-3.25">
                            {footerLinks.company.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    className="text-background/60 text-[0.85rem] hover:text-background transition-colors block"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </ul>
                    </div>

                    {/* Industries */}  
                    <div className="lg:mx-auto">
                        <span className="block font-bold uppercase text-xs tracking-widest text-background mb-6">
                            {t("industries")}
                        </span>
                        <ul className="space-y-3.25">
                            {footerLinks.industries.map((text, idx) => (
                                <span
                                    key={idx}
                                    className="text-background/60 text-[0.85rem] block"
                                >
                                    {text}
                                </span>
                            ))}
                        </ul>
                    </div>  

                    {/* Contact */}  
                    <div className="lg:mx-auto">
                        <span className="block font-bold uppercase text-xs tracking-widest text-background mb-6">
                            {t("contact")}
                        </span>
                        <ul className="space-y-3.25">
                            {footerLinks.contact.map((text, idx) => (
                                <span
                                    key={idx}
                                    className="text-background/60 text-[0.85rem] flex items-center gap-2"
                                >
                                    <text.icon className="w-4 h-4 text-orange-500 shrink-0"  />
                                    {text.val}
                                </span>
                            ))}
                        </ul>
                    </div>  
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 pb-6">
                    <p className="text-background/40 text-sm">
                        {t("rights", { date: new Date().getFullYear() })}
                    </p>
                </div>
            </ContentWrapper>
        </footer>
    )
}