"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import CTA from "@/app/components/home/CTA"
import Testimonial from "@/app/components/home/Testimonial"
import { motion } from "framer-motion"
import { Clock, Compass, Eye, Mail, MapPin, Phone, Target } from "lucide-react"
import { useTranslations } from "next-intl"

const fade = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.1 }
    })
}

export default function AboutUs() {
    const t = useTranslations("about")

    const stats = [
        { value: "5+", label: t("yearsExp") },
        { value: "500+", label: t("projectsCompl") },
        { value: "95%", label: t("clientSatisfaction") },
        { value: "8+", label: t("expertCraft") },
    ]

    const pillars = [
        {
            icon: Eye,
            tag: t("vision"),
            title: t("vision_title"),
            description: t("vision_desc")
        },
        {
            icon: Target,
            tag: t("mision"),
            title: t("mission_title"),
            description: t("mission_desc")
        },
        {
            icon: Compass,
            tag: t("objective"),
            title: t("objective_title"),
            description: t("objective_desc")
        },
    ]

    return (
        <>
            {/* Hero */}
            <section className="relative h-[70vh] min-h-110 flex items-end overflow-hidden">
                <div className="absolute inset-0">
                    <img src="hero-bg-2.jpg" alt="ArtLink" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/65" />
                </div>
                <ContentWrapper className="relative z-10 w pt-12 pb-16 md:pb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="font-mono text-orange-500 text-[0.725rem] tracking-[0.4em] uppercase block mb-4"
                    >
                        {t("subheader")}
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl lg:text-[4.125rem] font-extrabold text-background uppercase leading-[0.95] tracking-tight max-w-2xl block"
                    >
                        {t("header_1")}
                        <span className="block text-orange-500 mt-1">{t("header_2")}</span>
                    </motion.span>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="mt-6 text-background/50 text-sm md:text-base max-w-md leading-relaxed"
                    >
                        {t("description")}
                    </motion.p>
                </ContentWrapper>
            </section>

            {/* ═══ STATS STRIP ═══ */}
            <section className="relative bg-foreground">
                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-5" />

                <ContentWrapper className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-neutral-100/10">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={fade}
                            initial="hidden"
                            whileInView="visible"
                            custom={i}
                            viewport={{ once: true }}
                            className="py-8 md:py-12 text-center md:px-6"
                        >
                            <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground">{stat.value}</div>
                            <div className="text-primary-foreground/60 text-[0.6rem] tracking-[0.25em] uppercase mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </ContentWrapper>
            </section>

            {/* ═══ ABOUT US INTRO ═══ */}
            <section className="py-24 md:py-32 bg-background">
                <ContentWrapper>
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
                        <motion.div
                            variants={fade}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="lg:col-span-2"
                        >
                            <span className="font-mono text-orange-500 text-[0.75rem] tracking-[0.4em] uppercase block mb-3">
                                {t("whoWe")}
                            </span>
                            <div className="text-[2.1rem] font-extrabold text-foreground uppercase leading-[1.1]">
                                {t("header_3")}
                                <span className="block text-muted-foreground">{t("header_4")}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fade}
                            initial="hidden"
                            whileInView="visible"
                            custom={2}
                            viewport={{ once: true }}
                            className="lg:col-span-3 space-y-5 text-muted-foreground text-[0.9rem] leading-[1.875] font-medium"
                            >
                            <p>
                                {t("paragraph_1")}
                            </p>
                            <p>
                                {t("paragraph_2")}
                            </p>
                        </motion.div>
                    </div>
                </ContentWrapper>
            </section>

            {/* ═══ VISION / MISSION / OBJECTIVE ═══ */}
            <section className="bg-foreground py-24 md:py-32 relative overflow-hidden">

                <ContentWrapper className="relative">
                    <motion.div
                        variants={fade}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="font-mono text-orange-500 text-[0.725rem] tracking-[0.4em] uppercase block mb-3">
                            {t("header_5")}
                        </span>
                        <p className="text-3xl md:text-[2.5rem] font-bold text-background uppercase">
                            {t("header_6")}
                        </p>
                    </motion.div>

                    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-0">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={i}
                                variants={fade}
                                initial="hidden"
                                whileInView="visible"
                                custom={i}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {/* Large background number */}
                                <div 
                                    className={`absolute top-6 right-8 text-[7rem] md:text-[8rem] font-extrabold leading-none text-background/3 ${i === 1 && "text-orange-500/8"}`}>
                                    {String(i + 1).padStart(2, "0")}
                                </div>

                                {/* Top accent line */}
                                <div className={`h-0.5 bg-background/10 ${i === 1 && "bg-orange-500"} transition-colors duration-500`}/>

                                <div className="relative z-10 p-8 md:p-10 lg:p-12">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 border border-background/1 flex items-center justify-center mb-8`}>
                                        <p.icon className={`w-6 h-6 text-background/30`} />
                                    </div>

                                    {/* Tag */}
                                    <span className="font-mono text-orange-500 text-[0.6rem] tracking-[0.3em] uppercase font-bold">
                                        {p.tag}
                                    </span>

                                    {/* Title */}
                                    <p className="text-lg font-extrabold text-background uppercase tracking-wide mt-2 mb-5 leading-snug">
                                        {p.title}
                                    </p>

                                    {/* Divider */}
                                    <div className="w-8 h-px bg-orange-500/40 mb-5" />

                                    {/* Description */}
                                    <p className="text-background/40 text-sm leading-[1.85]">
                                        {p.description}
                                    </p>
                                </div>

                                {/* Vertical separator on right (except last) */}
                                {i < pillars.length - 1 && (
                                    <div className="hidden md:block absolute top-0 right-0 w-px h-full bg-background/10" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </ContentWrapper>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <Testimonial />

            {/* ═══ CONTACT INFORMATION ═══ */}
            <section className="py-16 lg:py-26 bg-foreground">
                <ContentWrapper>
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-4">
                        {/* Info */}
                        <div className="flex flex-col">
                            <span className="font-mono text-orange-500 text-[0.65rem] tracking-[0.4em] uppercase block mb-3">
                                {t("visit")}
                            </span>
                            <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-background uppercase leading-[1.1] mb-10">
                                {t("header_7")} <span className="text-orange-500">{t("header_8")}</span>
                            </p>

                            <div className="space-y-7">
                                {[
                                    { icon: MapPin, label: t("address"), value: "309 S115 - Industrial Area 5 - Industrial Area - Sharjah" },
                                    { icon: Phone, label: t("phone"), value: "+971 055 466 7720" },
                                    { icon: Mail, label: t("email"), value: "art.link.for.doors@gmail.com" },
                                    { icon: Clock, label: t("hours"), value: `${t("open_hrs")}\n${t("closed_hrs")}` },
                                ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={fade}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-4"
                                >
                                    <item.icon className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[0.6rem] font-bold text-background/40 tracking-[0.2em] uppercase mb-1">{item.label}</div>
                                        <div className="text-background/80 text-sm whitespace-pre-line leading-relaxed">{item.value}</div>
                                    </div>
                                </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                         <div className="relative min-h-100">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3606.4311923645305!2d55.4037684!3d25.323307999999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f594425d5c657%3A0x3bf5452b72ccb2ae!2zQXJ0IGxpbmsgZm9yIGRvb3JzIF_Yp9ix2Kog2YTZitmG2YMg2YTZhNin2KjZiNin2Kg!5e0!3m2!1sen!2sae!4v1771955303280!5m2!1sen!2sae"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: "grayscale(100%) contrast(1.1)", minHeight: "400px" }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="ArtLink Location"
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>
                </ContentWrapper>
            </section>

            {/* ═══ CTA ═══ */}
            <CTA />
        </>
    )
}