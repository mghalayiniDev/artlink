"use node"

import { v } from "convex/values"
import { action } from "./_generated/server"
import RateLimiter from "@convex-dev/rate-limiter"
import { components, internal } from "./_generated/api"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { v2 as cloudinary } from "cloudinary"

const rateLimiter = new RateLimiter(components.rateLimiter, {
    createCategory: { 
        kind: "token bucket",
        rate: 1,  
        period: 100000,   
        capacity: 2         
    },
    updateCategory: {
        kind: "token bucket",
        rate: 1,  
        period: 100000,   
        capacity: 2       
    },
    createProduct: {
        kind: "token bucket",
        rate: 1,  
        period: 100000,   
        capacity: 2       
    }
})

function extractJSON(text) {
    try {
        const cleaned = text.replace(/```json|```/g, "").trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) {
            return parsed[0]
        }
        return parsed
    } catch (e) {
        console.error("Failed to parse AI response:", text)
        throw new Error("The AI response was not valid JSON.")
    }
}

export const createCategory = action({
    args: {
        name: v.string(),
        description: v.string(),
        base64Image: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            // --- 1. PRE-FLIGHT CHECKS ---
            const identity = await ctx.auth.getUserIdentity()
            if (!identity) return { success: false, error: "You must be logged in" }

            // 2. RATE LIMIT CHECK
            const status = await rateLimiter.limit(ctx, "createCategory", { 
                key: identity.subject 
            })

            if (!status.ok) {
                return { success: false, message: "Too many requests. Please wait a moment." }
            }

            // 3. ADMIN CHECK
            const isAdmin = await ctx.runQuery(internal.users.isAdmin, { userId: identity.subject })
            if (!isAdmin) return { success: false, error: "Unauthorized: Admin access required" }

            const { name, description, base64Image } = args
            if (name.trim().length < 2) return { success: false, error: "Name is too short" }
            if (description.trim().length < 20) return { success: false, error: "Description needs more detail" }
            if (!base64Image.startsWith("data:image")) return { success: false, error: "Invalid image format" }
            
            // FIXED: Added size check to prevent massive payloads from crashing the server
            if (base64Image.length > 7000000) return { success: false, error: "Image is too large (Max 5MB)" }

            let translations
            const apiKey = process.env.GEMENI_API_KEY
            if (!apiKey) throw new Error("Internal Server Error: AI Config missing")

            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-lite",
                generationConfig: { responseMimeType: "application/json", temperature: 0.1 } 
            })

            const prompt = `
                You are a professional e-commerce localization expert. 
                Translate to English and Arabic.
                Arabic must be modern luxury retail tone.
                Return ONLY valid JSON.
                Structure: {"name": {"en": "...", "ar": "..."}, "description": {"en": "...", "ar": "..."}}
                Name: ${args.name}, Description: ${args.description}
            `

            try {
                const aiResult = await model.generateContent(prompt)
                translations = extractJSON(aiResult.response.text())
            } catch (aiError) {
                console.error("Translation logic failed:", aiError)
                return { success: false, error: "AI failed to generate translations. Please try again." }
            }

            // 5. CDN UPLOAD
            let upload
            try {
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                })
                upload = await cloudinary.uploader.upload(base64Image, {
                    folder: "categories",
                    transformation: [
                        { width: 1200, height: 1200, crop: "fill", gravity: "center" },
                        { quality: "auto:best" }, 
                        { fetch_format: "auto" }  
                    ]
                })
            } catch (error) {
                console.error("Cloudinary Error:", error)
                return { success: false, error: "Image upload to CDN failed" }
            }

            // 6. FINAL DB SAVE
            const slug = translations.name.en
                .toLowerCase()
                .trim()
                .replace(/[^\w ]+/g, "")
                .replace(/ +/g, "-")

            await ctx.runMutation(internal.admin.createCategoryRecord, {
                name: translations.name,
                description: translations.description,
                thumbnail: upload.secure_url,
                slug,
                userId: identity.subject
            })

            return { success: true }     
        } catch (error) {
            console.error("Critical Action Error:", error.message)
            return { success: false, error: "An unexpected server error occurred" }
        }
    }
}) 

