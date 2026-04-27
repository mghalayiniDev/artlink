"use client"

import { useLocale, useTranslations } from "next-intl"
import ContentWrapper from "../ContentWrapper"
import Logo from "../Logo"
import Searchbar from "./Searchbar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown, Heart, Loader, Menu, Search, ShoppingBag, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useIsMidScreen } from "@/hooks/useIsMidScreen"
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react"
import { UserButton } from "@clerk/clerk-react"
import { usePathname } from "next/navigation"
import { api } from "@/convex/_generated/api"

export default function Navbar() {
    const t = useTranslations("header")
    const isMid = useIsMidScreen()
    const pathname = usePathname()
    const locale = useLocale()

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const currentUser = useQuery(api.users.getCurrentUser)
    const userLoading = currentUser === undefined
    const userError = currentUser === null
    const isAdmin = currentUser?.role === "admin"

    const categories = useQuery(api.categories.getAllCategories)
    const categoriesLoading = categories === undefined
    const categoriesError = categories === null

    const navLinks = [
        { label: t("home"),     href: "/"         },
        { label: t("shop"),     href: "/shop"     },
        { label: t("about_us"), href: "/about"    },
        { label: t("contact"),  href: "/contact"  },
        isAdmin && { label: t("admin"), href: "/admin" },
    ].filter(Boolean)

    const isActive = (href) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href)

    // Close everything on route change
    useEffect(() => {
        setIsMenuOpen(false)
        setIsCategoriesOpen(false)
        setIsSearchOpen(false)
    }, [pathname])

    // Close mobile menu when screen grows
    useEffect(() => {
        if (!isMid) setIsMenuOpen(false)
    }, [isMid])


    const cartCount  = currentUser?.cart?.length          ?? 0
    const wishCount  = currentUser?.likedProducts?.length ?? 0

    return (
        <>
            <Searchbar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <nav className="w-full bg-white border-b border-gray-200">
                <ContentWrapper className="h-[68px] flex items-center gap-4">

                    {/* ── Logo ── */}
                    <div className="flex-1">
                        <Logo variant="light" />
                    </div>

                    {/* ── Desktop nav (centred via flex-1 on both sides) ── */}
                    <div className="hidden lg:flex items-center">
                        {navLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.href}
                                className={`relative w-fit px-3 py-2 text-[0.78rem] font-semibold uppercase tracking-widest
                                rounded-lg transition-colors
                                ${isActive(link.href)
                                    ? "text-orange-500"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Categories */}
                        {!categoriesLoading && !categoriesError && categories?.length > 0 && (
                            <div
                                className="relative"
                                onMouseEnter={() => setIsCategoriesOpen(true)}
                                onMouseLeave={() => setIsCategoriesOpen(false)}
                            >
                                <button className={`flex items-center gap-1.5 px-3 py-2 text-[0.78rem] font-semibold
                                    uppercase tracking-widest rounded-lg transition-colors cursor-pointer
                                    ${isCategoriesOpen ? "text-orange-500" : "text-gray-700 hover:text-gray-900"}`}
                                    aria-expanded={isCategoriesOpen}
                                >
                                    {t("categories")}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200
                                        ${isCategoriesOpen ? "rotate-180 text-orange-500" : ""}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isCategoriesOpen && !isMid && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2
                                            bg-white rounded-2xl shadow-2xl shadow-black/10
                                            border border-gray-100 py-2 min-w-52 z-50"
                                        >
                                            {/* Arrow */}
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2
                                                w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

                                            {categories.map((category) => (
                                                <Link
                                                    key={category._id}
                                                    href={`/shop?category=${category._id}`}
                                                    className="flex items-center mx-1.5 px-3.5 py-2.5 rounded-xl
                                                    text-[0.82rem] font-medium text-gray-600
                                                    hover:text-orange-500 hover:bg-orange-50 transition-colors whitespace-nowrap"
                                                >
                                                    {category.name[locale] || category.name["en"]}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* ── Right actions ── */}
                    <div className="flex-1 flex items-center justify-end gap-0.5">

                        {/* Search icon */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl
                            text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Search"
                        >
                            <Search className="w-[18px] h-[18px]" />
                        </button>

                        <Unauthenticated>
                            <Link
                                href="/sign-in"
                                className={`ml-1 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white
                                text-[0.75rem] font-bold uppercase tracking-widest rounded-lg
                                transition-colors ${locale === "ar" ? "font-cairo" : ""}`}
                            >
                                {t("sign-in")}
                            </Link>
                        </Unauthenticated>

                        <Authenticated>
                            {(!userLoading && !userError && currentUser) && (
                                <>
                                    {/* Wishlist */}
                                    <Link
                                        href="/wishlist"
                                        className="relative w-9 h-9 flex items-center justify-center rounded-xl
                                        text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    >
                                        <Heart className="w-[18px] h-[18px]" />
                                        {wishCount > 0 && (
                                            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full
                                            bg-orange-500 text-white text-[8px] font-bold
                                            flex items-center justify-center leading-none">
                                                {wishCount > 9 ? "9+" : wishCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Cart */}
                                    <Link
                                        href="/cart"
                                        className="relative w-9 h-9 flex items-center justify-center rounded-xl
                                        text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    >
                                        <ShoppingBag className="w-[18px] h-[18px]" />
                                        {cartCount > 0 && (
                                            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full
                                            bg-orange-500 text-white text-[8px] font-bold
                                            flex items-center justify-center leading-none">
                                                {cartCount > 9 ? "9+" : cartCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}

                            <div className="ml-0.5">
                                <UserButton>
                                    <UserButton.MenuItems>
                                        <UserButton.Link
                                            label={t("myOrders")}
                                            labelIcon={<ShoppingBag size={15} />}
                                            href="/orders"
                                        />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        </Authenticated>

                        <AuthLoading>
                            <Loader className="animate-spin text-orange-400 ml-1" width={18} height={18} />
                        </AuthLoading>

                        {/* Mobile toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
                            text-gray-600 hover:bg-gray-100 transition-colors ml-1"
                            aria-label="Menu"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMenuOpen
                                    ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <X className="w-5 h-5" />
                                      </motion.span>
                                    : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <Menu className="w-5 h-5" />
                                      </motion.span>
                                }
                            </AnimatePresence>
                        </button>
                    </div>
                </ContentWrapper>

                {/* ── Mobile menu ── */}
                <AnimatePresence>
                    {isMid && isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="lg:hidden border-t border-gray-100 overflow-hidden bg-white"
                        >
                            <ContentWrapper className="py-4 space-y-0.5">
                                {navLinks.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                                        uppercase tracking-wider transition-colors
                                        ${isActive(link.href)
                                            ? "text-orange-500 bg-orange-50"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        {isActive(link.href) && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        )}
                                        {link.label}
                                    </Link>
                                ))}

                                {!categoriesLoading && !categoriesError && categories?.length > 0 && (
                                    <div className="pt-4 mt-2 border-t border-gray-100">
                                        <p className="px-4 mb-3 text-[0.68rem] font-bold uppercase tracking-widest text-gray-400">
                                            {t("categories")}
                                        </p>
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {categories.map((cat, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/shop?category=${cat._id}`}
                                                    className="px-3.5 py-2 text-[0.78rem] font-medium text-gray-600
                                                    border border-gray-200 rounded-xl hover:border-orange-300
                                                    hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                                >
                                                    {cat.name[locale] || cat.name["en"]}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="h-3" />
                            </ContentWrapper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    )
}
