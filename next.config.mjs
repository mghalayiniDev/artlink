import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const securityHeaders = [
    { key: "X-Content-Type-Options",    value: "nosniff" },
    { key: "X-Frame-Options",           value: "DENY" },
    { key: "X-XSS-Protection",          value: "1; mode=block" },
    { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [{ source: "/(.*)", headers: securityHeaders }]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: ''
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                port: ''
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: ''
            }
        ],
    }
}

export default withNextIntl(nextConfig)