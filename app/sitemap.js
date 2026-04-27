import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const BASE_URL  = process.env.HOST_URL ?? "https://artlink.ae"
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL

const STATIC_ROUTES = [
    { url: "/",        priority: 1.0,  changeFrequency: "weekly"  },
    { url: "/shop",    priority: 0.9,  changeFrequency: "daily"   },
    { url: "/about",   priority: 0.6,  changeFrequency: "monthly" },
    { url: "/contact", priority: 0.6,  changeFrequency: "monthly" },
]

export default async function sitemap() {
    const entries = STATIC_ROUTES.map(r => ({
        url:             `${BASE_URL}${r.url}`,
        lastModified:    new Date(),
        changeFrequency: r.changeFrequency,
        priority:        r.priority,
    }))

    if (!CONVEX_URL) return entries

    try {
        const client = new ConvexHttpClient(CONVEX_URL)
        const sections = await client.query(api.products.getLandingPageData)

        for (const { category, products } of sections ?? []) {
            if (category?.slug) {
                entries.push({
                    url:             `${BASE_URL}/shop?category=${category._id}`,
                    lastModified:    new Date(category.updatedAt ?? Date.now()),
                    changeFrequency: "weekly",
                    priority:        0.8,
                })
            }
            for (const product of products ?? []) {
                if (product?.slug) {
                    entries.push({
                        url:             `${BASE_URL}/product/${product._id}`,
                        lastModified:    new Date(product.updatedAt ?? Date.now()),
                        changeFrequency: "weekly",
                        priority:        0.75,
                    })
                }
            }
        }
    } catch (err) {
        console.error("[sitemap] Failed to fetch dynamic routes:", err.message)
    }

    return entries
}
