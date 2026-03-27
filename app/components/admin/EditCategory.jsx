"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useAction } from "convex/react"
import { ImagePlus, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"

export default function EditCategory({ category }) {
    const t = useTranslations("admin")
    const updateCategory = useAction(api.upload.updateCategory)
    const router = useRouter()
    
    const [name, setName] = useState(category.name.en)
    const [description, setDescription] = useState(category.description.en)
    const [previewUrl, setPreviewUrl] = useState(category.thumbnail)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
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
                    reader.onerror = (error) => reject(error)
                })
            }

            const result = await updateCategory({
                id: category._id,
                name: nameHasChanged ? name : undefined,
                description: descHasChanged ? description : undefined,
                base64Image: base64Image
            })

            if (!result.success) {
                toast.error(result.error || "Failed to update category")
            } else {
                toast.success(t("categoryUpdateSuccess"))   
                router.push("/admin/categories")
            }
        } catch (error) {
            toast.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
    )
}