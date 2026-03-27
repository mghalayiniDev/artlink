"use client"

import { Bell, ChevronRight, FolderTree, LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import Logo from "../Logo"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useIsMidScreen } from "@/hooks/useIsMidScreen"
import Languagedropdown from "../header/LanguageDropdown"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"

export default function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const t = useTranslations("admin")
    const isMid = useIsMidScreen()
    const locale = useLocale()

    const navItems = [
        {
            path: '/admin',
            icon: LayoutDashboard,
            label: t("dashboard")
        },
        {
            path: '/admin/users',
            icon: Users,
            label: t("users")
        },
        {
            path: '/admin/categories',
            icon: FolderTree,
            label: t("categories")
        },
        {
            path: '/admin/products',
            icon: Package,
            label: t("products")
        },
        {
            path: '/admin/orders',
            icon: ShoppingCart,
            label: t("orders")
        },
        {
            path: '/admin/notifications',
            icon: Bell,
            label: t("notifications")
        },
    ]

    return (
        <aside
            className={`h-screen bg-white sticky top-0 flex flex-col transition-all
            duration-300 ease-in-out border-r ${(collapsed || isMid) ? "w-17 lg:w-18" : "w-62 xl:w-70"}`}
            dir="ltr"
        >
            {/* Logo */}
            <div className="h-16 flex items-center border-b px-4 gap-3 justify-between overflow-hidden">
                {isMid ? (
                    <Image 
                        src={"/brand.ico"}
                        alt="Artlink"
                        width={36}
                        height={36}
                    />
                ) : (
                    !collapsed &&
                        <Logo color="black" />
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors cursor-pointer hidden lg:block"
                >
                    <ChevronRight className={`w-5 h-5 ${locale === "ar" ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item, idx) => {
                    const isActive = pathname === item.path
                    return (
                        <Link
                            key={idx}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-20
                            ${(collapsed || isMid) ? "justify-center" : ""} 
                            ${isActive ? "bg-orange-500/20" : "hover:bg-orange-500/20"}`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {(!collapsed && !isMid) && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Language Switcher */}
            <div className={`py-4.5 border-t px-5 lg:px-6 flex items-center gap-6`}>
                <UserButton />
                <div className={`w-fit ${collapsed ? "hidden" : "hidden lg:block"}`}>
                    <Languagedropdown color="black" />
                </div>
            </div>
        </aside>
    )
}