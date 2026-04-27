import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { resend } from "./resend"

// ── Limits ────────────────────────────────────────────────────────────────────
const MAX_PER_HOUR  = 3          // same email, per hour
const MAX_PER_DAY   = 8          // same email, per 24 hours
const HOUR_MS       = 60 * 60 * 1000
const DAY_MS        = 24 * HOUR_MS

const LIMITS = {
    name:    100,
    email:   254,   // RFC 5321 max
    phone:   30,
    subject: 200,
    message: 4000,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Strip characters that could inject extra headers into the email Subject line
function sanitizeHeader(str) {
    return str.replace(/[\r\n\t]/g, " ").trim()
}

function esc(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

// ── Mutation ──────────────────────────────────────────────────────────────────
export const submitContactForm = mutation({
    args: {
        name:    v.string(),
        email:   v.string(),
        phone:   v.optional(v.string()),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {

        // 0. Auth check — must be signed in
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("AUTH: Must be signed in to send a message")
        }
        const userId = identity.subject

        // 1. Trim
        const name    = args.name.trim()
        const email   = args.email.trim().toLowerCase()
        const phone   = args.phone?.trim() ?? ""
        const subject = args.subject.trim()
        const message = args.message.trim()

        // 2. Required-field check
        if (!name || !email || !subject || !message) {
            throw new Error("VALIDATION: Required fields missing")
        }

        // 3. Format checks
        if (!EMAIL_RE.test(email)) {
            throw new Error("VALIDATION: Invalid email address")
        }
        if (message.length < 10) {
            throw new Error("VALIDATION: Message too short")
        }

        // 4. Length caps
        if (name.length    > LIMITS.name)    throw new Error("VALIDATION: Name too long")
        if (email.length   > LIMITS.email)   throw new Error("VALIDATION: Email too long")
        if (phone.length   > LIMITS.phone)   throw new Error("VALIDATION: Phone too long")
        if (subject.length > LIMITS.subject) throw new Error("VALIDATION: Subject too long")
        if (message.length > LIMITS.message) throw new Error("VALIDATION: Message too long")

        // 5. Rate limiting — check recent submissions from this email
        const now  = Date.now()
        const hour = now - HOUR_MS
        const day  = now - DAY_MS

        const recentSubmissions = await ctx.db
            .query("contactSubmissions")
            .withIndex("by_user", q => q.eq("userId", userId))
            .filter(q => q.gte(q.field("createdAt"), day))
            .collect()

        if (recentSubmissions.length >= MAX_PER_DAY) {
            throw new Error("RATE_LIMIT: Daily limit reached")
        }
        const lastHour = recentSubmissions.filter(s => s.createdAt >= hour)
        if (lastHour.length >= MAX_PER_HOUR) {
            throw new Error("RATE_LIMIT: Hourly limit reached")
        }

        // 6. Log submission before sending (so it's counted even if email fails)
        await ctx.db.insert("contactSubmissions", { userId, createdAt: now })

        // 7. Sanitize headers (prevent email header injection)
        const safeSubject = sanitizeHeader(subject)
        const safeName    = sanitizeHeader(name)

        // 8. Build + send email
        const recipientEmail = process.env.CONTACT_EMAIL ?? "art.link.for.doors@gmail.com"
        const senderEmail    = process.env.CONTACT_FROM  ?? "onboarding@resend.dev"

        const html = `<!DOCTYPE html>
            <html lang="en">
              <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
              <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);padding:28px 36px;">
                        <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Artlink</div>
                        <div style="font-size:15px;color:rgba(255,255,255,0.85);margin-top:6px;font-weight:600;">New Contact Form Submission</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 36px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;width:90px;vertical-align:top;padding-top:12px;">Name</td>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;font-weight:600;">${esc(name)}</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:12px;">Email</td>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#F97316;">${esc(email)}</td>
                          </tr>
                          ${phone ? `<tr>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:12px;">Phone</td>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">${esc(phone)}</td>
                          </tr>` : ""}
                          <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:12px;">Subject</td>
                            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;font-weight:600;">${esc(safeSubject)}</td>
                          </tr>
                        </table>
                        <div style="margin-top:20px;">
                          <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Message</div>
                          <div style="background:#f9fafb;border-radius:8px;padding:16px 18px;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap;border:1px solid #f0f0f0;">${esc(message)}</div>
                        </div>
                        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f0f0f0;font-size:12px;color:#bbb;">
                          Submitted via the contact form · ${new Date(now).toUTCString()}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:18px 36px;text-align:center;">
                        <div style="font-size:18px;font-weight:800;color:#F97316;margin-bottom:4px;">Artlink</div>
                        <div style="font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Artlink. All rights reserved.</div>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
              </body>
            </html>`

        await resend.sendEmail(ctx, {
            from: senderEmail,
            to: recipientEmail,
            subject: `New Message: ${safeSubject} — ${safeName}`,
            html,
        })

        return { success: true }
    },
})
