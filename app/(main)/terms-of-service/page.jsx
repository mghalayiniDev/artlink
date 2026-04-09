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
                    className="max-w-210"
                >
                    <span className="text-3xl md:text-4xl block font-bold text-foreground mb-3">{t("terms")}</span>
                    <p className="text-sm text-muted-foreground mb-10">{t("lastUpdate")}</p>

                    <div className="space-y-10">
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
                    <hr className="my-12" />
                    <div className="mt-12 p-6 border flex flex-col gap-6 md:flex-row md:justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-sm block font-bold text-foreground mb-1.5">{t("haveQuestions")}</span>
                            <p className="text-sm text-gray-600 max-w-md">{t("haveQuestionsDesc")}</p>
                        </div>
                        <a href="mailto:art.link.for.doors@gmail.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-xs 
                        font-medium uppercase tracking-widest hover:bg-orange-400 transition-colors shrink-0 cursor-pointer">
                            {t("contact")}
                        </a>
                    </div>
                </motion.div>
            </ContentWrapper>
        </section>
    )
}