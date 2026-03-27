"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useAction, useQuery } from "convex/react"
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AddProduct() {
    const t = useTranslations("admin")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("")
    const [features, setFeatures] = useState([""])
    const [colors, setColors] = useState([{ code: "#000000", name: "" }])
    const [previewUrl, setPreviewUrl] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = useRef(null)

    const createProduct = useAction(api.upload.createProduct)

    const addFeature = () => setFeatures([...features, ""])
    const addColor = () => setColors([...colors, { code: "#000000", name: "" }])

    const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index))
    const removeColor = (index) => setColors(colors.filter((_, i) => i !== index))

    const locale = useLocale()
    const router = useRouter()

    const categories = useQuery(api.categories.getAllCategories)
    const categorisLoading = categories === undefined

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedFile) return toast.error(t("noUploadImgError"))
        if (!selectedCategory) return toast.error(t("selectCategoryError"))

        setIsLoading(true)
        
        try {
            const formData = new FormData(e.currentTarget)
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsDataURL(selectedFile)
                reader.onload = () => resolve(reader.result)
                reader.onerror = (error) => reject(error)
            })

            const result = await createProduct({
                name: formData.get("name"),
                description: formData.get("description"),
                base64Image,
                categoryId: selectedCategory,
                price: Number(formData.get("price")),
                discount: Number(formData.get("discount")),
                stock: Number(formData.get("stock")),
                material: formData.get("material"),
                dimensions: formData.get("dimensions"),
                weight: Number(formData.get("weight")),
                features: features.filter(f => f.trim() !== ""),
                colors: colors.filter(c => c.name.trim() !== ""),
            })

            if (result.success) {
                toast.success(t("productCreatedSuccess"))
                router.push("/admin/products")
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error(t("unexpectedError"))
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
                        <Link href="/admin/products" className="hover:bg-orange-500/40">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    </Button>
                    <span className="text-3xl font-bold text-foreground block">{t('add_product')}</span>
                </div>
                <p className="text-muted-foreground flex items-center gap-3">
                    {t("product_subtitle")}
                </p>
            </div>

            {/* Body */}
            <form className="max-w-4xl my-8" onSubmit={handleSubmit}>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                        <div>
                            <Label htmlFor="category">{t('category')}</Label>
                            <Select
                                disabled={isLoading || categorisLoading} 
                                onValueChange={setSelectedCategory}
                                value={selectedCategory}
                                id="category"
                            >
                                <SelectTrigger className="h-11! mt-4 w-full px-4 bg-muted/50! text-[0.8rem]! font-medium! border-border! cursor-pointer">
                                    <SelectValue placeholder={categorisLoading ? "..." : t('select_category')} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border max-h-40 overflow-y-auto" position="popper" sideOffset={4} >
                                    {categories?.map((category) => (
                                        <SelectItem 
                                            key={category._id} 
                                            value={category._id}
                                            className="cursor-pointer text-[0.8rem] font-medium"
                                        >
                                            {category.name[locale] || category.name.en}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price">{t('price')}</Label>
                            <Input
                                id="price"
                                name="price" 
                                placeholder={t('productsPrice')}
                                required
                                disabled={isLoading}
                                className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount">{t('discount')}</Label>
                            <Input
                                id="discount"
                                name="discount" 
                                placeholder={t('productsDiscount')}
                                required
                                disabled={isLoading}
                                className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">{t('stock')}</Label>
                            <Input
                                id="stock"
                                name="stock" 
                                placeholder={t('productStock')}
                                required
                                disabled={isLoading}
                                className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="material">{t('material')}</Label>
                            <Input
                                id="material"
                                name="material" 
                                placeholder={t('productsMaterial')}
                                required
                                disabled={isLoading}
                                className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dimensions">{t('dimensions')}</Label>
                            <Input
                                id="dimensions"
                                name="dimensions" 
                                placeholder={t('productDimensions')}
                                required
                                disabled={isLoading}
                                className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">{t('weight')}</Label>
                            <Input
                                id="weight"
                                name="weight" 
                                placeholder={t('productWeight')}
                                required
                                disabled={isLoading}
                                className="h-11! mt-2.25 px-4 bg-muted/50! text-[0.8rem]! font-medium!"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-foreground/70">{t('features')}</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addFeature} className="text-orange-500 hover:text-orange-600 cursor-pointer">
                                + {t('add_feature')}
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input 
                                        placeholder={`${t('feature')} ${index + 1}`}
                                        value={feature}
                                        onChange={(e) => {
                                            const newFeatures = [...features];
                                            newFeatures[index] = e.target.value;
                                            setFeatures(newFeatures);
                                        }}
                                        className="h-10 bg-muted/30!"
                                    />
                                    {features.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="cursor-pointer" onClick={() => removeFeature(index)}>
                                            <span className="text-destructive">×</span>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-foreground/70">{t('colors')}</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addColor} className="text-orange-500 hover:text-orange-600 cursor-pointer">
                                + {t('add_color')}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {colors.map((color, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                                    <Input 
                                        type="color" 
                                        value={color.code}
                                        onChange={(e) => {
                                            const newColors = [...colors];
                                            newColors[index].code = e.target.value;
                                            setColors(newColors);
                                        }}
                                        className="w-12 h-10 p-1 bg-transparent border-none cursor-pointer"
                                    />
                                    <Input 
                                        placeholder={t('color_name')}
                                        value={color.name}
                                        onChange={(e) => {
                                            const newColors = [...colors];
                                            newColors[index].name = e.target.value;
                                            setColors(newColors);
                                        }}
                                        className="h-9 bg-background!"
                                    />
                                    {colors.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="cursor-pointer" onClick={() => removeColor(index)}>
                                            <span className="text-destructive text-lg">×</span>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
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