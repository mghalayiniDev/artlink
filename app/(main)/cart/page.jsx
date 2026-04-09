"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import { api } from "@/convex/_generated/api"
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Heart, Loader2, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const formatPrice = (amount) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Cart() {
    const t = useTranslations("cart")
    const locale = useLocale()

    const { isLoading: isAuthLoading } = useConvexAuth()
    const cartItems = useQuery(api.cart.getCartItems)
    const cartLoading = cartItems === undefined || isAuthLoading
    const cartError = cartItems === null

    const updateCartQty = useMutation(api.cart.updateCartQuantity)
    const removeFromCart = useMutation(api.cart.removeFromCart)

    const createCheckout = useAction(api.stripe.createPaymentCheckout)
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const totalItemsCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const subtotal = cartItems?.reduce((sum, item) => {
        const discountRate = item.product.discount || 0
        const activePrice = item.product.price * (1 - (discountRate / 100))
        return sum + (activePrice * item.quantity)
    }, 0) || 0

    const vatAmount = subtotal * 0.05
    const finalTotal = subtotal + vatAmount

    const getTotalOfProductInCart = (productId) => {
        if (!cartItems) return 0;
        return cartItems
            .filter((item) => item.productId === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }

    const updateQuantity = async (item, delta) => {
        const newQuantity = item.quantity + delta

        try {
            const result = await updateCartQty({
                productId: item.productId,
                colorCode: item.color.code,
                dimensions: item.dimensions,
                newQuantity: newQuantity
            })

            if (!result.success) {
                toast.error(result.message || t("updateError"))
            }
        } catch (error) {
            toast.error(error.message || t("updateError"))
        }
    }

    const removeItem = async (item) => {
        try {
            const result = await removeFromCart({
                productId: item.productId,
                colorCode: item.color.code,
                dimensions: item.dimensions
            })

            if (!result.success) {
                toast.error(result.message || t("removeError"))
            }
        } catch (error) {
            toast.error(error.message || t("removeError"))
        }
    }

    const handleCheckout = async () => {
        if (isCheckingOut) return
        
        setIsCheckingOut(true)

        try {
            const response = await createCheckout({ locale: locale })
            
            if (response.success === false) {
                toast.error(response.message || "Failed to process checkout")
                return
            }
            
            if (response.url) {
                window.location.href = response.url
            }
        } catch (error) {
            toast.error("A network error occurred. Please try again.")
        } finally {
            setIsCheckingOut(false)
        }
    }

    return (
        <section className="min-h-[60vh] pt-14 pb-24">
            <ContentWrapper>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{t("cart")}</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-10">
                    <div>
                        <span className="text-3xl md:text-[2.5rem] block font-extrabold text-foreground">
                            {t("header")}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2.5">
                            {cartLoading ? 
                                <><Loader2 className="w-4 h-4 animate-spin" /> {t("items")} {" "} {t("saved")}</> : (
                                    <>
                                        {(cartError || !cartItems || cartItems.length === 0) ? <>0 {t("items")} {t("saved")}</> : <> 
                                            {cartItems.length} {cartItems.length === 1 ? t("item") : t("items")} {t("saved")} 
                                        </>}
                                    </>
                                )
                            }
                        </p>
                    </div>
                </div>

                {/* Body */}
                {cartLoading ? (
                    <div className="grid lg:grid-cols-3 gap-14">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="w-full h-12 bg-neutral-100 animate-pulse" />
                            <div className="w-full h-px bg-neutral-100" />
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="w-full h-34 bg-neutral-100 rounded-xl animate-pulse" />
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="w-full h-[50vh] bg-neutral-100 rounded-xl animate-pulse" />
                        </div>
                    </div>
                ) : (
                    (cartError || !cartItems || cartItems.length === 0) ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center py-6"
                        >
                            <div className="relative mb-8">
                            <div className="w-28 h-28 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center">
                                <ShoppingBag size={40} className="text-muted-foreground/40" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                <span className="text-accent-foreground text-xs font-bold">0</span>
                            </div>
                            </div>
                            <span className="text-2xl block font-bold text-foreground mb-2">{t("titleError")}</span>
                            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
                                {t("descError")}
                            </p>
                            <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-7 py-3 bg-orange-500 text-accent-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                {t("btnError")}
                            </Link>
                            <Link
                                href="/wishlist"
                                className="inline-flex items-center gap-2 px-7 py-3 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                            >
                                {t("btnWishlist")}
                            </Link>
                            </div>
                            <div className="flex items-center gap-6 mt-10 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> {t("securePay")}</span>
                                <span className="flex items-center gap-1.5"><RotateCcw size={13} /> {t("easyReturns")}</span>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-16">
                            {/* Cart Items List */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 pb-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>{t("product")}</span>
                                    <span className="text-center">{t("price")}</span>
                                    <span className="text-center">{t("quantity")}</span>
                                    <span className="text-center">{t("total")}</span>
                                    <span className="w-9"></span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item, idx) => {
                                        const totalOfThisProduct = getTotalOfProductInCart(item.productId)
                                        const discountRate = item.product.discount || 0
                                        const activePrice = item.product.price * (1 - (discountRate / 100))
                                        const lineTotal = activePrice * item.quantity

                                        return (
                                            <motion.div
                                                key={`${item.productId}-${item.color.code}-${item.dimensions.h}-${idx}`}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center p-6 rounded-xl bg-neutral-50 border border-border"
                                            >
                                                {/* Product Col */}
                                                <div className="flex items-center gap-4">
                                                    <Link href={`/product/${item.productId}`} className="shrink-0">
                                                        <Image 
                                                            src={item.product.thumbnail}
                                                            alt={item.product.name[locale] || item.product.name["en"]}
                                                            width={80}
                                                            height={80}
                                                            className="rounded-md object-cover"
                                                        />
                                                    </Link>
                                                    <div>
                                                        <Link 
                                                            href={`/product/${item.productId}`} 
                                                            className="block font-bold text-[0.75rem] text-foreground hover:text-orange-500 transition-colors"
                                                        >
                                                            {item.product.name[locale] || item.product.name["en"]}
                                                        </Link>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                                            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                                <span className="w-2.5 h-2.5 border border-border rounded-sm" style={{ backgroundColor: item.color.code || "white" }} />
                                                                {item.color.name[locale] || item.color.name["en"]}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">{item.dimensions.h}cm × {item.dimensions.w}cm × {item.dimensions.d}cm</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price Col */}
                                                <div className="text-center flex flex-col items-center justify-center gap-0.5">
                                                    {discountRate > 0 ? (
                                                        <>
                                                            <span className="font-bold text-[0.825rem]">
                                                                {formatPrice(activePrice)} {t("currency")}
                                                            </span>
                                                            <span className="font-bold text-muted-foreground line-through text-xs opacity-70">
                                                                {formatPrice(item.product.price)} {t("currency")}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-foreground font-bold text-[0.825rem]">
                                                            {formatPrice(item.product.price)} {t("currency")}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity Col */}
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center border border-border bg-white rounded-lg overflow-hidden">
                                                        <button 
                                                            onClick={() => updateQuantity(item, -1)} 
                                                            className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground cursor-pointer"
                                                        >
                                                            <Minus size={13} />
                                                        </button>
                                                        <span className="w-9 text-center text-xs font-semibold text-foreground">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item, 1)} 
                                                            disabled={totalOfThisProduct >= item.product.stock}
                                                            className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Total Line Price Col */}
                                                <div className="hidden md:flex items-center justify-center flex-col">
                                                    <span className="text-foreground font-bold text-[0.825rem]">
                                                        {formatPrice(lineTotal)} {t("currency")}
                                                    </span>
                                                </div>

                                                {/* Remove Col */}
                                                <button 
                                                    onClick={() => removeItem(item)} 
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>

                                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-4">
                                    <ArrowLeft size={14} />
                                    {t("continueShopping")}
                                </Link>
                            </div>
                            
                            {/* Order Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="rounded-xl border border-border p-6 sticky top-24 bg-neutral-50">
                                    <span className="block font-bold text-foreground mb-6">{t("orderSummary")}</span>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t("subtotal")} ({totalItemsCount} {totalItemsCount === 1 ? t("item") : t("items")})
                                            </span>
                                            <span className="font-medium text-foreground">{formatPrice(subtotal)} {t("currency")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("shipping")}</span>
                                            <span className="font-medium text-foreground">{t("free")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">VAT (5%)</span>
                                            <span className="font-medium text-foreground">{formatPrice(vatAmount)} {t("currency")}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border my-5" />

                                    {/* Promo Code */}
                                    <div className="flex gap-2 mb-5">
                                        <div className="flex-1 relative">
                                            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder={t("promoPlaceholder")}
                                                className="w-full bg-neutral-200/60 rounded-lg text-sm py-2.5 pl-9 pr-4 outline-none text-foreground placeholder:text-muted-foreground border border-transparent focus:border-orange-500/30 transition-colors"
                                            />
                                        </div>
                                        <button 
                                            className="px-4 py-2.5 border border-border text-xs font-semibold text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                                            onClick={() => { toast.error(t("invalidPromoCode")) }}    
                                        >
                                            {t("apply")}
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center mb-5 pt-5 border-t border-border">
                                        <span className="text-base font-heading font-bold text-foreground">{t("total")}</span>
                                        <span className="text-[1.225rem] block font-bold text-foreground">{formatPrice(finalTotal)} {t("currency")}</span>
                                    </div>

                                    <button 
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                        className="w-full py-3.5 cursor-pointer bg-orange-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isCheckingOut ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> 
                                                {t("checkoutBtn")}...
                                            </>
                                        ) : (
                                            t("checkoutBtn")
                                        )}
                                    </button>

                                    {/* Trust Signals */}
                                    <div className="grid grid-cols-3 gap-3 mt-6">
                                        {[
                                            { icon: Truck, label: t("freeShipping") },
                                            { icon: ShieldCheck, label: t("securePay") },
                                            { icon: RotateCcw, label: t("easyReturns") },
                                        ].map((signal) => (
                                            <div key={signal.label} className="flex flex-col items-center gap-1.5 text-center">
                                                <signal.icon size={16} className="text-orange-500" />
                                                <span className="text-[10px] text-muted-foreground font-medium">{signal.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </ContentWrapper>
        </section>
    )
}