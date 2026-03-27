"use client"

import ContentWrapper from "@/app/components/ContentWrapper"
import ProductCard from "@/app/components/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Check, ChevronLeft, ChevronRight, Headset, Heart, Minus, Palette, Plus, Ruler, Share2, Shield, Truck } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function ProductPage() {
    const params = useParams()
    const productId = params.id
    const router = useRouter()

    const product = useQuery(api.products.getProductById, { id: productId })
    const productLoading = product === undefined
    const productError = product === null

    const t = useTranslations("product")
    const locale = useLocale()

    const hasDiscount = product?.discount > 0
    const discountedPrice = hasDiscount 
        ? product?.price - (product?.price * (product?.discount / 100)) 
        : product?.price;


    const [zoomStyle, setZoomStyle] = useState({
        transformOrigin: "center center",
        transform: "scale(1)"
    })

    const [customHeight, setCustomHeight] = useState('')
    const [customWidth, setCustomWidth] = useState('')
    const [customDepth, setCustomDepth] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [quantity, setQuantity] = useState(1)

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        
        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100
        
        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: "scale(1.25)" 
        })
    }

    const handleMouseLeave = () => {
        setZoomStyle({
            transformOrigin: "center center",
            transform: "scale(1)"
        })
    }

    const handleShare = async () => {
        const currentUrl = window.location.href
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t("shareTitle"),
                    url: currentUrl,
                })
            } catch (error) {
                console.log('Sharing failed', error)
            }
        } else {
            navigator.clipboard.writeText(currentUrl)
            alert(`✅ ${shareSuccess}`)
        }
    }

    const handleSupportClick = () => {
        const phoneNumber = "971554667720" 
        const currentUrl = window.location.href
        const baseMessage = t("supportMsg", { productName: product.name[locale] || product.name["en"] })
        const finalMessage = `${baseMessage}\n\nLink: ${currentUrl}`
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`
        
        window.open(whatsappUrl, "_blank")
    }

    return (
        <section className="min-h-[60vh] py-12">
            <ContentWrapper>
                {productLoading ? (
                    <main className="flex flex-col gap-8">
                        <span className="w-32 h-5.5 block bg-neutral-100"></span>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="w-full aspect-square bg-neutral-100 max-h-125" />
                            <div className="flex flex-col gap-5">
                                <span className="w-36 h-6 block bg-neutral-100"></span>
                                <span className="w-90 h-9 block bg-neutral-100"></span>
                                <span className="w-45 h-6 block bg-neutral-100"></span>
                                <span className="w-full h-14 block bg-neutral-100"></span>
                                <span className="w-full h-0.5 block bg-neutral-100 my-1"></span>
                                <span className="w-38 h-6 block bg-neutral-100"></span>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex flex-col gap-4">
                                            <span className="w-20 h-5 block bg-neutral-100"></span>
                                            <span className="w-full h-10 block bg-neutral-100"></span>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex flex-col gap-4">
                                            <span className="w-20 h-5 block bg-neutral-100"></span>
                                            <span className="w-full h-10 block bg-neutral-100"></span>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i}>
                                            <span className="w-full h-13 block bg-neutral-100"></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                ) : (
                    ((productError || !product) ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center min-h-[50vh]">
                            <span className="text-[1.75rem] font-extrabold uppercase tracking-tight block mb-2">
                                {t("product_not_found")}
                            </span>
                            <p className="text-muted-foreground text-[0.9rem] max-w-md">
                                {t("product_not_found_desc")}
                            </p>
                            <Link 
                                href="/shop"
                                className="mt-6 text-[0.9rem] font-bold underline underline-offset-4 cursor-pointer hover:text-orange-500 transition-colors"
                            >
                                {t("return_to_shop")}
                            </Link>
                        </div>
                    ) : (
                        <main className="flex flex-col gap-8">
                            {/* Breadcrumb */}
                            <div>
                                <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Link href="/" className="hover:text-foreground transition-colors">
                                        {t("home")}
                                    </Link>
                                    <ChevronRight size={12} />
                                    <Link href="/shop" className="hover:text-foreground transition-colors">
                                        {t("shop")}
                                    </Link>
                                    <ChevronRight size={12} />
                                    <Link href={`/shop?category=${product.categoryDetails._id}`} className="hover:text-foreground transition-colors cursor-pointer">
                                        {product.categoryDetails.name[locale] || product.categoryDetails.name["en"]}
                                    </Link>
                                    <ChevronRight size={12} />
                                    <span className="text-foreground font-medium">{product.name[locale] || product.name["en"]}</span>
                                </nav>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                                {/* Interactive Image Container */}
                                <div 
                                    className="w-full aspect-square bg-neutral-100 overflow-hidden cursor-zoom-in max-h-140 lg:sticky lg:top-10"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <img 
                                        src={product.thumbnail}
                                        alt={product.name[locale] || product.name['en']}
                                        className="w-full h-full object-cover transition-transform duration-100 ease-out pointer-events-none"
                                        style={zoomStyle}
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <span className="text-orange-500 font-mono text-sm tracking-widest uppercase block">
                                        {product.categoryDetails.name[locale] || product.categoryDetails.name['en']}
                                    </span>
                                    <span className="font-extrabold uppercase text-3xl md:text-4xl text-foreground block">
                                        {product.name[locale] || product.name['en']}
                                    </span>
                                    <div className="flex gap-4 mt-1 items-center flex-wrap">
                                        <button 
                                            className="inline-flex items-center gap-2 text-xs text-muted-foreground 
                                            hover:text-foreground transition-colors self-start cursor-pointer"
                                            onClick={handleShare}
                                        >
                                            <Share2 size={13} /> {t("share")}
                                        </button>
                                        <div className="w-px h-3 bg-gray-100" />
                                        <button 
                                            className="inline-flex items-center gap-2 text-xs text-muted-foreground 
                                            hover:text-foreground transition-colors self-start cursor-pointer"
                                            onClick={handleSupportClick}
                                        >
                                            <Headset size={13} /> {t("support")}
                                        </button>
                                    </div>

                                    {/* Price */}
                                    {hasDiscount ? (
                                        <div className="flex items-baseline gap-3 mt-2.5">
                                            <span className="font-heading font-bold text-2xl text-foreground block">
                                                {discountedPrice.toLocaleString()}{t("aed")}
                                            </span>
                                            <span className="text-muted-foreground line-through text-lg block">
                                                {product.price.toLocaleString()} {t("aed")}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="font-heading font-bold text-2xl text-foreground block mt-2.5">
                                            {product.price.toLocaleString()} {t("aed")}
                                        </span>
                                    )}

                                    {/* Description */}
                                    <p className="text-muted-foreground leading-relaxed">
                                        {product.description[locale] || product.description['en']}
                                    </p>

                                    {/* Custom Dimensions Section */}
                                    <div className="border-t border-foreground/10 pt-6 space-y-5 mt-3">
                                        <span className="span font-bold uppercase text-sm tracking-wide text-foreground">
                                            {t('customDimensions')}
                                        </span>

                                        <div className="grid md:grid-cols-3 gap-5 mt-7">
                                            <div className="space-y-2">
                                                <Label htmlFor="height" className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    {t('height')} ({t("cm")})
                                                </Label>
                                                <Input
                                                    id="height"
                                                    type="number"
                                                    placeholder="213"
                                                    value={customHeight}
                                                    onChange={(e) => setCustomHeight(e.target.value)}
                                                    className="border-foreground/20 rounded-none py-4.5"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="width" className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    {t('width')} ({t("cm")})
                                                </Label>
                                                <Input
                                                    id="width"
                                                    type="number"
                                                    placeholder="91"
                                                    value={customWidth}
                                                    onChange={(e) => setCustomWidth(e.target.value)}
                                                    className="border-foreground/20 rounded-none py-4.5"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="depth" className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    {t('depth')} ({t("cm")})
                                                </Label>
                                                <Input
                                                    id="depth"
                                                    type="number"
                                                    placeholder="4.5"
                                                    value={customDepth}
                                                    onChange={(e) => setCustomDepth(e.target.value)}
                                                    className="border-foreground/20 rounded-none py-4.5"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-7">
                                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                {t('color')}
                                            </Label>
                                            <Select value={selectedColor} onValueChange={setSelectedColor}>
                                                <SelectTrigger className="border-foreground/20 rounded-none w-full cursor-pointer py-4.5">
                                                    <SelectValue placeholder={t('selectColor')} />
                                                </SelectTrigger>
                                                <SelectContent position="popper" sideOffset={8}>
                                                    {product?.colors?.map((color, idx) => (
                                                        <SelectItem 
                                                            key={idx} 
                                                            value={color} 
                                                            className="cursor-pointer flex items-center text-[0.825rem] font-medium"
                                                        >
                                                            <div className="w-3 h-3 mr-1" style={{ backgroundColor: color.code }} />
                                                            {color.name[locale] || color.name['en']}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Quantity & Add to Cart */}
                                    <div className="border-t border-foreground/10 pt-6 mt-4">
                                        <div className="flex flex-row items-center gap-3.5">
                                            <span className="text-xs uppercase tracking-wide text-muted-foreground hidden md:block mr-1">
                                                {t('qty')}
                                            </span>
                                            <div className="flex items-center border border-foreground/20 w-fit h-11">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="p-3 h-full hover:bg-neutral-100 transition-colors cursor-pointer flex items-center justify-center"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-12 text-center font-mono text-sm">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                    disabled={quantity >= product.stock} 
                                                    className="p-3 h-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <Button 
                                                className="flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90 
                                                uppercase tracking-wide font-bold h-11! w-full text-[0.825rem] cursor-pointer border border-black"
                                            >
                                                {t('addToCart')}
                                            </Button>
                                            <Button 
                                                className="group rounded-none bg-neutral-100 text-background hover:bg-neutral-200 h-11! cursor-pointer border"
                                            >
                                                <Heart width={22} height={22} className="text-black" />
                                            </Button>
                                        </div>
                                        
                                    </div>

                                    {/* Tabs: Details & Features */}
                                    <div className="border-t border-foreground/10 pt-6.5 mt-3">
                                        <Tabs defaultValue="details" className="w-full">
                                            <TabsList className="bg-transparent border-b border-foreground/10 w-full justify-start gap-6 rounded-none p-0 h-auto">
                                                <TabsTrigger
                                                    value="details" 
                                                    className="rounded-none px-0 text-sm font-bold uppercase tracking-wide cursor-pointer
                                                    border-b-2 border-transparent border-x-0 border-t-0 shadow-none! mt-1 pb-4 max-w-30
                                                    data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                                >
                                                    {t('details')}
                                                </TabsTrigger>
                                                
                                                <TabsTrigger 
                                                    value="features" 
                                                    className="rounded-none px-0 text-sm font-bold uppercase tracking-wide cursor-pointer
                                                    border-b-2 border-transparent border-x-0 border-t-0 shadow-none! mt-1 pb-4 max-w-30
                                                    data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                                >
                                                    {t('features')}
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="details" className="mt-6">
                                                <div className="space-y-3">
                                                    <div className="flex flex-col gap-3 md:flex-row md:justify-between py-2 border-b border-foreground/5">
                                                        <span className="text-muted-foreground text-[0.8rem] font-medium">{t('material')}</span>
                                                        <span className="text-foreground text-[0.8rem]">{product.details.material[locale] || product.details.material["en"]}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-3 md:flex-row md:justify-between py-2 border-b border-foreground/5">
                                                        <span className="text-muted-foreground text-[0.8rem] font-medium">{t('standardDimensions')}</span>
                                                        <span className="text-foreground text-[0.8rem]">{product.details.standardDimensions}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-3 md:flex-row md:justify-between py-2 border-b border-foreground/5">
                                                        <span className="text-muted-foreground text-[0.8rem] font-medium">{t('weight')}</span>
                                                        <span className="text-foreground text-[0.8rem]">{product.details.weight}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-3 md:flex-row md:justify-between py-2 border-b border-foreground/5">
                                                        <span className="text-muted-foreground text-[0.8rem] font-medium">{t('category')}</span>
                                                        <span className="text-foreground text-[0.8rem]">{product.categoryDetails.name[locale] || product.categoryDetails.name["en"]}</span>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="features" className="mt-6">
                                                <ul className="space-y-4">
                                                    {product?.features?.map((feature, index) => (
                                                        <li key={index} className="flex items-center gap-3">
                                                            <Check className="w-4 h-4 text-orange-500" />
                                                            <span className="text-foreground text-[0.825rem]">{feature[locale] || feature["en"]}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            </div>

                            {/* Promotional Banner */}
                            <section className="mt-24 mb-21">
                                <div className="relative overflow-hidden bg-foreground ">
                                    <div className="relative py-14 px-8 md:px-16">
                                        {/* Title */}
                                        <div className="text-center mb-10">
                                            <span className="inline-block text-orange-500 font-mono text-xs tracking-[0.3em] uppercase mb-3">
                                                {t('whyChooseTag')}
                                            </span>
                                            <span className="block font-extrabold uppercase text-2xl md:text-3xl text-background">
                                                {t('whyChooseTitle')}
                                            </span>
                                        </div>

                                        {/* Features Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                            <div className="text-center">
                                                <div className="w-12 h-12 mx-auto mb-4 border border-background/20 flex items-center justify-center">
                                                    <Ruler className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <span className="block font-bold uppercase text-sm text-background mb-1">
                                                    {t('feature1Title')}
                                                </span>
                                                <p className="text-background/60 text-xs">
                                                    {t('feature1Desc')}
                                                </p>
                                            </div>
                                            
                                            <div className="text-center">
                                                <div className="w-12 h-12 mx-auto mb-4 border border-background/20 flex items-center justify-center">
                                                    <Palette className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <span className="block font-bold uppercase text-sm text-background mb-1">
                                                    {t('feature2Title')}
                                                </span>
                                                <p className="text-background/60 text-xs">
                                                    {t('feature2Desc')}
                                                </p>
                                            </div>
                                            
                                            <div className="text-center">
                                                <div className="w-12 h-12 mx-auto mb-4 border border-background/20 flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <span className="block font-bold uppercase text-sm text-background mb-1">
                                                    {t('feature3Title')}
                                                </span>
                                                <p className="text-background/60 text-xs">
                                                    {t('feature3Desc')}
                                                </p>
                                            </div>
                                            
                                            <div className="text-center">
                                                <div className="w-12 h-12 mx-auto mb-4 border border-background/20 flex items-center justify-center">
                                                    <Truck className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <span className="block font-bold uppercase text-sm text-background mb-1">
                                                    {t('feature4Title')}
                                                </span>
                                                <p className="text-background/60 text-xs">
                                                    {t('feature4Desc')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Decorative Corner Elements */}
                                        <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-background/20" />
                                        <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-background/20" />
                                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-background/20" />
                                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-background/20" />
                                    </div>
                                </div>
                            </section>

                            {/* Related Products */}
                            {product.relatedProducts.length > 0 && (
                                <div className="mb-18">
                                    <span className="block font-extrabold uppercase text-2xl md:text-3xl text-foreground mb-18">
                                        {t('youMightLike')}
                                    </span>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {product.relatedProducts.map((product, pIdx) => (
                                            <ProductCard
                                                key={product._id} 
                                                product={product}
                                                idx={pIdx} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </main>
                    ))
                )} 
            </ContentWrapper> 
        </section>
    )
}