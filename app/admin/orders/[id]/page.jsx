"use client"

import { api } from "@/convex/_generated/api"
import { useAction, useMutation, useQuery } from "convex/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft, Calendar, Check, ChevronDown, Clock, Copy, CreditCard,
    ExternalLink, Loader2, MapPin, PackageCheck,
    Phone, RotateCcw, ShoppingBag, Tag, Timer,
    Truck, Wallet, X, XCircle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const VALID_TRANSITIONS = {
    paid:       ["processing", "cancelled"],
    processing: ["delivering", "cancelled"],
    delivering: ["delivered"],
    delivered:  [],
    cancelled:  [],
    refunded:   [],
}
const REFUNDABLE     = new Set(["paid", "processing", "delivering", "delivered", "cancelled"])
const NEEDS_TRACKING = "delivering"
const DESTRUCTIVE    = new Set(["cancelled"])
const STRIPE_REASONS = [
    { val: "requested_by_customer", labelKey: "stripeReason_customer"   },
    { val: "duplicate",             labelKey: "stripeReason_duplicate"  },
    { val: "fraudulent",            labelKey: "stripeReason_fraudulent" },
]

const STATUS_CONFIG = {
    paid:       { badge: "bg-neutral-100 text-neutral-700 border-neutral-200", Icon: Wallet       },
    processing: { badge: "bg-amber-50   text-amber-700   border-amber-200",   Icon: Clock        },
    delivering: { badge: "bg-blue-50    text-blue-700    border-blue-200",    Icon: Truck        },
    delivered:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: PackageCheck },
    cancelled:  { badge: "bg-rose-50    text-rose-700    border-rose-200",    Icon: XCircle      },
    refunded:   { badge: "bg-slate-100  text-slate-500   border-slate-200",   Icon: RotateCcw    },
}

