"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import FilterSection from "@/app/components/shop/FilterSection"
import { Loader, GlobeLock, X, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { PRODUCT_FILTERS } from "@/constants"
import ProductCard from "@/app/components/ProductCard"
import { useState, useEffect, useRef } from "react"

const PAGE_SIZE = 6
const MAX_PRICE = 99999

const sanitizePrice = (val) => {
    const n = Math.floor(Number(val))
    if (isNaN(n) || val === "") return ""
    return Math.min(Math.max(0, n), MAX_PRICE).toString()
}

export default function Shop() {
    const t = useTranslations("shop")
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const locale = useLocale()
    const isRTL = locale === "ar"

    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const categoryId = searchParams.get("category") || undefined
    const materialEn = searchParams.get("material") || undefined
    const colorEn = searchParams.get("color") || undefined
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined

    const [openSection, setOpenSection] = useState(undefined)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [, forceUpdate] = useState(0)
    const [minInput, setMinInput] = useState(searchParams.get("minPrice") || "")
    const [maxInput, setMaxInput] = useState(searchParams.get("maxPrice") || "")

    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")

    useEffect(() => {
        setMinInput(minPriceParam || "")
        setMaxInput(maxPriceParam || "")
    }, [minPriceParam, maxPriceParam])

    const filterKey = `${categoryId}|${materialEn}|${colorEn}|${minPrice}|${maxPrice}`
    const cursorCacheRef = useRef({ key: filterKey, cursors: { 1: null } })

    if (cursorCacheRef.current.key !== filterKey) {
        cursorCacheRef.current = { key: filterKey, cursors: { 1: null } }
    }

    const canLoadPage = page in cursorCacheRef.current.cursors
    const currentCursor = canLoadPage ? cursorCacheRef.current.cursors[page] : null

    // Redirect to page 1 if user deep-links to ?page=N without a cached cursor
    useEffect(() => {
        if (!canLoadPage && page > 1) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", "1")
            replace(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }, [canLoadPage, page])

    const result = useQuery(
        api.products.getFilteredProducts,
        canLoadPage ? {
            paginationOpts: { numItems: PAGE_SIZE, cursor: currentCursor },
            categoryId,
            materialEn,
            colorEn,
            minPrice,
            maxPrice,
        } : "skip"
    )

    useEffect(() => {
        if (result && !result.isDone && result.continueCursor) {
            const nextPage = page + 1
            if (!(nextPage in cursorCacheRef.current.cursors)) {
                cursorCacheRef.current.cursors[nextPage] = result.continueCursor
                forceUpdate(n => n + 1)
            }
        }
    }, [result, page])

    const categories = useQuery(api.categories.getAllCategories)
    const categoriesLoading = categories === undefined

    const productsLoading = result === undefined || !canLoadPage
    const products = result?.page ?? []
    const isDone = result?.isDone ?? false
    const hasNext = result !== undefined && !isDone
    const hasPrev = page > 1

    const hasFiltersActive = categoryId || materialEn || colorEn || minPrice !== undefined || maxPrice !== undefined

    const applyPriceFilter = () => {
        const min = minInput !== "" ? Number(minInput) : undefined
        const max = maxInput !== "" ? Number(maxInput) : undefined
        const params = new URLSearchParams(searchParams.toString())
        if (min !== undefined) {
            params.set("minPrice", min.toString())
        } else {
            params.delete("minPrice")
        }
        if (max !== undefined) {
            params.set("maxPrice", max.toString())
        } else {
            params.delete("maxPrice")
        }
        params.set("page", "1")
        replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handlePageChange = (newPage) => {
        if (newPage < 1) return
        if (!(newPage in cursorCacheRef.current.cursors)) return
        const params = new URLSearchParams(searchParams)
        params.set("page", newPage.toString())
        replace(`${pathname}?${params.toString()}`)
    }

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === undefined || value === "" || value === null) {
            params.delete(key)
        } else {
            params.set(key, value.toString())
        }
        params.set("page", "1")
        replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const getPaginationNumbers = () => {
        const cursors = cursorCacheRef.current.cursors
        const maxAccessible = Math.max(...Object.keys(cursors).map(Number))
        const total = isDone && result
            ? page
            : page === maxAccessible && hasNext
                ? maxAccessible + 1
                : maxAccessible

        if (total <= 1) return []

        const allPages = []
        for (let i = 1; i <= total; i++) {
            allPages.push({ num: i, accessible: i in cursors })
        }

        if (total <= 7) return allPages

        const visible = new Set([1, page - 1, page, page + 1, total].filter(n => n >= 1 && n <= total))
        const result2 = []
        let prev = 0
        for (const n of [...visible].sort((a, b) => a - b)) {
            if (prev && n - prev > 1) result2.push({ num: "...", accessible: false })
            result2.push({ num: n, accessible: n in cursors })
            prev = n
        }
        return result2
    }

    const paginationNumbers = getPaginationNumbers()
    const showPagination = hasPrev || hasNext || paginationNumbers.length > 1

    return (
        <section className="min-h-screen">
            {/* Header */}
            <header className="bg-neutral-100 py-12 md:py-14 border-b border-neutral-200">
                <ContentWrapper>
                    <div className="flex items-center gap-2 text-[0.75rem] text-muted-foreground mb-5 uppercase tracking-wider">
                        <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
                        <span>/</span>
                        <span className="text-foreground font-semibold">{t("shop")}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <span className="block font-extrabold uppercase text-3xl md:text-5xl text-foreground tracking-tight">
                                {t("title")}
                            </span>
                            <p className="text-muted-foreground text-sm mt-2 max-w-md">{t("subtitle")}</p>
                        </div>
                        {!productsLoading && (
                            <p className="text-sm text-muted-foreground font-mono">
                                <span className="text-black font-bold">{products.length}</span>{" "}
                                {t("products")}
                                {page > 1 && (
                                    <span className="ml-2 text-xs">{t("page_indicator", { page })}</span>
                                )}
                            </p>
                        )}
                    </div>
                </ContentWrapper>
            </header>

            {/* Body */}
            <ContentWrapper className="lg:mt-10 mb-18">
                {/* Top toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                    <button
                        className="flex lg:hidden items-center gap-3 text-sm mt-12 font-medium cursor-pointer"
                        onClick={() => setIsFilterOpen(prev => !prev)}
                    >
                        <Filter className="w-4 h-4" />
                        {t("filters")}
                    </button>

                    {hasFiltersActive && (
                        <div className="max-w-xl flex flex-wrap gap-2 items-center">
                            {categoryId && (
                                <button
                                    onClick={() => updateFilter("category", undefined)}
                                    className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[10px] cursor-pointer
                                    font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors whitespace-nowrap"
                                >
                                    {categories?.find(c => c._id === categoryId)?.name[locale] ||
                                     categories?.find(c => c._id === categoryId)?.name["en"] ||
                                     t("category")}
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                            {materialEn && (
                                <button
                                    onClick={() => updateFilter("material", undefined)}
                                    className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[10px] cursor-pointer
                                    font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors whitespace-nowrap"
                                >
                                    {materialEn}
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                            {colorEn && (
                                <button
                                    onClick={() => updateFilter("color", undefined)}
                                    className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[10px] cursor-pointer
                                    font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors whitespace-nowrap"
                                >
                                    <div className="w-2 h-2 rounded-full border border-white/30" style={{ background: colorEn }} />
                                    {colorEn}
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                            {(minPrice !== undefined || maxPrice !== undefined) && (
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString())
                                        params.delete("minPrice")
                                        params.delete("maxPrice")
                                        params.set("page", "1")
                                        replace(`${pathname}?${params.toString()}`, { scroll: false })
                                    }}
                                    className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[10px] cursor-pointer
                                    font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors whitespace-nowrap"
                                >
                                    {minPrice !== undefined && maxPrice !== undefined
                                        ? t("price_range_both", { min: minPrice, max: maxPrice })
                                        : minPrice !== undefined
                                            ? t("price_range_min", { min: minPrice })
                                            : t("price_range_max", { max: maxPrice })}
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                            <button
                                className="text-[10px] cursor-pointer font-bold uppercase tracking-wider whitespace-nowrap text-orange-500 hover:text-orange-600 transition-colors"
                                onClick={() => replace(pathname)}
                            >
                                {t("clear_all_filters")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12 xl:gap-14 lg:py-2">
                    {/* Sidebar */}
                    <aside className={`lg:col-span-1 ${isFilterOpen ? "block" : "hidden lg:block"}`}>
                        <div className="sticky top-10 space-y-0">
                            <FilterSection
                                title={t("category")}
                                isOpen={openSection === "category"}
                                onToggle={() => setOpenSection(openSection === "category" ? undefined : "category")}
                            >
                                {categoriesLoading ? (
                                    <div className="w-full h-6 flex items-center justify-center">
                                        <Loader width={20} height={20} className="animate-spin" />
                                    </div>
                                ) : !categories || categories.length === 0 ? (
                                    <div className="w-full h-6 flex items-center justify-center">
                                        <GlobeLock width={20} height={20} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1.25 -mt-1 max-h-60 overflow-y-auto">
                                        {categories.map(cat => (
                                            <label key={cat._id} className="flex items-center gap-3.5 cursor-pointer group hover:bg-neutral-100 px-1 py-1">
                                                <input
                                                    type="radio"
                                                    name="category-group"
                                                    value={cat._id}
                                                    checked={categoryId === cat._id}
                                                    onClick={() => updateFilter("category", categoryId === cat._id ? undefined : cat._id)}
                                                    onChange={() => {}}
                                                    className="w-3.25 h-3.25 accent-black cursor-pointer"
                                                />
                                                <span className={`text-[0.8rem] transition-colors ${categoryId === cat._id ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                                    {cat.name[locale] || cat.name["en"]} ({cat.productCount})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </FilterSection>

                            <FilterSection
                                title={t("material")}
                                isOpen={openSection === "material"}
                                onToggle={() => setOpenSection(openSection === "material" ? undefined : "material")}
                            >
                                <div className="flex flex-col gap-1.25 -mt-1 max-h-60 overflow-y-auto">
                                    {PRODUCT_FILTERS.materials.map(material => (
                                        <label key={material.id} className="flex items-center gap-3.5 cursor-pointer group hover:bg-neutral-100 px-1 py-1">
                                            <input
                                                type="radio"
                                                name="material-group"
                                                value={material.id}
                                                checked={materialEn === material.en}
                                                onClick={() => updateFilter("material", materialEn === material.en ? undefined : material.en)}
                                                onChange={() => {}}
                                                className="w-3.25 h-3.25 accent-black cursor-pointer"
                                            />
                                            <span className={`text-[0.8rem] transition-colors ${materialEn === material.en ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                                {locale === "ar" ? material.ar : material.en}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection
                                title={t("color")}
                                isOpen={openSection === "color"}
                                onToggle={() => setOpenSection(openSection === "color" ? undefined : "color")}
                            >
                                <div className="flex flex-col gap-1.25 -mt-1 max-h-60 overflow-y-auto">
                                    {PRODUCT_FILTERS.colors.map(color => (
                                        <label key={color.en} className="flex items-center gap-3.5 cursor-pointer group hover:bg-neutral-100 px-1 py-1">
                                            <input
                                                type="radio"
                                                name="color-group"
                                                value={color.en}
                                                checked={colorEn === color.en}
                                                onClick={() => updateFilter("color", colorEn === color.en ? undefined : color.en)}
                                                onChange={() => {}}
                                                className="w-3.25 h-3.25 accent-black cursor-pointer"
                                            />
                                            <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-sm" style={{ backgroundColor: color.code }} />
                                            <span className={`text-[0.8rem] transition-colors ${colorEn === color.en ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                                {locale === "ar" ? color.ar : color.en}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection
                                title={t("price")}
                                isOpen={openSection === "price"}
                                onToggle={() => setOpenSection(openSection === "price" ? undefined : "price")}
                            >
                                <div className="flex flex-col gap-3 -mt-1 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">{t("min")}</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                value={minInput}
                                                onChange={e => setMinInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                                                onKeyDown={e => e.key === "Enter" && (setMinInput(sanitizePrice(minInput)), applyPriceFilter())}
                                                className="w-full border border-neutral-300 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
                                            />
                                        </div>
                                        <span className="text-muted-foreground text-sm mt-4">–</span>
                                        <div className="flex-1">
                                            <label className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">{t("max")}</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="∞"
                                                value={maxInput}
                                                onChange={e => setMaxInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                                                onKeyDown={e => e.key === "Enter" && (setMaxInput(sanitizePrice(maxInput)), applyPriceFilter())}
                                                className="w-full border border-neutral-300 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={applyPriceFilter}
                                        className="w-full bg-foreground text-background text-[0.75rem] font-bold uppercase tracking-wider py-2 hover:bg-orange-500 transition-colors cursor-pointer"
                                    >
                                        {t("apply")}
                                    </button>
                                </div>
                            </FilterSection>
                        </div>
                    </aside>

                    {/* Products */}
                    <div className="w-full lg:col-span-3">
                        {productsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(PAGE_SIZE)].map((_, i) => (
                                    <div key={i} className="space-y-4 animate-pulse">
                                        <div className="aspect-4/5 bg-neutral-200 rounded-sm" />
                                        <div className="h-4 bg-neutral-200 w-2/3" />
                                        <div className="h-3 bg-neutral-200 w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-neutral-100 rounded-xl">
                                <span className="text-xl font-extrabold uppercase tracking-tight block">
                                    {t("no_results_title")}
                                </span>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {hasFiltersActive ? t("no_results_filters_hint") : t("no_results_general_hint")}
                                </p>
                                {hasFiltersActive && (
                                    <button
                                        onClick={() => replace(pathname)}
                                        className="mt-6 text-sm font-bold underline underline-offset-4 cursor-pointer"
                                    >
                                        {t("clear_all_filters")}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {showPagination && (
                                    <div className="mt-16 mb-6 flex justify-center items-center border-t border-neutral-200 pt-10">
                                        <nav className="flex items-center gap-1">

                                            {/* Previous */}
                                            <button
                                                disabled={!hasPrev}
                                                onClick={() => handlePageChange(page - 1)}
                                                className="flex items-center gap-1.5 px-3 h-10 text-xs font-bold uppercase tracking-wider
                                                disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors cursor-pointer rounded-sm"
                                            >
                                                {isRTL ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                                                <span className="hidden sm:block">{t("previous")}</span>
                                            </button>

                                            {/* Page numbers */}
                                            <div className="flex items-center gap-1 mx-1">
                                                {paginationNumbers.map((item, idx) =>
                                                    item.num === "..." ? (
                                                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground text-sm select-none">
                                                            ···
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={item.num}
                                                            onClick={() => item.accessible ? handlePageChange(item.num) : undefined}
                                                            className={`w-10 h-10 flex items-center justify-center text-sm font-mono transition-all rounded-sm
                                                                ${page === item.num
                                                                    ? "bg-foreground text-background font-bold shadow-sm cursor-default"
                                                                    : item.accessible
                                                                        ? "text-foreground hover:bg-neutral-100 border border-transparent hover:border-neutral-200 cursor-pointer"
                                                                        : "text-neutral-300 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            {item.num}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            {/* Next */}
                                            <button
                                                disabled={!hasNext}
                                                onClick={() => handlePageChange(page + 1)}
                                                className="flex items-center gap-1.5 px-3 h-10 text-xs font-bold uppercase tracking-wider
                                                disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors cursor-pointer rounded-sm"
                                            >
                                                <span className="hidden sm:block">{t("next")}</span>
                                                {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            </button>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </ContentWrapper>
        </section>
    )
}
