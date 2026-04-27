"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { api } from "@/convex/_generated/api"
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, ChevronRight, Loader2, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const PROMO_MAX_LEN = 12

export default function Cart() {
    const t      = useTranslations("cart")
    const locale = useLocale()

    const { isLoading: isAuthLoading } = useConvexAuth()
    const cartItems   = useQuery(api.cart.getCartItems)
    const cartLoading = cartItems === undefined || isAuthLoading
    const cartError   = cartItems === null

    const updateCartQty  = useMutation(api.cart.updateCartQuantity)
    const removeFromCart = useMutation(api.cart.removeFromCart)
    const createCheckout = useAction(api.stripe.createPaymentCheckout)
    const validateCode   = useMutation(api.discounts.validateDiscountCode)

    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [promoInput,    setPromoInput]    = useState("")
    const [promoResult,   setPromoResult]   = useState(null)
    const [promoLoading,  setPromoLoading]  = useState(false)
    const [promoError,    setPromoError]    = useState(null)

    const totalItemsCount = cartItems?.reduce((s, i) => s + i.quantity, 0) || 0

    const subtotal = cartItems?.reduce((s, item) => {
        const active = item.product.price * (1 - (item.product.discount || 0) / 100)
        return s + active * item.quantity
    }, 0) || 0

    const promoDiscount      = promoResult?.valid ? (promoResult.discountAmount ?? 0) : 0
    const discountedSubtotal = subtotal - promoDiscount
    const vatAmount          = discountedSubtotal * 0.05
    const finalTotal         = discountedSubtotal + vatAmount

    const getTotalOfProduct = (id) => cartItems?.filter(i => i.productId === id).reduce((s, i) => s + i.quantity, 0) || 0

    const updateQuantity = async (item, delta) => {
        try {
            const r = await updateCartQty({ productId: item.productId, colorCode: item.color.code, dimensions: item.dimensions, newQuantity: item.quantity + delta })
            if (!r.success) toast.error(r.message || t("updateError"))
        } catch (e) { toast.error(e.message || t("updateError")) }
    }

    const removeItem = async (item) => {
        try {
            const r = await removeFromCart({ productId: item.productId, colorCode: item.color.code, dimensions: item.dimensions })
            if (!r.success) toast.error(r.message || t("removeError"))
        } catch (e) { toast.error(e.message || t("removeError")) }
    }

    const handlePromoChange = (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, PROMO_MAX_LEN)
        setPromoInput(val)
        if (promoError) setPromoError(null)
    }

    const handleApplyPromo = async () => {
        const code = promoInput.trim()
        if (!code) { setPromoError(t("promoRequired")); return }
        if (code.length < 3) { setPromoError(t("promoTooShort")); return }
        setPromoLoading(true)
        setPromoError(null)
        setPromoResult(null)
        try {
            const r = await validateCode({ code, subtotal })
            setPromoResult(r)
            if (r.valid) toast.success(t("promoApplied"))
            else setPromoError(r.error)
        } catch { setPromoError(t("unexpectedError")) }
        finally { setPromoLoading(false) }
    }

    const handleCheckout = async () => {
        if (isCheckingOut) return
        setIsCheckingOut(true)
        try {
            const r = await createCheckout({ locale, promoCode: promoResult?.valid ? promoResult.code : undefined })
            if (r.success === false) { toast.error(r.message || t("checkoutError")); return }
            if (r.url) window.location.href = r.url
        } catch { toast.error(t("checkoutError")) }
        finally { setIsCheckingOut(false) }
    }

    return (
        <section className="min-h-[70vh] bg-white">

            {/* ── Header band ── */}
            <div className="bg-neutral-100/70 border-b border-gray-200">
                <ContentWrapper className="py-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-3">
                        <Link href="/" className="hover:text-gray-700 transition-colors">{t("home")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-orange-500 font-semibold">{t("cart")}</span>
                    </div>
                    <span className="block text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                        {t("header")}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">
                        {cartLoading ? "—" : `${totalItemsCount} ${totalItemsCount === 1 ? t("item") : t("items")} ${t("saved")}`}
                    </p>
                </ContentWrapper>
            </div>

            <ContentWrapper className="py-10">

                {/* ── Skeleton ── */}
                {cartLoading && (
                    <div className="grid lg:grid-cols-3 gap-10 animate-pulse">
                        <div className="lg:col-span-2 space-y-3">
                            <div className="h-12 bg-neutral-100 rounded-xl" />
                            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-neutral-100 rounded-xl" />)}
                        </div>
                        <div className="h-96 bg-neutral-100 rounded-2xl" />
                    </div>
                )}

                {/* ── Empty state ── */}
                {!cartLoading && (cartError || !cartItems || cartItems.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                                <ShoppingBag className="w-9 h-9 text-orange-300" />
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                        </div>
                        <p className="text-xl font-extrabold uppercase tracking-tight text-gray-900">{t("titleError")}</p>
                        <p className="text-sm text-gray-400 mt-2 max-w-sm leading-relaxed">{t("descError")}</p>
                        <div className="flex items-center gap-3 mt-7">
                            <Link href="/shop" className="inline-flex items-center gap-2 px-7 h-11 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-colors">
                                {t("btnError")} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link href="/wishlist" className="inline-flex items-center gap-2 px-7 h-11 border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 text-xs font-semibold rounded-xl transition-colors">
                                {t("btnWishlist")}
                            </Link>
                        </div>
                        <div className="flex items-center gap-6 mt-10 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> {t("securePay")}</span>
                            <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-orange-400" /> {t("easyReturns")}</span>
                        </div>
                    </motion.div>
                )}

                {/* ── Cart content ── */}
                {!cartLoading && cartItems && cartItems.length > 0 && (
                    <div className="grid lg:grid-cols-3 gap-10">

                        {/* Items */}
                        <div className="lg:col-span-2 flex flex-col gap-3">

                            {/* Table header */}
                            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 pb-3 border-b border-gray-100">
                                {[t("product"), t("price"), t("quantity"), t("total"), ""].map((h, i) => (
                                    <span key={i} className={`text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gray-400 ${i > 0 && i < 4 ? "text-center" : ""}`}>{h}</span>
                                ))}
                            </div>

                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item, idx) => {
                                    const discountRate = item.product.discount || 0
                                    const activePrice  = item.product.price * (1 - discountRate / 100)
                                    const lineTotal    = activePrice * item.quantity
                                    const atStockLimit = getTotalOfProduct(item.productId) >= item.product.stock

                                    return (
                                        <motion.div
                                            key={`${item.productId}-${item.color.code}-${item.dimensions.h}-${idx}`}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center p-5 bg-neutral-50 border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all"
                                        >
                                            {/* Product */}
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <Link href={`/product/${item.productId}`}>
                                                        <Image
                                                            src={item.product.thumbnail}
                                                            alt={item.product.name[locale] || item.product.name.en}
                                                            width={72}
                                                            height={72}
                                                            className="rounded-xl object-cover border border-gray-100"
                                                        />
                                                    </Link>
                                                    {discountRate > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                                                            -{discountRate}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <Link href={`/product/${item.productId}`} className="block text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors truncate">
                                                        {item.product.name[locale] || item.product.name.en}
                                                    </Link>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                        <span className="inline-flex items-center gap-1.5 bg-white border border-gray-100 rounded-md px-2 py-0.5 text-[0.62rem] text-gray-500">
                                                            <span className="w-2 h-2 rounded-sm border border-gray-200 shrink-0" style={{ backgroundColor: item.color.code }} />
                                                            {item.color.name[locale] || item.color.name.en}
                                                        </span>
                                                        <span className="inline-flex items-center bg-white border border-gray-100 rounded-md px-2 py-0.5 text-[0.62rem] text-gray-500">
                                                            {item.dimensions.h}×{item.dimensions.w}×{item.dimensions.d} cm
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Unit price */}
                                            <div className="flex flex-col items-center justify-center gap-0.5">
                                                <span className="text-sm font-bold text-gray-900 tabular-nums">{fmt(activePrice)}</span>
                                                {discountRate > 0 && (
                                                    <span className="text-xs text-gray-400 line-through tabular-nums">{fmt(item.product.price)}</span>
                                                )}
                                                <span className="text-[0.58rem] text-gray-400 uppercase tracking-wide">{t("currency")}</span>
                                            </div>

                                            {/* Qty */}
                                            <div className="flex items-center justify-center">
                                                <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                                                    <button onClick={() => updateQuantity(item, -1)}
                                                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-9 text-center text-sm font-bold text-gray-900 tabular-nums">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item, 1)} disabled={atStockLimit}
                                                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Line total */}
                                            <div className="hidden md:flex flex-col items-center justify-center gap-0.5">
                                                <span className="text-sm font-extrabold text-gray-900 tabular-nums">{fmt(lineTotal)}</span>
                                                <span className="text-[0.58rem] text-gray-400 uppercase tracking-wide">{t("currency")}</span>
                                            </div>

                                            {/* Remove */}
                                            <button onClick={() => removeItem(item)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>

                            <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors mt-2 w-fit">
                                <ArrowLeft className="w-3.5 h-3.5" /> {t("continueShopping")}
                            </Link>
                        </div>

                        {/* Summary sidebar */}
                        <div className="lg:col-span-1">
                            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white sticky top-24">

                                {/* Header */}
                                <div className="px-6 py-4 bg-neutral-50 border-b border-gray-200">
                                    <span className="text-sm font-bold text-gray-900">{t("orderSummary")}</span>
                                </div>

                                <div className="px-6 py-5 flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("subtotal")} ({totalItemsCount})</span>
                                        <span className="font-semibold text-gray-900 tabular-nums">{fmt(subtotal)} <span className="text-xs text-gray-400">{t("currency")}</span></span>
                                    </div>
                                    {promoDiscount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-emerald-600 flex items-center gap-1.5 text-xs font-medium">
                                                <Tag className="w-3 h-3" /> {promoResult.code}
                                            </span>
                                            <span className="text-emerald-600 font-semibold text-xs tabular-nums">− {fmt(promoDiscount)} {t("currency")}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("shipping")}</span>
                                        <span className="font-semibold text-emerald-600">{t("free")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">VAT (5%)</span>
                                        <span className="font-semibold text-gray-900 tabular-nums">{fmt(vatAmount)} <span className="text-xs text-gray-400">{t("currency")}</span></span>
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-100 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">{t("total")}</span>
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-gray-900 leading-none tabular-nums">{fmt(finalTotal)}</p>
                                            <p className="text-[0.58rem] text-gray-400 uppercase tracking-wide mt-0.5">{t("currency")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 flex flex-col gap-4">
                                    {/* Promo code */}
                                    {promoResult?.valid ? (
                                        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <div className="flex items-center gap-2 text-emerald-700">
                                                <Tag className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold">{promoResult.code}</span>
                                                <span className="text-xs text-emerald-600 tabular-nums">− {fmt(promoResult.discountAmount)} {t("currency")}</span>
                                            </div>
                                            <button onClick={() => { setPromoResult(null); setPromoInput(""); setPromoError(null) }}
                                                className="text-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        placeholder={t("promoPlaceholder")}
                                                        value={promoInput}
                                                        onChange={handlePromoChange}
                                                        onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                                                        disabled={promoLoading}
                                                        maxLength={PROMO_MAX_LEN}
                                                        className={`w-full h-10 pl-9 pr-3 text-xs font-medium bg-neutral-50 border rounded-xl outline-none text-gray-900 placeholder:text-gray-400 focus:ring-2 transition-all uppercase disabled:opacity-50 ${
                                                            promoError
                                                                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400/10"
                                                                : "border-gray-200 focus:border-orange-400 focus:ring-orange-400/10"
                                                        }`}
                                                    />
                                                </div>
                                                <button onClick={handleApplyPromo}
                                                    disabled={promoLoading || !promoInput.trim()}
                                                    className="px-4 h-10 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                                                    {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("apply")}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5 min-h-4 px-0.5">
                                                {promoError ? (
                                                    <p className="text-[0.65rem] text-rose-500 flex items-center gap-1 leading-tight">
                                                        <X className="w-2.5 h-2.5 shrink-0" /> {promoError}
                                                    </p>
                                                ) : <span />}
                                                {promoInput.length > 0 && (
                                                    <span className="text-[0.6rem] text-gray-400 font-mono shrink-0 ml-2">
                                                        {promoInput.length}/{PROMO_MAX_LEN}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Checkout */}
                                    <button onClick={handleCheckout} disabled={isCheckingOut}
                                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
                                        {isCheckingOut
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("checkoutBtn")}...</>
                                            : <>{t("checkoutBtn")} <ArrowRight className="w-3.5 h-3.5" /></>
                                        }
                                    </button>

                                    {/* Trust signals */}
                                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
                                        {[
                                            { Icon: Truck,       label: t("freeShipping") },
                                            { Icon: ShieldCheck, label: t("securePay")    },
                                            { Icon: RotateCcw,   label: t("easyReturns")  },
                                        ].map(({ Icon, label }) => (
                                            <div key={label} className="flex flex-col items-center gap-1.5 text-center pt-3">
                                                <Icon className="w-4 h-4 text-orange-500" />
                                                <span className="text-[0.6rem] text-gray-400 font-medium leading-tight">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </ContentWrapper>
        </section>
    )
}