const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function InfoCard({ title, titleColor, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
                <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${titleColor ?? "text-gray-400"}`}>
                    {title}
                </span>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

function MetaRow({ label, value, valueClass = "" }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs text-gray-400 shrink-0">{label}</span>
            <span className={`text-xs font-medium text-gray-700 text-right ${valueClass}`}>{value}</span>
        </div>
    )
}

function CopyField({ label, value }) {
    const copy = () => { navigator.clipboard.writeText(value); toast.success("Copied") }
    return (
        <div>
            {label && (
                <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    {label}
                </span>
            )}
            <button
                onClick={copy}
                className="flex items-center gap-2 text-[0.68rem] font-mono text-gray-600
                bg-gray-50 hover:bg-gray-100 px-2.5 py-2 rounded-lg w-full border border-gray-200
                hover:border-gray-300 transition-colors cursor-pointer"
            >
                <Copy className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{value}</span>
            </button>
        </div>
    )
}

export default function OrderDetails() {
    const { id } = useParams()
    const t      = useTranslations("admin")
    const locale = useLocale()

    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const updateOrderStatus = useMutation(api.admin.updateOrderStatus)
    const refundOrder       = useAction(api.stripe.refundOrder)

    const [pending,       setPending]       = useState(null)
    const [tracking,      setTracking]      = useState("")
    const [confirm,       setConfirm]       = useState(false)
    const [refundOpen,    setRefundOpen]     = useState(false)
    const [refundText,    setRefundText]     = useState("")
    const [stripeReason,  setStripeReason]   = useState("requested_by_customer")
    const [submitting,    setSubmitting]     = useState(false)

    const resetAction = () => {
        setPending(null); setTracking(""); setConfirm(false)
        setRefundOpen(false); setRefundText(""); setStripeReason("requested_by_customer")
    }

    const handleSelectStatus = (val) => {
        setRefundOpen(false)
        setPending(val)
        setTracking("")
        setConfirm(DESTRUCTIVE.has(val))
    }

    const handleConfirm = async () => {
        if (!pending) return
        if (pending === NEEDS_TRACKING && !tracking.trim()) { toast.error(t("trackingRequired")); return }
        setSubmitting(true)
        try {
            const result = await updateOrderStatus({ orderId, status: pending, trackingNumber: tracking.trim() || undefined })
            if (result.success) { toast.success(t("statusUpdated")); resetAction() }
            else toast.error(result.error || t("statusUpdateError"))
        } catch { toast.error(t("statusUpdateError")) }
        finally { setSubmitting(false) }
    }

    const handleRefund = async () => {
        if (refundText.trim().length < 5) { toast.error(t("refundReasonTooShort")); return }
        setSubmitting(true)
        try {
            const result = await refundOrder({ orderId, reason: refundText.trim(), stripeReason })
            if (result.success) { toast.success(t("refundSuccess")); resetAction() }
            else toast.error(result.error || t("refundError"))
        } catch { toast.error(t("refundError")) }
        finally { setSubmitting(false) }
    }

    const orderId = Array.isArray(id) ? id[0] : id
    const order   = useQuery(api.admin.getOrderDetails, mounted ? { orderId } : "skip")

    const fmtDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })

    if (!mounted || order === undefined) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
        )
    }

    if (order === null) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
                <span className="text-sm font-medium text-gray-400">{t("adminOrderNotFound")}</span>
                <Link href="/admin/orders" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                    {t("backToOrders")}
                </Link>
            </div>
        )
    }

    const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing
    const { Icon } = cfg
    const totalQty = order.products.reduce((s, p) => s + p.quantity, 0)
    const subtotal = order.products.reduce((s, p) => s + p.priceAtPurchase * p.quantity, 0)

    return (
        <div className="space-y-6 max-w-6xl">

            {/* Header */}
            <div>
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400
                    hover:text-gray-700 transition-colors mb-5"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t("backToOrders")}
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                            #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {fmtDate(order.createdAt)}
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border w-fit ${cfg.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {t(order.status)}
                    </span>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left: Products + Summary */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Products */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-100">
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                                {t("orderItems")} — {totalQty} {totalQty === 1 ? t("item") : t("items")}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.products.map((product, idx) => {
                                const name      = product.nameAtPurchase[locale] || product.nameAtPurchase.en
                                const colorName = product.color.name[locale]     || product.color.name.en
                                const { h, w, d } = product.dimensions

                                return (
                                    <div key={idx} className="flex gap-4 p-5">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                            <Image
                                                src={product.imageAtPurchase}
                                                alt={name}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <span className="block text-sm font-semibold text-gray-800 leading-snug">{name}</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="inline-flex items-center gap-1.5 text-[0.68rem] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                                        style={{ backgroundColor: product.color.code }}
                                                    />
                                                    {colorName}
                                                    <span className="text-gray-300 font-mono text-[0.6rem]">{product.color.code}</span>
                                                </span>
                                                <span className="inline-flex items-center text-[0.68rem] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 font-mono">
                                                    {h}&thinsp;×&thinsp;{w}&thinsp;×&thinsp;{d}&thinsp;cm
                                                </span>
                                                <span className="inline-flex items-center text-[0.68rem] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                    {t("qty")}: <span className="font-semibold ml-1">{product.quantity}</span>
                                                </span>
                                            </div>
                                            <span className="block text-[0.63rem] font-mono text-gray-300">
                                                {product.productId}
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0 space-y-1">
                                            <span className="block text-sm font-bold text-gray-900">
                                                {t("aed")} {fmt(product.priceAtPurchase * product.quantity)}
                                            </span>
                                            {product.quantity > 1 && (
                                                <span className="block text-[0.68rem] text-gray-400">
                                                    {t("aed")} {fmt(product.priceAtPurchase)} {t("each")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <InfoCard title={t("orderSummaryAdmin")}>
                        <div className="space-y-2.5">
                            {/* Products subtotal */}
                            <MetaRow
                                label={t("subtotalLabel")}
                                value={`${t("aed")} ${fmt(subtotal)}`}
                            />

                            {/* Promo code discount */}
                            {order.discountAmount > 0 && (() => {
                                const savingsPct = subtotal > 0
                                    ? ((order.discountAmount / subtotal) * 100).toFixed(1)
                                    : "0"
                                return (
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                                                <Tag className="w-3 h-3 shrink-0" />
                                                {t("discount")}
                                                {order.promoCodeText && (
                                                    <span className="font-mono font-bold text-[0.68rem] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                                        {order.promoCodeText}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-[0.65rem] text-gray-400 pl-4.5">
                                                {savingsPct}% off subtotal
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 shrink-0">
                                            − {t("aed")} {fmt(order.discountAmount)}
                                        </span>
                                    </div>
                                )
                            })()}

                            {/* Discounted subtotal (shown only when discount applied) */}
                            {order.discountAmount > 0 && (
                                <div className="flex items-center justify-between gap-4 bg-emerald-50/60 rounded-lg px-3 py-1.5 border border-emerald-100">
                                    <span className="text-[0.68rem] text-emerald-700 font-medium">After discount</span>
                                    <span className="text-[0.68rem] font-bold text-emerald-700">
                                        {t("aed")} {fmt(subtotal - order.discountAmount)}
                                    </span>
                                </div>
                            )}

                            <MetaRow
                                label={t("vatLabel")}
                                value={`${t("aed")} ${fmt(order.vat)}`}
                                valueClass="text-gray-400"
                            />

                            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">{t("orderAmount")}</span>
                                <span className="text-base font-bold text-gray-900">{t("aed")} {fmt(order.totalAmount)}</span>
                            </div>

                            {/* Savings callout */}
                            {order.discountAmount > 0 && (
                                <div className="flex items-center justify-between bg-emerald-600 rounded-xl px-4 py-2.5">
                                    <span className="text-xs font-semibold text-white">Total Saved</span>
                                    <span className="text-sm font-bold text-white">
                                        {t("aed")} {fmt(order.discountAmount)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </InfoCard>
                </div>

                {/* Right: Meta cards */}
                <div className="space-y-4">

                    {/* Status Management */}
                    <InfoCard title={t("status")}>
                        {order.status === "refunded" ? (
                            <span className="text-xs text-gray-400 italic">{t("orderFinal")}</span>
                        ) : refundOpen ? (
                            <div className="space-y-2.5">
                                <p className="text-[0.68rem] font-bold text-rose-600 uppercase tracking-wide">
                                    {t("refundOrder")}
                                </p>
                                <Select value={stripeReason} onValueChange={setStripeReason} disabled={submitting}>
                                    <SelectTrigger className="h-8 text-xs border-gray-200 bg-gray-50 shadow-none font-semibold cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4}>
                                        {STRIPE_REASONS.map((r) => (
                                            <SelectItem key={r.val} value={r.val} className="text-xs cursor-pointer">{t(r.labelKey)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <textarea
                                    autoFocus
                                    placeholder={t("refundReasonPlaceholder")}
                                    value={refundText}
                                    onChange={(e) => setRefundText(e.target.value)}
                                    disabled={submitting}
                                    rows={3}
                                    maxLength={500}
                                    className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 resize-none
                                    focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300
                                    disabled:opacity-50 placeholder:text-gray-400"
                                />
                                <p className="text-[0.63rem] text-rose-500 font-medium">{t("refundWarning")}</p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={submitting}
                                        onClick={handleRefund}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600
                                        text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                        {t("refundConfirm")}
                                    </button>
                                    <button
                                        disabled={submitting}
                                        onClick={resetAction}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200
                                        text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ) : pending ? (
                            <div className="space-y-2.5">
                                {pending === NEEDS_TRACKING && (
                                    <div className="space-y-1.5">
                                        <span className="text-[0.68rem] font-semibold text-gray-500">{t("trackingPlaceholder")}</span>
                                        <Input
                                            autoFocus
                                            placeholder={t("trackingPlaceholder")}
                                            value={tracking}
                                            onChange={(e) => setTracking(e.target.value)}
                                            className="h-9 text-xs bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                )}
                                {confirm && (
                                    <p className="text-[0.68rem] text-rose-600 font-semibold">{t("confirmAction")}</p>
                                )}
                                {(pending !== NEEDS_TRACKING || tracking.trim()) && (
                                    <div className="flex gap-2">
                                        <button
                                            disabled={submitting}
                                            onClick={handleConfirm}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                                                DESTRUCTIVE.has(pending)
                                                    ? "bg-rose-500 hover:bg-rose-600"
                                                    : "bg-orange-600 hover:bg-orange-700"
                                            }`}
                                        >
                                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            {t(pending)}
                                        </button>
                                        <button
                                            disabled={submitting}
                                            onClick={resetAction}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200
                                            text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                {pending === NEEDS_TRACKING && !tracking.trim() && (
                                    <button onClick={resetAction} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <X className="w-3 h-3" /> {t("cancel")}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Current status */}
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    {(() => { const c = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing; const I = c.Icon; return (
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${c.badge}`}>
                                            <I className="w-3 h-3" />{t(order.status)}
                                        </span>
                                    )})()}
                                </div>
                                {VALID_TRANSITIONS[order.status]?.length > 0 && (
                                    <Select onValueChange={handleSelectStatus}>
                                        <SelectTrigger className="h-9 text-xs border-gray-200 bg-gray-50 shadow-none font-semibold cursor-pointer w-full">
                                            <span className="flex items-center gap-1.5 text-gray-500">
                                                <ChevronDown className="w-3.5 h-3.5" />
                                                {t("updateStatus")}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent position="popper" sideOffset={4}>
                                            {VALID_TRANSITIONS[order.status].map((s) => {
                                                const c = STATUS_CONFIG[s]
                                                return (
                                                    <SelectItem key={s} value={s} className="text-xs font-semibold cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${c?.dot ?? "bg-gray-300"}`} />
                                                            {t(s)}
                                                        </span>
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                                {REFUNDABLE.has(order.status) && (
                                    <button
                                        onClick={() => { setPending(null); setRefundOpen(true) }}
                                        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-rose-200
                                        text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        {t("refundOrder")}
                                    </button>
                                )}
                                {!VALID_TRANSITIONS[order.status]?.length && !REFUNDABLE.has(order.status) && (
                                    <span className="text-xs text-gray-400 italic">{t("orderFinal")}</span>
                                )}
                            </div>
                        )}
                    </InfoCard>

                    {/* Customer */}
                    <InfoCard title={t("orderCustomer")}>
                        <div className="flex items-center gap-3">
                            {order.customerImage ? (
                                <Image
                                    src={order.customerImage}
                                    alt={order.customerName}
                                    width={40}
                                    height={40}
                                    className="rounded-full shrink-0 border border-gray-100"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-orange-600">
                                        {order.customerName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-800 truncate">{order.customerName}</span>
                                <span className="block text-xs text-gray-400 truncate">{order.customerEmail}</span>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Promo Code */}
                    {order.promoCodeText && order.discountAmount > 0 && (() => {
                        const savingsPct = subtotal > 0
                            ? ((order.discountAmount / subtotal) * 100).toFixed(1)
                            : "0"
                        return (
                            <InfoCard title="Promo Code Applied" titleColor="text-emerald-600">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                            </div>
                                            <span className="font-mono text-sm font-bold text-gray-800 tracking-wider">
                                                {order.promoCodeText}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                                            −{savingsPct}%
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Original subtotal</span>
                                            <span className="font-medium text-gray-700">{t("aed")} {fmt(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Discount</span>
                                            <span className="font-semibold">− {t("aed")} {fmt(order.discountAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 border-t border-gray-100 pt-1.5">
                                            <span>After discount</span>
                                            <span className="font-bold text-gray-800">{t("aed")} {fmt(subtotal - order.discountAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </InfoCard>
                        )
                    })()}

                    {/* Shipping */}
                    <InfoCard title={t("orderAddress")}>
                        <div className="space-y-3 text-sm">
                            {order.shippingAddress?.line1 ? (
                                <div className="flex gap-2.5">
                                    <MapPin className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                                    <div className="space-y-0.5">
                                        <span className="block text-xs font-medium text-gray-700">{order.shippingAddress.line1}</span>
                                        {order.shippingAddress.line2 && (
                                            <span className="block text-xs text-gray-600">{order.shippingAddress.line2}</span>
                                        )}
                                        {order.shippingAddress.city && (
                                            <span className="block text-xs text-gray-400">{order.shippingAddress.city}</span>
                                        )}
                                        {order.shippingAddress.postal_code && (
                                            <span className="block text-xs text-gray-400 font-mono">{order.shippingAddress.postal_code}</span>
                                        )}
                                        {order.shippingAddress.country && (
                                            <span className="block text-xs text-gray-400">{order.shippingAddress.country}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-300">—</span>
                            )}
                            {order.phone && (
                                <div className="flex items-center gap-2.5 pt-2.5 border-t border-gray-100">
                                    <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                    <span className="text-xs text-gray-600">{order.phone}</span>
                                </div>
                            )}
                        </div>
                    </InfoCard>

                    {/* Payment */}
                    <InfoCard title={t("paymentDetails")}>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 capitalize">{order.paymentMethod}</span>
                                {order.cardLast4 && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                        <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                                        ••••&thinsp;{order.cardLast4}
                                    </span>
                                )}
                            </div>
                            {order.stripeSessionId && (
                                <CopyField label={t("stripeSession")} value={order.stripeSessionId} />
                            )}
                            {order.invoiceUrl && (
                                <a
                                    href={order.invoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold
                                    text-orange-600 border border-orange-200 rounded-xl px-3 py-2
                                    hover:bg-orange-50 transition-colors w-full"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {t("viewInvoice")}
                                </a>
                            )}
                        </div>
                    </InfoCard>

                    {/* Lead time */}
                    {order.maxLeadTimeDays != null && (
                        <InfoCard title={t("leadTimeDays")}>
                            <div className="flex items-center gap-2.5">
                                <Timer className="w-4 h-4 text-gray-300 shrink-0" />
                                <span className="text-sm font-semibold text-gray-700">
                                    {order.maxLeadTimeDays} {t("leadTimeDaysLabel")}
                                </span>
                            </div>
                        </InfoCard>
                    )}

                    {/* Tracking */}
                    {order.trackingNumber && (
                        <InfoCard title={t("trackingNumberLabel")}>
                            <CopyField value={order.trackingNumber} />
                        </InfoCard>
                    )}

                    {/* Refund */}
                    {order.status === "refunded" && (
                        <InfoCard title={t("refundDetailsTitle")} titleColor="text-rose-500">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {order.refundReason || <span className="text-gray-300">—</span>}
                            </p>
                        </InfoCard>
                    )}
                </div>
            </div>
        </div>
    )
}
