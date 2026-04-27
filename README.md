# 🏢 ArtLink Doors - Premium Full-Stack E-Commerce Platform

A custom-built, enterprise-grade **full-stack e-commerce platform** designed specifically for the UAE market. This application delivers high performance, real-time syncing, advanced edge security, and a deeply integrated bilingual architecture (English 🇬🇧 / Arabic 🇦🇪).

---

## 📸 Screenshots

![Home Page Preview](public/landing.png)

---

## 🌐 Live Application Pages

This platform includes a complete, production-ready storefront experience:

- 🏠 **Home Page** – Hero section, featured products, categories, and brand highlights  
- 🛍️ **Shop Page** – Dynamic product listing with real-time inventory  
- ℹ️ **About Us Page** – Company story and branding  
- 🔐 **Authentication Pages**
  - Login  
  - Signup  
- 🧾 **User Features**
  - Protected routes for authenticated users  
  - Persistent sessions via Clerk  
- 🛒 **Cart & Checkout System** *(if implemented)*  
- 📦 **Order Tracking System** *(real-time updates via Convex)*  

---

## 🚀 Full-Stack Architecture

This project is built using a modern **serverless full-stack architecture**, combining frontend, backend, authentication, and security into a seamless system.

---

## 🖥️ Frontend & UI

- **Next.js 14+ (App Router)**  
  - Server Components for performance  
  - Optimized SEO for e-commerce  
  - File-based routing  

- **React**  
  - Component-based architecture  
  - Interactive UI  

- **Tailwind CSS**  
  - Fully responsive design  
  - Utility-first styling system  

- **Lucide React**  
  - Clean and consistent SVG icons  

- **next-intl**  
  - Route-based localization  
  - Dynamic translation system  

---

## ⚙️ Backend & Database

- **Convex**
  - Real-time database syncing  
  - Serverless backend (no REST APIs)  
  - Type-safe Queries, Mutations, Actions  
  - Handles:
    - Products  
    - Categories  
    - Orders  
    - Users  
    - Newsletter system  

---

## 🔐 Authentication System

- **Clerk**
  - Secure authentication (Login / Signup)  
  - Session management  
  - Protected routes  
  - Role-based access system (`admin` / `user`)  
  - Webhooks to sync users with Convex database  

---

## 🛡️ Security Layer

- **Arcjet**
  - Edge-level protection  
  - Bot detection  
  - Rate limiting (newsletter, public APIs)  
  - Prevents abuse and malicious traffic  

---

## 🌍 Multilingual Architecture (i18n)

This platform is fully bilingual and supports:

- 🇬🇧 English (LTR)
- 🇦🇪 Arabic (RTL)

---

### 1. 🗄️ Database-Level Localization (Convex)

All translatable fields are stored directly in the database:

```ts
name: v.object({
  en: v.string(),
  ar: v.string()
}),
description: v.object({
  en: v.string(),
  ar: v.string()
})
```

---

### 2. 🌐 Frontend Rendering (next-intl)

Locale is detected via routing and cookies:

```tsx
<p>{product.name[locale] || product.name["en"]}</p>
```

---

### 3. 🔁 Dynamic RTL Layouts

UI automatically adapts for Arabic:

```tsx
<ArrowRight className={locale === "ar" ? "rotate-180" : ""} />
```

- Direction-aware layouts  
- Flipped icons & spacing  
- Proper RTL UX  

---

## ✨ Core Features

### ⚡ Real-Time E-Commerce
- Live inventory updates  
- Instant product sync  
- Real-time order tracking  

---

### 📩 Secure Newsletter System
- Rate-limited via Arcjet  
- Stored in Convex  
- Soft deletion system:
```ts
isActive: boolean
```

---

### 📦 Order Lifecycle Management
- Processing  
- Delivering  
- Delivered  
- Refunded  

---

### 🛡️ Admin-Ready Backend
- Role-based system (`admin` / `user`)  
- Managed via Clerk + Convex  
- Ready for:
  - Product management  
  - Category control  
  - Customer data access  

---

## 🛠️ Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/artlink-doors.git
cd artlink-doors
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Environment Variables

Create a `.env.local` file:

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

# Deployment used by `npx convex dev`
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
```

---

### 4. Start Backend (Convex)

```bash
npx convex dev
```

---

### 5. Start Frontend (Next.js)

```bash
npm run dev
```

---

### 🌐 Open in Browser

```
http://localhost:3000
```

---

## 🧠 Project Highlights

This project demonstrates:

- ✅ Full-stack architecture (Next.js + Convex + Clerk + Arcjet)  
- ✅ Real-time database-driven UI  
- ✅ Secure authentication & protected routes  
- ✅ Edge-level security implementation  
- ✅ Advanced bilingual (LTR/RTL) system  
- ✅ Scalable, production-ready design  

---

⭐ If you like this project, consider giving it a star!