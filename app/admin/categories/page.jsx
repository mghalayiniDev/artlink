"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { usePaginatedQuery } from "convex/react"
import { Bell, ChartColumnStacked, Loader, Pencil, Plus, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import { useLocale, useTranslations } from "use-intl"

export default function Categories() {
    const t = useTranslations("admin") 
    const [search, setSearch] = useState("")
    const locale = useLocale()

    const deferredSearch = useDeferredValue(search)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.admin.getAllCategories,
        { 
            search: deferredSearch || undefined, 
        },
        { initialNumItems: 10 },
    )

    return (
        <>
            {/* Header */}
            <div className="space-y-1.5">
                <div className="flex md:items-center md:justify-between gap-6 md:flex-row flex-col">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-4">
                            <ChartColumnStacked className="w-7 h-7 text-orange-500" />
                            <span className="text-3xl font-bold text-foreground block">{t('categories')}</span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-3">
                            {isLoading ? (
                                <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                            ) : (
                                results.length
                            )} {" "}
                            {t('totalCategories')}
                        </p>
                    </div>
                    <Button asChild className="gap-2 w-full sm:w-auto h-10.5 bg-orange-500 hover:bg-orange-600/90">
                        <Link href="/admin/categories/add">
                            <Plus className="w-4 h-4" />
                            {t('add_category')}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md my-8">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder={t('search')} 
                    className="ps-10 h-11! bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Categories Table */}
            <div className="rounded-md border bg-white overflow-hidden">
                {/* This wrapper is the key for mobile responsiveness */}
                <div className="relative w-full overflow-x-auto">
                    <Table className="min-w-225 w-full border-collapse">
                        <TableHeader className="bg-muted/50 hover:bg-muted/50">
                            <TableRow>
                                <TableHead className="min-w-40 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("name")}
                                </TableHead>
                                <TableHead className="min-w-70 font-bold text-start text-xs
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("description")}
                                </TableHead>
                                <TableHead className="min-w-20 font-bold text-start text-xs 
                                text-muted-foreground uppercase tracking-wider py-3.75 px-3 xl:px-6">
                                    {t("notificationCreationDate")}
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
                                            {/* Data - Language Sensitive */}
                                            <TableCell className={`min-w-100 text-start text-[0.8rem] tracking-wider py-5 px-3 xl:px-6 
                                                font-medium whitespace-normal break-word leading-relaxed`}>
                                                <div className="flex items-center gap-5">
                                                    <Image
                                                        width={60}
                                                        height={60}
                                                        alt={result.name[locale]}
                                                        src={result.thumbnail}
                                                        className="rounded-md"
                                                    />
                                                    <div className="flex flex-col">
                                                        <p className="font-semibold text-foreground truncate">{result.name[locale]}</p>
                                                        <p className="text-gray-500 truncate text-[0.725rem]"># {result._id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Description - Language Sensitive */}
                                            <TableCell className={`min-w-70 max-w-160 text-start text-[0.8rem] tracking-wider py-5 px-3 xl:px-6 
                                                whitespace-normal break-word leading-relaxed`}>
                                                {result.description[locale]}
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className={`min-w-35 font-semibold tracking-wider py-5 px-3 xl:px-6 
                                            whitespace-normal break-word leading-relaxed`}>
                                                {new Date(result._creationTime).toLocaleDateString(locale, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>

                                             {/* Actions */}
                                            <TableCell className="min-w-25 py-3.75 px-3 xl:px-6">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                        <Link href={`/admin/categories/edit/${result._id}`}>
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
                                    search.trim().length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4} 
                                                className="h-64 text-center hover:bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                                                    <Bell className="w-10 h-10 opacity-20" />
                                                    <p className="text-lg font-medium">{t('noCategories')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={4} 
                                                className="h-64 text-center hover:bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                                                    <Bell className="w-10 h-10 opacity-20" />
                                                    <p className="text-lg font-medium">{t('noCategories')}</p>
                                                    <button 
                                                        className="text-sm bg-slate-100 px-6 py-2.25 font-semibold
                                                    rounded-md cursor-pointer hover:bg-slate-200/70 text-gray-600"
                                                        onClick={() => {
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