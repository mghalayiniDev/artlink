"use client"

import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useAction, usePaginatedQuery } from "convex/react"
import { Check, FolderTree, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import { useLocale, useTranslations } from "use-intl"
import { toast } from "sonner"

const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700 whitespace-nowrap"

export default function Categories() {
    const t = useTranslations("admin")
    const [search, setSearch] = useState("")
    const locale = useLocale()
    const deferredSearch = useDeferredValue(search)

    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const deleteCategory = useAction(api.upload.deleteCategory)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAllCategories,
        { search: deferredSearch || undefined },
        { initialNumItems: 10 },
    )

    const handleDelete = async (id) => {
        setDeleting(true)
        try {
            const result = await deleteCategory({ id })
            if (result?.success === false) toast.error(result.error || t("deleteCategoryError"))
            else toast.success(t("deleteCategorySuccess"))
        } catch {
            toast.error(t("deleteCategoryError"))
        } finally {
            setDeleting(false)
            setConfirmDeleteId(null)
        }
    }

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{t("categories")}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        {isLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <span className="font-semibold text-gray-600">{results.length}</span>
                        }
                        {t("totalCategories")}
                    </p>
                </div>
                <Link
                    href="/admin/categories/add"
                    className="flex items-center gap-2 px-4 h-10 rounded-xl bg-orange-600 hover:bg-orange-700
                    text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-fit"
                >
                    <Plus className="w-4 h-4" />
                    {t("add_category")}
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                    placeholder={t("search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 bg-white border-gray-200 text-sm focus-visible:ring-orange-200 focus:border-orange-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("name")}</th>
                                <th className={TH}>{t("description")}</th>
                                <th className={TH}>{t("totalProducts")}</th>
                                <th className={TH}>{t("notificationCreationDate")}</th>
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
                                                    <div className="h-3 w-24 bg-gray-100 rounded-full" />
                                                    <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                        </td>
                                        {[1, 2, 3, 4].map(j => (
                                            <td key={j} className="py-4 px-5">
                                                <div className="h-3 bg-gray-100 rounded-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : results.length > 0 ? (
                                results.map((cat) => (
                                    <tr key={cat._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                                        {/* Name + thumbnail */}
                                        <td className={`${TD} min-w-52`}>
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={cat.thumbnail}
                                                    alt={cat.name[locale]}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg object-cover shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{cat.name[locale]}</p>
                                                    <p className="text-[0.68rem] text-gray-400 font-mono truncate">#{cat._id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className={`${TD} max-w-xs`}>
                                            <p className="truncate text-gray-500">{cat.description[locale]}</p>
                                        </td>

                                        {/* Total Products */}
                                        <td className={TD}>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
                                                {cat.productCount ?? 0}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className={`${TD} text-gray-400`}>
                                            {formatDate(cat._creationTime)}
                                        </td>

                                        {/* Actions */}
                                        <td className={TD}>
                                            {confirmDeleteId === cat._id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        disabled={deleting}
                                                        onClick={() => handleDelete(cat._id)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600
                                                        text-white text-[0.68rem] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        {deleting
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : <Check className="w-3 h-3" />
                                                        }
                                                        {t("deleteCategory")}
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
                                                        href={`/admin/categories/edit/${cat._id}`}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50
                                                        text-gray-400 hover:text-orange-600 transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(cat._id)}
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
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <FolderTree className="w-10 h-10" />
                                            <p className="text-sm font-medium text-gray-400">{t("noCategories")}</p>
                                            {search && (
                                                <button
                                                    onClick={() => setSearch("")}
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
