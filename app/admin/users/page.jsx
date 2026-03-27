"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { usePaginatedQuery } from "convex/react"
import { Loader, Search, Trash2, Users2 } from "lucide-react"
import Image from "next/image"
import { useDeferredValue, useState, useTransition } from "react"
import { useLocale, useTranslations } from "use-intl"
import { deleteUser, updateUserRole } from "./actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"

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
            roleFilter: (roleFilter && roleFilter !== "all") ? roleFilter : undefined
        },
        { initialNumItems: 10 },
    )

    const roles = [
        {
            val: "user",
            label: t("user")
        },
        {
            val: "admin",
            label: t("admin")
        }
    ]

    const handleRoleChange = (userId, newRole) => {
        startTransition(async () => {
            const result = await updateUserRole(userId, newRole)
            if (result?.success) {
                toast.success(t("roleUpdated"))
            } else {
                toast.error(result?.error || t("errorUpdatingRole"))
            }
        })
    }

    const handleDeleteUser = (userId) => {
        if (!confirm(t("confirmDelete"))) return
        startTransition(async () => {
            const result = await deleteUser(userId)
            if (result?.success) {
                toast.success(t("userDeleted"))
            } else {
                toast.error(result?.error || t("errorDeletingUser"))
            }
        })
    }

    return (
        <>
            {/* Header */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-5">
                    <Users2 className="w-7 h-7 text-orange-500" />
                    <span className="text-3xl font-bold text-foreground block">{t('users')}</span>
                </div>
                <p className="text-muted-foreground flex items-center gap-3">
                    {isLoading ? (
                        <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                    ) : (
                        results.length
                    )} {" "}
                    {t('totalUsers')}
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 my-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search')} 
                        className="ps-10 h-11! bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:max-w-56 h-11! bg-white cursor-pointer focus:ring-orange-500 ps-6">
                        <SelectValue placeholder={t('filterByRole')} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="max-h-60 w-[--radix-select-trigger-width]">
                        <SelectItem
                            value={"all"}
                            className="cursor-pointer text-[0.85rem] font-medium"
                        >
                            {t("noFilters")}
                        </SelectItem>
                        {roles.map((role, idx) => (
                            <SelectItem
                                key={idx}
                                value={role.val}
                                className="cursor-pointer text-[0.85rem] font-medium"
                            >
                                {role.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border bg-white overflow-hidden">
                {/* This wrapper is the key for mobile responsiveness */}
                <div className="relative w-full overflow-x-auto">
                    <Table className="min-w-225 w-full border-collapse">
                        <TableHeader className="bg-muted/50 hover:bg-muted/50">
                            <TableRow>
                                <TableHead className="min-w-90 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("userName")}
                                </TableHead>
                                <TableHead className="min-w-80 font-bold text-start text-xs 
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    # {t("userId")}
                                </TableHead>
                                <TableHead className="min-w-30 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("userRole")}
                                </TableHead>
                                <TableHead className="min-w-20 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("totalOrders")}
                                </TableHead>
                                <TableHead className="min-w-35 font-bold text-start text-xs 
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("userJoined")}
                                </TableHead>
                                <TableHead className="min-w-20 font-bold text-start text-xs 
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("actions")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-full bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-full bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-24 bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-24 bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-16 bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-16 bg-slate-200 animate-pulse rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                results.length > 0 ? (
                                    results.map((result, idx) => (
                                        <TableRow
                                            key={idx}
                                            className="hover:bg-white"
                                        >
                                            {/* Data */}
                                            <TableCell className={`min-w-90 text-start text-xs tracking-wider py-5 px-3 xl:px-6 
                                            font-medium whitespace-normal break-word leading-relaxed`}>
                                                <div className="flex items-center gap-5">
                                                    <Image 
                                                        width={40}
                                                        height={40}
                                                        alt={result.name}
                                                        src={result.imageURL}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex flex-col">
                                                        <p className="font-medium text-foreground truncate">{result.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{result.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* User ID */}
                                            <TableCell className={`min-w-80 text-start text-xs tracking-wider py-5 px-3 xl:px-6 
                                            font-medium whitespace-normal break-word leading-relaxed`}>
                                                {result.userId}
                                            </TableCell>

                                            {/* User Role - THE ACTION TRIGGER */}
                                            <TableCell className={`min-w-30 py-5 px-3 xl:px-6`}>
                                                <Select
                                                    key={`${result.userId}-${result.role}`}
                                                    defaultValue={result.role} 
                                                    disabled={isPending || result.role === "admin"}
                                                    onValueChange={(val) => handleRoleChange(result.userId, val)}
                                                >
                                                    <SelectTrigger className="w-34 text-[0.8rem] border h-9! bg-muted/50 shadow-none 
                                                    focus:ring-orange-500 font-semibold cursor-pointer disabled:cursor-default">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" sideOffset={0}>
                                                        {roles.map((r) => (
                                                            <SelectItem 
                                                                key={r.val} 
                                                                value={r.val}
                                                                className="text-xs font-semibold cursor-pointer"
                                                            >
                                                                {r.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            {/* Total orders */}
                                            <TableCell className={`min-w-20 font-semibold tracking-wider py-5 px-3 xl:px-6 
                                            whitespace-normal break-word leading-relaxed`}>
                                                {result.orders.length}
                                            </TableCell>

                                            {/* Joined */}
                                            <TableCell className={`min-w-35 font-semibold tracking-wider py-5 px-3 xl:px-6 
                                            whitespace-normal break-word leading-relaxed`}>
                                                {new Date(result._creationTime).toLocaleDateString(locale, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className={`min-w-20 py-5 px-3 xl:px-6`}>
                                                <div className="flex items-center gap-3">

                                                </div>
                                                {(result.role === "admin" || result.userId === currentUser?.id) ? (
                                                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" >
                                                        <Trash2 className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                                                        onClick={() => handleDeleteUser(result.userId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>  
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    (roleFilter.trim().length === 0 && search.trim().length === 0) ? (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={5} 
                                                className="h-64 text-center hover:bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                                                    <Users className="w-10 h-10 opacity-20" />
                                                    <p className="text-lg font-medium">{t('noUsers')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={5} 
                                                className="h-64 text-center hover:bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                                                    <Users className="w-10 h-10 opacity-20" />
                                                    <p className="text-lg font-medium">{t('noUsers')}</p>
                                                    <button 
                                                        className="text-sm bg-slate-100 px-6 py-2.25 font-semibold
                                                    rounded-md cursor-pointer hover:bg-slate-200/70 text-gray-600"
                                                        onClick={() => {
                                                            setTypeFilter("")
                                                            setSearch("")
                                                        }}
                                                    >
                                                        {t('clearFilters')}
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination / Load More */}
            <div className="mt-6 flex flex-col items-center justify-center gap-4">
                {status === "CanLoadMore" && (
                    <button
                        onClick={() => loadMore(10)}
                        disabled={isLoading}
                        className="px-6 max-w-34 text-center w-full py-2.25 bg-white border rounded-sm text-[0.825rem] font-semibold text-orange-600
                        hover:border-orange-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
                    >
                        {t('loadMore')}
                    </button>
                )}

                {status === "LoadingMore" && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <Loader className="w-4 h-4 animate-spin text-orange-500" />
                        {t('loading')}
                    </div>
                )}

                {status === "Exhausted" && results.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        {t('allLoaded')}
                    </p>
                )}
            </div>
        </>
    )
}