export const createProduct = action({
    args: {
        name: v.string(),
        description: v.string(),
        base64Image: v.string(),
        categoryId: v.id("categories"),
        price: v.number(),
        discount: v.number(),
        stock: v.number(),
        material: v.string(),
        dimensions: v.string(),
        weight: v.number(),
        features: v.array(v.string()),
        colors: v.array(
            v.object({
                code: v.string(),
                name: v.string()
            })
        )
    },
    handler: async (ctx, args) => {
        try {
            // --- 1. PRE-FLIGHT CHECKS ---
            const identity = await ctx.auth.getUserIdentity()
            if (!identity) return { success: false, error: "You must be logged in" }

            // 2. RATE LIMIT CHECK
            const status = await rateLimiter.limit(ctx, "createProduct", { 
                key: identity.subject 
            })

            if (!status.ok) {
                return { success: false, message: "Too many requests. Please wait a moment." }
            }

            // 3. ADMIN CHECK
            const isAdmin = await ctx.runQuery(internal.users.isAdmin, { userId: identity.subject })
            if (!isAdmin) return { success: false, error: "Unauthorized: Admin access required" }

            // 4. VALIDATING FIELDS
            const { name, description, base64Image, categoryId, price, discount, stock, material, dimensions, weight, features, colors } = args
            if (name.trim().length < 2) return { success: false, error: "Name is too short" }
            if (description.trim().length < 20) return { success: false, error: "Description needs more detail" }
            if (!base64Image.startsWith("data:image")) return { success: false, error: "Invalid image format" }
            
            // FIXED: Added size check to prevent massive payloads from crashing the server
            if (base64Image.length > 7000000) return { success: false, error: "Image is too large (Max 5MB)" }

            if (price < 0) return { success: false, error: "Price cannot be negative" }
            if (discount < 0 || discount > 100) return { success: false, error: "Discount must be between 0 and 100" }
            if (stock < 0) return { success: false, error: "Stock cannot be negative" }
            if (weight <= 0) return { success: false, error: "Weight must be a positive number" }
            if (dimensions.trim().length < 3) return { success: false, error: "Please provide valid dimensions (e.g., 10x20x30 cm)" }
            if (material.trim().length < 2) return { success: false, error: "Please specify the material" }

            const validFeatures = features.filter(f => f.trim() !== "")
            if (validFeatures.length === 0) return { success: false, error: "Please add at least one product feature" }

            const hasTooLongFeature = validFeatures.some(f => f.length > 200)
            if (hasTooLongFeature) return { success: false, error: "One of your features is too long (max 200 chars)" }

            const validColors = colors.filter(c => c.name.trim() !== "")
            if (validColors.length === 0) return { success: false, error: "Please provide at least one color name" }

            const hexRegex = /^#[0-9A-F]{6}$/i
            const isInvalidColor = validColors.some(c => !hexRegex.test(c.code))
            if (isInvalidColor) return { success: false, error: "One of the color codes is invalid" }

            const category = await ctx.runQuery(internal.admin.getCategoryById, { id: categoryId })
            if (!category) return { success: false, error: "The selected category does not exist" }

            // 5. TRANSLATING
            const apiKey = process.env.GEMENI_API_KEY
            if (!apiKey) throw new Error("Internal Server Error: AI Config missing")

            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-lite",
                generationConfig: { responseMimeType: "application/json", temperature: 0.1 } 
            })

            const colorInput = colors.map(c => `${c.name} (Code: ${c.code})`).join(", ")
            const prompt = `
                You are a luxury e-commerce localization expert. 
                Translate the following product details into English and Arabic.
                Arabic must be sophisticated, professional, and appealing to high-end shoppers.

                INPUTS:
                Name: ${name}
                Description: ${description}
                Material: ${material}
                Features: ${features.join(", ")}
                Colors: ${colorInput}

                RETURN ONLY VALID JSON in this structure:
                {
                    "name": {"en": "...", "ar": "..."},
                    "description": {"en": "...", "ar": "..."},
                    "material": {"en": "...", "ar": "..."},
                    "features": [{"en": "feature1", "ar": "ترجمة1"}, {"en": "feature2", "ar": "ترجمة2"}],
                    "colors": [{ "name": {"en": "...", "ar": "..." }, code: "#hex" }]
                }
                IMPORTANT: The "code" field in the colors array must exactly match the hex codes provided in the INPUTS
            `
            let translations
            try {
                const aiResult = await model.generateContent(prompt)
                translations = extractJSON(aiResult.response.text())
            } catch (aiError) {
                console.error("Translation logic failed:", aiError)
                return { success: false, error: "AI failed to generate translations. Please try again" }
            }

            // 6. CDN UPLOAD
            let upload
            try {
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                })
                upload = await cloudinary.uploader.upload(base64Image, {
                    folder: "products",
                    transformation: [
                        { width: 1200, height: 1200, crop: "fill", gravity: "center" },
                        { quality: "auto:best" }, 
                        { fetch_format: "auto" }  
                    ]
                })
            } catch (error) {
                console.error("Cloudinary Error:", error)
                return { success: false, error: "Image upload to CDN failed" }
            }

            // 6. FINAL DB SAVE
            const slug = translations.name.en
                .toLowerCase()
                .trim()
                .replace(/[^\w ]+/g, "")
                .replace(/ +/g, "-")

            await ctx.runMutation(internal.admin.createProductRecord, {
                userId: identity.subject,
                categoryId,
                thumbnail: upload.secure_url,
                name: translations.name,
                description: translations.description,
                price,
                discount, 
                stock,
                material: translations.material,
                dimensions,
                weight,
                features: translations.features,
                colors: translations.colors,
                slug
            })

            return { success: true }     
        } catch (error) {
            console.error("Critical Action Error:", error.message)
            return { success: false, error: "An unexpected server error occurred" }
        }
    }
})

