"use client"

import { useLocale, useTranslations } from "next-intl"
import ContentWrapper from "../ContentWrapper"
import Logo from "../Logo"
import Link from "next/link"
import { ChevronDown, Menu, Phone, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import Searchbar from "./Searchbar"
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen"
import Languagedropdown from "./LanguageDropdown"
import Sidebar from "./Sidebar"

export default function MainHeader({ isScrolled }) {
    const t = useTranslations("header")
    const [searchbarActive, setSearchbarActive] = useState(false)
    const [mobileMenuActive, setMobileMenuActive] = useState(false)
    const isSmallScreen = useIsSmallScreen()
    const locale = useLocale()
    const searchbarRef = useRef()

    const navLinks = [
        { label: t("home"), href: "/" },
        { label: t("shop"), href: "/shop" },
        { label: t("about_us"), href: "/about" }
    ]

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                searchbarRef.current &&
                !searchbarRef.current.contains(event.target)
            ) {
                setSearchbarActive(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (!isSmallScreen) {
            setMobileMenuActive(false)
        }
    }, [isSmallScreen])

    return (
        <>
            <div
                className={
                    `transition-all duration-500 ${
                        isScrolled
                        ? "bg-white shadow-md py-3"
                        : "bg-linear-to-b from-[#1a1a1a]/80 to-transparent py-4"
                    }`
                }
            >
                <ContentWrapper>
                    <nav className="flex items-center justify-between md:gap-14">
                        {/* Logo */}
                        <div className="shrink-0">
                            <Logo />
                        </div>
                        {/* Nav items */}
                        {(searchbarActive && !isSmallScreen) ? (
                            <Searchbar
                                ref={searchbarRef}
                            />
                        ) : (
                            <div className="hidden md:flex items-center gap-7.5 lg:gap-9 mx-auto">
                                {navLinks.map((link, idx) => (
                                    <Link
                                        href={link.href}
                                        className="text-[0.85rem] lg:text-[0.925rem] text-white"
                                        key={idx}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <span
                                    className="text-[0.85rem] lg:text-[0.925rem] text-white flex items-center gap-3 cursor-pointer"
                                >
                                    {t("categories")}
                                    <ChevronDown 
                                        width={14}
                                        height={14}
                                    />
                                </span>
                            </div>
                        )}
                        {/* Menu items */}
                        <div className="flex items-center gap-5 md:gap-6.5 lg:gap-8.5 shrink-0">
                            <button 
                                className="text-white cursor-pointer md:hidden"
                                onClick={() => setMobileMenuActive(prev => !prev)}
                            >
                                <Menu
                                    width={18}
                                    height={18}
                                />
                            </button>
                            <button 
                                className="text-white cursor-pointer hidden md:block"
                                onClick={() => setSearchbarActive(prev => !prev)}    
                            >
                                {searchbarActive ? (
                                    <X 
                                        width={18}
                                        height={18}
                                    />
                                ) : (
                                    <Search 
                                        width={18}
                                        height={18}
                                    />
                                )}
                            </button>
                            <Link
                                href="/sign-in"
                                className="px-6 lg:px-7 py-2.25 bg-linear-to-r from-[#e88839] 
                                    to-[#bc753b] rounded-3xl text-neutral-50 font-medium text-[0.85rem]
                                    hover:bg-linear-to-tr
                                    "
                            >
                                {t("sign-in")}
                            </Link>
                        </div>
                    </nav>
                </ContentWrapper>
            </div>
            {/* Sidebar */}
            {(isSmallScreen && mobileMenuActive) && (
                <Sidebar 
                    mobileMenuActive={mobileMenuActive}
                    setMobileMenuActive={setMobileMenuActive}
                    navLinks={navLinks}
                />
            )}
        </>
    )
}