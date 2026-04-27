"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useAction, useQuery } from "convex/react"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

function FieldError({ msg }) {
    if (!msg) return null
    return <p className="text-rose-500 text-xs mt-1.5">{msg}</p>
}

function FormCard({ title, description, action, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
                {action}
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    )
}

export default function EditProduct({ product }) {
    const t = useTranslations("admin")
    const locale = useLocale()
    const router = useRouter()
    const updateProduct = useAction(api.upload.updateProduct)

    const [name, setName] = useState(product.name.en)
    const [description, setDescription] = useState(product.description.en)
    const [selectedCategory, setSelectedCategory] = useState(product.categoryId)
    const [price, setPrice] = useState(String(product.price))
    const [discount, setDiscount] = useState(String(product.discount))
    const [stock, setStock] = useState(String(product.stock))
    const [material, setMaterial] = useState(product.details.material.en)
    const [dimensions, setDimensions] = useState(product.details.standardDimensions)
    const [weight, setWeight] = useState(String(product.details.weight))
    const [features, setFeatures] = useState(product.features.map(item => item.en))
    const [colors, setColors] = useState(
        product.colors.map(item => ({ code: item.code, name: item.name?.en ?? "" }))
    )

    const existingRange = product.dimensionRange
    const [enableDimRange, setEnableDimRange] = useState(!!existingRange)
    const [dimRange, setDimRange] = useState({
        minH: existingRange?.h.min ?? "",
        maxH: existingRange?.h.max ?? "",
        minW: existingRange?.w.min ?? "",
        maxW: existingRange?.w.max ?? "",
        minD: existingRange?.d.min ?? "",
        maxD: existingRange?.d.max ?? "",
    })
    const [leadTimeDays, setLeadTimeDays] = useState(product.leadTimeDays ?? "")
    const [isFeatured, setIsFeatured] = useState(product.isFeatured ?? false)
    const [previewUrl, setPreviewUrl] = useState(product.thumbnail)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)

    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const categories = useQuery(api.categories.getAllCategories)
    const categoriesLoading = categories === undefined

    const validate = () => {
        const errs = {}
        if (!name.trim()) errs.name = t("fieldRequired")
        if (!selectedCategory) errs.category = t("fieldRequired")
        if (!description.trim()) errs.description = t("fieldRequired")
        const priceNum = Number(price)
        if (!price || isNaN(priceNum) || priceNum <= 0) errs.price = t("positiveNumber")
        const discountNum = Number(discount)
        if (discount === "" || isNaN(discountNum) || discountNum < 0 || discountNum > 100) errs.discount = "0–100"
        const stockNum = Number(stock)
        if (stock === "" || isNaN(stockNum) || stockNum < 0) errs.stock = t("positiveNumber")
        if (!material.trim()) errs.material = t("fieldRequired")
        if (!dimensions.trim()) errs.dimensions = t("fieldRequired")
        const weightNum = Number(weight)
        if (!weight || isNaN(weightNum) || weightNum <= 0) errs.weight = t("positiveNumber")
        const validColors = colors.filter(c => c.name.trim() !== "")
        if (validColors.length === 0) errs.colors = t("atLeastOneColorRequired")
        if (enableDimRange) {
            const vals = [dimRange.minH, dimRange.maxH, dimRange.minW, dimRange.maxW, dimRange.minD, dimRange.maxD].map(Number)
            if (vals.some(v => !isFinite(v) || v < 0)) errs.dimRange = t("invalidDimValues")
            else if (vals[0] >= vals[1] || vals[2] >= vals[3] || vals[4] >= vals[5]) errs.dimRange = t("minLessThanMax")
        }
        return errs
    }

    const touch = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        setErrors(validate())
    }

    const err = (f) => touched[f] ? errors[f] : undefined
    const inputCls = (f) =>
        `h-11 bg-gray-50 border-gray-200 focus:bg-white text-sm transition-colors ${
            touched[f] && errors[f]
                ? "border-rose-400 focus-visible:ring-rose-200"
                : "focus-visible:ring-orange-200 focus:border-orange-400"
        }`

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const allTouched = Object.fromEntries(
            ["name", "category", "description", "price", "discount", "stock",
             "material", "dimensions", "weight", "colors",
             ...(enableDimRange ? ["dimRange"] : [])].map(k => [k, true])
        )
        setTouched(allTouched)
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setIsLoading(true)
        try {
            let base64Image = undefined
            if (selectedFile) {
                base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.readAsDataURL(selectedFile)
                    reader.onload = () => resolve(reader.result)
                    reader.onerror = reject
                })
            }

            let dimensionRange = undefined
            if (enableDimRange) {
                dimensionRange = {
                    h: { min: Number(dimRange.minH), max: Number(dimRange.maxH) },
                    w: { min: Number(dimRange.minW), max: Number(dimRange.maxW) },
                    d: { min: Number(dimRange.minD), max: Number(dimRange.maxD) },
                }
            }

            const result = await updateProduct({
                id: product._id,
                name,
                description,
                ...(base64Image && { base64Image }),
                categoryId: selectedCategory,
                price: Number(price),
                discount: Number(discount),
                stock: Number(stock),
                material,
                dimensions,
                weight: Number(weight),
                features: features.filter(f => f.trim() !== ""),
                colors: colors.filter(c => c.name.trim() !== ""),
                dimensionRange,
                leadTimeDays: leadTimeDays !== "" ? Number(leadTimeDays) : undefined,
                isFeatured: isFeatured,
            })

            if (result.success) {
                toast.success(t("productUpdatedSuccess"))
                router.push("/admin/products")
            } else {
                toast.error(result.error || t("productUpdateError"))
            }
        } catch (error) {
            console.error(error)
            toast.error(t("unexpectedError"))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 mt-8 max-w-3xl">

            {/* 1. Product Image */}
            <FormCard title="Product Image" description="Main photo shown to customers in the shop">
                <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                <div className="flex items-start gap-6">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50
                        hover:border-orange-300 hover:bg-orange-50/30 flex items-center justify-center
                        cursor-pointer transition-all overflow-hidden shrink-0"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                </div>
                                <span className="text-[0.72rem] text-gray-400 leading-tight">Click to upload</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-center gap-2.5 pt-2">
                        <span className="text-sm font-medium text-gray-800">Product thumbnail</span>
                        <span className="text-xs text-gray-400 leading-relaxed">
                            PNG, JPG or WEBP • Square recommended<br />
                            Leave unchanged to keep the current photo
                        </span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium w-fit cursor-pointer
                            border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors"
                        >
                            {previewUrl ? "Change photo" : "Choose photo"}
                        </button>
                    </div>
                </div>
            </FormCard>

            {/* 2. Basic Information */}
            <FormCard title="Basic Information" description="Name, category and product description">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">{t('name')}</Label>
                        <Input
                            placeholder={t('categoriesNamePlaceholder')}
                            disabled={isLoading}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => touch('name')}
                            className={inputCls('name')}
                        />
                        <FieldError msg={err('name')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">{t('category')}</Label>
                        <Select
                            disabled={isLoading || categoriesLoading}
                            onValueChange={(v) => { setSelectedCategory(v); touch('category') }}
                            value={selectedCategory}
                        >
                            <SelectTrigger className={`h-11 bg-gray-50 border-gray-200 text-sm ${touched.category && errors.category ? "border-rose-400" : ""}`}>
                                <SelectValue placeholder={categoriesLoading ? "Loading..." : t('select_category')} />
                            </SelectTrigger>
                            <SelectContent className="max-h-52" position="popper" sideOffset={4}>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id} className="text-sm cursor-pointer">
                                        {cat.name[locale] || cat.name.en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError msg={err('category')} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{t('description')}</Label>
                    <Textarea
                        placeholder={t('categoriesDescriptionPlaceholder')}
                        disabled={isLoading}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => touch('description')}
                        className={`bg-gray-50 border-gray-200 focus:bg-white text-sm resize-none min-h-[100px] transition-colors ${
                            touched.description && errors.description
                                ? "border-rose-400 focus-visible:ring-rose-200"
                                : "focus-visible:ring-orange-200 focus:border-orange-400"
                        }`}
                    />
                    <FieldError msg={err('description')} />
                </div>
            </FormCard>

            {/* 3. Pricing & Inventory */}
            <FormCard title="Pricing & Inventory" description="Set product price, discount percentage and stock level">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { f: 'price', label: `${t('price')} (AED)`, placeholder: "0.00", type: 'number', min: '0.01', step: '0.01', val: price, set: setPrice },
                        { f: 'discount', label: `${t('discount')} (%)`, placeholder: "0", type: 'number', min: '0', max: '100', step: '1', val: discount, set: setDiscount },
                        { f: 'stock', label: t('stock'), placeholder: "0", type: 'number', min: '0', step: '1', val: stock, set: setStock },
                    ].map(({ f, label, placeholder, type, min, max, step, val, set }) => (
                        <div key={f} className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">{label}</Label>
                            <Input
                                type={type} min={min} max={max} step={step}
                                placeholder={placeholder} disabled={isLoading}
                                value={val}
                                onChange={(e) => set(e.target.value)}
                                onBlur={() => touch(f)}
                                className={inputCls(f)}
                            />
                            <FieldError msg={err(f)} />
                        </div>
                    ))}
                </div>
            </FormCard>

            {/* 4. Specifications */}
            <FormCard title="Specifications" description="Physical attributes of the product">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { f: 'material', label: t('material'), placeholder: t('productsMaterial'), val: material, set: setMaterial },
                        { f: 'dimensions', label: t('dimensions'), placeholder: t('productDimensions'), val: dimensions, set: setDimensions },
                        { f: 'weight', label: `${t('weight')} (kg)`, placeholder: "0.00", type: 'number', min: '0.01', step: '0.01', val: weight, set: setWeight },
                    ].map(({ f, label, placeholder, type, min, step, val, set }) => (
                        <div key={f} className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">{label}</Label>
                            <Input
                                type={type} min={min} step={step}
                                placeholder={placeholder} disabled={isLoading}
                                value={val}
                                onChange={(e) => set(e.target.value)}
                                onBlur={() => touch(f)}
                                className={inputCls(f)}
                            />
                            <FieldError msg={err(f)} />
                        </div>
                    ))}
                </div>
            </FormCard>

            {/* 5. Features */}
            <FormCard
                title={t('features')}
                description="Key selling points shown on the product page"
                action={
                    <button
                        type="button"
                        onClick={() => setFeatures([...features, ""])}
                        className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700
                        border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {t('add_feature')}
                    </button>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                placeholder={`${t('feature')} ${i + 1}`}
                                value={feature}
                                onChange={(e) => {
                                    const next = [...features]
                                    next[i] = e.target.value
                                    setFeatures(next)
                                }}
                                className="h-10 bg-gray-50 border-gray-200 text-sm focus-visible:ring-orange-200 focus:border-orange-400 flex-1"
                            />
                            {features.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-50
                                    text-gray-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </FormCard>

            {/* 6. Colors */}
            <FormCard
                title={t('colors')}
                description="Available color options customers can choose from"
                action={
                    <button
                        type="button"
                        onClick={() => setColors([...colors, { code: "#6366f1", name: "" }])}
                        className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700
                        border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {t('add_color')}
                    </button>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colors.map((color, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50">
                            <input
                                type="color"
                                value={color.code}
                                onChange={(e) => {
                                    const next = [...colors]
                                    next[i] = { ...next[i], code: e.target.value }
                                    setColors(next)
                                }}
                                className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
                            />
                            <Input
                                placeholder={t('color_name')}
                                value={color.name}
                                onChange={(e) => {
                                    const next = [...colors]
                                    next[i] = { ...next[i], name: e.target.value }
                                    setColors(next)
                                    if (touched.colors) setErrors(validate())
                                }}
                                className="h-9 bg-white border-gray-200 text-sm flex-1 focus-visible:ring-orange-200 focus:border-orange-400"
                            />
                            {colors.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setColors(colors.filter((_, idx) => idx !== i))}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50
                                    text-gray-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <FieldError msg={err('colors')} />
            </FormCard>

            {/* 7. Product Options */}
            <FormCard title="Product Options" description="Dimension range, lead time and visibility settings">
                {/* Dimension Range Toggle */}
                <div className="flex items-center justify-between py-1">
                    <div>
                        <span className="text-sm font-medium text-gray-800">{t('dimensionRange')}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{t('enableDimRange')}</p>
                    </div>
                    <Switch checked={enableDimRange} onCheckedChange={setEnableDimRange} disabled={isLoading} className="cursor-pointer" />
                </div>

                {enableDimRange && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { key: "minH", label: `H ${t('dimMin')}` },
                                { key: "maxH", label: `H ${t('dimMax')}` },
                                { key: "minW", label: `W ${t('dimMin')}` },
                                { key: "maxW", label: `W ${t('dimMax')}` },
                                { key: "minD", label: `D ${t('dimMin')}` },
                                { key: "maxD", label: `D ${t('dimMax')}` },
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">{label} (cm)</Label>
                                    <Input
                                        type="number" min="0" step="0.1" placeholder="0"
                                        disabled={isLoading}
                                        value={dimRange[key]}
                                        onChange={(e) => setDimRange(prev => ({ ...prev, [key]: e.target.value }))}
                                        onBlur={() => touch('dimRange')}
                                        className="h-10 bg-gray-50 border-gray-200 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <FieldError msg={err('dimRange')} />
                    </div>
                )}

                {/* Lead Time */}
                <div className="pt-4 border-t border-gray-100 space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{t('leadTimeDays')}</Label>
                    <Input
                        type="number" min="1" step="1"
                        placeholder={t('leadTimeDaysPlaceholder')}
                        disabled={isLoading}
                        value={leadTimeDays}
                        onChange={(e) => setLeadTimeDays(e.target.value)}
                        className="h-11 bg-gray-50 border-gray-200 text-sm focus-visible:ring-orange-200 focus:border-orange-400 max-w-[200px]"
                    />
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-sm font-medium text-gray-800">{t('isFeatured')}</span>
                        <p className="text-xs text-gray-400 mt-0.5">Show this product in the featured section</p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} disabled={isLoading} className="cursor-pointer" />
                </div>
            </FormCard>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <Button
                    type="submit" disabled={isLoading}
                    className="h-10 px-7 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-medium shadow-sm"
                >
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('loading')}</> : t('save')}
                </Button>
                <Button
                    type="button" variant="outline" disabled={isLoading} asChild
                    className="h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                    <Link href="/admin/products">{t('cancel')}</Link>
                </Button>
            </div>
        </form>
    )
}
