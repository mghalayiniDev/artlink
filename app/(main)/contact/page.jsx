"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useMutation } from "convex/react"
import { useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import ContentWrapper from "@/app/components/ContentWrapper"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle, ChevronRight, Loader, LogIn } from "lucide-react"

const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.1 }
    })
}

const inputClass = `w-full h-11 px-4 text-sm text-gray-900 bg-white border border-gray-200
    rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15
    placeholder:text-gray-400 transition-all duration-150`

const textareaClass = `w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200
    rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15
    placeholder:text-gray-400 transition-all duration-150 resize-none`

export default function ContactPage() {
    const t = useTranslations("contact")
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
    const submitForm = useMutation(api.contact.submitContactForm)

    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState("idle") // idle | loading | success | error

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
        if (errors[field]) setErrors(er => ({ ...er, [field]: "" }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim())    e.name    = t("required")
        if (!form.email.trim())   e.email   = t("required")
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email"
        if (!form.subject.trim()) e.subject = t("required")
        if (!form.message.trim()) e.message = t("required")
        else if (form.message.trim().length < 10) e.message = "Too short"
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setStatus("loading")
        try {
            await submitForm({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                subject: form.subject.trim(),
                message: form.message.trim(),
            })
            setStatus("success")
        } catch (err) {
            const msg = err?.message ?? ""
            if (msg.includes("RATE_LIMIT")) setStatus("rateLimit")
            else setStatus("error")
        }
    }

    const infoItems = [
        { icon: Phone, label: t("phone"),   value: t("phoneValue"),   href: `tel:${t("phoneValue").replace(/\s/g, "")}` },
        { icon: Mail,  label: t("email"),   value: t("emailValue"),   href: `mailto:${t("emailValue")}` },
        { icon: MapPin, label: t("address"), value: t("addressValue"), href: null },
        { icon: Clock, label: t("hours"),   value: `${t("hoursValue")}\n${t("hoursClosed")}`, href: null },
    ]

    return (
        <>
            {/* ── Hero ── */}
            <section className="relative bg-foreground py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" />
                <ContentWrapper className="relative z-10">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-widest mb-8"
                    >
                        <Link href="/" className="hover:text-background/70 transition-colors">{t("home")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-orange-400">{t("breadcrumb")}</span>
                    </motion.div>

                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="font-mono text-orange-500 text-[0.7rem] tracking-[0.4em] uppercase block mb-4"
                    >
                        {t("subheader")}
                    </motion.span>

                    <motion.span
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="block text-4xl md:text-[3.5rem] font-extrabold text-background uppercase leading-[0.95] tracking-tight max-w-xl"
                    >
                        {t("header_1")}
                        <span className="block text-orange-500 mt-1">{t("header_2")}</span>
                    </motion.span>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.55, delay: 0.25 }}
                        className="mt-5 text-neutral-400 text-sm max-w-md leading-relaxed"
                    >
                        {t("description")}
                    </motion.p>
                </ContentWrapper>
            </section>

            {/* ── Info cards strip ── */}
            <section className="bg-white border-b border-gray-100">
                <ContentWrapper>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-x md:divide-y-0 lg:divide-y-0 divide-gray-100 py-4">
                        {infoItems.map(({ icon: Icon, label, value, href }, i) => (
                            <motion.div
                                key={i}
                                variants={fade}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                className="py-7 px-6 flex flex-col gap-2"
                            >
                                <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-gray-400 font-semibold">{label}</span>
                                {href ? (
                                    <a href={href} className="text-sm text-gray-800 font-medium hover:text-orange-500 transition-colors whitespace-pre-line leading-relaxed">
                                        {value}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-800 font-medium whitespace-pre-line leading-relaxed">{value}</span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </ContentWrapper>
            </section>

            {/* ── Form + Map ── */}
            <section className="bg-neutral-100/70 border-b border-gray-200 py-20 md:py-28">
                <ContentWrapper>
                    <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">

                        {/* Form */}
                        <motion.div
                            variants={fade}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="w-full"
                        >
                            <span className="font-mono text-orange-500 text-[0.7rem] tracking-[0.4em] uppercase block mb-3">
                                {t("formTitle")}
                            </span>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">{t("formDesc")}</p>

                            {authLoading ? (
                                <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
                                    <Loader className="w-5 h-5 animate-spin text-orange-400" />
                                </div>
                            ) : !isAuthenticated ? (
                                <div className="flex flex-col items-center gap-4 py-16 text-center bg-white rounded-xl border border-gray-100 px-8">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                        <LogIn className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Sign in to continue</p>
                                        <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">You need to be signed in to send us a message.</p>
                                    </div>
                                    <Link
                                        href="/sign-in"
                                        className="inline-flex items-center gap-2 mt-1 px-7 h-11 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-colors"
                                    >
                                        Sign In <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ) : status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-4 py-16 text-center bg-white rounded-xl border border-gray-100"
                                >
                                    <CheckCircle className="w-12 h-12 text-orange-500" />
                                    <div>
                                        <p className="font-extrabold text-gray-900 text-xl uppercase tracking-tight">{t("successTitle")}</p>
                                        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">{t("successDesc")}</p>
                                    </div>
                                    <button
                                        onClick={() => { setStatus("idle"); setForm({ name: "", email: "", phone: "", subject: "", message: "" }) }}
                                        className="mt-2 text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors"
                                    >
                                        {t("sendAnother")}
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-gray-100 p-7 md:p-10 flex flex-col gap-5 w-full">

                                    {/* Name + Email */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                {t("name")} <span className="text-orange-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={set("name")}
                                                placeholder={t("namePlaceholder")}
                                                className={inputClass}
                                            />
                                            {errors.name && <span className="text-[0.72rem] text-red-500">{errors.name}</span>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                {t("emailLabel")} <span className="text-orange-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={set("email")}
                                                placeholder={t("emailPlaceholder")}
                                                className={inputClass}
                                            />
                                            {errors.email && <span className="text-[0.72rem] text-red-500">{errors.email}</span>}
                                        </div>
                                    </div>

                                    {/* Phone + Subject */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                {t("phoneLabel")}
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={set("phone")}
                                                placeholder={t("phonePlaceholder")}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                {t("subject")} <span className="text-orange-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.subject}
                                                onChange={set("subject")}
                                                placeholder={t("subjectPlaceholder")}
                                                className={inputClass}
                                            />
                                            {errors.subject && <span className="text-[0.72rem] text-red-500">{errors.subject}</span>}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            {t("message")} <span className="text-orange-500">*</span>
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={form.message}
                                            onChange={set("message")}
                                            placeholder={t("messagePlaceholder")}
                                            className={textareaClass}
                                        />
                                        {errors.message && <span className="text-[0.72rem] text-red-500">{errors.message}</span>}
                                    </div>

                                    {(status === "error" || status === "rateLimit") && (
                                        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                                            {status === "rateLimit" ? t("errorRateLimit") : t("errorGeneric")}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="group inline-flex items-center justify-center gap-2 h-11 px-8
                                            bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed
                                            text-white text-xs font-bold uppercase tracking-[0.2em]
                                            rounded-lg transition-colors duration-200 w-full sm:w-fit mt-1 cursor-pointer"
                                    >
                                        {status === "loading"
                                            ? <><Loader className="w-4 h-4 animate-spin" />{t("submitting")}</>
                                            : <>{t("submit")}<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" /></>
                                        }
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Map */}
                        <motion.div
                            variants={fade}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={1}
                            className="flex flex-col gap-4"
                        >
                            <span className="font-mono text-orange-500 text-[0.7rem] tracking-[0.4em] uppercase block">
                                {t("mapTitle")}
                            </span>
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 flex-1 min-h-[420px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3606.4311923645305!2d55.4037684!3d25.323307999999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f594425d5c657%3A0x3bf5452b72ccb2ae!2zQXJ0IGxpbmsgZm9yIGRvb3JzIF_Yp9ix2Yk!5e0!3m2!1sen!2sae!4v1771955303280!5m2!1sen!2sae"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: "grayscale(20%) contrast(1.05)", minHeight: "420px" }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="ArtLink Location"
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>
                        </motion.div>

                    </div>
                </ContentWrapper>
            </section>
        </>
    )
}
