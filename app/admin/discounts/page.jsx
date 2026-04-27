"use client"

import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useMutation, usePaginatedQuery } from "convex/react"
import {
    Check, Copy, Loader2, Percent, Plus,
    Tag, Trash2, X, ToggleLeft, ToggleRight, Calendar
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700 whitespace-nowrap"

const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function FieldError({ msg }) {
    if (!msg) return null
    return <p className="text-rose-500 text-xs mt-1">{msg}</p>
}

function CreateForm({ onClose }) {
    const createCode = useMutation(api.discounts.createDiscountCode)

    const [code,           setCode]           = useState("")
    const [description,    setDescription]    = useState("")
    const [type,           setType]           = useState("percentage")
    const [value,          setValue]          = useState("")
    const [maxUses,        setMaxUses]        = useState("")
    const [maxUsesPerUser, setMaxUsesPerUser] = useState("")
    const [minOrderAmount, setMinOrderAmount] = useState("")
    const [expiresAt,      setExpiresAt]      = useState("")
    const [loading,        setLoading]        = useState(false)
    const [errors,         setErrors]         = useState({})

    const minExpiry = new Date(Date.now() + 60_000).toISOString().slice(0, 16)

    const validate = () => {
        const e = {}
        const normalized = code.toUpperCase().replace(/[^A-Z0-9-]/g, "")
        if (!normalized || normalized.length < 3 || normalized.length > 30)
            e.code = "3–30 alphanumeric characters (hyphens allowed)"
        if (!description.trim()) e.description = "Description is required"
        const v = parseFloat(value)
        if (isNaN(v) || v <= 0) e.value = type === "percentage" ? "Must be 1–100" : "Must be greater than 0"
        if (type === "percentage" && v > 100) e.value = "Must be 1–100"
        if (maxUses && (!Number.isInteger(Number(maxUses)) || Number(maxUses) < 1))
            e.maxUses = "Must be a positive whole number"
        if (maxUsesPerUser && (!Number.isInteger(Number(maxUsesPerUser)) || Number(maxUsesPerUser) < 1))
            e.maxUsesPerUser = "Must be a positive whole number"
        if (minOrderAmount && (isNaN(parseFloat(minOrderAmount)) || parseFloat(minOrderAmount) < 0))
            e.minOrderAmount = "Must be 0 or greater"
        if (expiresAt && new Date(expiresAt).getTime() < Date.now())
            e.expiresAt = "Must be in the future"
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setLoading(true)
        try {
            const res = await createCode({
                code:           code.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
                description:    description.trim(),
                type,
                value:          parseFloat(value),
                maxUses:        maxUses        ? parseInt(maxUses)        : undefined,
                maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : undefined,
                minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
                expiresAt:      expiresAt      ? new Date(expiresAt).getTime() : undefined,
            })
            if (res.success) {
                toast.success(`Code "${res.code}" created`)
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch { toast.error("An unexpected error occurred") }
        finally { setLoading(false) }
    }

    const inputCls = (field) =>
        `h-10 bg-gray-50 border-gray-200 text-sm focus-visible:ring-orange-200 focus:border-orange-400 ${
            errors[field] ? "border-rose-400 focus-visible:ring-rose-200" : ""
        }`

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">New Discount Code</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Code */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Code</label>
                        <Input
                            placeholder="e.g. SUMMER20"
                            value={code}
                            onChange={e => { setCode(e.target.value.toUpperCase()); setErrors(p => ({ ...p, code: undefined })) }}
                            disabled={loading}
                            maxLength={30}
                            className={`${inputCls("code")} font-mono uppercase`}
                        />
                        <FieldError msg={errors.code} />
                        <p className="text-[0.65rem] text-gray-400">Alphanumeric + hyphens only. Users will type this exactly.</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <Input
                            placeholder="e.g. Summer sale 20% off"
                            value={description}
                            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: undefined })) }}
                            disabled={loading}
                            className={inputCls("description")}
                        />
                        <FieldError msg={errors.description} />
                    </div>
                </div>

                {/* Type + Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Discount Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { val: "percentage", label: "Percentage (%)", icon: Percent },
                                { val: "fixed",      label: "Fixed (AED)",    icon: Tag     },
                            ].map(({ val, label, icon: Icon }) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setType(val)}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                        type === val
                                            ? "bg-orange-50 border-orange-300 text-orange-700"
                                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            Value {type === "percentage" ? "(1–100%)" : "(AED)"}
                        </label>
                        <Input
                            type="number"
                            min="0.01"
                            max={type === "percentage" ? "100" : undefined}
                            step="0.01"
                            placeholder={type === "percentage" ? "20" : "50.00"}
                            value={value}
                            onChange={e => { setValue(e.target.value); setErrors(p => ({ ...p, value: undefined })) }}
                            disabled={loading}
                            className={inputCls("value")}
                        />
                        <FieldError msg={errors.value} />
                    </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Max Total Uses</label>
                        <Input
                            type="number" min="1" step="1" placeholder="Unlimited"
                            value={maxUses}
                            onChange={e => { setMaxUses(e.target.value); setErrors(p => ({ ...p, maxUses: undefined })) }}
                            disabled={loading}
                            className={inputCls("maxUses")}
                        />
                        <FieldError msg={errors.maxUses} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Max Uses / User</label>
                        <Input
                            type="number" min="1" step="1" placeholder="Unlimited"
                            value={maxUsesPerUser}
                            onChange={e => { setMaxUsesPerUser(e.target.value); setErrors(p => ({ ...p, maxUsesPerUser: undefined })) }}
                            disabled={loading}
                            className={inputCls("maxUsesPerUser")}
                        />
                        <FieldError msg={errors.maxUsesPerUser} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Min Order (AED)</label>
                        <Input
                            type="number" min="0" step="0.01" placeholder="No minimum"
                            value={minOrderAmount}
                            onChange={e => { setMinOrderAmount(e.target.value); setErrors(p => ({ ...p, minOrderAmount: undefined })) }}
                            disabled={loading}
                            className={inputCls("minOrderAmount")}
                        />
                        <FieldError msg={errors.minOrderAmount} />
                    </div>
                </div>

                {/* Expiry */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Expiry Date (optional)
                    </label>
                    <input
                        type="datetime-local"
                        value={expiresAt}
                        min={minExpiry}
                        onChange={e => { setExpiresAt(e.target.value); setErrors(p => ({ ...p, expiresAt: undefined })) }}
                        disabled={loading}
                        className={`h-10 w-full max-w-xs px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                        focus:bg-white transition-colors disabled:opacity-50
                        ${errors.expiresAt ? "border-rose-400 focus:ring-rose-200" : ""}`}
                    />
                    <FieldError msg={errors.expiresAt} />
                </div>

                <div className="flex items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700
                        text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                            : <><Plus className="w-4 h-4" /> Create Code</>
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

function DeleteButton({ codeId }) {
    const [confirming, setConfirming] = useState(false)
    const [loading,    setLoading]    = useState(false)
    const deleteCode = useMutation(api.discounts.deleteDiscountCode)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await deleteCode({ codeId })
            if (res.success) toast.success("Code deleted")
            else toast.error(res.error)
        } catch { toast.error("An unexpected error occurred") }
        finally { setLoading(false); setConfirming(false) }
    }

    if (confirming) return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[0.68rem] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Confirm
            </button>
            <button onClick={() => setConfirming(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )

    return (
        <button
            onClick={() => setConfirming(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    )
}

function ToggleButton({ codeId, isActive }) {
    const [loading, setLoading] = useState(false)
    const toggle = useMutation(api.discounts.toggleDiscountCode)

    const handleToggle = async () => {
        setLoading(true)
        try {
            await toggle({ codeId, isActive: !isActive })
            toast.success(isActive ? "Code deactivated" : "Code activated")
        } catch { toast.error("An unexpected error occurred") }
        finally { setLoading(false) }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-1.5 text-[0.68rem] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title={isActive ? "Deactivate" : "Activate"}
        >
            {loading
                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                : isActive
                    ? <ToggleRight className="w-4.5 h-4.5 text-emerald-500" />
                    : <ToggleLeft  className="w-4.5 h-4.5 text-gray-400"  />
            }
        </button>
    )
}

export default function Discounts() {
    const [showForm, setShowForm] = useState(false)

    const { results, status, loadMore, isLoading } = usePaginatedQuery(
        api.discounts.getDiscountCodes,
        {},
        { initialNumItems: 20 }
    )

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })

    const copyCode = (code) => {
        navigator.clipboard.writeText(code)
        toast.success(`Copied "${code}"`)
    }

    const isExpired  = (c) => c.expiresAt && c.expiresAt < Date.now()
    const isExhausted = (c) => c.maxUses != null && c.usedCount >= c.maxUses

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-2xl font-bold text-gray-900">Discount Codes</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {isLoading
                            ? "Loading..."
                            : `${results.length} code${results.length !== 1 ? "s" : ""} · ${results.filter(c => c.isActive && !isExpired(c) && !isExhausted(c)).length} active`
                        }
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 h-10 rounded-xl bg-orange-600 hover:bg-orange-700
                        text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        New Code
                    </button>
                )}
            </div>

            {/* Create form */}
            {showForm && <CreateForm onClose={() => setShowForm(false)} />}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className={TH}>Code</th>
                                <th className={TH}>Description</th>
                                <th className={TH}>Discount</th>
                                <th className={TH}>Usage</th>
                                <th className={TH}>Per User</th>
                                <th className={TH}>Min Order</th>
                                <th className={TH}>Expires</th>
                                <th className={TH}>Status</th>
                                <th className={TH}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <td key={j} className="py-4 px-5"><div className="h-3 bg-gray-100 rounded-full" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : results.length > 0 ? (
                                results.map((c) => {
                                    const expired   = isExpired(c)
                                    const exhausted = isExhausted(c)
                                    const effective = c.isActive && !expired && !exhausted

                                    return (
                                        <tr key={c._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                                            {/* Code */}
                                            <td className={`${TD} min-w-36`}>
                                                <button
                                                    onClick={() => copyCode(c.code)}
                                                    className="flex items-center gap-1.5 font-mono font-semibold text-gray-800 hover:text-orange-600 transition-colors cursor-pointer group"
                                                    title="Click to copy"
                                                >
                                                    {c.code}
                                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            </td>

                                            {/* Description */}
                                            <td className={`${TD} max-w-48`}>
                                                <p className="truncate text-gray-500">{c.description}</p>
                                            </td>

                                            {/* Discount */}
                                            <td className={TD}>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                    c.type === "percentage"
                                                        ? "bg-violet-50 text-violet-700 border-violet-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                }`}>
                                                    {c.type === "percentage" ? `${c.value}%` : `${fmt(c.value)} AED`}
                                                </span>
                                            </td>

                                            {/* Usage */}
                                            <td className={TD}>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-semibold ${exhausted ? "text-rose-500" : "text-gray-700"}`}>
                                                        {c.usedCount}
                                                    </span>
                                                    {c.maxUses != null && (
                                                        <span className="text-gray-400">/ {c.maxUses}</span>
                                                    )}
                                                </div>
                                                {c.maxUses != null && (
                                                    <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${exhausted ? "bg-rose-400" : "bg-orange-400"}`}
                                                            style={{ width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Per user */}
                                            <td className={`${TD} text-gray-400`}>
                                                {c.maxUsesPerUser ?? "∞"}
                                            </td>

                                            {/* Min order */}
                                            <td className={`${TD} text-gray-400`}>
                                                {c.minOrderAmount ? `${fmt(c.minOrderAmount)} AED` : "—"}
                                            </td>

                                            {/* Expires */}
                                            <td className={TD}>
                                                {c.expiresAt
                                                    ? <span className={expired ? "text-rose-500 font-semibold" : "text-gray-400"}>
                                                        {formatDate(c.expiresAt)}
                                                      </span>
                                                    : <span className="text-gray-300">Never</span>
                                                }
                                            </td>

                                            {/* Status */}
                                            <td className={TD}>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                    effective
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : exhausted
                                                        ? "bg-rose-50 text-rose-600 border-rose-200"
                                                        : expired
                                                        ? "bg-orange-50 text-orange-600 border-orange-200"
                                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                                }`}>
                                                    {effective ? "Active" : exhausted ? "Exhausted" : expired ? "Expired" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className={TD}>
                                                <div className="flex items-center gap-1">
                                                    <ToggleButton codeId={c._id} isActive={c.isActive} />
                                                    <DeleteButton codeId={c._id} />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Tag className="w-10 h-10" />
                                            <p className="text-sm font-medium text-gray-400">No discount codes yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {status === "CanLoadMore" && (
                <div className="flex justify-center">
                    <button
                        onClick={() => loadMore(20)}
                        className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600
                        hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
                    >
                        Load More
                    </button>
                </div>
            )}
            {status === "Exhausted" && results.length > 0 && (
                <p className="text-center text-xs text-gray-400">All codes loaded</p>
            )}
        </div>
    )
}
