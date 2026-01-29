import { Resend } from "@convex-dev/resend"
import { components } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import { v } from "convex/values"

export const resend = new Resend(components.resend, { testMode:  false })

export const sendEmail = internalMutation({
    args: {
        email: v.string(),
        name: v.string()
    },
    handler: async (ctx, args) => {
        await resend.sendEmail(ctx, {
            from: "onboarding@resend.dev",
            to: args.email,
            subject: "Welcome! | أهلاً بك 🎉",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
                    <div style="text-align: center; padding: 20px 0;">
                        <h1 style="color: #4F46E5; margin: 0;">Artlink</h1>
                    </div>

                    <div style="direction: ltr; text-align: left; padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="margin-top: 0;">Welcome, ${args.name}! 👋</h2>
                        <p>We're thrilled to have you join our community. Your account is now active and ready for you to explore our latest collections.</p>
                        <a href="http://localhost:3000//shop" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping</a>
                    </div>

                    <div style="direction: rtl; text-align: right; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                        <h2 style="margin-top: 0;">أهلاً بك، ${args.name}! 🎉</h2>
                        <p>يسعدنا انضمامك إلينا. حسابك الآن نشط وجاهز لتكتشف أحدث مجموعاتنا الحصرية.</p>
                        <a href="http://localhost:3000//shop" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">ابدأ التسوق الآن</a>
                    </div>

                    <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
                        <p>© 2026 Artlink. All rights reserved.</p>
                        <p>You received this because you signed up on our website.</p>
                    </div>
                </div>
            `
        })
    }
})

export const sendDeleteUserEmail = internalMutation({
    args: { email: v.string(), name: v.string() },
    handler: async (ctx, args) => {
        await resend.sendEmail(ctx, {
            from: "support@resend.dev",
            to: args.email,
            subject: "Account Deleted | تم حذف الحساب 🗑️",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
                    <div style="text-align: center; padding: 20px 0;">
                        <h1 style="color: #6B7280; margin: 0;">Artlink</h1>
                    </div>

                    <div style="direction: ltr; text-align: left; padding: 20px; background-color: #fef2f2; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
                        <h2 style="margin-top: 0; color: #991b1b;">Account Deleted, ${args.name}</h2>
                        <p>We're writing to confirm that your Artlink account has been successfully deleted. All your personal data and preferences have been removed from our active systems.</p>
                        <p>We're sorry to see you go! If this was a mistake, you can always create a new account anytime.</p>
                    </div>

                    <div style="direction: rtl; text-align: right; padding: 20px; background-color: #fffaf0; border-radius: 8px; border-right: 4px solid #f59e0b;">
                        <h2 style="margin-top: 0; color: #92400e;">تم حذف الحساب، ${args.name}</h2>
                        <p>نؤكد لك أنه تم حذف حسابك في Artlink بنجاح. لقد تمت إزالة جميع بياناتك الشخصية وتفضيلاتك من أنظمتنا النشطة.</p>
                        <p>يؤسفنا رحيلك! إذا كان هذا القرار عن طريق الخطأ، يمكنك دائماً إنشاء حساب جديد في أي وقت.</p>
                    </div>

                    <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
                        <p>© 2026 Artlink. All rights reserved.</p>
                        <p>If you didn't request this, please contact our security team immediately.</p>
                    </div>
                </div>
            `
        })
    }
})