export const updateCategory = action({
    args: {
        id: v.id("categories"),
        name: v.optional(v.any()),
        description: v.optional(v.any()),
        base64Image: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        try {
            // --- 1. PRE-FLIGHT CHECKS ---
            const identity = await ctx.auth.getUserIdentity()
            if (!identity) return { success: false, error: "You must be logged in" }

            // 2. RATE LIMIT CHECK
            const status = await rateLimiter.limit(ctx, "updateCategory", { 
                key: identity.subject 
            })

            if (!status.ok) {
                return { success: false, message: "Too many requests. Please wait a moment." }
            }

            // 3. ADMIN CHECK
            const isAdmin = await ctx.runQuery(internal.users.isAdmin, { userId: identity.subject })
            if (!isAdmin) return { success: false, error: "Unauthorized: Admin access required" }

            let translations = undefined

            // 4 AI TRANSLATION 
            if (args.name || args.description) {
                if (args.name && args.name.trim().length < 2) return { success: false, error: "Name is too short" }
                if (args.description && args.description.trim().length < 20) return { success: false, error: "Description needs more detail" }
                
                const apiKey = process.env.GEMENI_API_KEY
                if (!apiKey) throw new Error("Server Error: AI API Key missing")
                const genAI = new GoogleGenerativeAI(apiKey)
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-2.5-flash-lite",
                    generationConfig: { responseMimeType: "application/json", temperature: 0.1 } 
                })

                const prompt = `
                    You are a professional e-commerce localization expert.
                    Translate this e-commerce category. 
                    
                    IMPORTANT RULES:
                    - If a field is "N/A", return null for that field in the JSON.
                    - Do not translate the string "N/A".
                    - Return ONLY valid JSON.

                    Structure: {"name": {"en": "...", "ar": "..."} or null, "description": {"en": "...", "ar": "..." } or null}
                    
                    Name: ${args.name || "N/A"}, Description: ${args.description || "N/A"}
                `

                try {
                    const aiResult = await model.generateContent(prompt)
                    translations = extractJSON(aiResult.response.text())
                // FIXED: Changed aiError to error
                } catch (error) {
                    console.error("Translation logic failed:", error)
                    return { success: false, error: "AI translation failed" }
                }
            }

            // --- 5. CDN UPLOAD (Only if new image) ---
            let imageUrl = undefined

            if (args.base64Image && args.base64Image.startsWith("data:image")) {
                
                // FIXED: Added size check here as well
                if (args.base64Image.length > 7000000) return { success: false, error: "Image is too large (Max 5MB)" }

                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                })

                const existing = await ctx.runQuery(internal.admin.getCategoryById, { id: args.id })
                if (existing?.thumbnail) {
                    try {
                        const parts = existing.thumbnail.split("/")
                        const fileName = parts.pop().split(".")[0]
                        const folder = parts.pop()
                        await cloudinary.uploader.destroy(`${folder}/${fileName}`)
                    } catch (error) {
                        // FIXED: Changed e.message to error.message
                        console.warn("Old image delete failed (non-fatal):", error.message)
                    }
                }

                try {
                    const upload = await cloudinary.uploader.upload(args.base64Image, {
                        folder: "categories",
                        transformation: [
                            { width: 1200, height: 1200, crop: "fill", gravity: "center" },
                            { quality: "auto:best" },
                            { fetch_format: "auto" }
                        ]
                    })
                    imageUrl = upload.secure_url
                } catch (error) {
                    console.error("Cloudinary Error:", error)
                    return { success: false, error: "Image upload failed" }
                }
            }

            // --- 6. FINAL DB SAVE ---
            const mutationArgs = {
                id: args.id,
                userId: identity.subject
            }

            if (translations?.name) {
                mutationArgs.name = translations.name
                mutationArgs.slug = translations.name.en
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w ]+/g, "")
                    .replace(/ +/g, "-")
            }

            if (translations?.description) {
                mutationArgs.description = translations.description
            }

            if (imageUrl) {
                mutationArgs.thumbnail = imageUrl
            }

            await ctx.runMutation(internal.admin.updateCategoryRecord, mutationArgs)

            return { success: true }
        } catch (error) {
            console.error("Critical Action Error:", error.message)
            return { success: false, error: "An unexpected server error occurred" }
        }
    }
})