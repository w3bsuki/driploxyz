# Apps/Web Complete Structure Audit

**Date:** October 13, 2025  
**Purpose:** Complete inventory of the main web application structure

---

## 📊 Overview

**Location:** `apps/web/`  
**Type:** SvelteKit Application (Main Production App)  
**Status:** ✅ Active - This is our ONE and ONLY app

---

## 📁 Root Level Files & Folders

### Configuration Files
```
apps/web/
├── .env                        # Local environment variables
├── .env.example                # Example env template
├── .gitignore                  # Git ignore patterns
├── .npmrc                      # NPM configuration
├── .prettierignore             # Prettier ignore
├── .prettierrc                 # Prettier config
├── eslint.config.ts            # ESLint configuration
├── package.json                # Package dependencies & scripts
├── playwright.config.ts        # E2E test configuration
├── README.md                   # App documentation
├── svelte.config.js            # SvelteKit configuration
├── tsconfig.json               # TypeScript configuration
├── typescript-errors.txt       # ⚠️ Error tracking file
├── vite.config.ts              # Vite configuration
├── vite.dev.config.ts          # Dev-specific Vite config
└── vitest.config.ts            # Unit test configuration
```

### Generated/System Folders
```
├── .svelte-kit/                # ✅ SvelteKit build output (gitignored)
├── .turbo/                     # ✅ Turbo cache (gitignored)
├── .vercel/                    # ✅ Vercel deployment cache (gitignored)
└── node_modules/               # ✅ Dependencies (gitignored)
```

### Working Folders
```
├── email-templates/            # Email template files
├── scripts/                    # Build & utility scripts
│   └── build-report.mjs        # Build analysis script
├── src/                        # ⭐ Main source code
├── static/                     # Static assets (fonts, icons, images)
└── tests/                      # E2E tests (Playwright)
```

---

## 🎯 Source Code Structure (`src/`)

### Root Source Files
```
src/
├── ambient.d.ts                # Ambient TypeScript declarations
├── app.css                     # Global styles
├── app.d.ts                    # App-level TypeScript types
├── app.html                    # HTML template
├── hooks.client.ts             # Client-side hooks
├── hooks.server.ts             # Server-side hooks
├── hooks.ts                    # Shared hooks
├── service-worker.ts           # PWA service worker
└── test-setup.ts               # Test configuration
```

### Main Source Folders
```
src/
├── lib/                        # ⭐ Shared library code (utilities, components, etc.)
├── params/                     # SvelteKit parameter matchers
├── routes/                     # ⭐ Application routes (pages & APIs)
└── types/                      # TypeScript type definitions
```

---

## 📚 Library Structure (`src/lib/`)

### Core Files
```
lib/
├── index.ts                    # Main library exports
├── auth.ts                     # Auth utilities
├── cache.ts                    # Caching logic
├── links.ts                    # Link utilities
└── seo.ts                      # SEO utilities
```

