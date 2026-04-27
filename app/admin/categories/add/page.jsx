"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useAction } from "convex/react"
import { ArrowLeft, ImagePlus, Loader2, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"

function FieldError({ msg }) {
    if (!msg) return null
    return <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">{msg}</p>
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

export default function AddCategory() {
    const t = useTranslations("admin")
    const uploadAndCreate = useAction(api.upload.createCategory)
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const fileInputRef = useRef(null)

    const validate = ({ n = name, d = description, file = selectedFile } = {}) => {
        const errs = {}
        if (!file) errs.thumbnail = t("noUploadImgError")
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
        setErrors(prev => { const n = { ...prev }; delete n.thumbnail; return n })
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setTouched({ thumbnail: true, name: true, description: true })
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setIsLoading(true)
        try {
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsDataURL(selectedFile)
                reader.onload = () => resolve(reader.result)
                reader.onerror = reject
            })
            const result = await uploadAndCreate({ name, description, base64Image })
            if (!result.success) {
                toast.error(result.error || t("categoryInternalError"))
                return
            }
            toast.success(t("categoryUploadSuccess"))
            router.push("/admin/categories")
        } catch (error) {
            toast.error(error?.data || error?.message)
        } finally {
            setIsLoading(false)
        }
    }

    const err = (field) => touched[field] ? errors[field] : undefined
    const inputCls = (field) =>
        `h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-sm ${
            touched[field] && errors[field] ? "border-rose-400 focus-visible:ring-rose-200" : "focus-visible:ring-orange-200 focus:border-orange-400"
        }`

    return (
        <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href="/admin/categories"
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                </Link>
                <div>
                    <span className="block text-xl font-bold text-gray-900">{t('add_category')}</span>
                    <span className="block text-sm text-gray-500 mt-0.5">{t("category_subtitle")}</span>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">

                {/* Thumbnail card */}
                <FormCard title={t('thumbnail')} description="Upload a representative image for this category">
                    <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />

                    <div className="flex items-start gap-5">
                        {/* Upload zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer
                            transition-all overflow-hidden shrink-0
                            ${previewUrl
                                ? "w-32 h-32 border-transparent"
                                : `w-32 h-32 ${err('thumbnail') ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/30"}`
                            }`}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 p-3 text-center">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${err('thumbnail') ? "bg-rose-100" : "bg-gray-100"}`}>
                                        <Upload className={`w-5 h-5 ${err('thumbnail') ? "text-rose-400" : "text-gray-400"}`} />
                                    </div>
                                    <span className="text-xs text-gray-400 leading-tight">Click to upload</span>
                                </div>
                            )}
                        </div>

                        {/* Hint */}
                        <div className="flex flex-col gap-2 pt-1">
                            <span className="text-sm text-gray-700 font-medium">Category thumbnail</span>
                            <span className="text-xs text-gray-400 leading-relaxed">
                                This image represents the category<br />in the shop. Use a square image<br />for best results.
                            </span>
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 cursor-pointer w-fit"
                                >
                                    Change image
                                </button>
                            )}
                            <FieldError msg={err('thumbnail')} />
                        </div>
                    </div>
                </FormCard>

                {/* Basic info card */}
                <FormCard title="Basic Information" description="Name and description shown to customers">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">{t('name')}</Label>
                        <Input
                            id="name"
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
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">{t('description')}</Label>
                        <Textarea
                            id="description"
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

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-10 px-6 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-medium shadow-sm"
                    >
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('loading')}</> : t('save')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        asChild
                        className="h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        <Link href="/admin/categories">{t('cancel')}</Link>
                    </Button>
                </div>
            </form>
        </div>
    )
}
