export function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
}

export function sanitizeEmailBody(html) {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<\/?\s*(?:iframe|object|embed|applet|base|form|input|button|select|textarea|meta|link|style|svg|math)\b[^>]*>/gi, "")
        .replace(/(?:^|[\s"'>])on[a-z]{1,30}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
        .replace(/((?:href|src|action|formaction|data|xlink:href)\s*=\s*["'])\s*(?:javascript|data|vbscript)\s*:[^"']*/gi, "$1#")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/expression\s*\([^)]*\)/gi, "")
}

// unsubscribeUrl: full URL with token, or "" for preview
export function buildEmailHtml(subject, body, unsubscribeUrl = "") {
    const year = new Date().getFullYear()
    const unsubscribeFooter = unsubscribeUrl
        ? `<a href="${unsubscribeUrl}" style="color:#F97316;text-decoration:underline;">Unsubscribe</a> from this list.`
        : `To unsubscribe, reply with &ldquo;Unsubscribe&rdquo; in the subject line.`

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${escapeHtml(subject)}</title>
    <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        .body-content { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #374151; line-height: 1.85; }
        .body-content h1 { font-size: 26px; font-weight: 800; color: #111827; margin: 0 0 16px; line-height: 1.25; letter-spacing: -0.3px; }
        .body-content h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px; line-height: 1.3; }
        .body-content h3 { font-size: 17px; font-weight: 600; color: #1f2937; margin: 0 0 10px; line-height: 1.4; }
        .body-content p  { margin: 0 0 18px; }
        .body-content p:last-child { margin-bottom: 0; }
        .body-content a  { color: #F97316; text-decoration: underline; font-weight: 500; }
        .body-content a:hover { color: #EA580C; }
        .body-content ul, .body-content ol { margin: 0 0 18px; padding-left: 22px; }
        .body-content li { margin-bottom: 7px; color: #374151; }
        .body-content img { max-width: 100%; height: auto; border-radius: 10px; display: block; margin: 20px 0; }
        .body-content strong, .body-content b { font-weight: 700; color: #111827; }
        .body-content em, .body-content i { font-style: italic; }
        .body-content hr { border: none; border-top: 2px solid #f0f0f0; margin: 28px 0; }
        .body-content blockquote { border-left: 4px solid #F97316; margin: 0 0 18px; padding: 12px 20px; background: #fff7ed; border-radius: 0 8px 8px 0; color: #4b5563; font-style: italic; }
        .body-content table { border-collapse: collapse; width: 100%; margin-bottom: 18px; font-size: 14px; }
        .body-content th { background: #f9fafb; padding: 9px 14px; text-align: left; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #e5e7eb; }
        .body-content td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; color: #374151; vertical-align: top; }
        .body-content pre, .body-content code { background: #f3f4f6; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937; }
        .body-content pre { padding: 14px 18px; overflow-x: auto; margin: 0 0 18px; }
        .body-content code { padding: 2px 6px; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0"
           style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">
      <tr>
        <td style="background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);padding:36px 40px 32px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;font-family:'Segoe UI',sans-serif;">Artlink</div>
          <div style="width:44px;height:3px;background:rgba(255,255,255,0.45);border-radius:2px;margin:14px auto 18px;"></div>
          <div style="font-size:21px;font-weight:700;color:#ffffff;line-height:1.35;letter-spacing:-0.2px;">${escapeHtml(subject)}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="body-content" style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:15px;color:#374151;line-height:1.85;padding:35px;">
            ${body}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px;">
          <div style="height:1px;background:linear-gradient(to right,transparent,#e5e7eb,transparent);"></div>
        </td>
      </tr>
      <tr>
        <td style="background:#fafafa;padding:26px 40px 28px;text-align:center;">
          <div style="font-size:20px;font-weight:800;color:#F97316;letter-spacing:-0.3px;margin-bottom:10px;font-family:'Segoe UI',sans-serif;">Artlink</div>
          <div style="font-size:12px;color:#9ca3af;line-height:1.85;">
            &copy; ${year} Artlink. All rights reserved.<br>
            You received this email because you subscribed to Artlink newsletters.<br>
            ${unsubscribeFooter}
          </div>
        </td>
      </tr>
    </table>
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:16px 0;text-align:center;">
        <div style="font-size:11px;color:#d1d5db;">Artlink &mdash; Dubai, UAE</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
