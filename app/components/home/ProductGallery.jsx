"use client"

import ProductCategoryCard from "./ProductCategoryCard"

export default function ProductGallery({ categories, categoriesLoading, categoriesError }) {
    if (categoriesLoading) return null
    if (categoriesError || categories?.length === 0) return null

    const validPairs = categories.filter(item => {
        return item.products && item.products.length >= 2
    })

    if (validPairs.length < 2) return null 

    return (
        <section>
            {validPairs.slice(0, 4).map((item, idx) => (
                <ProductCategoryCard 
                    key={item.category._id} 
                    idx={idx}
                    category={item.category}
                    products={item.products}
                    length={validPairs.length}
                />
            ))}
        </section>
    )
}