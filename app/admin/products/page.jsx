"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { useAction, usePaginatedQuery } from "convex/react"
import { Check, Loader2, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useDeferredValue, useEffect, useState } from "react"
import { toast } from "sonner"

const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700 whitespace-nowrap"

export default function Products() {
    const t = useTranslations("admin")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const locale = useLocale()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const deferredSearch = useDeferredValue(search)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const deleteProduct = useAction(api.upload.deleteProduct)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAllProducts,
        {
            search: deferredSearch || undefined,
            statusFilter: (statusFilter && statusFilter !== "all") ? statusFilter : undefined,
        },
        { initialNumItems: 10 },
    )

    const handleDelete = async (id) => {
        setDeleting(true)
        try {
            const result = await deleteProduct({ id })
            if (result?.success === false) toast.error(result.error || t("deleteProductError"))
            else toast.success(t("deleteProductSuccess"))
        } catch {
            toast.error(t("deleteProductError"))
        } finally {
            setDeleting(false)
            setConfirmDeleteId(null)
        }
    }

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

    if (!mounted) return (
        <div className="space-y-6">
            <div className="h-8 w-40 bg-gray-100 animate-pulse rounded-lg" />
            <div className="h-11 w-full max-w-sm bg-gray-100 animate-pulse rounded-xl" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{t("products")}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        {isLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <span className="font-semibold text-gray-600">{results.length}</span>
                        }
                        {t("totalProducts1")}
                    </p>
                </div>
                <Link
                    href="/admin/products/add"
                    className="flex items-center gap-2 px-4 h-10 rounded-xl bg-orange-600 hover:bg-orange-700
                    text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-fit"
                >
                    <Plus className="w-4 h-4" />
                    {t("add_product")}
                </Link>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-44 !h-11 bg-white border-gray-200 text-sm cursor-pointer">
                        <SelectValue placeholder={t("filterByStatus")} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                        <SelectItem value="all" className="text-sm cursor-pointer">{t("noFilters")}</SelectItem>
                        <SelectItem value="active" className="text-sm cursor-pointer">{t("active")}</SelectItem>
                        <SelectItem value="draft" className="text-sm cursor-pointer">{t("draft")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("name")}</th>
                                <th className={TH}>{t("category")}</th>
                                <th className={TH}>{t("price")}</th>
                                <th className={TH}>{t("discount")}</th>
                                <th className={TH}>{t("stock")}</th>
                                <th className={TH}>{t("status")}</th>
                                <th className={TH}>{t("isFeatured")}</th>
                                <th className={TH}>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                                                <div className="space-y-1.5">
                                                    <div className="h-3 w-28 bg-gray-100 rounded-full" />
                                                    <div className="h-2.5 w-40 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                        </td>
                                        {[1,2,3,4,5,6,7].map(j => (
                                            <td key={j} className="py-4 px-5">
                                                <div className="h-3 bg-gray-100 rounded-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : results.length > 0 ? (
                                results.map((p) => (
                                    <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                                        {/* Product */}
                                        <td className={`${TD} min-w-64`}>
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={p.thumbnail}
                                                    alt={p.name[locale]}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg object-cover shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{p.name[locale]}</p>
                                                    <p className="text-[0.68rem] text-gray-400 truncate max-w-48">
                                                        {p.description[locale].slice(0, 60)}{p.description[locale].length > 60 && "…"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className={`${TD} text-gray-500`}>
                                            {p.categoryName[locale]}
                                        </td>

                                        {/* Price */}
                                        <td className={`${TD} font-semibold text-gray-800`}>
                                            {p.price} {t("aed")}
                                        </td>

                                        {/* Discount */}
                                        <td className={TD}>
                                            {p.discount > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border bg-rose-50 text-rose-600 border-rose-200">
                                                    -{p.discount}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>

                                        {/* Stock */}
                                        <td className={TD}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                p.stock === 0
                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                    : p.stock <= 5
                                                    ? "bg-orange-50 text-orange-600 border-orange-200"
                                                    : p.stock <= 15
                                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                            }`}>
                                                {p.stock}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className={TD}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                p.status === "draft"
                                                    ? "bg-gray-100 text-gray-500 border-gray-200"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            }`}>
                                                {p.status === "draft" ? t("draft") : t("active")}
                                            </span>
                                        </td>

                                        {/* Featured */}
                                        <td className={TD}>
                                            {p.isFeatured ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border bg-orange-50 text-orange-600 border-orange-200">
                                                    {t("featured")}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className={TD}>
                                            {confirmDeleteId === p._id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        disabled={deleting}
                                                        onClick={() => handleDelete(p._id)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600
                                                        text-white text-[0.68rem] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        {deleting
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : <Check className="w-3 h-3" />
                                                        }
                                                        {t("deleteProduct")}
                                                    </button>
                                                    <button
                                                        disabled={deleting}
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100
                                                        text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={`/admin/products/edit/${p._id}`}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50
                                                        text-gray-400 hover:text-orange-600 transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(p._id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50
                                                        text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Package className="w-10 h-10" />
                                            <p className="text-sm font-medium text-gray-400">{t("noProducts")}</p>
                                            {(statusFilter || search) && (
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
