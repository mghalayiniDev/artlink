import { Resend } from "@convex-dev/resend"
import { components } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import { v } from "convex/values"

export const resend = new Resend(components.resend, { testMode: false })

export const sendOrderConfirmationEmail = internalMutation({
    args: {
        email: v.string(),
        name: v.string(),
        sessionId: v.string(),
        products: v.array(v.object({
            productId: v.id("products"),
            nameAtPurchase: v.object({ en: v.string(), ar: v.string() }),
            priceAtPurchase: v.number(),
            imageAtPurchase: v.string(),
            quantity: v.number(),
            color: v.object({
                code: v.string(),
                name: v.object({ en: v.string(), ar: v.string() })
            }),
            dimensions: v.object({ h: v.number(), w: v.number(), d: v.number() })
        })),
        shippingAddress: v.object({
            city: v.optional(v.string()),
            country: v.optional(v.string()),
            line1: v.optional(v.string()),
            line2: v.optional(v.string()),
            postal_code: v.optional(v.string()),
        }),
        totalAmount: v.number(),
        vat: v.number(),
        discountAmount: v.optional(v.number()),
        promoCodeText: v.optional(v.string()),
        paymentMethod: v.string(),
        cardLast4: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const HOST_URL = process.env.HOST_URL || "http://localhost:3000"
        const orderUrl = `${HOST_URL}/order/${args.sessionId}`

        const subtotal = args.totalAmount - args.vat + (args.discountAmount || 0)

        const productRowsEn = args.products.map(p => `
            <tr>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
                    <img src="${p.imageAtPurchase}" alt="${p.nameAtPurchase.en}" width="56" height="56"
                        style="border-radius: 8px; object-fit: cover; display: block;" />
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
                    <div style="font-weight: 600; color: #111; font-size: 14px;">${p.nameAtPurchase.en}</div>
                    <div style="font-size: 12px; color: #888; margin-top: 3px;">
                        Color: ${p.color.name.en} &nbsp;|&nbsp; ${p.dimensions.h}×${p.dimensions.w}×${p.dimensions.d} cm
                    </div>
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; text-align: center; color: #555; font-size: 14px;">
                    ×${p.quantity}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; text-align: right; font-weight: 600; color: #111; font-size: 14px; white-space: nowrap;">
                    AED ${(p.priceAtPurchase * p.quantity).toFixed(2)}
                </td>
            </tr>
        `).join("")

        const productRowsAr = args.products.map(p => `
            <tr>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
                    <img src="${p.imageAtPurchase}" alt="${p.nameAtPurchase.ar}" width="56" height="56"
                        style="border-radius: 8px; object-fit: cover; display: block;" />
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
                    <div style="font-weight: 600; color: #111; font-size: 14px;">${p.nameAtPurchase.ar}</div>
                    <div style="font-size: 12px; color: #888; margin-top: 3px;">
                        اللون: ${p.color.name.ar} &nbsp;|&nbsp; ${p.dimensions.h}×${p.dimensions.w}×${p.dimensions.d} سم
                    </div>
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; text-align: center; color: #555; font-size: 14px;">
                    ×${p.quantity}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; text-align: left; font-weight: 600; color: #111; font-size: 14px; white-space: nowrap;">
                    ${(p.priceAtPurchase * p.quantity).toFixed(2)} د.إ
                </td>
            </tr>
        `).join("")

        const addressEn = [
            args.shippingAddress.line1,
            args.shippingAddress.line2,
            args.shippingAddress.city,
            args.shippingAddress.postal_code,
            args.shippingAddress.country,
        ].filter(Boolean).join(", ") || "—"

        const paymentLabel = args.cardLast4
            ? `${args.paymentMethod.replace(/_/g, " ")} •••• ${args.cardLast4}`
            : args.paymentMethod.replace(/_/g, " ")

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation — Artlink</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 32px 16px;">
    <tr>
        <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); padding: 36px 40px; text-align:center;">
                    <div style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">Artlink</div>
                    <div style="margin-top: 20px; width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 50%; text-align: center; display: inline-block;">
                        <span style="font-size: 28px; line-height: 56px; color: #ffffff;">✓</span>
                    </div>
                    <div style="margin-top: 12px; font-size: 22px; font-weight: 700; color: #fff;">Order Confirmed!</div>
                    <div style="margin-top: 6px; font-size: 14px; color: rgba(255,255,255,0.8);">Thank you, ${args.name}. Your order is being prepared.</div>
                </td>
            </tr>

            <!-- EN Body -->
            <tr>
                <td style="padding: 36px 40px; direction: ltr; text-align: left;">

                    <!-- Order ref -->
                    <div style="background: #fff7ed; border-left: 4px solid #F97316; border-radius: 6px; padding: 14px 18px; margin-bottom: 28px;">
                        <span style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Order Reference</span>
                        <div style="font-size: 13px; font-weight: 600; color: #F97316; margin-top: 4px; word-break: break-all;">${args.sessionId}</div>
                    </div>

                    <!-- Products -->
                    <div style="font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Items Ordered</div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
                        <thead>
                            <tr style="background: #fafafa;">
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 600; text-align: left; width: 72px;"></th>
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 600; text-align: left;">Product</th>
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 600; text-align: center; width: 50px;">Qty</th>
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 600; text-align: right; width: 90px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>${productRowsEn}</tbody>
                    </table>

                    <!-- Totals -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #666;">Subtotal</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #333; text-align: right;">AED ${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #666;">VAT (5%)</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #333; text-align: right;">AED ${args.vat.toFixed(2)}</td>
                        </tr>
                        ${args.discountAmount ? `
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #10b981;">Promo${args.promoCodeText ? ` (${args.promoCodeText})` : ""}</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #10b981; text-align: right;">− AED ${args.discountAmount.toFixed(2)}</td>
                        </tr>` : ""}
                        <tr>
                            <td colspan="2" style="padding: 8px 0;"><hr style="border: none; border-top: 2px solid #f0f0f0; margin: 0;" /></td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-size: 16px; font-weight: 700; color: #111;">Total</td>
                            <td style="padding: 5px 0; font-size: 16px; font-weight: 700; color: #F97316; text-align: right;">AED ${args.totalAmount.toFixed(2)}</td>
                        </tr>
                    </table>

                    <!-- Shipping & Payment -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px; border-top: 1px solid #f0f0f0; padding-top: 24px;">
                        <tr>
                            <td width="50%" style="vertical-align: top; padding-right: 16px;">
                                <div style="font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Ship To</div>
                                <div style="font-size: 14px; color: #333; line-height: 1.6;">${addressEn}</div>
                            </td>
                            <td width="50%" style="vertical-align: top; padding-left: 16px;">
                                <div style="font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Payment</div>
                                <div style="font-size: 14px; color: #333; text-transform: capitalize;">${paymentLabel}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="${orderUrl}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px;">
                            Track My Order →
                        </a>
                    </div>

                </td>
            </tr>

            <!-- Divider -->
            <tr>
                <td style="padding: 0 40px;">
                    <hr style="border: none; border-top: 2px dashed #e5e7eb; margin: 0;" />
                </td>
            </tr>

            <!-- AR Body -->
            <tr>
                <td style="padding: 36px 40px; direction: rtl; text-align: right;">

                    <div style="font-size: 20px; font-weight: 700; color: #111; margin-bottom: 6px;">تم تأكيد طلبك! 🎉</div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 28px;">شكراً لك، ${args.name}. طلبك قيد التجهيز الآن.</div>

                    <!-- Products AR -->
                    <div style="font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">المنتجات المطلوبة</div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
                        <thead>
                            <tr style="background: #fafafa;">
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; font-weight: 600; text-align: right; width: 72px;"></th>
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; font-weight: 600; text-align: right;">المنتج</th>
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; font-weight: 600; text-align: center; width: 50px;">الكمية</th>
                                <th style="padding: 10px 8px; font-size: 11px; color: #aaa; font-weight: 600; text-align: left; width: 90px;">السعر</th>
                            </tr>
                        </thead>
                        <tbody>${productRowsAr}</tbody>
                    </table>

                    <!-- Totals AR -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #666;">المجموع الفرعي</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #333; text-align: left;">${subtotal.toFixed(2)} د.إ</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #666;">ضريبة القيمة المضافة (5%)</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #333; text-align: left;">${args.vat.toFixed(2)} د.إ</td>
                        </tr>
                        ${args.discountAmount ? `
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #10b981;">خصم${args.promoCodeText ? ` (${args.promoCodeText})` : ""}</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #10b981; text-align: left;">− ${args.discountAmount.toFixed(2)} د.إ</td>
                        </tr>` : ""}
                        <tr>
                            <td colspan="2" style="padding: 8px 0;"><hr style="border: none; border-top: 2px solid #f0f0f0; margin: 0;" /></td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-size: 16px; font-weight: 700; color: #111;">الإجمالي</td>
                            <td style="padding: 5px 0; font-size: 16px; font-weight: 700; color: #F97316; text-align: left;">${args.totalAmount.toFixed(2)} د.إ</td>
                        </tr>
                    </table>

                    <!-- Shipping & Payment AR -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px; border-top: 1px solid #f0f0f0; padding-top: 24px;">
                        <tr>
                            <td width="50%" style="vertical-align: top; padding-left: 16px;">
                                <div style="font-size: 12px; font-weight: 700; color: #888; letter-spacing: 0.5px; margin-bottom: 8px;">عنوان الشحن</div>
                                <div style="font-size: 14px; color: #333; line-height: 1.6;">${addressEn}</div>
                            </td>
                            <td width="50%" style="vertical-align: top; padding-right: 16px;">
                                <div style="font-size: 12px; font-weight: 700; color: #888; letter-spacing: 0.5px; margin-bottom: 8px;">طريقة الدفع</div>
                                <div style="font-size: 14px; color: #333; text-transform: capitalize;">${paymentLabel}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- CTA AR -->
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="${orderUrl}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                            تتبع طلبي ←
                        </a>
                    </div>

                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: #fafafa; border-top: 1px solid #f0f0f0; padding: 24px 40px; text-align: center;">
                    <div style="font-size: 18px; font-weight: 800; color: #F97316; margin-bottom: 6px;">Artlink</div>
                    <div style="font-size: 12px; color: #aaa; line-height: 1.7;">
                        © ${new Date().getFullYear()} Artlink. All rights reserved.<br/>
                        You received this email because you placed an order on our website.
                    </div>
                </td>
            </tr>

        </table>
        </td>
    </tr>
</table>

</body>
</html>`

        const from = process.env.ORDER_FROM ?? process.env.NEWSLETTER_FROM
        if (!from) {
            console.error("sendOrderConfirmationEmail: ORDER_FROM env var not set — skipping email")
            return
        }

        await resend.sendEmail(ctx, {
            from,
            to: args.email,
            subject: `Order Confirmed — AED ${args.totalAmount.toFixed(2)} | تم تأكيد طلبك`,
            html,
        })
    }
})