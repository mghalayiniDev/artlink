import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { Webhook } from "svix"
import { api, internal } from "./_generated/api"
import Stripe from "stripe"

const http = httpRouter()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil"
})

http.route({
    path: "/stripe/webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const signature = request.headers.get("stripe-signature")
        const body = await request.text()

        if (!signature) {
            return new Response("No signature", { status: 400 })
        }

        let event
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            )
        } catch (error) {
            return new Response(`Webhook Error: ${error.message}`, { status: 400 })
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object

            const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: [
                    "invoice",
                    "payment_intent",
                    "payment_intent.payment_method",
                    "payment_intent.latest_charge"
                ]
            })

            try {
                await ctx.runMutation(internal.orders.createOrder, {
                    stripeSession: fullSession
                })
            } catch (error) {
                return new Response(`Server error: ${error.message}`, { status: 500 })
            }
        }

        return new Response(null, { status: 200 })
    })
})

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
        if (!webhookSecret) {
            console.error("Missing CLERK_WEBHOOK_SECRET")
            return new Response("Server Configuration Error", { status: 500 })
        }

        const svix_id = request.headers.get("svix-id")
        const svix_signature = request.headers.get("svix-signature")
        const svix_timestamp = request.headers.get("svix-timestamp")

        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("Missing Svix Headers", { status: 400 })
        }

        const payload = await request.text()

        let event
        try {
            const wh = new Webhook(webhookSecret)
            event = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            })
        } catch (error) {
            console.error("Webhook verification failed:", error instanceof Error ? error.message : error)
            return new Response("Invalid signature", { status: 401 })
        }

        try {
            const { type, data } = event
            const { id } = data

            switch (type) {
                case "user.created": {
                    const { first_name, last_name, email_addresses, image_url } = data
                    const email = email_addresses[0]?.email_address
                    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()

                    await ctx.runMutation(internal.users.upsertFromClerk, {
                        userId: id,
                        name: name,
                        email: email,
                        imageURL: image_url,
                        role: "user"
                    })

                    await ctx.runMutation(internal.notifications.notifyAdmins, {
                        userId: id,
                        title: {
                            en: "New User Registered 👤",
                            ar: "تسجيل مستخدم جديد 👤"
                        },
                        body: {
                            en: `User ${name} (${email}) has joined.`,
                            ar: `انضم المستخدم ${name} عبر البريد (${email}).`
                        },
                        type: "alert"
                    })

                    break
                }   

                case "user.updated": {
                    const { first_name, last_name, email_addresses, image_url, public_metadata } = data
                    const email = email_addresses[0]?.email_address
                    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
                    const role = public_metadata?.role || "user"

                    await ctx.runMutation(api.users.upsertFromClerk, {
                        userId: id,
                        name: name,
                        email: email,
                        imageURL: image_url,
                        role: role
                    })
                    
                    const newProfileDetails = `
                        • Name: ${name}
                        • Email: ${email}
                        • Role: ${role}
                    `.trim()

                    await ctx.runMutation(internal.notifications.notifyAdmins, {
                        userId: id,
                        title: {
                            en: `User Profile Updated: ${name} ✅`,
                            ar: `تحديث بيانات المستخدم: ${name} ✅`
                        },
                        body: {
                            en: `Current profile state:\n${newProfileDetails}`,
                            ar: `البيانات الحالية: ${name} | ${email} | ${role}`
                        },
                        type: "alert"
                    })

                    break
                }   

                case "user.deleted": {
                    console.log("user deleted")
                    await ctx.runMutation(internal.users.deleteFromClerk, { userId: id })
                    break
                }
                    
                default:
                    console.log("Unhandled event type:", type)
                    break
            }

            return new Response("Webhook processed successfully", { status: 200 })
        } catch (error) {
            console.error("Internal processing error:", error)
            return new Response("Internal Server Error", { status: 500 })
        }
    })
})

export default http