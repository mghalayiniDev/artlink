"use client"

import { useQuery } from "convex/react"
import Categories from "../components/home/Categories"
import CTA from "../components/home/CTA"
import HeroCoursel from "../components/home/HeroCoursel"
import HowItWorks from "../components/home/HowItWorks"
import ProductGallery from "../components/home/ProductGallery"
import Testimonial from "../components/home/Testimonial"
import WhyChooseUs from "../components/home/WhyChooseUs"
import { api } from "@/convex/_generated/api"

export default function Home() {
    const categories = useQuery(api.products.getLandingPageData)
    const categoriesLoading = categories === undefined
    const categoriesError = categories === null

    return (
        <>
            <HeroCoursel />
            <Categories
                categories={categories}
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
            />
            <WhyChooseUs />
            <ProductGallery 
                categories={categories}
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
            />
            <HowItWorks />
            <Testimonial />
            <CTA />
        </>
    )
}