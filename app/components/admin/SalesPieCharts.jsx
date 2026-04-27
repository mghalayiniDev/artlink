"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#f97316", "#8b5cf6", "#10b981", "#3b82f6", "#f59e0b"]

export default function SalesDonutChart({ data, formatValue, emptyLabel = "No data yet" }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-gray-300">
                {emptyLabel}
            </div>
        )
    }

    const total = data.reduce((s, d) => s + d.value, 0)

    return (
        <div>
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1200}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: "10px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                            fontSize: "12px",
                            padding: "8px 12px",
                        }}
                        formatter={(v, name) => [formatValue(v), name]}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 space-y-2 px-1">
                {data.map((item, i) => {
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                    return (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                                <span className="text-xs text-gray-600 truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                                <span className="text-xs font-semibold text-gray-900">{formatValue(item.value)}</span>
                                <span className="text-[0.65rem] text-gray-400 w-7 text-right">{pct}%</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
