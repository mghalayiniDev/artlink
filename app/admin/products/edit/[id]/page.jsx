"use client"

import EditProduct from "@/app/components/admin/EditProduct"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { useLocale, useTranslations } from "next-intl"

export default function EditProductPage({ params }) {
    const resolvedParams = use(params)
    const productId = resolvedParams.id
    const t = useTranslations("admin")
    const locale = useLocale()

    const product = useQuery(api.admin.getProductForAdmin, { id: productId })
    const isProductLoading = product === undefined
    const productError = product === null

    return (
        <div className="max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href="/admin/products"
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                </Link>
                <div>
                    <span className="block text-xl font-bold text-gray-900">{t('edit_product')}</span>
                    <span className="block text-sm text-gray-500 mt-0.5">
                        {t("product_edit_subtitle", { productName: product?.name[locale] || "..." })}
                    </span>
                </div>
            </div>

            {isProductLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                </div>
            ) : productError ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    {t("product_not_found")}
                </div>
            ) : (
                <EditProduct product={product} />
            )}
        </div>
    )
}