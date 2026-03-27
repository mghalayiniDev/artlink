"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import FilterSection from "@/app/components/shop/FilterSection"
import { Loader, GlobeLock, X, Filter } from "lucide-react"
import { PRODUCT_FILTERS } from "@/constants"
import ProductCard from "@/app/components/ProductCard"
import { useState } from "react"

export default function Shop() {
    const t = useTranslations("shop")
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const categoryId = searchParams.get("category") || undefined
    const materialEn = searchParams.get("material") || undefined
    const colorEn = searchParams.get("color") || undefined
    const pageSize = 9

    const locale = useLocale()
    const [openSection, setOpenSection] = useState(undefined)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const products = useQuery(api.products.getFilteredProducts, {
        page,
        pageSize,
        categoryId,
        materialEn,
        colorEn,
    })
    const productsLoading = products === undefined
    const productsError = products === null

    const categories = useQuery(api.categories.getAllCategories)
    const categoriesLoading = categories === undefined
    const categoriesError = categories === null

    const hasFiltersActive = categoryId || materialEn || colorEn

    const handlePageChange = (newPage) => {
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

    const generatePagination = (currentPage, totalPages) => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages]
        }

        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
    }

    return (
        <section className="min-h-screen">
            {/* Header */}
            <header className="bg-neutral-100 py-12 md:py-14 border-b border-gray-300">
                <ContentWrapper>
                    <div className="flex items-center gap-3 text-[0.8rem] text-muted-foreground mb-5">
                        <Link href="/" className="hover:text-foreground transition-colors">
                            {t("home")}
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{t('shop')}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <span className="block font-extrabold uppercase text-3xl md:text-5xl text-foreground tracking-tight">
                                {t('title')}
                            </span>
                            <p className="text-muted-foreground text-sm mt-2 max-w-md">
                                {t('subtitle')}
                            </p>
                        </div>
                        {(!productsLoading && !productsError) && (
                            <p className="text-sm text-muted-foreground font-mono">
                                <span className="text-black font-bold">{products.products.length}</span> {t("products")}
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
                        onClick={() => {
                            setIsFilterOpen((prev) => !prev)
                        }}    
                    >
                        <Filter className="w-4 h-4" />
                        {t('filters')}
                    </button>
                    {/* Active filter pills */}
                    {hasFiltersActive && (
                        <div className="max-w-xl flex flex-wrap gap-3 items-center">
                            {categoryId && (
                                <button
                                    onClick={() => updateFilter("category", undefined)}
                                    className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[10px] cursor-pointer 
                                    font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors whitespace-nowrap"
                                >
                                    {
                                        (categories?.find((cat) => cat._id === categoryId)?.name[locale] || 
                                        categories?.find((cat) => cat._id === categoryId)?.name["en"]) || 
                                        t('category')
                                    }
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
                                    className="flex items-center gap-2.25 bg-foreground text-background px-3 py-1.5 text-[10px] cursor-pointer 
                                    font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors whitespace-nowrap"
                                >
                                    <div className="w-2 h-2 border" style={{ background: colorEn }} />
                                    {colorEn}
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                            <button
                                className="text-[10px] cursor-pointer font-bold uppercase tracking-wider whitespace-nowrap text-orange-500"
                                onClick={() => replace(pathname)}
                            >
                                {t("clear_all_filters")}
                            </button>
                        </div>
                    )}
                </div>       

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12 xl:gap-14 lg:py-2">
                    {/* Sidebar Filters (Desktop) */}
                    <aside className={`lg:col-span-1 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-10 space-y-0">
                            {/* Categories */}
                            <FilterSection 
                                title={t('category')} 
                                isOpen={openSection === 'category'} 
                                onToggle={() => setOpenSection(openSection === 'category' ? undefined : 'category')}
                            >
                                {categoriesLoading ? (
                                    <div className="w-full h-6 flex items-center justify-center">
                                        <Loader width={20} height={20} className="animate-spin" />
                                    </div>
                                ) : (
                                    (categoriesError || categories.length === 0) ? (
                                        <div className="w-full h-6 flex items-center justify-center">
                                            <GlobeLock width={20} height={20} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1.25 -mt-1 max-h-60 overflow-y-auto">
                                            {categories.map((cat, idx) => (
                                                <label 
                                                    key={cat._id} 
                                                    className="flex items-center gap-3.5 cursor-pointer group hover:bg-neutral-100 px-1 py-1"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="category-group"
                                                        value={cat._id}
                                                        checked={categoryId === cat._id}
                                                        onClick={() => {
                                                            if (categoryId === cat._id) {
                                                                updateFilter("category", undefined)
                                                            } else {
                                                                updateFilter("category", cat._id)
                                                            }
                                                        }}
                                                        onChange={() => {}}
                                                        className="w-3.25 h-3.25 accent-black cursor-pointer"
                                                    />
                                                    <span 
                                                        className={`text-[0.8rem] transition-colors ${
                                                            categoryId === cat._id 
                                                            ? "font-semibold text-foreground" 
                                                            : "text-muted-foreground group-hover:text-foreground"
                                                        }`}
                                                    >
                                                        {cat.name[locale] || cat.name['en']}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )
                                )}
                            </FilterSection>

                            {/* Materials  */}
                            <FilterSection 
                                title={t('material')} 
                                isOpen={openSection === 'material'} 
                                onToggle={() => setOpenSection(openSection === 'material' ? undefined : 'material')}
                            >
                                <div className="flex flex-col gap-1.25 -mt-1 max-h-60 overflow-y-auto">
                                    {PRODUCT_FILTERS.materials.map((material) => (
                                        <label 
                                            key={material.id} 
                                            className="flex items-center gap-3.5 cursor-pointer group hover:bg-neutral-100 px-1 py-1"
                                        >
                                            <input
                                                type="radio"
                                                name="material-group"
                                                value={material.id}
                                                checked={materialEn === material.en}
                                                onClick={() => {
                                                    if (materialEn === material.en) {
                                                        updateFilter("material", undefined)
                                                    } else {
                                                        updateFilter("material", material.en)
                                                    }
                                                }}
                                                onChange={() => {}}
                                                className="w-3.25 h-3.25 accent-black cursor-pointer"
                                            />
                                            <span 
                                                className={`text-[0.8rem] transition-colors ${
                                                    materialEn === material.en
                                                    ? "font-semibold text-foreground" 
                                                    : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                            >
                                                {locale === "ar" ? material.ar : material.en}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Color  */}
                            <FilterSection 
                                title={t('color')} 
                                isOpen={openSection === 'color'} 
                                onToggle={() => setOpenSection(openSection === 'color' ? undefined : 'color')}
                            >
                                <div className="flex flex-col gap-1.25 -mt-1 max-h-60 overflow-y-auto">
                                    {PRODUCT_FILTERS.colors.map((color) => (
                                        <label 
                                            key={color.en} 
                                            className="flex items-center gap-3.5 cursor-pointer group hover:bg-neutral-100 px-1 py-1"
                                        >
                                            <input
                                                type="radio"
                                                name="color-group"
                                                value={color.en}
                                                checked={colorEn === color.en}
                                                onClick={() => {
                                                    if (colorEn === color.en) {
                                                        updateFilter("color", undefined)
                                                    } else {
                                                        updateFilter("color", color.en)
                                                    }
                                                }}
                                                onChange={() => {}}
                                                className="w-3.25 h-3.25 accent-black cursor-pointer"
                                            />
                                            <div 
                                                className="w-3.5 h-3.5 border"
                                                style={{ backgroundColor: color.code }}
                                            />
                                            <span 
                                                className={`text-[0.8rem] transition-colors ${
                                                    colorEn === color.en
                                                    ? "font-semibold text-foreground" 
                                                    : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                            >
                                                {locale === "ar" ? color.ar : color.en}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>
                        </div>
                    </aside>

                    {/* Products */}
                    <div className="w-full lg:col-span-3">
                        {/* 1. LOADING STATE */}
                        {productsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="space-y-4 animate-pulse">
                                        <div className="aspect-4/5 bg-neutral-200 rounded-sm" />
                                        <div className="h-4 bg-neutral-200 w-2/3" />
                                        <div className="h-3 bg-neutral-200 w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : productsError ? (
                            /* 2. ERROR STATE */
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <GlobeLock className="w-12 h-12 text-neutral-300 mb-4" />
                                <span className="text-lg font-bold block">{t('error_title')}</span>
                                <p className="text-muted-foreground">{t('error_subtitle')}</p>
                            </div>
                        ) : products.products.length === 0 ? (
                            /* 3. EMPTY STATE (No products) */
                            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-neutral-100 rounded-xl">
                                <span className="text-xl font-extrabold uppercase tracking-tight block">
                                    {t('no_results_title')}
                                </span>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {hasFiltersActive ? t('no_results_filters_hint') : t('no_results_general_hint')}
                                </p>
                                {hasFiltersActive && (
                                    <button 
                                        onClick={() => replace(pathname)}
                                        className="mt-6 text-sm font-bold underline underline-offset-4 cursor-pointer"
                                    >
                                        {t('clear_all_filters')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* 4. SUCCESS STATE (Grid + Pagination) */
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                                    {products.products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {products.totalPages > 1 && (
                                    <div className="mt-16 mb-6 flex justify-center items-center border-t border-neutral-200 pt-10">
                                        <nav className="flex items-center gap-1 sm:gap-2">
                                            
                                            {/* Previous Button */}
                                            <button
                                                disabled={page === 1}
                                                onClick={() => handlePageChange(page - 1)}
                                                className="hidden md:block px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold border border-transparent disabled:opacity-30 
                                                disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors uppercase tracking-wider cursor-pointer"
                                            >
                                                {t('previous')}
                                            </button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {generatePagination(page, products.totalPages).map((pageNumber, index) => {
                                                    // Render Ellipsis
                                                    if (pageNumber === '...') {
                                                        return (
                                                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground font-mono">
                                                                ...
                                                            </span>
                                                        );
                                                    }

                                                    // Render Numbered Buttons
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => handlePageChange(pageNumber)}
                                                            className={`w-10 h-10 flex items-center justify-center text-sm font-mono transition-colors cursor-pointer ${
                                                                page === pageNumber
                                                                    ? "bg-black text-white font-bold" // Active state
                                                                    : "bg-transparent text-foreground hover:bg-neutral-100 border border-transparent hover:border-neutral-200" // Inactive state
                                                            }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Next Button */}
                                            <button
                                                disabled={page === products.totalPages}
                                                onClick={() => handlePageChange(page + 1)}
                                                className="hidden md:block px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold border border-transparent cursor-pointer
                                                disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors uppercase tracking-wider"
                                            >
                                                {t('next')}
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