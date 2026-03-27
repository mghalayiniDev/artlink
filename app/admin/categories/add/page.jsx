"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useAction } from "convex/react"
import { ArrowLeft, CirclePlus, ImagePlus, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"

export default function AddCategory() {
    const t = useTranslations("admin")
    const uploadAndCreate = useAction(api.upload.createCategory)
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = useRef(null)

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    // Submit Handler
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return toast.error(t("noUploadImgError"))

        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const name = formData.get("name")
        const description = formData.get("description")

        try {
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsDataURL(selectedFile)
                reader.onload = () => resolve(reader.result)
                reader.onerror = (error) => reject(error)
            })

            await uploadAndCreate({
                name,
                description,
                base64Image
            })

            toast.success(t("categoryUploadSuccess"))
            router.push("/admin/categories")
        } catch (error) {
            const message = error.data || error.message
            toast.error(message)
            console.log(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Header */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/categories" className="hover:bg-orange-500/40">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    </Button>
                    <span className="text-3xl font-bold text-foreground block">{t('add_category')}</span>
                </div>
                <p className="text-muted-foreground flex items-center gap-3">
                    {t("category_subtitle")}
                </p>
            </div>

            {/* Body */}
            <form onSubmit={onSubmit} className="max-w-3xl my-8">
                <div className="bg-card rounded-xl border border-border p-7 space-y-6">
                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                        <Label className="font-semibold">{t('thumbnail')}</Label>
                        <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                        />
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-28 h-28 rounded-lg border-2 border-dashed border-border bg-muted/50 flex 
                            items-center justify-center cursor-pointer hover:bg-muted/70 transition-all mt-4 overflow-hidden"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImagePlus className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder={t('categoriesNamePlaceholder')}
                            required
                            disabled={isLoading}
                            className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('description')}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder={t('categoriesDescriptionPlaceholder')}
                            required
                            disabled={isLoading}
                            className="mt-4.25 px-4 bg-muted/50! text-[0.8rem]! font-medium! py-3.5! resize-none h-24"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-8 px-1.5">
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="h-10.25 min-w-32 bg-orange-500 hover:bg-orange-600/90 cursor-pointer"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing...</>
                        ) : t('save')}
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        disabled={isLoading}
                        asChild
                        className="h-10.25 min-w-32 cursor-pointer"
                    >
                        <Link href="/admin/categories">{t('cancel')}</Link>
                    </Button>
                </div>
            </form>
        </>
    )
}