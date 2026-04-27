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
                    "payment_intent.latest_charge",
                    "total_details.breakdown",  // needed for discount fallback reading
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

        // Release reservations when checkout is abandoned/expired
        if (event.type === "checkout.session.expired") {
            const session = event.data.object
            if (session.metadata?.promoCodeId) {
                try {
                    await ctx.runMutation(internal.discounts.cancelDiscountReservation, {
                        stripeSessionId: session.id,
                    })
                } catch {
                    // Non-critical — pending records also have expiresAt for cleanup
                }
            }
            // Stock release must succeed — do NOT catch. If this throws, we return 500
            // so Stripe retries the webhook until it succeeds. Silently swallowing this
            // error would leave stock permanently locked with no automatic recovery.
            await ctx.runMutation(internal.reservations.releaseStockReservations, {
                stripeSessionId: session.id,
            })
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
                    const { first_name, last_name, email_addresses, image_url, public_metadata } = data
                    const email = email_addresses[0]?.email_address
                    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
                    const role = public_metadata?.role === "admin" ? "admin" : "user"

                    await ctx.runMutation(internal.users.upsertFromClerk, {
                        userId: id,
                        name: name,
                        email: email,
                        imageURL: image_url,
                        role: role
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
                    const role = public_metadata?.role === "admin" ? "admin" : "user"

                    // upsertFromClerk already fires a notification if the role changed.
                    // Skipping the generic "profile updated" notification here because
                    // Clerk fires user.updated on every login (last_sign_in_at changes),
                    // which would create one notification row per user session — unbounded growth.
                    await ctx.runMutation(internal.users.upsertFromClerk, {
                        userId: id,
                        name: name,
                        email: email,
                        imageURL: image_url,
                        role: role
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

// Called when user clicks "Cancel" on the Stripe checkout page.
// Stripe redirects to cancel_url — the Next.js route handler POSTs here.
// Runs inside Convex where STRIPE_SECRET_KEY is available, so we can both
// release reservations directly AND expire the Stripe session (which would
// otherwise stay open for 30 min and fire its own webhook unnecessarily).
http.route({
    path: "/checkout-cancel",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const sessionId = new URL(request.url).searchParams.get("session_id")

        if (sessionId) {
            await ctx.runMutation(internal.reservations.releaseStockReservations, {
                stripeSessionId: sessionId,
            })
            try {
                await ctx.runMutation(internal.discounts.cancelDiscountReservation, {
                    stripeSessionId: sessionId,
                })
            } catch {}
            // Prevent completing payment on a stale browser tab
            await stripe.checkout.sessions.expire(sessionId).catch(() => {})
        }

        return new Response(null, { status: 200 })
    }),
})

export default http