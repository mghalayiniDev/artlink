"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function SearchResult({ product }) {
    const locale = useLocale()
    const [isImgLoaded, setIsImgLoaded] = useState(false)

    return (
        <Link
            href={`/product/${product.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 transition-colors border-b border-foreground/10 last:border-0 gap-4"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-neutral-100">
                    {!isImgLoaded && (
                        <Skeleton className="absolute inset-0 w-full h-full" />
                    )}
                    <Image 
                        src={product.images[0]}
                        alt={product.name[locale]}
                        fill
                        sizes="48px"
                        className={`object-cover transition-opacity duration-300 ${
                            isImgLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => setIsImgLoaded(true)}
                    />
                </div>
                <span className="text-[0.8rem] font-semibold text-foreground truncate whitespace-nowrap">
                    {product.name[locale]}
                </span>
            </div>
            <div className="text-xs font-mono font-bold text-gray-600 shrink-0">
                {product.price} AED
            </div>
        </Link>
    )
}