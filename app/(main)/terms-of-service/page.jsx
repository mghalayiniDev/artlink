"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { terms } from "@/constants"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import Link from "next/link"
import { useTranslations } from "use-intl"

export default function TermsOfService() {
    const locale = useLocale()
    const t = useTranslations("terms")

    return (
        <section className="pt-12 pb-24">
            <ContentWrapper>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        {t("home")}
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">
                        {t("terms")}
                    </span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl"
                >
                    <span className="text-3xl md:text-4xl block font-bold text-foreground mb-3">{t("terms")}</span>
                    <p className="text-sm text-muted-foreground mb-10">{t("lastUpdate")}</p>

                    <div className="space-y-8">
                        {terms.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <span className="text-lg block font-semibold text-foreground mb-2">
                                    {section.header[locale] || section.header["en"]}
                                </span>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {section.description[locale] || section.description["en"]}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 pt-10 border-t border-border">
                        <p className="text-xs font-medium">
                            {t("contact")}{" "}
                            <a href="mailto:art.link.for.doors@gmail.com" className="text-orange-500 hover:underline">art.link.for.doors@gmail.com</a>
                        </p>
                    </div>
                </motion.div>
            </ContentWrapper>
        </section>
    )
}