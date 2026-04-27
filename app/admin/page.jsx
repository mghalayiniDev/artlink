"use client"

import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useRef } from "react"
import {
    AlertTriangle, ArrowRight, Crown, DollarSign,
    Package, ShoppingCart, Tag, TrendingUp, Users
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"

const RevenueChart   = dynamic(() => import("../components/admin/RevenueChart"),   { ssr: false })
const SalesDonutChart = dynamic(() => import("../components/admin/SalesPieCharts"), { ssr: false })

const STATUS_STYLES = {
    paid:       "bg-green-50 text-green-700 border-green-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    delivering: "bg-orange-50 text-orange-700 border-orange-200",
    delivered:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled:  "bg-red-50 text-red-700 border-red-200",
    refunded:   "bg-gray-100 text-gray-600 border-gray-200",
}

function StatCard({ title, value, Icon, gradient, loading, delta }) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                        <div className="h-3 w-20 bg-gray-100 rounded-full" />
                        <div className="h-7 w-28 bg-gray-100 rounded-lg" />
                        <div className="h-3 w-24 bg-gray-100 rounded-full" />
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
                </div>
            </div>
        )
    }
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight truncate">{value}</p>
                    {delta !== null && delta !== undefined && (
                        <p className={`text-xs font-semibold flex items-center gap-0.5 ${delta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% vs last month
                        </p>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    )
}

function SectionCard({ title, description, href, hrefLabel, icon: Icon, iconGradient, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconGradient}`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
                    </div>
                </div>
                {href && (
                    <Link
                        href={href}
                        className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 shrink-0 transition-colors"
                    >
                        {hrefLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </div>
            <div className="overflow-x-auto">{children}</div>
        </div>
    )
}

function TableSkeleton({ cols, rows = 5 }) {
    return Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
            {Array.from({ length: cols }).map((__, j) => (
                <td key={j} className="py-3.5 px-5">
                    <div className="h-3.5 bg-gray-100 rounded-full" />
                </td>
            ))}
        </tr>
    ))
}

function EmptyState({ icon: Icon, label }) {
    return (
        <tr>
            <td colSpan={99} className="py-14 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-300">
                    <Icon className="w-9 h-9" />
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                </div>
            </td>
        </tr>
    )
}

export default function Admin() {
    const t = useTranslations("admin")
    const locale = useLocale()
    const data = useQuery(api.admin.getDashboardData)
    const loading = data === undefined
    const initStats = useMutation(api.admin.initDashboardStats)
    const initCalled = useRef(false)

    useEffect(() => {
        if (data?.needsInit && !initCalled.current) {
            initCalled.current = true
            initStats()
        }
    }, [data?.needsInit, initStats])

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

    const stats = [
        {
            title: t("total_revenue"),
            value: loading ? "—" : `${data.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t("aed")}`,
            Icon: DollarSign,
            gradient: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            delta: loading ? undefined : data.momDeltas.revenue,
        },
        {
            title: t("total_users"),
            value: loading ? "—" : `${data.stats.totalUsers}`,
            Icon: Users,
            gradient: "bg-gradient-to-br from-violet-400 to-violet-600",
        },
        {
            title: t("totalProducts"),
            value: loading ? "—" : `${data.stats.totalProducts}`,
            Icon: Package,
            gradient: "bg-gradient-to-br from-amber-400 to-amber-600",
        },
        {
            title: t("totalOrders"),
            value: loading ? "—" : `${data.stats.totalOrders}`,
            Icon: ShoppingCart,
            gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
            delta: loading ? undefined : data.momDeltas.orders,
        },
    ]

    const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
    const TD = "py-3.5 px-5 text-xs font-medium text-gray-700 whitespace-nowrap"

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{t("dashboard")}</p>
                    <p className="text-xs text-gray-400 mt-1">{today}</p>
                </div>
                <p className="text-[0.7rem] text-gray-400">{t("welcome")}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} loading={loading} />
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{t("revenue_overview")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Monthly revenue for the past 12 months</p>
                </div>
                <div className="p-5">
                    <div className="h-64 w-full">
                        {loading ? (
                            <div className="w-full h-full flex items-end gap-1.5 pb-1">
                                {[...Array(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gray-100 animate-pulse rounded-t-md"
                                        style={{ height: `${25 + (i % 5) * 15}%` }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <RevenueChart data={data.revenueHistory} aedLabel={t("aed")} revenueLabel={t("total_revenue")} />
                        )}
                    </div>
                </div>
            </div>

            {/* Top Categories + Top Products */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SectionCard
                    title={t("topCategoriesTitle")}
                    description={t("topCategoriesDesc")}
                    href="/admin/categories"
                    hrefLabel={t("viewCategories")}
                    icon={Tag}
                    iconGradient="bg-gradient-to-br from-orange-400 to-orange-600"
                >
                    <div className="px-5 py-4">
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="mx-auto w-36 h-36 rounded-full bg-gray-100" />
                                {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded-full" />)}
                            </div>
                        ) : (
                            <SalesDonutChart
                                data={data.topCategories}
                                formatValue={(v) => `${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t("aed")}`}
                                emptyLabel={t("noChartData")}
                            />
                        )}
                    </div>
                </SectionCard>

                <SectionCard
                    title={t("topProductsTitle")}
                    description={t("topProductsDesc")}
                    href="/admin/products"
                    hrefLabel={t("viewProducts")}
                    icon={TrendingUp}
                    iconGradient="bg-gradient-to-br from-violet-400 to-violet-600"
                >
                    <div className="px-5 py-4">
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="mx-auto w-36 h-36 rounded-full bg-gray-100" />
                                {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded-full" />)}
                            </div>
                        ) : (
                            <SalesDonutChart
                                data={data.topSellingProducts}
                                formatValue={(v) => `${v} ${t("units")}`}
                                emptyLabel={t("noChartData")}
                            />
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Order Status Breakdown</p>
                        <p className="text-xs text-gray-400 mt-0.5">Year-to-date distribution across all statuses</p>
                    </div>
                    <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 animate-pulse">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {Object.entries(data.statusBreakdown).map(([status, count]) => (
                            <Link
                                key={status}
                                href={`/admin/orders?status=${status}`}
                                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-opacity hover:opacity-80 ${STATUS_STYLES[status]}`}
                            >
                                <span className="text-xl font-bold leading-none">{count}</span>
                                <span className="text-[0.62rem] font-semibold uppercase tracking-wide mt-1">{t(status)}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Low Stock + Top Buyers */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                <SectionCard
                    title={t("lowStock")}
                    description="Products running low on inventory"
                    href="/admin/products"
                    hrefLabel="View products"
                    icon={AlertTriangle}
                    iconGradient="bg-gradient-to-br from-amber-400 to-amber-600"
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("name")}</th>
                                <th className={TH}>{t("category")}</th>
                                <th className={TH}>{t("stock")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <TableSkeleton cols={3} /> : data.lowStockProducts.length > 0 ? (
                                data.lowStockProducts.map((product) => (
                                    <tr key={product._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className={`${TD} min-w-44`}>
                                            <div className="flex items-center gap-2.5">
                                                <Image
                                                    src={product.thumbnail}
                                                    alt={product.name[locale]}
                                                    width={30}
                                                    height={30}
                                                    className="rounded-lg object-cover shrink-0"
                                                />
                                                <span className="line-clamp-1 text-gray-800 font-semibold">{product.name[locale]}</span>
                                            </div>
                                        </td>
                                        <td className={`${TD} text-gray-400`}>{product.categoryName[locale]}</td>
                                        <td className={TD}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                product.stock === 0
                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                    : product.stock < 5
                                                    ? "bg-orange-50 text-orange-600 border-orange-200"
                                                    : "bg-amber-50 text-amber-600 border-amber-200"
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : <EmptyState icon={Package} label={t("noLowStock")} />}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard
                    title={t("topBuyers")}
                    description="Customers with the highest spending"
                    href="/admin/users"
                    hrefLabel="View users"
                    icon={Crown}
                    iconGradient="bg-gradient-to-br from-orange-400 to-orange-600"
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={`${TH} w-12 text-center`}>{t("rank")}</th>
                                <th className={TH}>{t("buyer")}</th>
                                <th className={TH}>{t("totalOrders_col")}</th>
                                <th className={TH}>{t("totalSpent")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <TableSkeleton cols={4} /> : data.topBuyers.length > 0 ? (
                                data.topBuyers.map((buyer, idx) => (
                                    <tr key={buyer.userId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className={`${TD} text-center text-base`}>
                                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (
                                                <span className="text-xs text-gray-400 font-semibold">#{idx + 1}</span>
                                            )}
                                        </td>
                                        <td className={`${TD} min-w-44`}>
                                            <div className="flex items-center gap-2.5">
                                                {buyer.imageURL ? (
                                                    <Image src={buyer.imageURL} alt={buyer.name} width={30} height={30} className="rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                        <span className="text-orange-600 text-xs font-bold">{buyer.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{buyer.name}</p>
                                                    <p className="text-[0.68rem] text-gray-400 truncate">{buyer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`${TD} text-gray-400`}>{buyer.totalOrders}</td>
                                        <td className={`${TD} font-semibold text-gray-900`}>
                                            {buyer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t("aed")}
                                        </td>
                                    </tr>
                                ))
                            ) : <EmptyState icon={Users} label={t("noTopBuyers")} />}
                        </tbody>
                    </table>
                </SectionCard>
            </div>

            {/* Recent Orders + Recent Users */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                <SectionCard
                    title={t("recentOrders")}
                    description="Latest orders placed in the store"
                    href="/admin/orders"
                    hrefLabel="View all"
                    icon={ShoppingCart}
                    iconGradient="bg-gradient-to-br from-blue-400 to-blue-600"
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("orderId")}</th>
                                <th className={TH}>{t("userName")}</th>
                                <th className={TH}>{t("orderAmount")}</th>
                                <th className={TH}>{t("status")}</th>
                                <th className={TH}>{t("orderDate")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <TableSkeleton cols={5} /> : data.recentOrders.length > 0 ? (
                                data.recentOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className={`${TD} font-mono text-gray-400 text-[0.7rem]`}>{shortId(order._id)}</td>
                                        <td className={`${TD} font-semibold text-gray-800`}>{order.userName}</td>
                                        <td className={TD}>
                                            {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t("aed")}
                                        </td>
                                        <td className={TD}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${STATUS_STYLES[order.status] ?? STATUS_STYLES.processing}`}>
                                                {t(order.status)}
                                            </span>
                                        </td>
                                        <td className={`${TD} text-gray-400`}>{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))
                            ) : <EmptyState icon={ShoppingCart} label={t("noOrders")} />}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard
                    title={t("recentUsers")}
                    description="Newly registered users"
                    href="/admin/users"
                    hrefLabel="View all"
                    icon={Users}
                    iconGradient="bg-gradient-to-br from-violet-400 to-violet-600"
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("userName")}</th>
                                <th className={TH}>{t("userRole")}</th>
                                <th className={TH}>{t("userJoined")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <TableSkeleton cols={3} /> : data.recentUsers.length > 0 ? (
                                data.recentUsers.map((u) => (
                                    <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className={`${TD} min-w-48`}>
                                            <div className="flex items-center gap-2.5">
                                                {u.imageURL ? (
                                                    <Image src={u.imageURL} alt={u.name} width={30} height={30} className="rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                                        <span className="text-violet-600 text-xs font-bold">{u.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{u.name}</p>
                                                    <p className="text-[0.68rem] text-gray-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                u.role === "admin"
                                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                            }`}>
                                                {t(u.role)}
                                            </span>
                                        </td>
                                        <td className={`${TD} text-gray-400`}>{formatDate(u.joinedAt)}</td>
                                    </tr>
                                ))
                            ) : <EmptyState icon={Users} label={t("noUsers")} />}
                        </tbody>
                    </table>
                </SectionCard>
            </div>
        </div>
    )
}
