# Fundu — India's Premier Re-Commerce & Doorstep Phone Repair Platform

Fundu is a modern re-commerce and smartphone servicing web platform built for high-scale retail trade-in, certified refurbished device commerce, and 30-minute doorstep mobile repairs across India (supporting 19,000+ pin codes).

---

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **Styling:** Tailwind CSS + Lucide React icons + Custom Theme Palette
- **Routing:** React Router DOM v6 (dynamic multi-page brand, series & device routes)
- **Backend:** Node.js + Express (located in `server/`)
- **Database / Auth:** Firebase & MongoDB
- **Notifications & Communication:** EmailJS, Resend & SMS alerts

---

## 📁 Repository Structure

```text
fundu/
├── src/                          # Main Frontend Application (Vite + React + TypeScript)
│   ├── components/               # Reusable UI & section components
│   │   ├── home/                 # HeroSection, CategoryGrid, TrustBadges, Testimonials
│   │   ├── sell/                 # SellStep1Device, SellStep2Condition, SellStep3Quote, SuccessModal
│   │   ├── admin/                # Admin sidebar, catalog editors, pricing controls
│   │   ├── Navbar.tsx            # Multi-level header, live search autocomplete, cart popup
│   │   ├── Footer.tsx            # Footnote navigation, pan-India coverage, helpline
│   │   ├── BrandLogo.tsx         # Responsive vector/image brand logo
│   │   └── SEO.tsx               # Dynamic OpenGraph, meta titles & schema tags
│   │
│   ├── pages/                    # Route Page Components
│   │   ├── Home.tsx              # Main marketplace landing page
│   │   ├── SellPhone.tsx         # Multi-step device buyback & valuation wizard
│   │   ├── SellBrandPage.tsx     # Brand-specific sell catalog (e.g. /sell/apple, /sell/samsung)
│   │   ├── Repair.tsx            # Doorstep repair booking wizard & issue selector
│   │   ├── RepairBrandPage.tsx   # Brand repair catalog (/repair/apple, /repair/samsung)
│   │   ├── RepairIssuePage.tsx   # Issue-specific pricing & repair breakdown
│   │   ├── BuyPhones.tsx         # Certified refurbished phone catalog & filters
│   │   ├── ProductDetail.tsx     # Refurbished device details, grading & checkout trigger
│   │   ├── Dashboard.tsx         # Customer portal (orders, repair bookings, pickups)
│   │   ├── Admin.tsx             # Superadmin operations, order management, live pricing sync
│   │   ├── Vendor.tsx            # Verified B2B vendor inventory & dispatch portal
│   │   ├── DeliveryAgentPortal.tsx # Real-time field rider dispatch & doorstep inspection portal
│   │   └── ...                   # About, Contact, PartnerProgram, FunduStore, Recycle, etc.
│   │
│   ├── data/                     # Offline Catalogs & Benchmark Dictionaries
│   │   ├── masterModelCatalog.ts # Primary device model catalog with prices, storage & images
│   │   ├── brandSeriesCatalog.ts # Brand series hierarchies (iPhone 18 down to Classic, Galaxy S, Nord)
│   │   ├── indianPhonesCatalog.ts# Comprehensive Indian smartphone catalog database
│   │   └── deviceImageDictionary.ts # Clean WebP/PNG product thumbnail mapping
│   │
│   ├── lib/                      # Core Business Logic, Pricing Engines & Utilities
│   │   ├── mobileApi.ts          # External device catalog API & autocomplete service
│   │   ├── priceSync.ts          # Realtime price override synchronization & deletion checks
│   │   ├── repairPriceSync.ts    # Model-to-repair cost calculation engine
│   │   ├── deviceSpecs.ts        # Storage variant multipliers & specification parser
│   │   ├── locationService.ts    # Pan-India 19,000+ pin codes and city resolver
│   │   ├── phoneImages.ts        # Dynamic image fallback & CDN resolver
│   │   └── db.ts                 # Database helpers, currency formatting (INR), local storage
│   │
│   ├── context/                  # React Context Providers (AuthContext, CartContext)
│   ├── App.tsx                   # Top-level Router configuration & role-based route guards
│   └── index.css                 # Global CSS variables, custom typography & tailwind utilities
│
├── server/                       # Node.js Express Backend API
│   ├── config/                   # Database & third-party service connections
│   ├── middleware/               # JWT authentication, role verification & rate limiters
│   ├── models/                   # Mongoose schemas (Orders, Quotes, Users, Repairs)
│   ├── routes/                   # REST API routes (/api/orders, /api/quotes, /api/auth)
│   └── index.js                  # Express application entry point
│
├── public/                       # Static public assets (Favicon, logos, sound assets)
├── dist/                         # Production compiled bundle output (`npm run build`)
├── fundu_phone_quote.mjs         # Self-contained buyback valuation engine
├── tailwind.config.js            # Tailwind CSS configuration & brand color palette
├── vite.config.ts                # Vite build and dev server proxy configuration
└── package.json                  # Dependencies and execution scripts
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
# Frontend (Vite)
npm run dev

# Backend Server (Express)
npm run server
```

The app will be accessible at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Generates a minified, tree-shaken, production bundle in `dist/`.

---

## 🛠️ Key Architectural Highlights

1. **Chronological Model Sorting (Latest First):**
   - Models across both Sell and Repair pages are dynamically sorted so the newest models appear first (e.g. iPhone 18 Pro Max → 17 → 16 → 15 ... down to Classic Series).
2. **Accurate Series Categorization:**
   - Word boundaries and series definitions in `brandSeriesCatalog.ts` ensure exact matching without legacy leakage into newer flagships.
3. **Decoupled Architecture:**
   - Catalog data (`data/masterModelCatalog.ts`) is strictly decoupled from UI components, preventing circular evaluation and runtime `ReferenceError`s.
4. **Resilient Image Fallbacks:**
   - `phoneImages.ts` uses multi-tiered image resolution: Local CDN → GSMArena canonical links → SVG smart placeholders.
