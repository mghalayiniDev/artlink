"use client"

import { BarChart2, Bell, ChevronLeft, ChevronRight, FolderTree, LayoutDashboard, Mail, Package, ShoppingCart, Tag, Users, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import Logo from "../Logo"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Languagedropdown from "../header/LanguageDropdown"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"

function NavLink({ item, isCollapsed, pathname }) {
    const isActive = pathname === item.path ||
        (item.path !== "/admin" && pathname.startsWith(item.path))

    return (
        <Link
            href={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center rounded-xl transition-all duration-150 group
            ${isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"}
            ${isActive
                ? "bg-orange-500/75 text-white shadow-sm shadow-orange-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
        >
            <item.icon className={`shrink-0 w-[17px] h-[17px] transition-colors
                ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
            />
            {!isCollapsed && (
                <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>
                    {item.label}
                </span>
            )}
        </Link>
    )
}

export default function AdminSidebar({ mobileOpen, onMobileClose }) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const t = useTranslations("admin")

    useEffect(() => {
        onMobileClose?.()
    }, [pathname])

    const navItems = [
        { path: "/admin",               icon: LayoutDashboard, label: t("dashboard")     },
        { path: "/admin/users",         icon: Users,           label: t("users")         },
        { path: "/admin/categories",    icon: FolderTree,      label: t("categories")    },
        { path: "/admin/products",      icon: Package,         label: t("products")      },
        { path: "/admin/orders",        icon: ShoppingCart,    label: t("orders")        },
        { path: "/admin/notifications", icon: Bell,            label: t("notifications") },
        { path: "/admin/newsletter",    icon: Mail,            label: t("newsletter")    },
        { path: "/admin/discounts",     icon: Tag,             label: "Discounts"        },
        { path: "/admin/analytics",    icon: BarChart2,       label: t("analytics")     },
    ]

    return (
        <>
            {/* ── Desktop sidebar (≥ lg) ── */}
            <aside
                dir="ltr"
                className={`hidden lg:flex h-screen sticky top-0 flex-col bg-white border-r border-gray-100
                transition-all duration-300 ease-in-out shrink-0
                ${collapsed ? "w-[68px]" : "w-[240px] xl:w-[256px]"}`}
            >
                {/* Logo row */}
                <div className={`h-[60px] flex items-center border-b border-gray-100 shrink-0
                    ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}
                >
                    {collapsed ? (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="flex flex-col items-center justify-center gap-0.5 w-full h-full cursor-pointer group"
                            title="Expand sidebar"
                        >
                            <Image src="/brand.ico" alt="Artlink" width={26} height={26} className="rounded-md" />
                            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>
                    ) : (
                        <>
                            <Logo variant="light" />
                            <button
                                onClick={() => setCollapsed(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                                hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                                title="Collapse"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Section label */}
                {!collapsed && (
                    <div className="px-4 pt-5 pb-2">
                        <span className="text-[0.65rem] font-semibold tracking-wider text-gray-400 uppercase">Navigation</span>
                    </div>
                )}

                {/* Nav */}
                <nav className={`flex-1 overflow-y-auto space-y-0.5 ${collapsed ? "px-2 py-4" : "px-3 py-2"}`}>
                    {navItems.map((item, idx) => (
                        <NavLink key={idx} item={item} isCollapsed={collapsed} pathname={pathname} />
                    ))}
                </nav>

                {/* Footer */}
                <div className={`border-t border-gray-100 shrink-0 ${collapsed ? "p-3 flex justify-center" : "p-4 flex items-center gap-3"}`}>
                    <UserButton />
                    {!collapsed && <Languagedropdown color="black" />}
                </div>
            </aside>

            {/* ── Tablet icon-only sidebar (md–lg) ── */}
            <aside
                dir="ltr"
                className="hidden md:flex lg:hidden h-screen sticky top-0 w-[68px] shrink-0
                flex-col bg-white border-r border-gray-100"
            >
                <div className="h-[60px] flex items-center justify-center border-b border-gray-100 shrink-0">
                    <Image src="/brand.ico" alt="Artlink" width={28} height={28} className="rounded-md" />
                </div>
                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map((item, idx) => (
                        <NavLink key={idx} item={item} isCollapsed={true} pathname={pathname} />
                    ))}
                </nav>
                <div className="border-t border-gray-100 p-3 flex justify-center shrink-0">
                    <UserButton />
                </div>
            </aside>

            {/* ── Mobile drawer (< md) ── */}
            {/* Backdrop */}
            <div
                onClick={onMobileClose}
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden
                ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            {/* Drawer panel */}
            <aside
                dir="ltr"
                className={`fixed top-0 left-0 z-50 h-full w-72 bg-white flex flex-col shadow-2xl
                transition-transform duration-300 ease-in-out md:hidden
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Header */}
                <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
                    <Logo variant="light" />
                    <button
                        onClick={onMobileClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200
                        text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Section label */}
                <div className="px-4 pt-5 pb-2">
                    <span className="text-[0.65rem] font-semibold tracking-wider text-gray-400 uppercase">Navigation</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                    {navItems.map((item, idx) => (
                        <NavLink key={idx} item={item} isCollapsed={false} pathname={pathname} />
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 flex items-center gap-3 shrink-0">
                    <UserButton />
                    <Languagedropdown color="black" />
                </div>
            </aside>
        </>
    )
}