### Feature Modules (30 folders)
```
lib/
├── analytics/                  # Analytics tracking
│   └── product.ts
│
├── auth/                       # Authentication system
│   ├── AuthErrorBoundary.svelte
│   ├── AuthProvider.svelte
│   ├── hooks.ts
│   ├── index.ts
│   ├── oauth.ts
│   ├── onboarding.ts
│   ├── README.md
│   └── store.svelte.ts
│
├── categories/                 # Product categories
│   ├── mapping.ts
│   └── translation-test.ts
│
├── client/                     # Client-side API calls
│   ├── auth.ts
│   └── products.ts
│
├── components/                 # ⭐ Reusable UI components (20+ files)
│   ├── ConversationList.svelte
│   ├── EarlyBirdBanner.svelte
│   ├── ErrorBoundary.svelte
│   ├── FavoriteButtonWithRealtimeWrapper.svelte
│   ├── FollowButtonWithRealtimeWrapper.svelte
│   ├── FormErrorBoundary.svelte
│   ├── Header.svelte
│   ├── HeroSearch.svelte
│   ├── LocaleDetector.svelte
│   ├── MessageInput.svelte
│   ├── MessageThread.svelte
│   ├── OptimizedImage.svelte
│   ├── PageLoader.svelte
│   ├── PaymentErrorBoundary.svelte
│   ├── PayoutRequestModal.svelte
│   ├── RealtimeErrorBoundary.svelte
│   ├── RealtimeManager.svelte
│   ├── RegionSwitchModal.svelte
│   ├── VirtualProductGrid.svelte
│   ├── business/               # Business-related components
│   └── forms/                  # Form components
│       ├── EnhancedForm.svelte
│       ├── MultiStepForm.svelte
│       ├── README.md
│       ├── SelectField.svelte
│       └── TextareaField.svelte
│
├── cookies/                    # Cookie management
│   └── production-cookie-system.ts
│
├── country/                    # Country detection
│   └── detection.ts
│
├── data/                       # Static data
│   └── collections.ts
│
├── env/                        # Environment utilities
│   ├── server.ts
│   └── validation.ts
│
├── hooks/                      # Custom Svelte hooks
│   └── use-country.ts
│
├── jobs/                       # Background jobs
│   └── slug-processor.ts
│
├── locale/                     # Localization
│   └── detection.ts
│
├── middleware/                 # Middleware functions
│   ├── error-handler.ts
│   ├── rate-limiter.ts
│   ├── security.ts
│   └── validation.ts
│
├── monitoring/                 # Performance monitoring
│   └── performance.ts
│
├── realtime/                   # Real-time features
│   └── notifications.ts
│
├── security/                   # Security utilities
│   └── rate-limiter.ts
│
├── server/                     # ⭐ Server-side utilities (30+ files)
│   ├── api.ts
│   ├── auth-guard.ts
│   ├── auth.ts
│   ├── categories.remote.ts
│   ├── country-redirect.ts
│   ├── country.ts
│   ├── csrf.ts
│   ├── env.ts
│   ├── error-handler.ts
│   ├── geo-detection.ts
│   ├── hooks.ts
│   ├── i18n.ts
│   ├── locale-redirect.ts
│   ├── products.ts
│   ├── rate-limit.ts
│   ├── rate-limiter.ts
│   ├── reviews.ts
│   ├── sentry-config.ts
│   ├── sentry.ts
│   ├── slug-validation.ts
│   ├── supabase-hooks.ts
│   ├── supabase.server.ts
│   ├── utils.ts
│   ├── validation.ts
│   ├── virtual-categories.ts
│   ├── analytics/
│   ├── cookies/
│   ├── env/
│   ├── jobs/
│   ├── middleware/
│   ├── monitoring/
│   ├── security/
│   ├── supabase/              # Supabase server utils
│   │   ├── client.ts
│   │   ├── columns.ts
│   │   ├── country-queries.ts
│   │   ├── image-processor.ts
│   │   ├── server.ts
│   │   └── storage.ts
│   ├── utils/
│   │   ├── cache.ts
│   │   ├── payments.ts
│   │   └── rate-limiting.ts
│   └── __tests__/
│       └── supabase.server.test.ts
│
├── stores/                     # ⭐ Svelte 5 runes stores (13 files)
│   ├── auth-popup.svelte.ts
│   ├── auth.svelte.ts
│   ├── categories-cache.svelte.ts
│   ├── favorites.svelte.ts
│   ├── follow.svelte.ts
│   ├── followNotifications.svelte.ts
│   ├── messageNotifications.svelte.ts
│   ├── notifications.svelte.ts
│   ├── orderNotifications.svelte.ts
│   ├── orderSubscription.svelte.ts
│   ├── product-filter.svelte.ts
│   ├── purchase.svelte.ts
│   └── toast.svelte.ts
│
├── stripe/                     # Stripe payment integration
│   └── client.ts
│
├── supabase/                   # Supabase client utilities
│   ├── client.ts
│   ├── columns.ts
│   ├── country-queries.ts
│   ├── image-processor.ts
│   ├── server.ts
│   └── storage.ts
│
├── tutorial/                   # User tutorial system
│   └── manager.svelte.ts
│
├── types/                      # TypeScript types
│   └── index.ts
│
├── utils/                      # ⭐ Utility functions (30+ files)
│   ├── api-error-handler.ts
│   ├── auth-helpers.ts
│   ├── date.ts
│   ├── debounce.ts
│   ├── domains.ts
│   ├── error-handling.svelte.ts
│   ├── error-logger.ts
│   ├── filter-url.ts
│   ├── form-accessibility.ts
│   ├── form-validation.svelte.ts
│   ├── format.ts
│   ├── image-optimization.ts
│   ├── image-processing.ts
│   ├── imageAnalysis.ts
│   ├── language-switcher.ts
│   ├── locale-links.ts
│   ├── log.ts
│   ├── messages-error-handler.ts
│   ├── monitoring.ts
│   ├── navigation.ts
│   ├── payments.ts
│   ├── performance.ts
│   ├── pluralization.ts
│   ├── price.ts
│   ├── rate-limiting.ts
│   ├── realtimeSetup.ts
│   ├── rtl.ts
│   ├── security-audit.ts
│   ├── sentry-auth.ts
│   ├── seo-urls.ts
│   ├── slug-backfill.ts
│   ├── slug.ts
│   ├── url.ts
│   ├── validation.ts
│   ├── viewTracking.ts
│   └── __tests__/
│       ├── auth-helpers.test.ts
│       └── validation.test.ts
│
├── validation/                 # Validation schemas
│   ├── auth.ts
│   └── product.ts
│
└── __tests__/                  # Lib-level tests
    └── README.md
```

