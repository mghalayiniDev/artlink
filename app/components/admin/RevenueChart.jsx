"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function RevenueChart({ data, aedLabel, revenueLabel }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                <Tooltip
                    cursor={{ stroke: "#F97316", strokeWidth: 2 }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    formatter={(v) => [`${v} ${aedLabel}`, revenueLabel]}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F97316"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={3}
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
