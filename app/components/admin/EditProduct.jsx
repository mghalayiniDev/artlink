"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ImagePlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import { useLocale, useTranslations } from "use-intl"

export default function EditProduct({ product }) {
    const t = useTranslations("admin")
    const locale = useLocale()

    const [name, setName] = useState(product.name.en)
    const [description, setDescription] = useState(product.description.en)
    const [selectedCategory , setSelectedCategory ] = useState(product.categoryId)
    const [price, setPrice] = useState(product.price)
    const [discount, setDiscount] = useState(product.discount)
    const [stock, setStock] = useState(product.stock)
    const [material, setMaterial] = useState(product.details.material.en)
    const [dimensions, setDimensions] = useState(product.details.standardDimensions)
    const [weight, setWeight] = useState(product.details.weight)
    const [features, setFeatures] = useState(
        product.features.map(item => item.en)
    )
    const [colors, setColors] = useState(
        product.colors.map(item => ({
            code: item.code,
            name: item.name?.en
        }))
    )

    const [previewUrl, setPreviewUrl] = useState(product.thumbnail)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)

    const categories = useQuery(api.categories.getAllCategories)
    const categorisLoading = categories === undefined

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const addFeature = () => setFeatures([...features, ""])
    const addColor = () => setColors([...colors, { code: "#000000", name: "" }])

    const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index))
    const removeColor = (index) => setColors(colors.filter((_, i) => i !== index))

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const nameHasChanged = name !== product.name.en && name !== product.name.ar
            const categoryHasChanged = selectedCategory !== product.categoryId
            const descHasChanged = description !== product.description.en && description !== product.description.ar
            const priceHasChanged = price !== product.price
            const discountHasChanged = discount !== product.discount
            const stockHasChanged = stock !== product.stock
            const materialHasChanged = material !== product.details.material.en && material !== product.details.material.ar
            const dimensionsHasChanged = dimensions !== product.details.dimensions && dimensions !== product.details.dimensions
            const weightHasChanged = weight !== product.details.weight && weight !== product.details.weight
            const featuresHasChanged = 
                features.length !== product.features.length ||
                features.some((feat, i) => feat !== product.features[i]?.en)

            const colorsHasChanged = 
                colors.length !== product.colors.length ||
                colors.some((color, i) => 
                    color.code !== product.colors[i]?.code || 
                    color.name !== product.colors[i]?.name?.en
            )

        } catch (error) {
            
        }
    }

    return (
        <form className="max-w-4xl my-8">
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
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
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
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
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
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
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
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
                            value={dimensions}
                            onChange={(e) => setDimensions(e.target.value)}
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
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
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
    )
}