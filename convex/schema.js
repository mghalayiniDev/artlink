import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    categories: defineTable({
        updatedAt: v.number(),
        searchTexts: v.string(),
        name: v.object({ en: v.string(), ar: v.string() }),
        description: v.object({ en: v.string(), ar: v.string() }),
        thumbnail: v.string(), 
        slug: v.string(),
    })
        .index("by_slug", ["slug"])
        .searchIndex("search_all", {
            searchField: "searchTexts"
        }),

    products: defineTable({
        categoryId: v.id("categories"),
        updatedAt: v.number(),
        thumbnail: v.string(),
        name: v.object({ en: v.string(), ar: v.string() }),
        description: v.object({ en: v.string(), ar: v.string() }),
        price: v.number(), 
        discount: v.number(), 
        stock: v.number(),
        status: v.union(v.literal("active"), v.literal("draft")),
        details: v.object({
            material: v.object({ en: v.string(), ar: v.string() }),
            standardDimensions: v.string(),
            weight: v.number()
        }),
        searchTexts: v.string(),
        features: v.array(v.object({ en: v.string(), ar: v.string() })),
        colors: v.array(
            v.object({
                code: v.string(),
                name: v.object({ en: v.string(), ar: v.string() })
            })
        ),
        slug: v.string()
    })
        .index("by_category_id", ["categoryId"])
        .index("by_price", ["price"])
        .index("by_status", ["status"])
        .index("by_category_status", ["categoryId", "status"])
        .searchIndex("search_all", {
            searchField: "searchTexts"
        }),

    users: defineTable({
        userId: v.string(), 
        name: v.string(),
        role: v.union(v.literal("user"), v.literal("admin")),
        email: v.string(),
        likedProducts: v.array(v.id("products")),
        imageURL: v.string(),
        orders: v.array(
            v.id("orders")
        ),
        cart: v.array(
            v.object({
                productId: v.id("products"),
                quantity: v.number(),
                color: v.object({
                    code: v.string(),
                    name: v.object({ 
                        en: v.string(), 
                        ar: v.string() 
                    })
                }),
                dimensions: v.object({ 
                    h: v.number(), 
                    w: v.number(), 
                    d: v.number() 
                })
            })
        )
    })
        .index("by_user_id", ["userId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .searchIndex("search_all", {
            searchField: "email",
            filterFields: ["role"]
        }),

    orders: defineTable({
        userId: v.id("users"),
        products: v.array(
            v.object({
                productId: v.id("products"),
                nameAtPurchase: v.object({ en: v.string(), ar: v.string() }),
                priceAtPurchase: v.number(),
                imageAtPurchase: v.string(),
                quantity: v.number(),
                color: v.object({
                    name: v.object({ en: v.string(), ar: v.string() }),
                    code: v.string() 
                }),
                dimensions: v.object({ 
                    h: v.number(), 
                    w: v.number(), 
                    d: v.number() 
                })
            })
        ),
        shippingAddress: v.object({
            city: v.optional(v.string()),
            country: v.optional(v.string()),
            line1: v.optional(v.string()),
            line2: v.optional(v.string()),
            postal_code: v.optional(v.string()),
        }),
        phone: v.optional(v.string()),
        paymentMethod: v.string(), 
        cardLast4: v.optional(v.string()),
        invoiceUrl: v.optional(v.string()),
        vat: v.number(),
        totalAmount: v.number(),
        trackingNumber: v.optional(v.string()),
        stripeSessionId: v.optional(v.string()),
        discountAmount: v.optional(v.number()), 
        promoCodeText: v.optional(v.string()),
        status: v.union(
            v.literal("paid"),  
            v.literal("processing"),
            v.literal("shipped"),   
            v.literal("delivered"),  
            v.literal("cancelled"), 
            v.literal("refunded")   
        ),
        createdAt: v.number()
    })
        .index("by_user_id", ["userId"])
        .index("by_status", ["status"])
        .index("by_stripe_session_id", ["stripeSessionId"]),

    notifications: defineTable({
        userId: v.string(),
        title: v.object({ en: v.string(), ar: v.string() }),
        body: v.object({ en: v.string(), ar: v.string() }),
        type: v.union(
            v.literal("order_status"), 
            v.literal("promotion"), 
            v.literal("alert"),
            v.literal("inventory")
        ),
        createdAt: v.number(),
        searchTexts: v.string(),
    })
        .index("by_user_id", ["userId"])
        .index("by_type_and_created", ["type", "createdAt"]) 
        .index("by_created_at", ["createdAt"])
        .searchIndex("search_all", {
            searchField: "searchTexts",
            filterFields: ["type"]
        }),
})