---

## 🛣️ Routes Structure (`src/routes/`)

### Route Groups (7 groups)

#### 1. **(admin)** - Admin Routes (Protected)
```
(admin)/
├── +error.svelte
├── +layout.server.ts           # Admin auth guard
├── +layout.svelte
└── admin/
    ├── +page.server.ts         # Admin dashboard
    ├── +page.svelte
    └── payouts/                # Payout management
        ├── +page.server.ts
        └── +page.svelte
```
**Status:** ✅ Keep - Custom admin features (payout approvals)

---

#### 2. **(api)** - Remote Procedure Calls
```
(api)/
└── favorites.remote.ts         # Favorites RPC endpoint
```
**Status:** ⏳ Review - Minimal, might be obsolete

---

#### 3. **(app)** - Main Application Routes

**Shop Routes:**
```
(app)/(shop)/
├── +layout.svelte
├── brands/                     # Brand directory
├── category/[...segments]/     # Dynamic category pages
├── collection/[slug]/          # Collections
├── designer/                   # Designer items
├── drip/                       # Drip page
├── product/
│   ├── [id]/                   # Product by ID
│   └── [seller]/[slug]/        # Product by seller/slug
├── search/                     # Search results
├── sellers/                    # Seller directory
└── wishlist/                   # User wishlist
```

**Account Routes:**
```
(app)/(account)/
├── +layout.svelte
├── pro/                        # Pro account features
└── profile/[id]/               # Public user profiles
```

**Status:** ✅ Keep all - Core shop functionality

---

#### 4. **(auth)** - Authentication Routes
```
(auth)/
├── +error.svelte
├── +layout.server.ts           # Auth layout
├── +layout.svelte
├── auth-code-error/            # Auth error page
├── forgot-password/            # Password reset
├── login/                      # Login page
├── signup/                     # Registration
└── verify-email/               # Email verification
```
**Status:** ✅ Keep all - Essential auth flow

---

#### 5. **(marketing)** - Marketing/Legal Pages
```
(marketing)/
├── +layout.svelte
├── about/                      # About us
├── blog/                       # Blog (placeholder?)
├── careers/                    # Careers page
├── help/                       # Help center
├── privacy/                    # Privacy policy
│   └── cookies/                # Cookie policy
├── returns/                    # Returns policy
├── terms/                      # Terms of service
└── trust-safety/               # Trust & safety
```
**Status:** ⏳ Review - Check if blog/careers are actually used

---

#### 6. **(protected)** - Authenticated User Routes

**Dashboard:**
```
(protected)/dashboard/
├── +page.server.ts             # Dashboard home
├── +page.svelte
├── earnings/                   # Seller earnings
├── order-management/           # Order management
├── profile/                    # Profile pages
│   └── edit/                   # Edit profile
├── purchases/                  # Purchase history
├── sales/                      # Sales history
├── sold/                       # Sold items
└── upgrade/                    # Account upgrade
    └── success/                # Upgrade success
```

