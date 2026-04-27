"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { useMutation, usePaginatedQuery, useQuery } from "convex/react"
import {
    Check, Clock, Loader2,
    Mail, Send, Users, X, Eye, EyeOff, AlertTriangle
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useDeferredValue, useMemo, useState, useCallback } from "react"
import { toast } from "sonner"
import { buildEmailHtml } from "@/lib/emailUtils"

const TH = "py-3 px-5 text-left text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
const TD = "py-4 px-5 text-xs font-medium text-gray-700 whitespace-nowrap"

const STATUS_STYLES = {
    scheduled: { badge: "bg-orange-50 text-orange-700 border-orange-200",  label: "statusScheduled" },
    sending:   { badge: "bg-blue-50   text-blue-700   border-blue-200",    label: "statusSending"   },
    sent:      { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "statusSent"    },
    cancelled: { badge: "bg-gray-100  text-gray-500   border-gray-200",    label: "statusCancelled" },
}

const MAX_SUBJECT = 200
const MAX_BODY    = 50_000

function StatCard({ icon: Icon, label, value, loading, color }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                {loading
                    ? <div className="h-6 w-16 bg-gray-100 rounded-lg animate-pulse mt-1" />
                    : <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                }
            </div>
        </div>
    )
}

function ProgressBar({ sent, total }) {
    const pct = total > 0 ? Math.round((sent / total) * 100) : 0
    return (
        <div className="flex items-center gap-2 min-w-32">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[0.68rem] font-semibold text-gray-500 shrink-0">{sent}/{total}</span>
        </div>
    )
}

