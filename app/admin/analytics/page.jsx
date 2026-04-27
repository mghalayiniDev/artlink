"use client"

import { useEffect, useState } from "react"
import {
    ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell,
} from "recharts"
import {
    Activity, Clock, Globe, Laptop,
    Monitor, Smartphone, TrendingUp, Users, Eye, Wifi,
} from "lucide-react"

// ── Constants ─────────────────────────────────────────────────────────────────
const CHANNEL_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDuration = (s) => {
    if (!s || s === 0) return "0s"
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

const fmtNum = (n) => (n ?? 0).toLocaleString()

const fmtDate = (d) => {
    try {
        return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch { return d }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, gradient, loading }) {
    if (loading) return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <div className="h-3 w-20 bg-gray-100 rounded-full" />
                    <div className="h-7 w-28 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
            </div>
        </div>
    )
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    )
}

function Card({ title, description, icon: Icon, iconGradient, children, loading, rows = 5 }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconGradient}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
                </div>
            </div>
            {loading ? (
                <div className="p-5 space-y-3 animate-pulse">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <div className="h-3 bg-gray-100 rounded-full flex-1" />
                            <div className="h-3 w-12 bg-gray-100 rounded-full" />
                        </div>
                    ))}
                </div>
            ) : children}
        </div>
    )
}

function BarRow({ label, value, pct, max }) {
    const width = max > 0 ? Math.round((value / max) * 100) : 0
    return (
        <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-600 truncate min-w-0 flex-1">{label}</span>
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${width}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-900 w-12 text-right tabular-nums">{fmtNum(value)}</span>
                <span className="text-[0.65rem] text-gray-400 w-8 text-right tabular-nums">{pct}%</span>
            </div>
        </div>
    )
}

function DeviceIcon({ device }) {
    const d = (device || "").toLowerCase()
    if (d.includes("mobile"))  return <Smartphone className="w-3.5 h-3.5 text-gray-400" />
    if (d.includes("tablet"))  return <Monitor className="w-3.5 h-3.5 text-gray-400" />
    return <Laptop className="w-3.5 h-3.5 text-gray-400" />
}

function ChannelTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const p = payload[0]?.payload
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-gray-800">{p?.source}</p>
            <p className="text-gray-500 mt-0.5">{fmtNum(p?.visitors)} visitors · {p?.pct}%</p>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [days,    setDays]    = useState(30)
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch(`/api/analytics?days=${days}`)
            .then(r => {
                if (!r.ok) return r.json().then(e => { throw new Error(e.error || "Failed") })
                return r.json()
            })
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [days])

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

    const TH = "py-3 px-4 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
    const TD = "py-3 px-4 text-xs font-medium text-gray-700 whitespace-nowrap"

    const maxCountry = data ? Math.max(...(data.countries?.map(r => r.visitors) ?? [1])) : 1
    const maxBrowser = data ? Math.max(...(data.browsers?.map(r => r.visitors)  ?? [1])) : 1
    const maxOS      = data ? Math.max(...(data.os?.map(r => r.visitors)         ?? [1])) : 1
    const maxDevice  = data ? Math.max(...(data.devices?.map(r => r.visitors)    ?? [1])) : 1

    const tickInterval = Math.max(0, Math.ceil((data?.trend?.length ?? 7) / 8) - 1)

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-2xl font-bold text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-400 mt-1">{today}</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                days === d
                                    ? "bg-orange-500 text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            {d}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-sm text-rose-600 font-medium">
                    {error === "PostHog not configured"
                        ? "PostHog is not configured. Add POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY to your environment variables."
                        : `Failed to load analytics: ${error}`
                    }
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5 gap-4">
                <StatCard icon={Users}      label="Unique Visitors" value={loading ? "—" : fmtNum(data?.overview?.visitors)}          sub={`Last ${days} days`}                                    gradient="bg-gradient-to-br from-orange-400 to-orange-600"   loading={loading} />
                <StatCard icon={Eye}        label="Pageviews"        value={loading ? "—" : fmtNum(data?.overview?.pageviews)}         sub={`${loading ? "—" : fmtNum(data?.overview?.sessions)} sessions`} gradient="bg-gradient-to-br from-blue-400 to-blue-600"   loading={loading} />
                <StatCard icon={Activity}   label="Sessions"         value={loading ? "—" : fmtNum(data?.overview?.sessions)}          sub="Total visits"                                           gradient="bg-gradient-to-br from-violet-400 to-violet-600"   loading={loading} />
                <StatCard icon={Clock}      label="Avg. Duration"    value={loading ? "—" : fmtDuration(data?.overview?.avg_duration)} sub="Per session"                                            gradient="bg-gradient-to-br from-emerald-400 to-emerald-600" loading={loading} />
                <StatCard icon={TrendingUp} label="Bounce Rate"      value={loading ? "—" : `${data?.overview?.bounce_rate ?? 0}%`}    sub="Single-page sessions"                                   gradient="bg-gradient-to-br from-amber-400 to-amber-600"     loading={loading} />
            </div>

            {/* Trend chart + Traffic Channels donut */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">

                {/* Trend chart */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Visitors &amp; Pageviews</p>
                            <p className="text-xs text-gray-400 mt-0.5">Daily trend — last {days} days</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="h-64">
                            {loading ? (
                                <div className="w-full h-full flex items-end gap-1.5 pb-1 animate-pulse">
                                    {Array.from({ length: Math.min(days, 20) }).map((_, i) => (
                                        <div key={i} className="flex-1 bg-gray-100 rounded-t-md" style={{ height: `${25 + (i % 5) * 12}%` }} />
                                    ))}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data?.trend ?? []} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                                            dy={10}
                                            tickFormatter={fmtDate}
                                            interval={tickInterval}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px" }}
                                            labelFormatter={fmtDate}
                                        />
                                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                                        <Bar dataKey="pageviews" fill="#bfdbfe" radius={[3, 3, 0, 0]} maxBarSize={28} animationDuration={800} />
                                        <Line type="monotone" dataKey="visitors" stroke="#f97316" strokeWidth={2.5} dot={false} animationDuration={1000} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Traffic Channels donut */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                            <Wifi className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Traffic Channels</p>
                            <p className="text-xs text-gray-400 mt-0.5">Where visitors come from</p>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col items-center gap-5">
                        <div className="w-44 h-44 shrink-0">
                            {loading ? (
                                <div className="w-full h-full rounded-full bg-gray-100 animate-pulse" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.referrers ?? []}
                                            dataKey="visitors"
                                            nameKey="source"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="52%"
                                            outerRadius="78%"
                                            paddingAngle={3}
                                            animationDuration={800}
                                        >
                                            {(data?.referrers ?? []).map((_, i) => (
                                                <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChannelTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="w-full space-y-2.5">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-4 bg-gray-100 rounded-full animate-pulse" />
                                ))
                            ) : (data?.referrers?.length
                                ? data.referrers.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                                        <span className="text-xs text-gray-600 flex-1 truncate">{r.source}</span>
                                        <span className="text-xs font-semibold text-gray-900 tabular-nums">{fmtNum(r.visitors)}</span>
                                        <span className="text-[0.65rem] text-gray-400 w-7 text-right">{r.pct}%</span>
                                    </div>
                                ))
                                : <p className="text-center text-sm text-gray-300 py-4">No data yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Pages + Traffic Sources */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                <Card title="Top Pages" description="Most visited pages" icon={Eye} iconGradient="bg-gradient-to-br from-blue-400 to-blue-600" loading={loading} rows={8}>
                    <div className="px-5 py-3">
                    <div className="overflow-auto max-h-72 admin-scroll rounded-xl border border-gray-100">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className={TH}>Page</th>
                                    <th className={TH}>Views</th>
                                    <th className={TH}>Visitors</th>
                                    <th className={TH}>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.topPages?.length ? data.topPages.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className={`${TD} max-w-[180px]`}>
                                            <span className="truncate block text-gray-600">{r.page || "/"}</span>
                                        </td>
                                        <td className={TD}>{fmtNum(r.views)}</td>
                                        <td className={TD}>{fmtNum(r.visitors)}</td>
                                        <td className={TD}>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                {r.pct}%
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-300">No data yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </div>
                </Card>

                <Card title="Traffic Sources" description="Referral breakdown" icon={Globe} iconGradient="bg-gradient-to-br from-emerald-400 to-emerald-600" loading={loading} rows={8}>
                    <div className="px-5 py-3">
                    <div className="overflow-auto max-h-72 admin-scroll rounded-xl border border-gray-100">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className={TH}>Source</th>
                                    <th className={TH}>Visits</th>
                                    <th className={TH}>Visitors</th>
                                    <th className={TH}>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.referrers?.length ? data.referrers.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className={`${TD} font-semibold text-gray-800`}>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                                                {r.source}
                                            </div>
                                        </td>
                                        <td className={TD}>{fmtNum(r.visits)}</td>
                                        <td className={TD}>{fmtNum(r.visitors)}</td>
                                        <td className={TD}>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                {r.pct}%
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-300">No data yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </div>
                </Card>
            </div>

            {/* Countries + Devices / Browsers / OS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                <Card title="Countries" description="Visitor geography" icon={Globe} iconGradient="bg-gradient-to-br from-violet-400 to-violet-600" loading={loading}>
                    <div className="px-5 py-3 divide-y divide-gray-50 max-h-72 overflow-y-auto admin-scroll">
                        {data?.countries?.length ? data.countries.map((r, i) => (
                            <BarRow key={i} label={r.country} value={r.visitors} pct={r.pct} max={maxCountry} />
                        )) : <p className="py-10 text-center text-sm text-gray-300">No data yet</p>}
                    </div>
                </Card>

                <div className="flex flex-col gap-4">

                    <Card title="Devices" description="Desktop · Mobile · Tablet" icon={Monitor} iconGradient="bg-gradient-to-br from-amber-400 to-amber-600" loading={loading} rows={3}>
                        <div className="px-5 py-3 divide-y divide-gray-50">
                            {data?.devices?.length ? data.devices.map((r, i) => (
                                <div key={i} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                                    <DeviceIcon device={r.device} />
                                    <span className="text-xs text-gray-600 flex-1 truncate">{r.device}</span>
                                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${maxDevice > 0 ? Math.round(r.visitors / maxDevice * 100) : 0}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-900 tabular-nums w-10 text-right">{fmtNum(r.visitors)}</span>
                                    <span className="text-[0.65rem] text-gray-400 w-7 text-right">{r.pct}%</span>
                                </div>
                            )) : <p className="py-6 text-center text-sm text-gray-300">No data yet</p>}
                        </div>
                    </Card>

                    <Card title="Browsers & OS" description="Browser and operating system breakdown" icon={Laptop} iconGradient="bg-gradient-to-br from-slate-400 to-slate-600" loading={loading} rows={5}>
                        <div className="grid grid-cols-2 divide-x divide-gray-50">
                            <div className="px-4 py-3">
                                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 pb-2">Browser</p>
                                <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto admin-scroll">
                                    {data?.browsers?.length ? data.browsers.map((r, i) => (
                                        <BarRow key={i} label={r.browser} value={r.visitors} pct={r.pct} max={maxBrowser} />
                                    )) : <p className="py-4 text-center text-sm text-gray-300">—</p>}
                                </div>
                            </div>
                            <div className="px-4 py-3">
                                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 pb-2">OS</p>
                                <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto admin-scroll">
                                    {data?.os?.length ? data.os.map((r, i) => (
                                        <BarRow key={i} label={r.os} value={r.visitors} pct={r.pct} max={maxOS} />
                                    )) : <p className="py-4 text-center text-sm text-gray-300">—</p>}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    )
}