**Other Protected Routes:**
```
(protected)/
├── +error.svelte
├── +layout.server.ts           # Auth guard
├── +layout.svelte
├── account/                    # Account settings
├── become-seller/              # Seller onboarding
├── checkout/                   # Checkout flow
│   ├── bundle/                 # Bundle checkout
│   └── [productId]/            # Single product checkout
├── favorites/                  # User favorites
├── listings/                   # User's listings
├── messages/                   # Messaging system
│   ├── components/
│   └── new/                    # New message
├── offer/[sellerId]/           # Make offer
├── onboarding/                 # User onboarding
├── orders/                     # Order history
├── payment/success/            # Payment success
├── product/[id]/edit/          # Edit product
├── profile/                    # Own profile
│   └── edit/                   # Edit own profile
├── purchases/                  # Purchases
├── sell/                       # ⭐ List new item
│   └── components/             # Sell form steps (8 components)
├── settings/                   # User settings
└── welcome/                    # Welcome page
```
**Status:** ✅ Keep all - Core user features

---

### API Routes (`routes/api/`)

```
api/
├── +layout.server.ts           # API layout
├── admin/
│   └── archive-orders/         # Admin: archive orders
├── auth/                       # Auth endpoints
│   ├── login/
│   ├── logout/
│   ├── resend-verification/
│   └── signup/
├── checkout/                   # Checkout API
│   ├── +server.ts
│   └── confirm/
├── client-info/                # Client info endpoint
├── cron/                       # Cron jobs
│   └── archive-orders/
├── favorites/                  # Favorites API
│   ├── +server.ts
│   ├── status/
│   └── [productId]/
├── followers/                  # Follow system API
│   ├── status/
│   └── toggle/
├── health/                     # Health check
├── jobs/                       # Background jobs
│   └── process-slugs/
├── monitoring/                 # Monitoring endpoints
│   └── performance/
├── onboarding/                 # Onboarding API
│   └── complete/
├── orders/                     # Orders API
│   └── [id]/
│       ├── +server.ts
│       └── status/
├── payments/                   # Payment API
│   ├── confirm/
│   └── create-intent/
├── products/                   # Products API
│   ├── price-suggestions/
│   └── [id]/
├── profile/                    # Profile API
│   └── update-account-type/
├── recent-listings/            # Recent listings
├── region/                     # Region switching
│   └── switch/
├── reviews/                    # Reviews API
│   ├── +server.ts
│   ├── order/[orderId]/
│   └── [sellerId]/
├── search/                     # Search API
│   ├── +server.ts
│   └── __tests__/
├── sellers/                    # Sellers API
│   └── [sellerId]/products/
├── subscription-plans/         # Subscription plans
├── subscriptions/              # Subscription management
│   ├── cancel/
│   ├── create/
│   ├── discount/
│   ├── plans/
│   └── validate-discount/
├── validate-slug/              # Slug validation
├── webhooks/                   # Webhooks
│   └── stripe/                 # Stripe webhooks
│       ├── +server.ts
│       └── subscriptions/
└── _debug/                     # ⚠️ Debug endpoints (REMOVE IN PROD)
    ├── env/
    ├── locals/
    ├── ping/
    └── supabase/
```

**Status:** 
- ✅ Keep all production APIs
- ⚠️ **DELETE `_debug/` before production**

---

### Standalone Routes

```
routes/
├── +error.svelte               # Global error page
├── +layout.server.ts           # Root layout server
├── +layout.svelte              # Root layout
├── +layout.ts                  # Root layout client
├── +page.server.ts             # Homepage server
├── +page.svelte                # Homepage
├── auth/                       # Auth callback routes
│   ├── callback/
│   ├── confirm/
│   └── verified/
├── components/                 # Route-level components
│   ├── Header.svelte
│   ├── RealtimeErrorBoundary.svelte
│   └── RegionSwitchModal.svelte
├── logout/                     # Logout handler
├── offline/                    # Offline page (PWA)
├── register/                   # Registration handler
├── robots.txt/                 # SEO: robots.txt
├── sitemap.xml/                # SEO: sitemap
└── [...slug]/                  # Catch-all route
```

---

## 🧪 Tests Structure (`tests/`)

