"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { usePaginatedQuery } from "convex/react"
import { Heart, Loader2, Search, ShoppingCart, ShoppingBag, Trash2, Users2 } from "lucide-react"
import Image from "next/image"
import { useDeferredValue, useState, useTransition } from "react"
import { useLocale, useTranslations } from "use-intl"
import { deleteUser, updateUserRole } from "./actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700 whitespace-nowrap"

function Avatar({ src, name, size = 34 }) {
    if (src) {
        return (
            <Image
                src={src}
                alt={name}
                width={size}
                height={size}
                className="rounded-full object-cover shrink-0"
            />
        )
    }
    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full bg-orange-100 flex items-center justify-center shrink-0"
        >
            <span className="text-orange-600 text-xs font-bold">
                {name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
        </div>
    )
}

function DeleteButton({ onClick, disabled, isProtected }) {
    const [confirming, setConfirming] = useState(false)

    if (isProtected) {
        return (
            <div className="w-8 h-8 flex items-center justify-center rounded-lg cursor-not-allowed opacity-30">
                <Trash2 className="w-3.5 h-3.5 text-gray-400" />
            </div>
        )
    }

    if (confirming) {
        return (
            <button
                onClick={() => { setConfirming(false); onClick() }}
                onBlur={() => setConfirming(false)}
                disabled={disabled}
                className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[0.68rem] font-semibold
                hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
                Confirm
            </button>
        )
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            disabled={disabled}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50
            text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    )
}

export default function Users() {
    const t = useTranslations("admin")
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("")
    const { user: currentUser } = useUser()
    const [isPending, startTransition] = useTransition()
    const locale = useLocale()

    const deferredSearch = useDeferredValue(search)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAllUsers,
        {
            search: deferredSearch || undefined,
            roleFilter: (roleFilter && roleFilter !== "all") ? roleFilter : undefined,
        },
        { initialNumItems: 10 },
    )

    const handleRoleChange = (userId, newRole) => {
        startTransition(async () => {
            const result = await updateUserRole(userId, newRole)
            if (result?.success) toast.success(t("roleUpdated"))
            else toast.error(result?.error || t("errorUpdatingRole"))
        })
    }

    const handleDeleteUser = (userId) => {
        startTransition(async () => {
            const result = await deleteUser(userId)
            if (result?.success) toast.success(t("userDeleted"))
            else toast.error(result?.error || t("errorDeletingUser"))
        })
    }

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{t("users")}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        {isLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <span className="font-semibold text-gray-600">{results.length}</span>
                        }
                        {t("totalUsers")}
                    </p>
                </div>
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
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-44 !h-11 bg-white border-gray-200 text-sm cursor-pointer">
                        <SelectValue placeholder={t("filterByRole")} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                        <SelectItem value="all" className="text-sm cursor-pointer">{t("noFilters")}</SelectItem>
                        <SelectItem value="user" className="text-sm cursor-pointer">{t("user")}</SelectItem>
                        <SelectItem value="admin" className="text-sm cursor-pointer">{t("admin")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>{t("userName")}</th>
                                <th className={TH}>{t("userRole")}</th>
                                <th className={TH}>{t("totalOrders")}</th>
                                <th className={`${TH}`}>Wishlist</th>
                                <th className={`${TH}`}>Cart</th>
                                <th className={TH}>{t("userJoined")}</th>
                                <th className={TH}>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                                                <div className="space-y-1.5">
                                                    <div className="h-3 w-28 bg-gray-100 rounded-full" />
                                                    <div className="h-2.5 w-36 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                        </td>
                                        {[1,2,3,4,5,6].map(j => (
                                            <td key={j} className="py-4 px-5">
                                                <div className="h-3 bg-gray-100 rounded-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : results.length > 0 ? (
                                results.map((u) => {
                                    const isProtected = u.role === "admin" || u.userId === currentUser?.id
                                    return (
                                        <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                                            {/* User */}
                                            <td className={`${TD} min-w-56`}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={u.imageURL} name={u.name} />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-800 truncate">{u.name}</p>
                                                        <p className="text-[0.68rem] text-gray-400 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className={TD}>
                                                {u.role === "admin" ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[0.68rem] font-semibold border bg-orange-50 text-orange-700 border-orange-200">
                                                        {t("admin")}
                                                    </span>
                                                ) : (
                                                    <Select
                                                        key={`${u.userId}-${u.role}`}
                                                        defaultValue={u.role}
                                                        disabled={isPending || isProtected}
                                                        onValueChange={(val) => handleRoleChange(u.userId, val)}
                                                    >
                                                        <SelectTrigger className="h-7 w-28 text-[0.68rem] font-semibold border-gray-200 bg-gray-50 shadow-none cursor-pointer disabled:cursor-default focus:ring-orange-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" sideOffset={4}>
                                                            <SelectItem value="user" className="text-xs cursor-pointer font-medium">{t("user")}</SelectItem>
                                                            <SelectItem value="admin" className="text-xs cursor-pointer font-medium">{t("admin")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </td>

                                            {/* Orders */}
                                            <td className={TD}>
                                                <div className="flex items-center gap-1.5">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                                                    <span className="font-semibold text-gray-700">{u.orderCount ?? 0}</span>
                                                </div>
                                            </td>

                                            {/* Wishlist */}
                                            <td className={TD}>
                                                <div className="flex items-center gap-1.5">
                                                    <Heart className="w-3.5 h-3.5 text-gray-300" />
                                                    <span className="font-semibold text-gray-700">{u.likedProducts?.length ?? 0}</span>
                                                </div>
                                            </td>

                                            {/* Cart */}
                                            <td className={TD}>
                                                <div className="flex items-center gap-1.5">
                                                    <ShoppingCart className="w-3.5 h-3.5 text-gray-300" />
                                                    <span className="font-semibold text-gray-700">{u.cart?.length ?? 0}</span>
                                                </div>
                                            </td>

                                            {/* Joined */}
                                            <td className={`${TD} text-gray-400`}>
                                                {formatDate(u._creationTime)}
                                            </td>

                                            {/* Actions */}
                                            <td className={TD}>
                                                <DeleteButton
                                                    onClick={() => handleDeleteUser(u.userId)}
                                                    disabled={isPending}
                                                    isProtected={isProtected}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Users2 className="w-10 h-10" />
                                            <p className="text-sm font-medium text-gray-400">{t("noUsers")}</p>
                                            {(roleFilter || search) && (
                                                <button
                                                    onClick={() => { setRoleFilter(""); setSearch("") }}
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
