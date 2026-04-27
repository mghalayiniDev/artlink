"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { useMutation, usePaginatedQuery } from "convex/react"
import {
    Check, ChevronDown, Clock, Loader2,
    PackageCheck, Phone, ShoppingCart,
    Tag, Truck, Wallet, X, XCircle
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useDeferredValue, useEffect, useState } from "react"
import { toast } from "sonner"

const VALID_TRANSITIONS = {
    paid:       ["processing", "cancelled"],
    processing: ["delivering", "cancelled"],
    delivering: ["delivered"],
    delivered:  [],
    cancelled:  [],
    refunded:   [],
}

const NEEDS_TRACKING = "delivering"
const DESTRUCTIVE    = new Set(["cancelled"])

const STATUS_CONFIG = {
    paid:       { badge: "bg-neutral-100 text-neutral-700 border-neutral-200", icon: Wallet,       dot: "bg-neutral-400"  },
    processing: { badge: "bg-amber-50   text-amber-700   border-amber-200",   icon: Clock,        dot: "bg-amber-400"    },
    delivering: { badge: "bg-blue-50    text-blue-700    border-blue-200",    icon: Truck,        dot: "bg-blue-400"     },
    delivered:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: PackageCheck, dot: "bg-emerald-400"  },
    cancelled:  { badge: "bg-rose-50    text-rose-700    border-rose-200",    icon: XCircle,      dot: "bg-rose-400"     },
    refunded:   { badge: "bg-slate-100  text-slate-500   border-slate-200",   dot: "bg-slate-400" },
}


const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700 align-top"

