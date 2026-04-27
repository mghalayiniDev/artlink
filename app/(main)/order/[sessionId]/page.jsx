"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import {
    ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock,
    CreditCard, Download, MapPin, MessageSquare, Package,
    PackageCheck, RotateCcw, Tag, Truck, Wallet, XCircle
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const STATUS = {
    paid:       { pill: "bg-neutral-100 text-neutral-700 border-neutral-200", dot: "bg-neutral-400",  icon: Wallet,       banner: "bg-neutral-800", label: "Order Placed"    },
    processing: { pill: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-400",    icon: Clock,        banner: "bg-amber-700",   label: "Processing"      },
    delivering: { pill: "bg-orange-50 text-orange-700 border-orange-200",       dot: "bg-orange-500",   icon: Truck,        banner: "bg-orange-600",  label: "Out for Delivery" },
    delivered:  { pill: "bg-emerald-50 text-emerald-700 border-emerald-200",   dot: "bg-emerald-500",  icon: PackageCheck, banner: "bg-emerald-700", label: "Delivered"       },
    cancelled:  { pill: "bg-rose-50 text-rose-700 border-rose-200",            dot: "bg-rose-500",     icon: XCircle,      banner: "bg-rose-700",    label: "Cancelled"       },
    refunded:   { pill: "bg-slate-100 text-slate-600 border-slate-200",        dot: "bg-slate-400",    icon: RotateCcw,    banner: "bg-slate-600",   label: "Refunded"        },
}

const FLOW = ["paid", "processing", "delivering", "delivered"]

export default function Order() {
    const params  = useParams()
    const t       = useTranslations("order")
    const locale  = useLocale()

    const order        = useQuery(api.orders.getOrderBySessionId, params.sessionId ? { sessionId: params.sessionId } : "skip")
    const orderLoading = order === undefined
    const orderError   = order === null

    const cfg        = STATUS[order?.status] ?? STATUS.processing
    const StatusIcon = cfg.icon
    const stepIdx    = Math.max(0, FLOW.indexOf(order?.status))
    const showFlow   = FLOW.includes(order?.status)
    const progressPct = stepIdx === FLOW.length - 1
        ? 100
        : stepIdx * (100 / FLOW.length) + (100 / FLOW.length) / 2

    let minDateStr = "", maxDateStr = ""
    if (order?.createdAt) {
        const lead = order.maxLeadTimeDays ?? 30
        const min  = new Date(order.createdAt); min.setDate(min.getDate() + lead)
        const max  = new Date(order.createdAt); max.setDate(max.getDate() + lead + 14)
        minDateStr = min.toLocaleDateString(locale || "en-US", { month: "short", day: "numeric", year: "numeric" })
        maxDateStr = max.toLocaleDateString(locale || "en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const orderDate = order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : ""
    const itemCount = order?.products.reduce((s, i) => s + i.quantity, 0) ?? 0
    const discount  = order?.discountAmount ?? 0

    return (
        <section className="min-h-[70vh] bg-white">

            {/* ── Header band ── */}
            <div className="bg-neutral-100/70 border-b border-gray-200">
                <ContentWrapper className="py-7">
                    <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-3">
                        <Link href="/" className="hover:text-gray-700 transition-colors">{t("home")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/orders" className="hover:text-gray-700 transition-colors">{t("orders")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-orange-500 font-semibold">
                            {orderLoading ? "—" : `#${order._id.slice(-6).toUpperCase()}`}
                        </span>
                    </nav>
                    <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors w-fit">
                        <ArrowLeft className="w-3.5 h-3.5" /> {t("backToOrder")}
                    </Link>
                </ContentWrapper>
            </div>

            <ContentWrapper className="py-10">

                {/* ── Skeleton ── */}
                {orderLoading && (
                    <div className="flex flex-col gap-5 animate-pulse">
                        <div className="h-36 bg-neutral-100 rounded-2xl" />
                        <div className="h-28 bg-neutral-100 rounded-2xl" />
                        <div className="grid lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2 h-[45vh] bg-neutral-100 rounded-2xl" />
                            <div className="h-80 bg-neutral-100 rounded-2xl" />
                        </div>
                    </div>
                )}

                {/* ── Not found ── */}
                {!orderLoading && orderError && (
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-5">
                            <Package className="w-7 h-7 text-orange-400" />
                        </div>
                        <p className="text-xl font-extrabold uppercase tracking-tight text-gray-900">{t("order_not_found")}</p>
                        <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">{t("order_not_found_desc")}</p>
                        <Link href="/shop" className="mt-6 inline-flex items-center gap-2 px-7 h-11 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-colors">
                            {t("return_to_shop")}
                        </Link>
                    </div>
                )}

                {/* ── Order ── */}
                {!orderLoading && order && (
                    <div className="flex flex-col gap-5">

                        {/* ── Status card ── */}
                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                            {/* Dark top banner */}
                            <div className={`${cfg.banner} px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                        <StatusIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-extrabold text-lg tracking-tight leading-none">
                                            {cfg.label}
                                        </p>
                                        <p className="text-white/60 text-xs mt-1 font-mono">
                                            #{order._id.slice(-10).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-white/70 text-xs">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> {orderDate}
                                    </span>
                                    <span className="opacity-40">·</span>
                                    <span>{itemCount} {itemCount === 1 ? t("product") : t("products")}</span>
                                    <span className="opacity-40">·</span>
                                    <span className="text-white font-bold">{fmt(order.totalAmount)} {t("aed")}</span>
                                </div>
                            </div>

                            {/* Action buttons row */}
                            <div className="bg-white px-6 py-3.5 flex items-center justify-between border-b border-gray-100">
                                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gray-400">
                                    {t("orders")} / {order._id.slice(-6).toUpperCase()}
                                </p>
                                <div className="flex items-center gap-2">
                                    {order.invoiceUrl && (
                                        <Link href={order.invoiceUrl} target="_blank"
                                            className="inline-flex items-center gap-1.5 px-3.5 h-8 text-[0.68rem] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors">
                                            <Download className="w-3 h-3" /> {t("invoice")}
                                        </Link>
                                    )}
                                    <Link href="https://wa.me/971554667720" target="_blank"
                                        className="inline-flex items-center gap-1.5 px-3.5 h-8 text-[0.68rem] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors">
                                        <MessageSquare className="w-3 h-3" /> {t("support")}
                                    </Link>
                                </div>
                            </div>

                            {/* Progress stepper */}
                            {showFlow && (
                                <div className="bg-white px-8 py-8" dir="ltr">
                                    <div className="relative flex items-start justify-between">
                                        <div className="absolute top-5 left-0 right-0 h-px bg-gray-200" />
                                        <div className="absolute top-5 left-0 h-px bg-orange-500 transition-all duration-700"
                                            style={{ width: `${progressPct}%` }} />
                                        {FLOW.map((s, i) => {
                                            const done    = i <= stepIdx
                                            const current = i === stepIdx
                                            return (
                                                <div key={s} className="flex flex-col items-center z-10 flex-1">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                        done
                                                            ? "bg-orange-500 shadow-md shadow-orange-100"
                                                            : "bg-white border-2 border-gray-200"
                                                    }`}>
                                                        {done
                                                            ? <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                                                            : <span className="text-xs font-bold text-gray-300">{i + 1}</span>
                                                        }
                                                    </div>
                                                    <p className={`text-[11px] font-bold text-center mt-2.5 leading-tight ${
                                                        done ? (current ? "text-orange-500" : "text-gray-700") : "text-gray-300"
                                                    }`}>
                                                        {t(`status.${s}`)}
                                                    </p>
                                                    {s === "paid" && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {order.status !== "delivered" && (
                                        <div className="mt-7 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 w-fit">
                                            <Truck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                            <p className="text-xs text-gray-600">
                                                {t("estimatedDelivery")}
                                                <span className="font-bold text-gray-900 ml-1">{minDateStr} – {maxDateStr}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Main grid ── */}
                        <div className="grid lg:grid-cols-3 gap-5 items-stretch">

                            {/* Items */}
                            <div className="lg:col-span-2 border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col">
                                <div className="h-14 px-6 bg-neutral-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                                    <span className="text-sm font-bold text-gray-900">{t("header2")}</span>
                                    <span className="text-xs text-gray-400">{itemCount} {itemCount === 1 ? t("product") : t("products")}</span>
                                </div>
                                <div className="divide-y divide-gray-100 flex-1">
                                    {order.products.map((item, i) => (
                                        <div key={i} className="flex gap-4 px-6 py-5">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={item.imageAtPurchase}
                                                    alt={item.nameAtPurchase[locale] || item.nameAtPurchase.en}
                                                    className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                                                />
                                                {item.quantity > 1 && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {item.nameAtPurchase[locale] || item.nameAtPurchase.en}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 text-[0.65rem] text-gray-500">
                                                        <span className="w-2 h-2 rounded-sm border border-gray-200" style={{ background: item.color.code }} />
                                                        {item.color.name[locale] || item.color.name.en}
                                                    </span>
                                                    <span className="inline-flex items-center bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 text-[0.65rem] text-gray-500">
                                                        {item.dimensions.h}×{item.dimensions.w}×{item.dimensions.d} cm
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {fmt(item.priceAtPurchase)} {t("aed")} × {item.quantity}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-extrabold text-gray-900">
                                                    {fmt(item.priceAtPurchase * item.quantity)}
                                                </p>
                                                <p className="text-[0.6rem] text-gray-400 uppercase tracking-wide mt-0.5">{t("aed")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar — single card, same height as items */}
                            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col">

                                {/* Summary header */}
                                <div className="h-14 px-5 bg-neutral-50 border-b border-gray-200 flex items-center shrink-0">
                                    <span className="text-sm font-bold text-gray-900">{t("summary")}</span>
                                </div>

                                {/* Pricing */}
                                <div className="px-5 py-5 flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("subtotal")}</span>
                                        <span className={discount > 0 ? "text-gray-400 line-through text-xs self-center" : "font-semibold text-gray-900"}>
                                            {fmt(order.totalAmount / 1.05 + discount)} {t("aed")}
                                        </span>
                                    </div>

                                    {discount > 0 && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-emerald-600 flex items-center gap-1.5 text-xs font-medium">
                                                    <Tag className="w-3 h-3" />
                                                    {order.promoCodeText ?? t("discount")}
                                                </span>
                                                <span className="text-emerald-600 font-semibold text-xs">− {fmt(discount)} {t("aed")}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                                <span className="text-emerald-700 text-xs font-medium">{t("afterDiscount")}</span>
                                                <span className="text-emerald-700 text-xs font-bold">{fmt(order.totalAmount / 1.05)} {t("aed")}</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("shipping")}</span>
                                        <span className="font-semibold text-emerald-600">{t("free")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("vat")}</span>
                                        <span className="font-semibold text-gray-900">{fmt(order.vat)} {t("aed")}</span>
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-100 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">{t("total")}</span>
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-gray-900 leading-none">{fmt(order.totalAmount)}</p>
                                            <p className="text-[0.6rem] text-gray-400 uppercase tracking-wide mt-0.5">{t("aed")}</p>
                                        </div>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between items-center bg-orange-500 rounded-xl px-4 py-2.5 mt-1">
                                            <span className="text-white text-xs font-semibold">{t("totalSaved")}</span>
                                            <span className="text-white font-bold">{fmt(discount)} <span className="text-xs font-normal opacity-80">{t("aed")}</span></span>
                                        </div>
                                    )}
                                </div>

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* Shipping address */}
                                <div className="border-t border-gray-100 px-5 py-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t("shipAddress")}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {order.phone && <span className="block font-medium">{order.phone}</span>}
                                        <span className="text-gray-500 text-xs">
                                            {[order.shippingAddress.line1, order.shippingAddress.line2, order.shippingAddress.city, order.shippingAddress.postal_code, order.shippingAddress.country].filter(Boolean).join(", ")}
                                        </span>
                                    </p>
                                </div>

                                {/* Payment method */}
                                <div className="border-t border-gray-100 px-5 py-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t("paymentMethod")}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 capitalize font-medium">
                                        {order.paymentMethod?.replace(/_/g, " ")}
                                    </p>
                                    {order.cardLast4 && (
                                        <p className="text-xs text-gray-400 mt-0.5 font-mono">···· ···· ···· {order.cardLast4}</p>
                                    )}
                                </div>

                                {/* Continue shopping */}
                                <div className="border-t border-gray-100 px-5 py-4">
                                    <Link href="/shop"
                                        className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors">
                                        <Package className="w-3.5 h-3.5" /> {t("continueShopping")}
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </ContentWrapper>
        </section>
    )
}
