"use client"

import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { Check, X, Loader2, Mail } from "lucide-react"
import { useTranslations } from "next-intl"

function UnsubscribeContent() {
    const t = useTranslations("newsletterUnsubscribe")
    const unsubscribeByToken = useMutation(api.newsletter.unsubscribeByToken)
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    // "loading" | "success" | "already" | "error"
    const [status, setStatus] = useState("loading")

    useEffect(() => {
        if (!token) { setStatus("error"); return }
        unsubscribeByToken({ token })
            .then(res => {
                if (!res.success) setStatus("error")
                else if (res.alreadyUnsubscribed) setStatus("already")
                else setStatus("success")
            })
            .catch(() => setStatus("error"))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const states = {
        loading: {
            icon: <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />,
            iconBg: "bg-orange-50",
            label: t("loadingLabel"),
            title: t("loadingTitle"),
            desc: t("loadingDesc"),
            cta: null,
        },
        success: {
            icon: <Check className="w-6 h-6 text-orange-500" strokeWidth={2.5} />,
            iconBg: "bg-orange-50",
            label: t("successLabel"),
            title: t("successTitle"),
            desc: t("successDesc"),
            cta: { href: "/", text: t("successCta") },
        },
        already: {
            icon: <Check className="w-6 h-6 text-gray-400" strokeWidth={2.5} />,
            iconBg: "bg-gray-100",
            label: t("alreadyLabel"),
            title: t("alreadyTitle"),
            desc: t("alreadyDesc"),
            cta: { href: "/", text: t("alreadyCta") },
        },
        error: {
            icon: <X className="w-6 h-6 text-rose-500" strokeWidth={2.5} />,
            iconBg: "bg-rose-50",
            label: t("errorLabel"),
            title: t("errorTitle"),
            desc: t("errorDesc"),
            cta: { href: "/", text: t("errorCta") },
        },
    }

    const s = states[status]

    return (
        <div className="w-full max-w-sm">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="h-1 w-full bg-orange-500" />

                <div className="px-8 py-10 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center mb-5`}>
                        {s.icon}
                    </div>

                    <span className="inline-block text-[0.65rem] font-bold tracking-widest uppercase text-orange-500 mb-3">
                        {s.label}
                    </span>

                    <div className="text-[1.35rem] font-bold text-gray-900 leading-tight mb-2">
                        {s.title}
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed mb-7 max-w-xs">
                        {s.desc}
                    </p>

                    {s.cta && (
                        <Link
                            href={s.cta.href}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600
                            text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {s.cta.text}
                        </Link>
                    )}
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-[0.7rem] text-gray-400">{t("footerLabel")}</span>
                </div>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="w-full max-w-sm">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-1 w-full bg-orange-500" />
                <div className="px-8 py-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-400">Loading…</p>
                </div>
            </div>
        </div>
    )
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <Suspense fallback={<LoadingFallback />}>
                <UnsubscribeContent />
            </Suspense>
        </div>
    )
}