```
tests/
├── auth.spec.ts                # Auth E2E tests
├── checkout.spec.ts            # Checkout E2E tests
├── fixtures.ts                 # Test fixtures
├── IMPLEMENTATION_PROGRESS.md  # Test progress tracking
├── onboarding.spec.ts          # Onboarding E2E tests
├── search.spec.ts              # Search E2E tests
└── setup.ts                    # Test setup
```

**Status:** ✅ Keep - Essential testing

---

## 📦 Static Assets (`static/`)

```
static/
├── apple-touch-icon.png        # iOS icon
├── avatars/                    # User avatar placeholders
├── favicon-32x32.png           # Favicon
├── favicon.ico                 # Favicon
├── favicon.png                 # Favicon
├── fonts/                      # Custom fonts
├── icons/                      # App icons
├── manifest.json               # PWA manifest
├── placeholder-product.svg     # Product placeholder
└── sounds/                     # Notification sounds
```

**Status:** ✅ Keep all

---

## 📊 Summary Statistics

### Code Organization
- **Total Route Groups:** 7 (admin, api, app, auth, marketing, protected, standalone)
- **Total API Endpoints:** ~50+ endpoints
- **Total UI Components:** ~40+ components
- **Total Stores:** 13 Svelte 5 rune stores
- **Total Utilities:** ~50+ utility files
- **Total Tests:** 5 E2E test suites

### Features Implemented
✅ **Core E-commerce:**
- Product browsing & search
- Shopping cart & checkout
- Order management
- Seller dashboard
- User profiles

✅ **Authentication:**
- Email/password signup/login
- OAuth (future ready)
- Email verification
- Password reset

✅ **Social Features:**
- Messaging system
- Follow system
- Favorites/wishlist
- Reviews & ratings

✅ **Seller Features:**
- List products (multi-step form)
- Manage inventory
- Track earnings
- Payout requests

✅ **Advanced Features:**
- Real-time notifications
- PWA support (offline mode)
- Multi-language (i18n)
- Multi-region
- Stripe subscriptions
- Admin panel (custom)

---

## ⚠️ Items to Review

### High Priority
1. **`typescript-errors.txt`** - ⚠️ Error tracking file in root
   - **Action:** Review errors, fix, then delete file

2. **`api/_debug/`** - ⚠️ Debug endpoints exposed
   - **Action:** Delete before production or guard with auth

3. **`(api)/favorites.remote.ts`** - Single RPC file
   - **Action:** Check if still used, might be obsolete

4. **Marketing routes** - Blog/Careers
   - **Action:** Check if actually implemented or just placeholders

### Medium Priority
5. **Duplicate component folders** - Components in both `lib/components/` and `routes/components/`
   - **Action:** Consolidate if duplicates exist

6. **Server utils duplication** - Some utils in both `lib/server/` and nested folders
   - **Action:** Review for duplication

7. **Test coverage** - Only 5 E2E tests
   - **Action:** Expand test coverage

---

## ✅ Health Check

### Well-Organized ✅
- Clear route group structure
- Separated client/server code
- Modular component architecture
- Comprehensive utility library

### Potential Issues ⚠️
- Debug endpoints still present
- TypeScript errors tracked in file
- Possible component duplication
- Some marketing pages might be placeholders

---

## 🎯 Recommended Actions

### Immediate
1. ⚠️ **Delete `api/_debug/`** or add production guard
2. ⚠️ **Review `typescript-errors.txt`** - fix errors and remove file
3. ⏳ **Audit marketing routes** - remove placeholder pages

### Short-term
4. ⏳ **Consolidate components** - check for duplicates
5. ⏳ **Review `(api)` group** - seems underutilized
6. ⏳ **Expand test coverage** - more E2E and unit tests

### Long-term
7. 📚 **Document route structure** - add route map to README
8. 📚 **Component documentation** - Storybook stories
9. 🔧 **Performance audit** - optimize bundle size

---

## 📝 Notes

- **This is a well-structured C2C marketplace** with comprehensive features
- **Most code should be KEPT** - this is production code
- **Focus cleanup on:**
  - Debug endpoints
  - Error tracking files
  - Placeholder/unimplemented features
  - Duplicate code

---

**Next Steps:** Review specific folders for deletion/consolidation opportunities
