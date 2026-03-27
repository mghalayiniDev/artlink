"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { DollarSign, LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import StatCard from "../components/admin/StatCard"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

export default function Admin() {
    const t = useTranslations("admin")
    const data = useQuery(api.admin.getDashboardData)
    const loading = data === undefined
    const error = data === null

    const statCard = loading ? [] : [
        {
            title: t("total_revenue"),
            value: `${data.stats.totalRevenue.toFixed(2)} ${t("aed")}`,
            Icon: DollarSign,
            iconColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
        },
        {
            title: t("total_users"),
            value: `${data.stats.totalUsers}`,
            Icon: Users,
            iconColor: 'bg-gradient-to-br from-violet-500 to-violet-600'
        },
        {
            title: t("totalProducts"),
            value: `${data.stats.totalProducts}`,
            Icon: Package,
            iconColor: 'bg-gradient-to-br from-amber-500 to-amber-600'
        },
        {
            title: t("totalOrders"),
            value: `${data.stats.totalOrders}`,
            Icon: ShoppingCart,
            iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600'
        }
    ]

    return (
        <>
            {/* Header */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-5">
                    <LayoutDashboard className="w-7 h-7 text-orange-500" />
                    <span className="text-3xl font-bold text-foreground block">{t('dashboard')}</span>
                </div>
                <p className="text-muted-foreground flex items-center gap-3">
                    {t("welcome")}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 my-8">
                {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div 
                            key={idx}
                            className="w-full h-28 bg-gray-100 rounded-md"
                        />
                    ))
                ) : (
                    statCard.map((stat, idx) => (
                        <StatCard 
                            key={idx}
                            title={stat.title}
                            value={stat.value}
                            Icon={stat.Icon}
                            iconColor={stat.iconColor}
                        />
                    ))
                )}
            </div>

            {/* Revenue Graph Section */}
            <div className="bg-card border rounded-xl p-6 md:p-8">
                <span className="text-lg font-bold mb-12 block">{t("revenue_overview")}</span>
                <div className="h-87.5 w-full">
                    {loading ?  (
                        <div className="w-full h-full bg-muted animate-pulse rounded-md flex items-end justify-between p-4 gap-2">
                            {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="bg-gray-200 w-full rounded-t" 
                                    style={{ 
                                        height: `${20 + (i % 3) * 20}%`,
                                        opacity: 0.5 + (i % 2) * 0.3 
                                    }} 
                                />
                            ))}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueHistory} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12}}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#f97316', strokeWidth: 2 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} ${t("aed")}`, t("total_revenue")]}
                                />
                                <Area
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#f97316" 
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </>
    )
}