function CancelButton({ campaignId, disabled }) {
    const t = useTranslations("admin")
    const [confirming, setConfirming] = useState(false)
    const cancelCampaign = useMutation(api.newsletterAdmin.cancelCampaign)
    const [loading, setLoading] = useState(false)

    const handleCancel = async () => {
        setLoading(true)
        try {
            const res = await cancelCampaign({ campaignId })
            if (res.success) toast.success(t("campaignCancelled"))
            else toast.error(res.error)
        } catch { toast.error("Failed to cancel campaign") }
        finally { setLoading(false); setConfirming(false) }
    }

    if (confirming) return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={handleCancel}
                disabled={loading || disabled}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600
                text-white text-[0.68rem] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                {t("confirmAction2")}
            </button>
            <button
                onClick={() => setConfirming(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100
                text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )

    return (
        <button
            onClick={() => setConfirming(true)}
            disabled={disabled}
            className="text-[0.68rem] font-semibold text-rose-500 hover:text-rose-600
            border border-rose-200 rounded-lg px-2.5 py-1 hover:bg-rose-50 transition-colors
            cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {t("cancelCampaign")}
        </button>
    )
}

function CampaignForm({ stats, onClose }) {
    const t = useTranslations("admin")
    const createCampaign = useMutation(api.newsletterAdmin.createCampaign)

    const [subject, setSubject]         = useState("")
    const [body, setBody]               = useState("")
    const [sendType, setSendType]       = useState("now")
    const [scheduledAt, setScheduledAt] = useState("")
    const [preview, setPreview]         = useState(false)
    const [loading, setLoading]         = useState(false)
    const [errors, setErrors]           = useState({})

    const minDatetime = useMemo(
        () => new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16),
        // Recompute once per form mount — no need to update every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const validate = useCallback(() => {
        const e = {}
        if (!subject.trim()) e.subject = "Subject is required"
        else if (subject.length > MAX_SUBJECT) e.subject = `Max ${MAX_SUBJECT} characters`
        if (!body.trim()) e.body = "Body is required"
        else if (body.length > MAX_BODY) e.body = `Max ${MAX_BODY.toLocaleString()} characters`
        if (sendType === "scheduled") {
            if (!scheduledAt) e.scheduledAt = "Please pick a date and time"
            else if (new Date(scheduledAt).getTime() < Date.now()) e.scheduledAt = "Must be in the future"
        }
        return e
    }, [subject, body, sendType, scheduledAt])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        const ts = sendType === "now"
            ? Date.now()
            : new Date(scheduledAt).getTime()

        setLoading(true)
        try {
            const res = await createCampaign({ subject: subject.trim(), body: body.trim(), scheduledAt: ts })
            if (res.success) {
                toast.success(t("campaignCreated"))
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{t("newCampaign")}</p>
                        {stats && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                {t("willSendTo", { count: stats.active })}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200
                    text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Subject */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">{t("campaignSubject")}</label>
                        <span className={`text-[0.65rem] font-medium ${subject.length > MAX_SUBJECT * 0.9 ? "text-rose-500" : "text-gray-400"}`}>
                            {subject.length}/{MAX_SUBJECT} {t("chars")}
                        </span>
                    </div>
                    <Input
                        placeholder={t("campaignSubjectPlaceholder")}
                        value={subject}
                        onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
                        maxLength={MAX_SUBJECT}
                        disabled={loading}
                        className={`h-11 bg-gray-50 border-gray-200 text-sm focus:bg-white transition-colors
                        focus-visible:ring-orange-200 focus:border-orange-400
                        ${errors.subject ? "border-rose-400 focus-visible:ring-rose-200" : ""}`}
                    />
                    {errors.subject && <p className="text-rose-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                {/* Body */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">{t("campaignBody")}</label>
                        <div className="flex items-center gap-3">
                            <span className={`text-[0.65rem] font-medium ${body.length > MAX_BODY * 0.9 ? "text-rose-500" : "text-gray-400"}`}>
                                {body.length.toLocaleString()}/{MAX_BODY.toLocaleString()} {t("chars")}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreview(p => !p)}
                                className="flex items-center gap-1 text-[0.68rem] font-semibold text-orange-600
                                hover:text-orange-700 cursor-pointer transition-colors"
                            >
                                {preview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                {t("previewEmail")}
                            </button>
                        </div>
                    </div>

                    {preview ? (
                        <iframe
                            srcDoc={
                                body
                                    ? buildEmailHtml(
                                        subject || "Preview",
                                        body
                                            .replace(/\{\{name\}\}/gi, "John Doe")
                                            .replace(/\{\{email\}\}/gi, "subscriber@example.com"),
                                        ""
                                      )
                                    : "<p style='color:#9ca3af;font-family:sans-serif;padding:16px'>Nothing to preview yet…</p>"
                            }
                            sandbox=""
                            title="Email preview"
                            className="w-full min-h-48 max-h-96 rounded-xl border border-gray-200 bg-white"
                            style={{ height: "480px" }}
                        />
                    ) : (
                        <textarea
                            placeholder={t("campaignBodyPlaceholder")}
                            value={body}
                            onChange={e => { setBody(e.target.value); setErrors(p => ({ ...p, body: undefined })) }}
                            disabled={loading}
                            rows={10}
                            maxLength={MAX_BODY}
                            className={`w-full text-sm rounded-xl border border-gray-200 bg-gray-50 px-4 py-3
                            focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                            resize-y transition-colors font-mono placeholder:font-sans placeholder:text-gray-400
                            disabled:opacity-50 ${errors.body ? "border-rose-400 focus:ring-rose-200" : ""}`}
                        />
                    )}
                    {errors.body && <p className="text-rose-500 text-xs mt-1">{errors.body}</p>}

                    {/* Merge tag pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-wide">
                            {t("mergeTags")}:
                        </span>
                        {["{{name}}", "{{email}}"].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                disabled={loading || preview}
                                onClick={() => setBody(b => b + tag)}
                                className="font-mono text-[0.65rem] px-2 py-0.5 bg-gray-100 text-gray-600 rounded
                                border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700
                                transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {tag}
                            </button>
                        ))}
                        <span className="text-[0.63rem] text-gray-400">{t("mergeTagsHint")}</span>
                    </div>

                    <p className="text-[0.65rem] text-gray-400">
                        {t("campaignBodyNote")}
                    </p>
                </div>

                {/* Send type */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">{t("scheduledAt")}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { val: "now", label: t("sendNow"), icon: Send },
                            { val: "scheduled", label: t("scheduleFor"), icon: Clock },
                        ].map(({ val, label, icon: Icon }) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => { setSendType(val); setErrors(p => ({ ...p, scheduledAt: undefined })) }}
                                disabled={loading}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium
                                transition-all cursor-pointer ${sendType === val
                                    ? "bg-orange-50 border-orange-300 text-orange-700"
                                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {sendType === "scheduled" && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">{t("scheduledAt")}</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                min={minDatetime}
                                onChange={e => { setScheduledAt(e.target.value); setErrors(p => ({ ...p, scheduledAt: undefined })) }}
                                disabled={loading}
                                className={`h-11 w-full px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm
                                focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                                focus:bg-white transition-colors disabled:opacity-50
                                ${errors.scheduledAt ? "border-rose-400 focus:ring-rose-200" : ""}`}
                            />
                            {errors.scheduledAt && <p className="text-rose-500 text-xs">{errors.scheduledAt}</p>}
                        </div>
                    )}
                </div>

                {/* Rate limit info */}
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700 leading-relaxed">
                        <span className="font-semibold">Rate-limited sending:</span> one email per minute per subscriber to protect your Resend reputation.
                        A campaign to {stats?.active ?? "—"} subscribers will take ~{stats?.active ?? 0} minutes to complete.
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={loading || !subject.trim() || !body.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700
                        text-white text-sm font-semibold transition-colors cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("loading")}</>
                            : <><Send className="w-4 h-4" /> {t("launchCampaign")}</>
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600
                        hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {t("cancel")}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default function Newsletter() {
    const t = useTranslations("admin")
    const locale = useLocale()

    const [showForm, setShowForm]       = useState(false)
    const [activeOnly, setActiveOnly]   = useState(false)
    const [statusFilter, setStatusFilter] = useState("")
    const deferredStatus = useDeferredValue(statusFilter)

    const stats = useQuery(api.newsletterAdmin.getSubscriberStats)

    const { results: campaigns, status: campaignStatus, loadMore: loadMoreCampaigns, isLoading: campaignsLoading } =
        usePaginatedQuery(api.newsletterAdmin.getCampaigns, {}, { initialNumItems: 10 })

    const { results: subscribers, status: subStatus, loadMore: loadMoreSubs, isLoading: subsLoading } =
        usePaginatedQuery(
            api.newsletterAdmin.getSubscribers,
            { activeOnly: activeOnly || undefined },
            { initialNumItems: 20 }
        )

    const filteredCampaigns = (deferredStatus && deferredStatus !== "all")
        ? campaigns.filter(c => c.status === deferredStatus)
        : campaigns

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

    const formatShortDate = (ts) =>
        new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

    const totalSent = stats?.totalEmailsSent ?? 0

    const etaMinutes = (c) => Math.ceil((c.totalRecipients - c.currentIndex) * 1)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{t("newsletter")}</p>
                    <p className="text-xs text-gray-400 mt-1">{t("newsletterDesc")}</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 h-10 rounded-xl bg-orange-600 hover:bg-orange-700
                        text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-fit"
                    >
                        <Send className="w-4 h-4" />
                        {t("newCampaign")}
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={Users}
                    label={t("activeSubscribers")}
                    value={stats?.active ?? 0}
                    loading={stats === undefined}
                    color="bg-gradient-to-br from-orange-400 to-orange-600"
                />
                <StatCard
                    icon={Mail}
                    label={t("totalCampaigns")}
                    value={campaignsLoading ? "—" : campaigns.length}
                    loading={campaignsLoading}
                    color="bg-gradient-to-br from-violet-400 to-violet-600"
                />
                <StatCard
                    icon={Send}
                    label={t("emailsSent")}
                    value={totalSent.toLocaleString()}
                    loading={stats === undefined}
                    color="bg-gradient-to-br from-emerald-400 to-emerald-600"
                />
            </div>

            {/* Campaign form */}
            {showForm && (
                <CampaignForm stats={stats} onClose={() => setShowForm(false)} />
            )}

            {/* Campaigns */}
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-700">{t("totalCampaigns")}</p>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 !h-9 bg-white border-gray-200 text-xs cursor-pointer">
                            <SelectValue placeholder={t("noFilters")} />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="all" className="text-xs cursor-pointer">{t("noFilters")}</SelectItem>
                            <SelectItem value="scheduled" className="text-xs cursor-pointer">{t("statusScheduled")}</SelectItem>
                            <SelectItem value="sending" className="text-xs cursor-pointer">{t("statusSending")}</SelectItem>
                            <SelectItem value="sent" className="text-xs cursor-pointer">{t("statusSent")}</SelectItem>
                            <SelectItem value="cancelled" className="text-xs cursor-pointer">{t("statusCancelled")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className={TH}>{t("campaignSubject")}</th>
                                    <th className={TH}>{t("status")}</th>
                                    <th className={TH}>{t("campaignProgress")}</th>
                                    <th className={TH}>{t("campaignRecipients")}</th>
                                    <th className={TH}>{t("campaignScheduled")} / {t("campaignSent")}</th>
                                    <th className={TH}>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaignsLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                            {[1,2,3,4,5,6].map(j => (
                                                <td key={j} className="py-4 px-5">
                                                    <div className="h-3 bg-gray-100 rounded-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filteredCampaigns.length > 0 ? (
                                    filteredCampaigns.map((c) => {
                                        const cfg = STATUS_STYLES[c.status] ?? STATUS_STYLES.cancelled
                                        const canCancel = c.status === "scheduled" || c.status === "sending"
                                        return (
                                            <tr key={c._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                                <td className={`${TD} min-w-56 max-w-64`}>
                                                    <p className="font-semibold text-gray-800 truncate">{c.subject}</p>
                                                    <p className="text-[0.65rem] text-gray-400 mt-0.5">
                                                        {formatShortDate(c.createdAt)}
                                                    </p>
                                                </td>
                                                <td className={TD}>
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${cfg.badge}`}>
                                                        {c.status === "sending" && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                                                        )}
                                                        {t(cfg.label)}
                                                    </span>
                                                </td>
                                                <td className={`${TD} min-w-40`}>
                                                    <ProgressBar sent={c.sentCount} total={c.totalRecipients} />
                                                    {c.status === "sending" && (
                                                        <p className="text-[0.63rem] text-gray-400 mt-1">
                                                            {t("estTimeRemaining", { min: etaMinutes(c) })}
                                                        </p>
                                                    )}
                                                    {c.failedCount > 0 && (
                                                        <p className="text-[0.63rem] text-rose-500 mt-0.5">
                                                            {c.failedCount} {t("campaignFailed")}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className={`${TD} font-semibold text-gray-700`}>
                                                    {c.totalRecipients.toLocaleString()}
                                                </td>
                                                <td className={`${TD} text-gray-400 min-w-40`}>
                                                    {c.sentAt
                                                        ? formatDate(c.sentAt)
                                                        : formatDate(c.scheduledAt)
                                                    }
                                                </td>
                                                <td className={TD}>
                                                    {canCancel
                                                        ? <CancelButton campaignId={c._id} disabled={false} />
                                                        : <span className="text-gray-300 text-xs">—</span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-14 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                                <Mail className="w-10 h-10" />
                                                <p className="text-sm font-medium text-gray-400">{t("noCampaigns")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {campaignStatus === "CanLoadMore" && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => loadMoreCampaigns(10)}
                            className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600
                            hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
                        >
                            {t("loadMore")}
                        </button>
                    </div>
                )}
            </div>

            {/* Subscribers */}
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">{t("subscribersTitle")}</p>
                        {stats && (
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {stats.active} active / {stats.total} total
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setActiveOnly(p => !p)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                            activeOnly
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {activeOnly ? t("activeOnly") : t("allSubscribers")}
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className={TH}>{t("subscriberEmail")}</th>
                                    <th className={TH}>{t("subscriberStatus")}</th>
                                    <th className={TH}>{t("subscriberJoined")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subsLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                                            <td className="py-4 px-5"><div className="h-3 w-48 bg-gray-100 rounded-full" /></td>
                                            <td className="py-4 px-5"><div className="h-5 w-16 bg-gray-100 rounded-lg" /></td>
                                            <td className="py-4 px-5"><div className="h-3 w-24 bg-gray-100 rounded-full" /></td>
                                        </tr>
                                    ))
                                ) : subscribers.length > 0 ? (
                                    subscribers.map((s) => (
                                        <tr key={s._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                            <td className={`${TD} min-w-56 font-semibold text-gray-800`}>
                                                {s.email}
                                            </td>
                                            <td className={TD}>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${
                                                    s.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                                }`}>
                                                    {s.isActive ? t("subscriberActive") : t("subscriberInactive")}
                                                </span>
                                            </td>
                                            <td className={`${TD} text-gray-400`}>
                                                {formatShortDate(s.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-14 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                                <Users className="w-10 h-10" />
                                                <p className="text-sm font-medium text-gray-400">{t("noSubscribers")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {subStatus === "CanLoadMore" && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => loadMoreSubs(20)}
                            className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600
                            hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
                        >
                            {t("loadMore")}
                        </button>
                    </div>
                )}
                {subStatus === "Exhausted" && subscribers.length > 0 && (
                    <p className="text-center text-xs text-gray-400">{t("allLoaded")}</p>
                )}
            </div>
        </div>
    )
}
