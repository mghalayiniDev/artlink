"use client"

import { categories, products } from "@/sample"
import ProductCategoryCard from "./ProductCategoryCard"

export default function ProductGallery() {
    return (
        (categories.length > 0 && products.length) && (
            <section>
                {categories.slice(0, 4).map((category, idx) => (
                    <ProductCategoryCard 
                        category={category}
                        idx={idx}
                        key={idx}
                    />
                ))}
            </section>
        )
    )
}