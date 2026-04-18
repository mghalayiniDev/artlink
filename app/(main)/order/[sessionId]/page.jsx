"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock, CreditCard, Download, Hash, MapPin, MessageSquare, Package, PackageCheck, RotateCcw, Truck, Wallet, XCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function Order() {
    const params = useParams()
    const sessionId = params.sessionId

    const t = useTranslations("order")
    const locale = useLocale()

    const order = useQuery(
        api.orders.getOrderBySessionId, 
        sessionId ? { sessionId } : "skip"
    )
    const orderLoading = order === undefined
    const orderError = order === null

    const configs = {
        paid: {
            color: "bg-neutral-100 text-neutral-800 border-neutral-200", 
            dotColor: "bg-neutral-500",
            icon: Wallet,
            label: t("status.paid")
        },
        processing: {
            color: "bg-amber-50 text-amber-800 border-amber-200",
            dotColor: "bg-amber-500",
            icon: Clock,
            label: t("status.processing")
        },
        delivering: {
            color: "bg-blue-50 text-blue-800 border-blue-200",
            dotColor: "bg-blue-500",
            icon: Truck,
            label: t("status.delivering")
        },
        delivered: {
            color: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dotColor: "bg-emerald-500",
            icon: PackageCheck,
            label: t("status.delivered")
        },
        cancelled: {
            color: "bg-rose-50 text-rose-800 border-rose-200",
            dotColor: "bg-rose-500",
            icon: XCircle,
            label: t("status.cancelled")
        },
        refunded: {
            color: "bg-slate-100 text-slate-600 border-slate-200",
            dotColor: "bg-slate-400",
            icon: RotateCcw,
            label: t("status.refunded")
        }
    }

    const currentStatusConfig = configs[order?.status] || configs.processing
    const StatusIcon = currentStatusConfig.icon

    const flowSequence = ["paid", "processing", "delivering", "delivered"]
    const currentStepIndex = Math.max(0, flowSequence.indexOf(order?.status))
    const stepWidth = 100 / flowSequence.length 
    const progressPercent = currentStepIndex === flowSequence.length - 1 
        ? 100 
        : (currentStepIndex * stepWidth) + (stepWidth / 2)

    const timeline = flowSequence.map((statusId, index) => {
        const dateString = statusId === "paid" && order?.createdAt 
            ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ""

        return {
            id: statusId,
            title: t(`status.${statusId}`),
            date: dateString,
            completed: index <= currentStepIndex 
        }
    })

    let minDateStr = ""
    let maxDateStr = ""
    
    if (order?.createdAt) {
        const minDate = new Date(order.createdAt);
        minDate.setMonth(minDate.getMonth() + 1); 
        
        const maxDate = new Date(order.createdAt);
        maxDate.setMonth(maxDate.getMonth() + 2)
        maxDate.setDate(maxDate.getDate() + 15)
        
        minDateStr = minDate.toLocaleDateString(locale || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        maxDateStr = maxDate.toLocaleDateString(locale || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    console.log(order)

    return (
        <section className="min-h-[60vh] py-12">
            <ContentWrapper>
                {orderLoading ? (
                    <div className="flex flex-col">
                        <div className="w-34 h-6 bg-neutral-100" />
                        <div className="w-24 h-6 bg-neutral-100 mt-6" />
                        <div className="w-full h-[35vh] rounded-xl mt-4 bg-neutral-100" />
                        <div className="grid lg:grid-cols-3 gap-6 mt-6">
                            <div className="lg:col-span-2 h-[55vh] bg-neutral-100" />
                            <div className="h-[45vh] bg-neutral-100" />
                        </div>
                    </div>
                ) : (
                    (orderError || !order) ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center min-h-[50vh]">
                            <span className="text-[1.75rem] font-extrabold uppercase tracking-tight block mb-2">
                                {t("order_not_found")}
                            </span>
                            <p className="text-muted-foreground text-[0.9rem] max-w-md">
                                {t("order_not_found_desc")}
                            </p>
                            <Link 
                                href="/shop"
                                className="mt-6 text-[0.9rem] font-bold underline underline-offset-4 cursor-pointer hover:text-orange-500 transition-colors"
                            >
                                {t("return_to_shop")}
                            </Link>
                        </div>
                    ) : (
                        <main className="flex flex-col gap-8">
                            {/* Breadcrumb */}
                            <div>
                                <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Link href="/" className="hover:text-foreground transition-colors">
                                        {t("home")}
                                    </Link>
                                    <ChevronRight size={12} />
                                    <Link href="/orders" className="hover:text-foreground transition-colors">
                                        {t("orders")}
                                    </Link>
                                    <ChevronRight size={12} />
                                    <span className="text-foreground font-medium">ORD-{order._id.slice(-8).toUpperCase()}</span>
                                </nav>
                            </div>

                            {/* Back link */}
                            <Link 
                                href="/orders" 
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                            >
                                <ArrowLeft size={13} /> {t("backToOrder")}
                            </Link>

                            {/* Order Header Card */}
                            <div className="border border-border rounded-2xl bg-neutral-50 overflow-hidden">
                                <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${currentStatusConfig.color} border flex items-center justify-center`}>
                                            <StatusIcon size={20} className={currentStatusConfig.color} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-xl sm:text-2xl block font-bold text-foreground tracking-tight">
                                                    ORD-{order._id.slice(-8).toUpperCase()}
                                                </span>
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${currentStatusConfig.color} border`}>
                                                    {currentStatusConfig.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={11} /> 
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Hash size={11} /> {order.products.reduce((s, i) => s + i.quantity, 0)} {order.products.length === 1 ? t("product") : t("products")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link 
                                            className="px-4 py-2 rounded-xl text-xs font-medium text-foreground border border-border 
                                            hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                                            href={order.invoiceUrl}
                                            target="_blank"
                                        >
                                            <Download size={12} /> {t("invoice")}
                                        </Link>
                                        <Link 
                                            className="px-4 py-2 rounded-xl text-xs font-medium text-foreground border border-border 
                                            hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                                            href="https://wa.me/971554667720"
                                            target="_blank"    
                                        >
                                            <MessageSquare size={12} /> {t("support")}
                                        </Link>
                                    </div>
                                </div>

                                {/* Order Status Stepper */}
                                {(order.status === "paid" || order.status === "processing" || order.status === "delivering" || order.status === "delivered") && (
                                    <div className="border-t border-border px-6 sm:px-8 py-12" dir="ltr">
                                        {/* Stepper */}
                                        <div className="flex items-start justify-between relative">
                                            
                                            {/* Background Line */}
                                            {/* Background Line */}
                                            <div className="absolute top-4.5 left-0 right-0 h-0.5 bg-border" />

                                            {/* Active Progress Line */}
                                            <div
                                                className="absolute top-4.5 left-0 h-0.5 bg-foreground transition-all duration-500 z-0"
                                                style={{ width: `${progressPercent}%` }}
                                            />

                                            {/* Timeline Steps */}
                                            {timeline.map((event, i) => (
                                                <div key={i} className="flex flex-col items-center text-center relative z-10 flex-1">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2.5 transition-all duration-500 ${
                                                        event.completed
                                                            ? "bg-foreground shadow-sm"
                                                            : "bg-background border-2 border-border"
                                                    }`}>
                                                        {event.completed ? (
                                                            <CheckCircle2 size={14} className="text-background" />
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-border" />
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] font-semibold leading-tight transition-colors duration-500 ${event.completed ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {event.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 h-3">
                                                        {event.date}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {order.status !== "delivered" && (
                                            <p className="text-[0.725rem] text-muted-foreground mt-10 flex items-center gap-1.5">
                                                <Truck size={12} /> {t("estimatedDelivery")} <span className="font-medium text-black">{minDateStr} - {maxDateStr}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Content Grid */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Items */}
                                <div
                                    className="lg:col-span-2 border border-border rounded-2xl bg-neutral-50 overflow-hidden"
                                >
                                    <div className="px-6 sm:px-8 py-5 border-b border-border">
                                        <span className="text-sm block font-bold text-foreground">{t("header2")}</span>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {order.products.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 sm:gap-5 px-6 sm:px-8 py-5">
                                                <img
                                                    src={item.imageAtPurchase}
                                                    alt={item.nameAtPurchase[locale] || item.nameAtPurchase["en"]}
                                                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground">{item.nameAtPurchase[locale] || item.nameAtPurchase["en"]}</p>
                                                    <div className="text-muted-foreground mt-1.25 flex items-center gap-2 text-[0.65rem] font-medium">
                                                        <div className="flex items-center gap-2.25">
                                                            <div className="w-2.5 h-2.5 border" style={{ background: item.color.code }} />
                                                            {item.color.name[locale] || item.color.name["en"]}
                                                        </div>
                                                        <span className="text-sm">·</span>
                                                        <span>{item.dimensions.h}cm×{item.dimensions.w}cm×{item.dimensions.d}cm</span>
                                                    </div>
                                                    <p className="text-[0.65rem] font-medium text-muted-foreground mt-1.25">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="lg:col-span-1 space-y-4">
                                    {/* Price Summary */}
                                    <div className="border border-border rounded-2xl bg-neutral-50 p-6">
                                        <span className="text-sm block font-bold text-foreground mb-5">{t("summary")}</span>
                                        <div className="space-y-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">{t("subtotal")}</span>
                                                <span className="text-foreground font-semibold">
                                                    {(order.totalAmount-order.vat).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t("aed")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">{t("shipping")}</span>
                                                <span className="font-semibold text-green-700">
                                                    {t("free")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between mb-5">
                                                <span className="text-muted-foreground font-medium">{t("vat")}</span>
                                                <span className="text-foreground font-semibold">
                                                    {(order.vat).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t("aed")}
                                                </span>
                                            </div>
                                            <div className="border-t border-border pt-4 flex justify-between items-baseline">
                                                <span className="text-sm block font-bold text-foreground">{t("total")}</span>
                                                <span className="font-bold text-[1.125rem]">
                                                    {(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t("aed")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping & Payment */}
                                    <div className="border border-border rounded-2xl bg-neutral-50 divide-y divide-border">
                                        <div className="p-6">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                                <MapPin size={11} /> {t("shipAddress")}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {order.phone}<br />
                                                {[
                                                    order.shippingAddress.line1,
                                                    order.shippingAddress.line2,
                                                    order.shippingAddress.city,
                                                    order.shippingAddress.postal_code,
                                                    order.shippingAddress.country
                                                ].filter(Boolean).join(", ")}
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                                <CreditCard size={11} /> {t("paymentMethod")}
                                            </span>
                                            <p className="text-sm text-foreground">
                                                {order.paymentMethod} {t("cardEnding") } •••• {order.cardLast4}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/shop"
                                        className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <Package size={13} /> {t("continueShopping")}
                                    </Link>
                                </div>
                            </div>
                        </main>
                    )
                )}
            </ContentWrapper>
        </section>
    )
}