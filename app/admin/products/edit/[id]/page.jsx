"use client"

import EditProduct from "@/app/components/admin/EditProduct"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { useLocale, useTranslations } from "use-intl"

export default function EditProductPage({ params }) {
    const resolvedParams = use(params)
    const productId = resolvedParams.id
    const t = useTranslations("admin")
    const locale = useLocale()

    const product = useQuery(api.products.getProducBytId, { id: productId })
    const isProductLoading = product === undefined
    const productErrpr = product === null
    
    return (
        <>
            {/* Header */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/products" className="hover:bg-orange-500/40">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    </Button>
                    <span className="text-3xl font-bold text-foreground block">{t('edit_product')}</span>
                </div>
                <p className="text-muted-foreground flex items-center gap-3">
                    {t("product_edit_subtitle", { productName: product?.name[locale] || "Unknown" })}
                </p>
            </div>

            {isProductLoading ? (
                <div className="flex items-center justify-center h-64 max-w-2xl my-8">
                    <Loader2 className="h-13 w-13 animate-spin text-orange-500" />
                </div>
            ) : (
                productErrpr ? (
                    <div className="flex items-center justify-center h-64 max-w-2xl my-8">
                        {t("product_not_found")}
                    </div>
                ) : (
                    <EditProduct 
                        product={product}
                    />
                )
            )}
        </>
    )
}