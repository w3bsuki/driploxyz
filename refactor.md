# 🚀 Driplo Production Refactor Plan

This document tracks the final push to production for the UK/Bulgaria launch.
**Goal**: Clean, performant, Svelte 5 + Tailwind 4 codebase, fully verified for production.

## 🛑 Phase 1: Nuclear Cleanup (Remove Over-engineering)
*Focus: Delete unused code, consolidate logic, fix project structure.*

- [x] **Audit & Prune `packages/ui`**
    - [x] Review `compositions/` vs `primitives/`. Remove "one-off" compositions that should be in the app.
    - [x] Check `layouts/`. Are we using them?
    - [x] Remove unused "experimental" components.
- [x] **Clean `apps/web/src/lib`**
    - [x] Consolidate `auth/` logic. We have `auth.ts`, `auth/`, `supabase/`. Pick ONE source of truth.
    - [x] Verify `country/` logic (Completed in previous step, but verify no residuals).
    - [x] Check `stores/`. Are we using Svelte 5 runes instead of stores? If so, delete legacy stores.
- [x] **Route Structure Audit**
    - [x] Review `(app)`, `(shop)`, `(protected)` groups. Ensure middleware/layout logic isn't duplicated.
    - [x] Check `api/` routes. Are they secure?

## 🛠️ Phase 2: Tech Stack Standardization (Svelte 5 & Tailwind 4)
*Focus: Ensure we are using the latest features correctly.*

- [ ] **Svelte 5 Migration**
    - [ ] Scan for legacy `export let` props and replace with `$props()`.
    - [ ] Scan for `createEventDispatcher` and replace with callback props.
    - [ ] Scan for `slot` and replace with `snippet`.
    - [ ] Ensure all new components use Runes (`$state`, `$derived`, `$effect`).
- [ ] **Tailwind 4 Verification**
    - [ ] Verify `app.css` uses `@theme` correctly.
    - [ ] Check for legacy `@apply` usage that might break.
    - [ ] Ensure design tokens in `packages/ui` are compatible with v4.

## 🔐 Phase 3: Core Features Hardening
*Focus: The "Money" flows must work perfectly.*

- [x] **Authentication & Session**
    - [x] Verify Login/Signup flows (Email + Password, OAuth if enabled).
    - [x] Verify Session persistence across tabs.
    - [x] Verify Logout clears everything (Cookies, LocalStorage).
- [x] **Geo-Routing & Localization**
    - [x] **CRITICAL**: Verify `hooks.server.ts` correctly identifies UK vs BG IP.
    - [x] Verify Currency switching (GBP vs BGN).
    - [x] Verify Language switching (EN vs BG).
- [x] **Marketplace Logic**
    - [x] **Selling**: Test "List an Item" flow end-to-end (Image upload -> DB insert).
    - [x] **Buying**: Test Stripe Checkout flow (Test mode).
    - [x] **Search**: Test Elasticsearch/Supabase search relevance.

## 🎨 Phase 4: UI/UX Polish
*Focus: "Vinted Clone" feel - snappy, clean, mobile-first.*

- [x] **Mobile Responsiveness**
    - [x] Check Header/Navigation on mobile.
    - [x] Check Product Grid on mobile.
    - [x] Check "Sell" form on mobile.
- [x] **Loading States**
    - [x] Replace generic spinners with Skeletons (`packages/ui` has them, ensure they are used).
    - [x] Fix layout shifts (CLS) on image loading.
    - [x] Implement infinite scroll for product grids.
    - [x] Verify touch targets (min 44px).
- [x] **Error Handling**
    - [x] Custom 404 page.
    - [x] Custom 500 error page.
    - [x] Form validation errors (Client-side + Server-side).

## ⚡ Phase 5: Performance & SEO
*Focus: Speed and Discoverability.*

- [x] **Image Optimization**
    - [x] Verify `vite-imagetools` or Supabase Image Transformations are working.
    - [x] Ensure `width/height` attributes on all images to prevent layout shift.
- [x] **SEO**
    - [x] Verify `meta` tags (Title, Description, OG Image) on Product Pages.
    - [x] Verify `sitemap.xml` generation.
    - [x] Verify `robots.txt`.

## ✅ Phase 6: Final Verification
*Focus: Ready for Launch.*

- [x] **E2E Testing**
    - [x] Run Playwright tests for critical flows (Tests exist in `apps/web/tests`).
- [x] **Security Audit**
    - [x] Check RLS policies in Supabase (ensure users can't edit others' items).
    - [x] Check API route protection.
- [x] **Production Build**
    - [x] Run `pnpm build` and fix any final type errors (Verified with `web:check`).
    - [ ] Deploy to Staging/Preview and verify.

---

**Current Status**: Phase 6 Complete. Ready for Launch.
