"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { usePaginatedQuery } from "convex/react"
import { Bell, Loader2, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useDeferredValue, useState } from "react"

const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700"

const TYPE_STYLES = {
    order_status: "bg-blue-50 text-blue-700 border-blue-200",
    promotion:    "bg-orange-50 text-orange-700 border-orange-200",
    alert:        "bg-amber-50 text-amber-700 border-amber-200",
    inventory:    "bg-orange-50 text-orange-700 border-orange-200",
}

export default function AdminNotifications() {
    const t = useTranslations("admin")
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const locale = useLocale()
    const deferredSearch = useDeferredValue(search)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAdminNotifications,
        {
            search: deferredSearch || undefined,
            typeFilter: (typeFilter && typeFilter !== "all") ? typeFilter : undefined,
        },
        { initialNumItems: 10 },
    )

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <p className="text-2xl font-bold text-gray-900">{t("notifications")}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    {isLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <span className="font-semibold text-gray-600">{results.length}</span>
                    }
                    {t("totalNotifications")}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-11 bg-white border-gray-200 text-sm focus-visible:ring-orange-200 focus:border-orange-400"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-44 !h-11 bg-white border-gray-200 text-sm cursor-pointer">
                        <SelectValue placeholder={t("filterByType")} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                        <SelectItem value="all" className="text-sm cursor-pointer">{t("noFilters")}</SelectItem>
                        <SelectItem value="order_status" className="text-sm cursor-pointer">{t("order_status")}</SelectItem>
                        <SelectItem value="promotion" className="text-sm cursor-pointer">{t("promotion")}</SelectItem>
                        <SelectItem value="alert" className="text-sm cursor-pointer">{t("alert")}</SelectItem>
                        <SelectItem value="inventory" className="text-sm cursor-pointer">{t("inventory")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("notificationsTitle")}</th>
                                <th className={TH}>{t("notificationsMsg")}</th>
                                <th className={TH}>{t("notificationType")}</th>
                                <th className={TH}>{t("notificationCreationDate")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                        <td className="py-4 px-5"><div className="h-3 w-32 bg-gray-100 rounded-full" /></td>
                                        <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded-full" /></td>
                                        <td className="py-4 px-5"><div className="h-5 w-20 bg-gray-100 rounded-lg" /></td>
                                        <td className="py-4 px-5"><div className="h-3 w-20 bg-gray-100 rounded-full" /></td>
                                    </tr>
                                ))
                            ) : results.length > 0 ? (
                                results.map((n) => (
                                    <tr key={n._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                                        {/* Title */}
                                        <td className={`${TD} min-w-48 font-semibold text-gray-800`}>
                                            {n.title[locale]}
                                        </td>

                                        {/* Body */}
                                        <td className={`${TD} min-w-64 max-w-sm`}>
                                            <p className="text-gray-500 truncate">{n.body[locale]}</p>
                                        </td>

                                        {/* Type badge */}
                                        <td className={`${TD} min-w-32`}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${TYPE_STYLES[n.type] ?? TYPE_STYLES.alert}`}>
                                                {t(n.type) || n.type}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className={`${TD} text-gray-400 whitespace-nowrap`}>
                                            {formatDate(n._creationTime)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Bell className="w-10 h-10" />
                                            <p className="text-sm font-medium text-gray-400">{t("noNotifications")}</p>
                                            {(typeFilter || search) && (
                                                <button
                                                    onClick={() => { setTypeFilter(""); setSearch("") }}
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
                        onClick={() => loadMore(10)}
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
