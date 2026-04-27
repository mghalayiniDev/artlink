"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { CheckCircle2, ChevronRight, Package, ShoppingBag, Truck, Wallet } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"

export default function Orders() {
    const t = useTranslations("orders")
    const locale = useLocale()

    const orders = useQuery(api.orders.getUserOrders)
    const ordersLoading = orders === undefined
    const ordersError = orders === null

    const rawTotal = orders?.filter(o => o.status !== "refunded" && o.status !== "cancelled").reduce((acc, o) => acc + o.totalAmount, 0) || 0
    const totalAmount = rawTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const totalDelivered  = orders?.filter(o => o.status === "delivered").length  || 0
    const totalInTransit  = orders?.filter(o => o.status === "delivering").length || 0

    const statusConfig = {
        paid:       { pill: "bg-neutral-100 text-neutral-700 border-neutral-200",  dot: "bg-neutral-400" },
        processing: { pill: "bg-amber-50 text-amber-700 border-amber-200",          dot: "bg-amber-400"   },
        delivering: { pill: "bg-orange-50 text-orange-700 border-orange-200",        dot: "bg-orange-500"  },
        delivered:  { pill: "bg-emerald-50 text-emerald-700 border-emerald-200",    dot: "bg-emerald-500" },
        cancelled:  { pill: "bg-rose-50 text-rose-700 border-rose-200",             dot: "bg-rose-500"    },
        refunded:   { pill: "bg-slate-100 text-slate-600 border-slate-200",         dot: "bg-slate-400"   },
    }

    const getConfig = (status) => statusConfig[status] ?? statusConfig.processing

    const stats = [
        { icon: ShoppingBag, value: orders?.length ?? 0,  label: t("totalOrders")   },
        { icon: CheckCircle2, value: totalDelivered,       label: t("totalDelivered") },
        { icon: Truck,        value: totalInTransit,       label: t("totalDelivery")  },
        { icon: Wallet,       value: totalAmount,          label: t("totalSpent"), suffix: t("aed") },
    ]

    return (
        <section className="min-h-[70vh] bg-white">

            {/* ── Header band ── */}
            <div className="bg-neutral-100/70 border-b border-gray-200">
                <ContentWrapper className="py-10">
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-4">
                        <Link href="/" className="hover:text-gray-700 transition-colors">{t("home")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-orange-500 font-semibold">{t("orders")}</span>
                    </div>
                    <span className="block text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                        {t("orders")}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">
                        {ordersLoading ? "—" : `${orders?.length || 0} ${orders?.length === 1 ? t("item") : t("items")} · ${totalAmount} ${t("aed")} ${t("total")}`}
                    </p>
                </ContentWrapper>
            </div>

            <ContentWrapper className="py-10">

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {stats.map(({ icon: Icon, value, label, suffix }, i) => (
                        <div key={i} className="bg-neutral-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                            <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
                            {ordersLoading ? (
                                <div className="space-y-2">
                                    <div className="h-7 w-16 bg-neutral-100 animate-pulse rounded" />
                                    <div className="h-2.5 w-20 bg-neutral-100 animate-pulse rounded" />
                                </div>
                            ) : (
                                <>
                                    <span className="text-2xl font-bold text-gray-900 leading-none">
                                        {value}{suffix ? <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span> : null}
                                    </span>
                                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-gray-400">{label}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Orders list ── */}
                {ordersLoading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-lg bg-neutral-100 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-neutral-100 rounded" />
                                        <div className="h-3 w-1/4 bg-neutral-100 rounded" />
                                    </div>
                                    <div className="h-6 w-20 bg-neutral-100 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (ordersError || orders.length === 0) ? (
                    <div className="bg-neutral-50 border border-gray-200 rounded-xl px-6 py-20 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <Package className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-lg font-bold text-gray-900 uppercase tracking-tight">{t("noOrders")}</span>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs">{t("noOrdersDesc")}</p>
                        <Link
                            href="/shop"
                            className="mt-6 inline-flex items-center gap-2 px-6 h-10 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.18em] rounded-lg transition-colors"
                        >
                            {t("shopBtn")}
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {orders.map((order) => {
                            const cfg = getConfig(order.status)
                            const label = t(`status.${order.status}`)
                            const date = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            const productNames = order.products.map(p => p.nameAtPurchase[locale] || p.nameAtPurchase.en).join(", ")
                            const itemCount = order.products.reduce((s, p) => s + p.quantity, 0)

                            return (
                                <Link
                                    key={order._id}
                                    href={`/order/${order.stripeSessionId}`}
                                    className="group bg-neutral-50 border border-gray-200 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 hover:border-orange-200 hover:shadow-sm transition-all duration-200"
                                >
                                    {/* Top row on mobile: thumbnails + chevron */}
                                    <div className="flex items-center gap-3 sm:contents">

                                        {/* Product thumbnails */}
                                        <div className="flex shrink-0">
                                            {order.products.slice(0, 2).map((product, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-gray-100 bg-neutral-100"
                                                    style={{ marginLeft: idx > 0 ? "-12px" : 0, zIndex: 2 - idx, position: "relative" }}
                                                >
                                                    {product.imageAtPurchase ? (
                                                        <Image
                                                            src={product.imageAtPurchase}
                                                            alt={product.nameAtPurchase.en}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {order.products.length > 2 && (
                                                <div
                                                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-neutral-100 border border-gray-100 flex items-center justify-center"
                                                    style={{ marginLeft: "-12px", position: "relative", zIndex: 0 }}
                                                >
                                                    <span className="text-[10px] font-bold text-gray-500">+{order.products.length - 2}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{productNames}</p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                                                <span className="text-xs text-gray-400">{date}</span>
                                                <span className="text-gray-200 hidden sm:inline">·</span>
                                                <span className="text-xs text-gray-400">{itemCount} {itemCount === 1 ? t("product") : t("products")}</span>
                                                <span className="text-gray-200 hidden sm:inline">·</span>
                                                <span className="text-xs font-mono text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>

                                        {/* Chevron — visible on mobile inline, hidden on sm+ (re-added at end) */}
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0 sm:hidden" />
                                    </div>

                                    {/* Bottom row on mobile / right side on sm+ */}
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-3 border-t border-gray-100 sm:pt-0 sm:border-0">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] font-semibold border rounded-full ${cfg.pill}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                            {label}
                                        </span>
                                        <span className="text-base font-bold text-gray-900">
                                            {order.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="text-xs font-normal text-gray-400 ml-1">{t("aed")}</span>
                                        </span>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0 hidden sm:block" />
                                </Link>
                            )
                        })}
                    </div>
                )}
            </ContentWrapper>
        </section>
    )
}
