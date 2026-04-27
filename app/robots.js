export default function robots() {
    const base = process.env.HOST_URL ?? "https://artlink.ae"
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/api/", "/sign-in/", "/sign-up/"],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
    }
}