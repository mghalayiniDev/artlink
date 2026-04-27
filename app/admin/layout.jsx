"use client"

import { useState } from "react"
import AdminSidebar from "../components/admin/AdminSidebar"
import Logo from "../components/Logo"
import { Menu } from "lucide-react"

export default function AdminLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen flex w-full bg-slate-50/60">
            <AdminSidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile topbar */}
                <header className="md:hidden h-14 flex items-center gap-3 px-4 bg-white border-b border-gray-100 sticky top-0 z-30 shrink-0">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200
                        text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Open menu"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                    <Logo variant="light" />
                </header>

                <main className="flex-1 overflow-auto p-5 md:p-8 xl:p-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
