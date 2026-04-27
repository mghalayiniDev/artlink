# Artlink — Premium Architectural Doors Platform

A production-grade, full-stack e-commerce platform built for the UAE market. Bilingual (English / Arabic), real-time, and built to scale.

![Landing Page](public/landing.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Backend / Database | Convex (real-time, serverless) |
| Authentication | Clerk |
| Edge Security | Arcjet |
| Payments | Stripe |
| Image CDN | Cloudinary |
| Email | Resend |
| Analytics | PostHog |
| AI Translation | Google Gemini |
| Internationalisation | next-intl |
| Styling | Tailwind CSS v4 |

---

## Features

A complete storefront, a full admin panel, a payment and inventory system, and production-grade security — all in one codebase.

### Storefront

- **Home** — hero carousel, category grid, product galleries, testimonials, how-it-works section
- **Shop** — real-time product listing with filters for category, material, color, and price range
- **Product pages** — custom dimension input, color selection, stock validation, related products, wishlist toggle
- **Cart** — persistent cart, promo code application, real-time stock checks, dimension validation
- **Checkout** — Stripe-hosted checkout with shipping collection, phone collection, and invoice generation
- **Orders** — full order history, live status tracking, invoice download
- **Wishlist** — saved products with personalised recommendations
- **Newsletter** — double opt-in subscription with email confirmation, unsubscribe flow
- **Contact** — authenticated contact form with rate limiting and email delivery
- **About, Privacy, Terms** — static content pages

---

### Admin Panel

Fully protected admin area (`/admin`) with role-based access enforced at both the edge (Arcjet + Clerk middleware) and the Convex backend.

#### Dashboard
- Revenue overview chart (monthly, year-to-date)
- Total revenue, orders, products, and users stat cards
- Month-over-month revenue and order deltas
- Top selling products by units and top categories by revenue
- Low stock alerts (products under 10 units)
- Top 5 buyers by spend
- Recent orders and recent users feed
- Admin notification feed

#### Products
- Create, edit, and delete products
- AI-powered bilingual translation (English + Arabic) via Google Gemini on save
- Image upload to Cloudinary with automatic resizing and format optimisation
- Configurable fields: price, discount, stock, material, weight, dimensions, colors, features, lead time, featured flag
- Optional custom dimension range (min/max per axis) for bespoke orders
- Paginated listing with search and status filter (active / draft)

#### Categories
- Create, edit, and delete categories
- AI-powered bilingual name and description translation
- **Total products per category** shown inline
- Cloudinary image upload with old image cleanup on replace
- Deleting a category moves all its products to draft automatically

#### Orders
- Paginated order list with status filter
- Inline status transitions: `paid → processing → delivering → delivered`
- Tracking number attachment on delivery
- Full refund processing via Stripe with reason logging
- Order detail view with customer info, line items, shipping address, payment method

#### Users
- Paginated user list with role filter and search
- Role promotion / demotion (admin ↔ user) via Clerk server actions
- User deletion with admin-protection guard (cannot delete or demote other admins)

#### Discount Codes
- Create percentage or fixed-amount codes with optional expiry, max total uses, per-user limit, and minimum order amount
- Toggle codes active/inactive
- Live usage progress bar per code
- Race condition prevention: pending reservations are tracked at checkout creation and confirmed on payment

#### Newsletter
- Campaign creation with plain text or HTML body, merge tags (`{{name}}`, `{{email}}`), and live email preview
- Send immediately or schedule up to 30 days in advance
- Rate-limited delivery (one email per minute per subscriber to protect sender reputation)
- Campaign cancellation mid-send
- Daily campaign limit (3 per 24 hours) to prevent abuse
- Subscriber list with active/inactive filter

#### Analytics
- PostHog integration via HogQL — all queries run server-side with a 5-minute shared cache (`unstable_cache`) so concurrent admin sessions share a single PostHog API call batch
- Unique visitors, pageviews, sessions, average session duration, bounce rate
- Daily visitor and pageview trend chart
- Traffic channels donut chart
- Top pages, traffic sources, countries, devices, browsers, and OS — all scrollable with max-height and custom scrollbar

#### Notifications
- Real-time feed of inventory, order, security, and user events
- Searchable and filterable by type
- Automatic 30-day retention cleanup (daily cron)

---

### Payments & Inventory

- Stripe Checkout with AED currency, shipping address collection, and phone collection
- **Stock reservation system** — stock is atomically reserved when a checkout session opens and released if the session expires or is cancelled, preventing overselling under concurrent load
- Stripe coupon creation for managed discount codes (bypasses Stripe's native promo code system to enforce server-validated rules)
- Full Stripe refund flow with reason tracking and revenue stat correction
- Stripe webhook verification (signature-based)
- Checkout cancel URL handler releases reservations and expires the Stripe session immediately

---

### Security

- **Arcjet edge layer** — dedicated rule sets per route type:
  - Admin: zero bot tolerance, 60 req/min token bucket, WAF shield
  - Auth pages: zero bot tolerance, 10 req/10min sliding window
  - User routes: search engine bots allowed, 20 req/min token bucket
  - Public: monitor/preview bots allowed, 100 req/min token bucket
- **Clerk middleware** — unauthenticated admin visitors are redirected to sign-in with `redirect_url`; non-admin authenticated users are redirected to home
- **Convex-level auth** — every query, mutation, and action independently verifies identity and role; no trust passed from the frontend
- **Rate limiting** — Convex `@convex-dev/rate-limiter` on: cart operations, wishlist, checkout creation, file uploads (per action), discount code validation, refund processing, order status updates
- **Input validation** — length caps, format checks, hex validation, image size limits (7 MB), and dimension range enforcement throughout
- **Stripe webhook** — HMAC signature verification via `stripe.webhooks.constructEventAsync`
- **Clerk webhook** — SVIX signature verification
- **Email sanitisation** — HTML newsletter bodies sanitised with regex blocklist (scripts, event handlers, dangerous protocols) before storage and delivery
- **Email header injection prevention** — subject and name fields stripped of CR/LF/tab before use in email headers
- **Search input caps** — all admin paginated queries reject search strings over 200 characters

---

### Performance & Cost

- **Analytics caching** — `unstable_cache` with 5-minute revalidation; at most 9 PostHog queries fire per 5 minutes regardless of how many admins are viewing analytics simultaneously
- **Notification retention** — daily cron deletes notifications older than 30 days in batches of 100, preventing unbounded table growth
- **Stock reservation cleanup** — cron runs every 10 minutes to release expired reservations
- **`Promise.allSettled`** on analytics queries — a single slow PostHog query no longer crashes the entire analytics page; partial data renders gracefully
- **Paginated queries** — all admin and public listing queries use Convex cursor pagination

---

### Internationalisation

- Full English (LTR) and Arabic (RTL) support
- Locale detection via `next-intl` with automatic `dir` and `lang` attributes on `<html>`
- All translatable content stored bilingually in Convex at the database level
- AI translation on every product and category save — admins write in any language, Gemini produces both EN and AR versions
- RTL-aware UI throughout (flipped icons, mirrored layouts, Arabic typography)

---

### SEO & Metadata

- Dynamic `sitemap.xml` — generated at request time from live Convex product and category data
- `robots.txt` — blocks `/admin`, `/api`, `/sign-in`, `/sign-up` from crawlers
- Root metadata with Open Graph and Twitter card tags, title template (`%s | Artlink`), and keywords
- Next.js Image component throughout with Cloudinary CDN

---

### Resilience

- Root and admin `error.jsx` boundaries — runtime crashes show a recovery UI with a retry button instead of a blank page
- `loading.jsx` at root and admin level — Suspense fallback spinner during page transitions
- Graceful `not-found.jsx` with navigation links

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/mghalayiniDev/artlink.git
cd artlink
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_FRONTEND_API_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXt_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
NEXt_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

CONVEX_DEPLOYMENT= 

CLERK_JWT_ISSUER_DOMAIN=

NEXT_PUBLIC_CONVEX_URL=

CLERK_WEBHOOK_SECRET=

GEMENI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ARCJET_KEY=
ARCJET_ENV=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

HOST_URL=

RESEND_FROM_EMAIL=
NEWSLETTER_FROM=

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
POSTHOG_PERSONAL_API_KEY=
POSTHOG_PROJECT_ID=

ORDER_FROM=
NEWSLETTER_FROM=
CONTACT_FROM=
CONTACT_EMAIL=
```

Convex environment variables (`STRIPE_SECRET_KEY`, `CLOUDINARY_*`, `GEMENI_API_KEY`, `RESEND_API_KEY`, `NEWSLETTER_FROM`, `CONTACT_FROM`, `CONTACT_EMAIL`, `HOST_URL`, `CLERK_WEBHOOK_SECRET`, `CLERK_JWT_ISSUER_DOMAIN`) must also be set in the Convex dashboard under **Settings → Environment Variables**.

### 4. Start Convex

```bash
npx convex dev
```

### 5. Start Next.js

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
artlink/
├── app/
│   ├── (auth)/          # Sign-in, sign-up pages
│   ├── (main)/          # Storefront pages
│   ├── admin/           # Admin panel
│   ├── api/             # Next.js route handlers
│   ├── components/      # Shared UI components
│   ├── error.jsx        # Root error boundary
│   ├── loading.jsx      # Root loading state
│   ├── robots.js        # Dynamic robots.txt
│   └── sitemap.js       # Dynamic sitemap
├── convex/
│   ├── schema.js        # Database schema
│   ├── admin.js         # Admin queries & mutations
│   ├── cart.js          # Cart logic
│   ├── discounts.js     # Discount code system
│   ├── http.js          # Webhook handlers
│   ├── newsletterAdmin.js
│   ├── orders.js
│   ├── stripe.js        # Checkout & refunds
│   ├── upload.js        # Cloudinary + AI actions
│   └── crons.js         # Scheduled jobs
├── lib/
│   └── emailUtils.js    # Email template & sanitisation
├── messages/
│   ├── en.json
│   └── ar.json
└── proxy.js             # Arcjet + Clerk middleware
```

---

⭐ If you like this project, consider giving it a star!
