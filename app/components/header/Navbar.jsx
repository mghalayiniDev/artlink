"use client"

import { useLocale, useTranslations } from "next-intl"
import ContentWrapper from "../ContentWrapper"
import Logo from "../Logo"
import Searchbar from "./Searchbar"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Heart, Loader, Menu, ShoppingBag, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useIsMidScreen } from "@/hooks/useIsMidScreen"
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react"
import { UserButton, useUser } from "@clerk/clerk-react"
import { usePathname } from "next/navigation"
import { api } from "@/convex/_generated/api"

export default function Navbar() {
    const t = useTranslations("header")
    const isMid = useIsMidScreen()
    const pathname = usePathname() 
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const categoriesRef = useRef(null)
    const locale = useLocale()
    const { user } = useUser()

    const currentUser = useQuery(api.users.getCurrentUser)
    const userLoading = currentUser === undefined
    const userError = currentUser === null

    const isAdmin = user?.publicMetadata?.role === "admin"

    const categories = useQuery(api.categories.getAllCategories)
    const categoriesLoading = categories === undefined
    const categoriesError = categories === null

    const navLinks = [
        { label: t("home"), href: "/" },
        { label: t("shop"), href: "/shop" },
        { label: t("about_us"), href: "/about" },
        isAdmin && { label: t("admin"), href: "/admin" }
    ].filter(Boolean)

    useEffect(() => {
        if (!isMid) {
            setIsMenuOpen(false)
        }
        const handleRouteChange = () => {
            setIsMenuOpen(false)
            setIsCategoriesOpen(false)
        }
        handleRouteChange()
    }, [pathname, isMid])

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 80) {
                        setIsCategoriesOpen(false)
                        if (isMenuOpen) setIsMenuOpen(false)
                    }
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [isMenuOpen])

    return (
        <nav 
            className={`w-full bg-white ${isMenuOpen ? "border-0" : "border-b"} border-gray-300 h-20`}
        >
            <ContentWrapper className="h-full flex items-center justify-between gap-4 md:gap-12">
                {/* Logo */}
                <div className="shrink-0">
                    <Logo 
                        color="black"
                    />
                </div>

                {/* Search */}
                <div className="hidden md:block w-full">
                    <Searchbar />
                </div>

                {/* Desktop Navigation */}
                <div className="flex items-center gap-4.25 shrink-0">
                    <div className="hidden lg:flex items-center gap-4">
                        {navLinks.map((link, idx) => (
                            <Link
                                href={link.href}
                                key={idx}
                                className="text-[0.8rem] xl:text-sm font-bold uppercase tracking-wide 
                                text-foreground hover:text-[#d7803a] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    {/* Categories Dropdown */}
                    {(!categoriesLoading && !categoriesError && (categories && categories.length > 0)) && (
                        <div
                            ref={categoriesRef}
                            className="relative flex items-center h-full"
                            onMouseEnter={() => setIsCategoriesOpen(true)}
                            onMouseLeave={() => setIsCategoriesOpen(false)}
                            onFocus={() => setIsCategoriesOpen(true)} 
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setIsCategoriesOpen(false)
                                }
                            }}
                        >
                            <button 
                                className="text-[0.8rem] xl:text-sm font-bold uppercase tracking-wide text-foreground 
                                transition-colors hover:text-[#d7803a] cursor-pointer items-center gap-1.25 hidden lg:flex"
                                aria-expanded={isCategoriesOpen}
                                aria-haspopup="true"
                            >
                                {t('categories')}
                                <ChevronDown className="w-3.75 h-3.75" />
                            </button>
                            
                            <AnimatePresence>
                                {(!isMid && isCategoriesOpen) && (
                                    <>
                                        <div className="absolute top-full right-0 z-0 w-full h-9" />
                                        <motion.div
                                            key="categories-dropdown"
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-9 right-0 bg-background border border-foreground z-50 min-w-50 max-h-50 overflow-y-auto"
                                        >
                                            {categories.map((category) => (
                                                <Link
                                                    key={category._id}
                                                    href={`/shop?category=${category._id}`}
                                                    className="block px-5 py-3 text-[0.8rem] font-bold uppercase text-foreground hover:bg-neutral-100 
                                                    hover:text-[#d7803a] transition-colors border-b border-foreground/10 last:border-0 font-mono whitespace-nowrap"
                                                >
                                                    {category.name[locale] || category.name["en"]}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Unauthenticated>
                            <Link
                                href="/sign-in"
                                className={`px-4 py-2 bg-orange-400 text-background text-[0.8rem] xl:text-sm font-bold 
                                uppercase  hover:bg-orange-400/85 transition-colors ${locale === "ar" ? "font-cairo" : "font-mono"}`}
                            >
                                {t("sign-in")}
                            </Link>
                        </Unauthenticated>
                        <Authenticated>
                            <UserButton />
                            {(!userLoading && !userError && currentUser) && (
                                <div className="flex items-center">
                                    <Link 
                                        href="/wishlist" 
                                        className="flex w-10 h-10 items-center justify-center rounded-lg text-muted-foreground 
                                        hover:text-foreground hover:bg-secondary transition-colors relative"
                                    >
                                        <Heart size={18} />
                                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-destructive 
                                        text-neutral-100 text-[8px] flex items-center justify-center font-bold">{currentUser?.likedProducts?.length}</span>
                                    </Link>
                                    <Link 
                                        href="/cart" 
                                        className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
                                    >
                                        <ShoppingBag size={18} />
                                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 
                                        text-accent-foreground text-[8px] flex items-center justify-center font-bold">{currentUser?.cart?.length}</span>
                                    </Link>
                                </div>
                            )}
                        </Authenticated>
                        <AuthLoading>
                            <Loader
                                className="animate-spin text-[#db8b4a]"
                                width={22}
                                height={22}
                            />
                        </AuthLoading>
                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden cursor-pointer"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </ContentWrapper>

            {/* Mobile Menu */}
            <AnimatePresence>
                {(isMid && isMenuOpen) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-background border-b border-gray-300 overflow-hidden relative z-20"
                    >
                        <ContentWrapper className="pt-6 md:pt-2 pb-4 flex flex-col gap-4">
                            {/* Mobile Search */}
                            <div className="md:hidden mb-2">
                                <Searchbar />
                            </div>

                            {/* Nav links */}
                            {navLinks.map((link, idx) => (
                                <Link
                                    href={link.href}
                                    key={idx}
                                    className="text-sm font-bold uppercase tracking-wide text-foreground pt-2 pb-3 border-b border-gray-300"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Categories */}
                            {(!categoriesLoading && !categoriesError && (categories && categories.length > 0)) && (
                                <div className="py-2">
                                    <span className="text-sm font-bold uppercase tracking-wide text-foreground">
                                        {t('categories')}
                                    </span>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {categories.map((category, idx) => (
                                            <Link
                                                key={idx}
                                                className="px-3 py-2 border border-foreground/20 text-[0.785rem] text-foreground bold
                                                hover:border-[#d7803a] hover:text-[#d7803a] transition-colors font-mono"
                                                href={`/shop?category=${category._id}`}
                                            >
                                                {category.name[locale] || category.name["en"]}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ContentWrapper>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}