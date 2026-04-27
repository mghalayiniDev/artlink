import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    dashboardStats: defineTable({
        totalUsers: v.number(),
        totalProducts: v.number(),
        totalOrders: v.number(),
        totalRevenue: v.number(),
    }),
    
    categories: defineTable({
        updatedAt: v.number(),
        searchTexts: v.string(),
        name: v.object({ en: v.string(), ar: v.string() }),
        description: v.object({ en: v.string(), ar: v.string() }),
        thumbnail: v.string(),
        slug: v.string(),
        productCount: v.optional(v.number()),
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
        slug: v.string(),
        materialKey: v.optional(v.string()),
        dimensionRange: v.optional(v.object({
            h: v.object({ min: v.number(), max: v.number() }),
            w: v.object({ min: v.number(), max: v.number() }),
            d: v.object({ min: v.number(), max: v.number() }),
        })),
        leadTimeDays: v.optional(v.number()),
        isFeatured: v.optional(v.boolean()),
    })
        .index("by_category_id", ["categoryId"])
        .index("by_price", ["price"])
        .index("by_status", ["status"])
        .index("by_category_status", ["categoryId", "status"])
        .index("by_status_material", ["status", "materialKey"])
        .index("by_category_status_material", ["categoryId", "status", "materialKey"])
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
        orders: v.array(v.id("orders")),
        orderCount: v.optional(v.number()),
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
        maxLeadTimeDays: v.optional(v.number()),
        status: v.union(
            v.literal("paid"),
            v.literal("processing"),
            v.literal("delivering"),
            v.literal("delivered"),
            v.literal("cancelled"),
            v.literal("refunded")
        ),
        refundReason: v.optional(v.string()),
        createdAt: v.number()
    })
        .index("by_user_id", ["userId"])
        .index("by_status", ["status"])
        .index("by_stripe_session_id", ["stripeSessionId"])
        .index("by_created_at", ["createdAt"]),

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

    newsletterSubscribers: defineTable({
        email:             v.string(),
        isActive:          v.boolean(),
        createdAt:         v.number(),
        unsubscribeToken:  v.optional(v.string()),
        verificationToken: v.optional(v.string()),
    })
        .index("by_email",              ["email"])
        .index("by_status",             ["isActive"])
        .index("by_token",              ["unsubscribeToken"])
        .index("by_verification_token", ["verificationToken"]),

    discountCodes: defineTable({
        code:            v.string(),
        description:     v.string(),
        type:            v.union(v.literal("percentage"), v.literal("fixed")),
        value:           v.number(),
        maxUses:         v.optional(v.number()),
        maxUsesPerUser:  v.optional(v.number()),
        minOrderAmount:  v.optional(v.number()),
        expiresAt:       v.optional(v.number()),
        isActive:        v.boolean(),
        usedCount:       v.number(),
        createdAt:       v.number(),
        createdBy:       v.string(),
    })
        .index("by_code",       ["code"])
        .index("by_active",     ["isActive"])
        .index("by_created_at", ["createdAt"]),

    discountUsages: defineTable({
        codeId:          v.id("discountCodes"),
        userId:          v.string(),
        orderId:         v.optional(v.id("orders")),   // null while pending
        stripeSessionId: v.optional(v.string()),
        discountAmount:  v.number(),
        // pending → session created but not paid yet
        // confirmed → payment succeeded
        // cancelled → session expired or abandoned
        status:          v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
        appliedAt:       v.number(),
        expiresAt:       v.optional(v.number()),        // Stripe session expiry
    })
        .index("by_code_user",   ["codeId", "userId"])
        .index("by_code",        ["codeId"])
        .index("by_order",       ["orderId"])
        .index("by_session",     ["stripeSessionId"]),

    // Tracks stock held for an active Stripe checkout session.
    // Stock is decremented immediately on reservation and restored if the session expires.
    // On payment: reservation is marked confirmed (stock stays decremented).
    stockReservations: defineTable({
        stripeSessionId: v.string(),
        productId:       v.id("products"),
        userId:          v.string(),
        quantity:        v.number(),
        expiresAt:       v.number(),
        // active    → session open, stock held
        // confirmed → payment succeeded, stock permanently deducted
        // released  → session expired/cancelled, stock returned
        status:    v.union(v.literal("active"), v.literal("confirmed"), v.literal("released")),
        createdAt: v.number(),
    })
        .index("by_session",        ["stripeSessionId"])
        .index("by_product",        ["productId"])
        .index("by_user_status",    ["userId", "status"])
        .index("by_status_expires", ["status", "expiresAt"]),

    contactSubmissions: defineTable({
        userId:    v.string(),   // identity.subject
        createdAt: v.number(),
    })
        .index("by_user",       ["userId"])
        .index("by_created_at", ["createdAt"]),

    newsletterCampaigns: defineTable({
        subject: v.string(),
        safeBody: v.string(),
        status: v.union(
            v.literal("scheduled"),
            v.literal("sending"),
            v.literal("sent"),
            v.literal("cancelled"),
        ),
        scheduledAt: v.number(),
        sentAt: v.optional(v.number()),
        recipients: v.array(v.string()),
        totalRecipients: v.number(),
        sentCount: v.number(),
        failedCount: v.number(),
        currentIndex: v.number(),
        createdAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_created_at", ["createdAt"]),
})