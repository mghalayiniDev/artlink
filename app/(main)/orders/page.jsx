"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { CheckCircle2, Package, ShoppingBag, Truck, Wallet } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"

export default function Orders() {
    const t = useTranslations("orders")
    const locale = useLocale()

    const orders = useQuery(api.orders.getUserOrders) 
    const ordersLoading = orders === undefined
    const ordersError = orders === null

    const rawTotal = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0
    const totalAmount = rawTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const totalDelivered  = orders?.filter(order => order.status === "delivered").length || 0
    const totalProcessing = orders?.filter(order => order.status === "delivering").length || 0

    const getStatusConfig = (status) => {
        const configs = {
            paid: {
                color: "bg-neutral-100 text-neutral-800 border-neutral-200", 
                dotColor: "bg-neutral-500",
                label: t("status.paid")
            },
            processing: {
                color: "bg-amber-50 text-amber-800 border-amber-200",
                dotColor: "bg-amber-500",
                label: t("status.processing")
            },
            delivering: {
                color: "bg-blue-50 text-blue-800 border-blue-200",
                dotColor: "bg-blue-500",
                label: t("status.delivering")
            },
            delivered: {
                color: "bg-emerald-50 text-emerald-800 border-emerald-200",
                dotColor: "bg-emerald-500",
                label: t("status.delivered")
            },
            cancelled: {
                color: "bg-rose-50 text-rose-800 border-rose-200",
                dotColor: "bg-rose-500",
                label: t("status.cancelled")
            },
            refunded: {
                color: "bg-slate-100 text-slate-600 border-slate-200",
                dotColor: "bg-slate-400",
                label: t("status.refunded")
            }
        }

        return configs[status] || configs.processing;
    }

    return (
        <section className="min-h-[60vh] pt-14 pb-24">
            <ContentWrapper>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{t("orders")}</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-10">
                    <div>
                        <span className="text-3xl md:text-[2.5rem] block font-extrabold text-foreground">
                            {t("orders")}
                        </span>
                        <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            {ordersLoading ? (
                                <div className="w-42 h-5 bg-neutral-100" />
                            ) : (
                                (ordersError || orders.length === 0) ? (
                                    <div className="flex items-center gap-2.5">
                                        <span>0 {t("items")}</span>
                                        <span>·</span>
                                        <span>0 {t("aed")} {t("total")}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5">
                                        <span>{orders.length} {orders.length === 1 ? t("item") : t("items")}</span>
                                        <span>·</span>
                                        <span>{totalAmount} {t("aed")} {t("total")}</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="border p-6 flex flex-col">
                        <ShoppingBag size={18} className="text-muted-foreground mb-3" strokeWidth={1.5} />
                        {ordersLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 w-12 bg-neutral-100 animate-pulse rounded" />
                                <div className="h-3 w-24 bg-neutral-100 animate-pulse rounded" />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">{orders?.length || 0}</p>
                                <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">{t("totalOrders")}</p>
                            </>
                        )}
                    </div>

                    <div className="border p-6 flex flex-col">
                        <CheckCircle2 size={18} className="text-muted-foreground mb-3" strokeWidth={1.5} />
                        {ordersLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 w-12 bg-neutral-100 animate-pulse rounded" />
                                <div className="h-3 w-24 bg-neutral-100 animate-pulse rounded" />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">{totalDelivered}</p>
                                <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">{t("totalDelivered")}</p>
                            </>
                        )}
                    </div>

                    <div className="border p-6 flex flex-col">
                        <Truck size={18} className="text-muted-foreground mb-3" strokeWidth={1.5} />
                        {ordersLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 w-12 bg-neutral-100 animate-pulse rounded" />
                                <div className="h-3 w-24 bg-neutral-100 animate-pulse rounded" />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">{totalProcessing}</p>
                                <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">{t("totalDelivery")}</p>
                            </>
                        )}
                    </div>

                    <div className="border p-6 flex flex-col">
                        <div className="flex items-center gap-2.5 mb-3">
                            <Wallet size={18} className="text-muted-foreground" strokeWidth={1.5} />
                            {!ordersLoading && <span className="text-[0.825rem] text-muted-foreground">{t("aed")}</span>}
                        </div>
                        {ordersLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 w-24 bg-neutral-100 animate-pulse rounded" />
                                <div className="h-3 w-24 bg-neutral-100 animate-pulse rounded" />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">
                                    {totalAmount}
                                </p>
                                <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">{t("totalSpent")}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Orders List */}
                {ordersLoading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="border rounded p-6">
                                <div className="h-14 w-1/2 bg-neutral-100 mb-2 rounded" />  
                            </div>
                        ))}
                    </div>
                ) : (
                    (ordersError || orders.length === 0) ? (
                        <div className="min-h-[25vh] border px-6 py-12 flex items-center justify-center text-center">
                            <div className="max-w-265 flex flex-col text-center items-center justify-center">
                                <div className="w-16 h-16 bg-secondary flex items-center justify-center mb-6">
                                    <Package className="w-9 h-9 text-muted-foreground" />
                                </div>
                                <span className="block text-2xl font-bold text-foreground mb-2">
                                    {t("noOrders")}
                                </span>
                                <p className="text-muted-foreground text-sm max-w-sm text-center mb-5">
                                    {t("noOrdersDesc")}
                                </p>
                                <Link 
                                    href={"/shop"}                                
                                    className="bg-orange-500 hover:bg-orange-600/90 py-2.5 px-6 rounded-md text-sm font-medium cursor-pointer"
                                >
                                    {t("shopBtn")}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="gap-4 pt-4 flex flex-col">
                            {orders.map((order) => {
                                const config = getStatusConfig(order.status)

                                return (
                                    <Link 
                                        key={order._id} 
                                        className="border p-6 w-full flex flex-col hover:bg-neutral-50 transition-colors"
                                        href={`/order/${order.stripeSessionId}`}
                                    >
                                        <div className="flex items-center justify-between mb-5 w-full">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full ${config.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                                                    {config.label}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <span className="font-mono text-xs text-muted-foreground">ORD-{order._id.slice(-8).toUpperCase()}</span>
                                        </div>

                                        {/* Products row */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="flex -space-x-2">
                                                {order.products.slice(0, 3).map((_, idx) => (
                                                    <div key={idx} className="w-12 h-12 bg-secondary border-2 border-card flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    ))}
                                                    {order.products.length > 3 && (
                                                    <div className="w-11 h-11 bg-secondary border-2 border-card flex items-center justify-center">
                                                        <span className="text-[10px] font-semibold text-muted-foreground">+{order.products.length - 3}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {order.products.map(it => it.nameAtPurchase[locale] || it.nameAtPurchase['en']).join(', ')}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {order.products.reduce((sum, it) => sum + it.quantity, 0)} {order.products.length === 1 ? t("product") : t("products")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-5 border-t border-border/60">
                                             <p className="text-xl font-bold text-foreground">
                                                {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-muted-foreground">{t("aed")}</span>
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )
                )}
            </ContentWrapper>
        </section>
    )
}