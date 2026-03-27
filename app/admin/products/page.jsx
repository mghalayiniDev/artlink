"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { usePaginatedQuery } from "convex/react"
import { Bell, Loader, Pencil, Plus, Search, ShoppingBasket, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useDeferredValue, useState } from "react"

export default function Products() {
    const t = useTranslations("admin")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const locale = useLocale()
    
    const deferredSearch = useDeferredValue(search)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAllProducts,
        { 
            search: deferredSearch || undefined, 
            statusFilter: (statusFilter && statusFilter !== "all") ? statusFilter : undefined
        },
        { initialNumItems: 10 },
    )

    const getStatus = (status) => {
        switch (status) {
            case "active":
                return (
                    <Badge variant="default">
                        {t("active")}
                    </Badge>
                )

            case "draft":
                return (
                    <Badge variant="destructive">
                        {t("draft")}
                    </Badge>
                )
        
            default:
                return (
                    <Badge variant="default">
                        {t("active")}
                    </Badge>
                )
        }
    }

    const statues = [
        { val: "active", label: t("active") },
        { val: "draft", label: t("draft") }
    ]
    
    return (
        <>
            {/* Header */}
            <div className="space-y-1.5">
                <div className="flex md:items-center md:justify-between gap-6 md:flex-row flex-col">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-4">
                            <ShoppingBasket className="w-7 h-7 text-orange-500" />
                            <span className="text-3xl font-bold text-foreground block">{t('products')}</span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-3">
                            {isLoading ? (
                                <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                            ) : (
                                results.length
                            )} {" "}
                            {t('totalProducts1')}
                        </p>
                    </div>
                    <Button asChild className="gap-2 w-full sm:w-auto h-10.5 bg-orange-500 hover:bg-orange-600/90">
                        <Link href="/admin/products/add">
                            <Plus className="w-4 h-4" />
                            {t('add_product')}
                        </Link>
                    </Button>
                </div>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:max-w-56 h-11! bg-white cursor-pointer focus:ring-orange-500 ps-6">
                        <SelectValue placeholder={t('filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="max-h-60 w-[--radix-select-trigger-width]">
                        <SelectItem
                            value={"all"}
                            className="cursor-pointer text-[0.85rem] font-medium"
                        >
                            {t("noFilters")}
                        </SelectItem>
                        {statues.map((statue, idx) => (
                            <SelectItem
                                key={idx}
                                value={statue.val}
                                className="cursor-pointer text-[0.85rem] font-medium"
                            >
                                {statue.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Products Table */}
            <div className="rounded-md border bg-white overflow-hidden">
                {/* This wrapper is the key for mobile responsiveness */}
                <div className="relative w-full overflow-x-auto">
                    <Table className="min-w-225 w-full border-collapse">
                        <TableHeader className="bg-muted/50 hover:bg-muted/50">
                            <TableRow>
                                <TableHead className="min-w-85 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("userName")}
                                </TableHead>
                                <TableHead className="min-w-40 font-bold text-start text-xs 
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("category")}
                                </TableHead>
                                <TableHead className="min-w-35 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("price")}
                                </TableHead>
                                <TableHead className="min-w-35 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("discount")}
                                </TableHead>
                                <TableHead className="min-w-30 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("stock")}
                                </TableHead>
                                <TableHead className="min-w-32 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("status")}
                                </TableHead>
                                <TableHead className="min-w-25 font-bold text-start text-xs 
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
                                        <TableCell className="py-5 px-6"><div className="h-4 w-16 bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-5 px-6"><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></TableCell>
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
                                            <TableCell className={`min-w-80 max-w-95 text-start text-xs tracking-wider py-5 px-3 xl:px-6 
                                            font-medium whitespace-normal break-word leading-relaxed`}>
                                                <div className="flex items-center gap-5">
                                                    <Image
                                                        width={55}
                                                        height={55}
                                                        alt={result.name[locale]}
                                                        src={result.thumbnail}
                                                        className="rounded-md"
                                                    />
                                                    <div className="flex flex-col">
                                                        <p className="font-medium text-foreground truncate">{result.name[locale]}</p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-lg
                                                        whitespace-normal break-word leading-relaxed">
                                                            {result.description[locale].slice(0, 90)}{result.description[locale].length > 90 && "..."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell className={`min-w-35 font-semibold tracking-wider py-5 px-3 xl:px-6 text-xs`}>
                                                {result.categoryName[locale]}
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell className={`min-w-40 font-semibold tracking-wider py-5 px-3 xl:px-6 text-xs`}>
                                                {result.price} {t("aed")}
                                            </TableCell>

                                            {/* Discount */}
                                            <TableCell className={`min-w-30 font-semibold tracking-wider py-5 px-3 xl:px-6 text-xs`}>
                                                {result.discount}%
                                            </TableCell>

                                            {/* Stock */}
                                            <TableCell className={`min-w-30 font-semibold tracking-wider py-5 px-3 xl:px-6 text-xs
                                            ${result.stock > 15 ? "text-green-600" : result.stock > 5 ? "text-orange-500" : "text-red-500"}    
                                            `}>
                                                {result.stock}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className={`min-w-30 40 py-5 px-3 xl:px-6`}>
                                                {getStatus(result.status)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="min-w-25 py-3.75 px-3 xl:px-6">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                        <Link href={`/admin/products/edit/${result._id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    (statusFilter.trim().length === 0 && search.trim().length === 0) ? (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={7} 
                                                className="h-64 text-center hover:bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                                                    <Bell className="w-10 h-10 opacity-20" />
                                                    <p className="text-lg font-medium">{t('noProducts')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={7} 
                                                className="h-64 text-center hover:bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                                                    <Bell className="w-10 h-10 opacity-20" />
                                                    <p className="text-lg font-medium">{t('noProducts')}</p>
                                                    <button 
                                                        className="text-sm bg-slate-100 px-6 py-2.25 font-semibold
                                                    rounded-md cursor-pointer hover:bg-slate-200/70 text-gray-600"
                                                        onClick={() => {
                                                            setStatusFilter("")
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