"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useAction } from "convex/react"
import { Loader2, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"

function FieldError({ msg }) {
    if (!msg) return null
    return <p className="text-rose-500 text-xs mt-1.5">{msg}</p>
}

function FormCard({ title, description, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    )
}

export default function EditCategory({ category }) {
    const t = useTranslations("admin")
    const updateCategory = useAction(api.upload.updateCategory)
    const router = useRouter()

    const [name, setName] = useState(category.name.en)
    const [description, setDescription] = useState(category.description.en)
    const [previewUrl, setPreviewUrl] = useState(category.thumbnail)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const fileInputRef = useRef(null)

    const validate = ({ n = name, d = description } = {}) => {
        const errs = {}
        if (!n.trim()) errs.name = t("fieldRequired")
        if (!d.trim()) errs.description = t("fieldRequired")
        return errs
    }

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        setErrors(validate())
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setTouched({ name: true, description: true })
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setIsLoading(true)
        try {
            const nameHasChanged = name !== category.name.en && name !== category.name.ar
            const descHasChanged = description !== category.description.en && description !== category.description.ar
            let base64Image = undefined
            if (selectedFile) {
                base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.readAsDataURL(selectedFile)
                    reader.onload = () => resolve(reader.result)
                    reader.onerror = reject
                })
            }
            const result = await updateCategory({
                id: category._id,
                name: nameHasChanged ? name : undefined,
                description: descHasChanged ? description : undefined,
                base64Image,
            })
            if (!result.success) toast.error(result.error || "Failed to update category")
            else {
                toast.success(t("categoryUpdateSuccess"))
                router.push("/admin/categories")
            }
        } catch (error) {
            toast.error(error?.message || String(error))
        } finally {
            setIsLoading(false)
        }
    }

    const err = (field) => touched[field] ? errors[field] : undefined
    const inputCls = (field) =>
        `h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-sm ${
            touched[field] && errors[field]
                ? "border-rose-400 focus-visible:ring-rose-200"
                : "focus-visible:ring-orange-200 focus:border-orange-400"
        }`

    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-5 mt-8">
            {/* Thumbnail */}
            <FormCard title={t('thumbnail')} description="Category thumbnail displayed in the shop">
                <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                <div className="flex items-start gap-5">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50
                        hover:border-orange-300 hover:bg-orange-50/30 flex items-center justify-center cursor-pointer
                        transition-all overflow-hidden shrink-0"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-400">Upload</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                        <span className="text-sm font-medium text-gray-700">Category image</span>
                        <span className="text-xs text-gray-400 leading-relaxed">
                            Square images work best.<br />Accepted: PNG, JPG, WEBP
                        </span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 cursor-pointer w-fit"
                        >
                            {previewUrl ? "Change image" : "Upload image"}
                        </button>
                    </div>
                </div>
            </FormCard>

            {/* Basic info */}
            <FormCard title="Basic Information" description="Category name and description">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{t('name')}</Label>
                    <Input
                        placeholder={t('categoriesNamePlaceholder')}
                        disabled={isLoading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={inputCls('name')}
                    />
                    <FieldError msg={err('name')} />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{t('description')}</Label>
                    <Textarea
                        placeholder={t('categoriesDescriptionPlaceholder')}
                        disabled={isLoading}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => handleBlur('description')}
                        className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors text-sm resize-none min-h-[100px] ${
                            touched.description && errors.description
                                ? "border-rose-400 focus-visible:ring-rose-200"
                                : "focus-visible:ring-orange-200 focus:border-orange-400"
                        }`}
                    />
                    <FieldError msg={err('description')} />
                </div>
            </FormCard>

            <div className="flex items-center gap-3 pt-1">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-6 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-medium shadow-sm"
                >
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('loading')}</> : t('save')}
                </Button>
                <Button
                    type="button" variant="outline" disabled={isLoading} asChild
                    className="h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                    <Link href="/admin/categories">{t('cancel')}</Link>
                </Button>
            </div>
        </form>
    )
}
