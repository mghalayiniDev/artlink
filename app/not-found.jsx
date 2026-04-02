"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Home, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function NotFound() {
    const t = useTranslations("404")

    return (
        <section className="min-h-screen flex items-center justify-center p-6">
            <main className="max-w-xl w-full flex items-center justify-center flex-col gap-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Large 404 Display */}
                    <div className="relative mb-8">
                        <span className="text-[10rem] md:text-[14rem] font-bold leading-none tracking-tighter text-muted/50 select-none">
                            404
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center">
                                <Search className="w-8 h-8 text-primary/60" />
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <span className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight block">
                        {t("header")}
                    </span>
                    <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                        {t("description")}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-[#171d26] text-neutral-100 px-8 py-3.5 rounded-none 
                            text-sm font-semibold tracking-wider uppercase hover:bg-[#171d26]/90 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            {t("back")}
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-none text-sm 
                            font-semibold tracking-wider uppercase hover:bg-accent transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t("goBack")}
                        </button>
                    </div>
                </motion.div>

                {/* Helpful Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-16 pt-10 border-t border-border"
                >
                    <p className="text-sm text-muted-foreground mb-6 uppercase tracking-widest font-medium">
                        {t("subheader")}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                        {[
                            { label: t("home"), to: "/" },
                            { label: t("shop"), to: "/shop" },
                            { label: t("about"), to: "/about" }
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.to}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </main>
        </section>
    )
}