export default function Orders() {
    const t = useTranslations("admin")

    const [statusFilter, setStatusFilter] = useState("")
    const [search,       setSearch]       = useState("")
    const deferredSearch = useDeferredValue(search)

    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const [rowState, setRowState] = useState({})

    const updateOrderStatus = useMutation(api.admin.updateOrderStatus)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAllOrders,
        { statusFilter: (statusFilter && statusFilter !== "all") ? statusFilter : undefined },
        { initialNumItems: 15 },
    )

    const filtered = deferredSearch.trim()
        ? results.filter((o) => {
            const q = deferredSearch.trim().toLowerCase()
            return (
                o._id.slice(-8).toLowerCase().includes(q) ||
                o.customerName.toLowerCase().includes(q)  ||
                o.customerEmail.toLowerCase().includes(q)
            )
        })
        : results

    const setRow   = (id, patch) => setRowState((p) => ({ ...p, [id]: { ...p[id], ...patch } }))
    const clearRow = (id)        => setRowState((p) => { const n = { ...p }; delete n[id]; return n })

    const handleSelectStatus = (orderId, newStatus) => {
        if (newStatus === NEEDS_TRACKING) {
            setRow(orderId, { pending: newStatus, tracking: "", confirm: false, refund: false })
        } else if (DESTRUCTIVE.has(newStatus)) {
            setRow(orderId, { pending: newStatus, tracking: "", confirm: true,  refund: false })
        } else {
            setRow(orderId, { pending: newStatus, tracking: "", confirm: false, refund: false })
        }
    }

    const handleConfirm = async (orderId) => {
        const rs = rowState[orderId]
        if (!rs?.pending) return
        if (rs.pending === NEEDS_TRACKING && !rs.tracking?.trim()) {
            toast.error(t("trackingRequired"))
            return
        }
        try {
            const result = await updateOrderStatus({
                orderId,
                status:         rs.pending,
                trackingNumber: rs.tracking?.trim() || undefined,
            })
            if (result.success) { toast.success(t("statusUpdated")); clearRow(orderId) }
            else toast.error(result.error || t("statusUpdateError"))
        } catch { toast.error(t("statusUpdateError")) }
    }

    const formatAmount = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const statusFilters = [
        { val: "all",        label: t("noFilters")  },
        { val: "paid",       label: t("paid")       },
        { val: "processing", label: t("processing") },
        { val: "delivering", label: t("delivering") },
        { val: "delivered",  label: t("delivered")  },
        { val: "cancelled",  label: t("cancelled")  },
        { val: "refunded",   label: t("refunded")   },
    ]

    if (!mounted) return (
        <div className="space-y-6">
            <div className="h-8 w-36 bg-gray-100 animate-pulse rounded-lg" />
            <div className="flex gap-3">
                <div className="h-11 flex-1 max-w-sm bg-gray-100 animate-pulse rounded-xl" />
                <div className="h-11 w-44 bg-gray-100 animate-pulse rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 border-b border-gray-50 bg-gray-50/50 animate-pulse" />
                ))}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <p className="text-2xl font-bold text-gray-900">{t("orders")}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    {isLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <span className="font-semibold text-gray-600">{filtered.length}</span>
                    }
                    {t("totalOrders1")}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder={t("ordersSearch")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-11 bg-white border-gray-200 text-sm focus-visible:ring-orange-200 focus:border-orange-400"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-44 !h-11 bg-white border-gray-200 text-sm cursor-pointer">
                        <SelectValue placeholder={t("filterByStatus")} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                        {statusFilters.map((s) => (
                            <SelectItem key={s.val} value={s.val} className="text-sm cursor-pointer">{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("orderId")}</th>
                                <th className={TH}>{t("orderCustomer")}</th>
                                <th className={TH}>{t("orderPhone")}</th>
                                <th className={TH}>{t("orderItems")}</th>
                                <th className={TH}>{t("orderAmount")}</th>
                                <th className={TH}>{t("discount")}</th>
                                <th className={TH}>{t("status")}</th>
                                <th className={TH}>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                        {Array.from({ length: 8 }).map((__, j) => (
                                            <td key={j} className="py-4 px-5">
                                                <div className="h-3 bg-gray-100 rounded-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((order) => {
                                    const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing
                                    const rs       = rowState[order._id] ?? {}
                                    const next     = VALID_TRANSITIONS[order.status] ?? []
                                    const isFinal  = order.status === "refunded" || order.status === "delivered"

                                    return (
                                        <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                                            {/* Order ID */}
                                            <td className={TD}>
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="font-mono text-[0.7rem] font-semibold text-orange-600 hover:text-orange-700 hover:underline underline-offset-2"
                                                >
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </Link>
                                            </td>

                                            {/* Customer */}
                                            <td className={`${TD} min-w-44`}>
                                                <p className="font-semibold text-gray-800">{order.customerName}</p>
                                                <p className="text-[0.68rem] text-gray-400 mt-0.5">{order.customerEmail}</p>
                                            </td>

                                            {/* Phone */}
                                            <td className={`${TD} min-w-32`}>
                                                {order.phone ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                                                        <p className="text-[0.68rem] text-gray-500">{order.phone}</p>
                                                    </div>
                                                ) : <span className="text-gray-300">—</span>}
                                            </td>

                                            {/* Items */}
                                            <td className={TD}>
                                                <span className="font-semibold text-gray-700">
                                                    {order.products.reduce((s, p) => s + p.quantity, 0)}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className={`${TD} whitespace-nowrap`}>
                                                <span className="font-semibold text-gray-800">
                                                    {formatAmount(order.totalAmount)} {t("aed")}
                                                </span>
                                            </td>

                                            {/* Discount */}
                                            <td className={`${TD} min-w-36`}>
                                                {order.discountAmount > 0 ? (() => {
                                                    const originalSubtotal = order.totalAmount / 1.05 + order.discountAmount
                                                    const pct = ((order.discountAmount / originalSubtotal) * 100).toFixed(1)
                                                    return (
                                                        <div className="space-y-1">
                                                            {order.promoCodeText && (
                                                                <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                                                    <Tag className="w-2.5 h-2.5" />
                                                                    {order.promoCodeText}
                                                                </span>
                                                            )}
                                                            <p className="text-[0.68rem] font-semibold text-emerald-600">
                                                                − {formatAmount(order.discountAmount)} {t("aed")}
                                                            </p>
                                                            <p className="text-[0.63rem] text-gray-400">{pct}% off</p>
                                                        </div>
                                                    )
                                                })() : <span className="text-gray-300">—</span>}
                                            </td>

                                            {/* Status */}
                                            <td className={TD}>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${cfg.badge}`}>
                                                    {t(order.status)}
                                                </span>
                                            </td>

                                            {/* Actions — status update only; refunds handled on the detail page */}
                                            <td className={`${TD} min-w-40`}>
                                                {rs.pending ? (
                                                    <div className="flex flex-col gap-2">
                                                        {rs.pending === NEEDS_TRACKING && (
                                                            <Input
                                                                autoFocus
                                                                placeholder={t("trackingPlaceholder")}
                                                                value={rs.tracking ?? ""}
                                                                onChange={(e) => setRow(order._id, { tracking: e.target.value })}
                                                                className="h-8 text-xs w-40 bg-gray-50 border-gray-200"
                                                            />
                                                        )}
                                                        {(rs.pending !== NEEDS_TRACKING || rs.tracking?.trim()) && (
                                                            <div className="flex items-center gap-1.5">
                                                                {rs.confirm && (
                                                                    <span className="text-[0.68rem] text-rose-600 font-semibold mr-1">
                                                                        {t("confirmAction")}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleConfirm(order._id)}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[0.68rem] font-semibold transition-colors cursor-pointer ${
                                                                        DESTRUCTIVE.has(rs.pending)
                                                                            ? "bg-rose-500 hover:bg-rose-600"
                                                                            : "bg-orange-600 hover:bg-orange-700"
                                                                    }`}
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                    {t(rs.pending)}
                                                                </button>
                                                                <button
                                                                    onClick={() => clearRow(order._id)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100
                                                                    text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {rs.pending === NEEDS_TRACKING && !rs.tracking?.trim() && (
                                                            <button
                                                                onClick={() => clearRow(order._id)}
                                                                className="flex items-center gap-1 text-[0.68rem] text-gray-400 hover:text-gray-600 cursor-pointer w-fit"
                                                            >
                                                                <X className="w-3 h-3" /> {t("cancel")}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : isFinal ? (
                                                    <Link
                                                        href={`/admin/orders/${order._id}`}
                                                        className="text-[0.68rem] text-orange-600 hover:text-orange-700 font-medium hover:underline underline-offset-2"
                                                    >
                                                        View details →
                                                    </Link>
                                                ) : next.length > 0 ? (
                                                    <Select onValueChange={(val) => handleSelectStatus(order._id, val)}>
                                                        <SelectTrigger className="h-8 w-40 text-xs border-gray-200 bg-gray-50 shadow-none font-semibold cursor-pointer">
                                                            <span className="flex items-center gap-1.5 text-gray-600">
                                                                <ChevronDown className="w-3 h-3" />
                                                                {t("updateStatus")}
                                                            </span>
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" sideOffset={4}>
                                                            {next.map((s) => {
                                                                const c = STATUS_CONFIG[s]
                                                                return (
                                                                    <SelectItem key={s} value={s} className="text-xs font-semibold cursor-pointer">
                                                                        <span className="flex items-center gap-2">
                                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${c?.dot}`} />
                                                                            {t(s)}
                                                                        </span>
                                                                    </SelectItem>
                                                                )
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-gray-300 text-[0.68rem]">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <ShoppingCart className="w-10 h-10" />
                                            <p className="text-sm font-medium text-gray-400">{t("noOrders")}</p>
                                            {((statusFilter && statusFilter !== "all") || search.trim()) && (
                                                <button
                                                    onClick={() => { setStatusFilter(""); setSearch("") }}
                                                    className="mt-1 text-xs font-semibold text-orange-600 hover:text-orange-700 border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors cursor-pointer"
                                                >
                                                    {t("clearFilters")}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Load more */}
            <div className="flex flex-col items-center gap-3">
                {status === "CanLoadMore" && (
                    <button
                        onClick={() => loadMore(15)}
                        disabled={isLoading}
                        className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600
                        hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        {t("loadMore")}
                    </button>
                )}
                {status === "LoadingMore" && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("loading")}
                    </div>
                )}
                {status === "Exhausted" && results.length > 0 && (
                    <p className="text-xs text-gray-400">{t("allLoaded")}</p>
                )}
            </div>
        </div>
    )
}
