"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"
import ContentWrapper from "../ContentWrapper"

export default function HeroCoursel() {
    const t = useTranslations("hero")

    return (
        <section className="w-full min-h-[75vh] bg-neutral-100/70 border-b border-gray-200 flex items-center">
            <ContentWrapper className="py-12">
                <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

                    {/* ── Left: Text ── */}
                    <div className="flex flex-col gap-6">

                        <motion.span
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 text-orange-500 font-semibold text-xs tracking-[0.28em] uppercase"
                        >
                            <span className="h-px w-5 bg-orange-500" />
                            {t("eyebrow")}
                        </motion.span>

                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.08 }}
                            className="block font-extrabold uppercase leading-[0.9] tracking-tight text-gray-900"
                            style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)" }}
                        >
                            {t("title1")}
                            <br />
                            <span className="text-orange-500">{t("title2")}</span>
                        </motion.span>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.18 }}
                            className="text-gray-500 text-[0.95rem] leading-[1.85] max-w-[400px]"
                        >
                            {t("description")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.45, delay: 0.28 }}
                            className="flex flex-wrap gap-3 pt-1"
                        >
                            <Link
                                href="/shop"
                                className="group inline-flex items-center gap-2 px-6 py-3.5
                                    bg-orange-500 hover:bg-orange-600 text-white
                                    text-xs font-bold uppercase tracking-[0.2em]
                                    transition-colors duration-200"
                            >
                                {t("cta")}
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/about"
                                className="inline-flex items-center px-6 py-3.5
                                    border border-gray-300 text-gray-500
                                    hover:border-gray-500 hover:text-gray-800
                                    text-xs font-bold uppercase tracking-[0.2em]
                                    transition-colors duration-200"
                            >
                                {t("cta2")}
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.45, delay: 0.38 }}
                            className="grid grid-cols-3 pt-6 mt-1 border-t border-gray-200"
                        >
                            {[
                                { val: "200+", label: t("projects") },
                                { val: "4.7★", label: t("ratingLabel") },
                                { val: "UAE", label: t("coverage") },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col gap-1 ${i > 0 ? "pl-5 border-l border-gray-200" : "pr-5"}`}
                                >
                                    <span className="text-gray-900 font-bold text-2xl leading-none">{s.val}</span>
                                    <span className="text-gray-400 text-[0.58rem] uppercase tracking-widest mt-0.5">{s.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Right: Door visual ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="hidden lg:flex items-center justify-center"
                    >
                        <div className="relative w-[300px] xl:w-[340px]">

                            {/* Door frame */}
                            <div className="relative bg-white border-[3px] border-gray-800 shadow-2xl"
                                style={{ aspectRatio: "0.52" }}>

                                {/* Door panel inset top */}
                                <div className="absolute inset-x-5 border border-gray-200"
                                    style={{ top: "8%", bottom: "46%" }} />

                                {/* Door panel inset bottom */}
                                <div className="absolute inset-x-5 border border-gray-200"
                                    style={{ top: "57%", bottom: "8%" }} />

                                {/* Handle */}
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0">
                                    <div className="w-1 h-14 bg-gray-400 rounded-full" />
                                </div>

                                {/* Orange accent stripe at top */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
                            </div>

                            {/* Shadow under door */}
                            <div className="absolute -bottom-3 left-4 right-4 h-4 bg-gray-900/10 blur-md rounded-full" />

                            {/* Decorative bracket — top left */}
                            <span className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-orange-400" />
                            {/* Decorative bracket — bottom right */}
                            <span className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-orange-400" />
                        </div>
                    </motion.div>

                </div>
            </ContentWrapper>
        </section>
    )
}
