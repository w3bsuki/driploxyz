# PDP Mobile-First — Execution Plan

Purpose: Implement a fast, accessible mobile-first Product Detail Page using @repo/ui primitives and Tailwind v4 tokens.

Single-Task Mode: Follow steps, keep diffs ≤ 400 LOC per PR, update CODEX_TASKLIST.

## 0) Read
- `docs/pdp-mobile-first-revamp.md`
- `docs/pdp-ux-refactor-plan.md`
- `docs/UI_LIBRARY.md`, `docs/TAILWIND_V4_FIX_PLAN.md`

## 1) Component Layout and Ownership
- Use/polish these from `@repo/ui` (promote missing pieces if truly reusable):
  - ProductImageGallery, ProductHero, ProductActionBar (sticky on mobile), BuyBox, ProductDetails, SellerProfile, ProductRecommendations, ProductBreadcrumb
- Keep route orchestrators in app (`apps/web`); move purely presentational subcomponents to `@repo/ui`

## 2) Performance & LCP
- Preload main image variants in `<SEOMetaTags>` (already implemented)
- Ensure placeholder/skeletons to avoid CLS during image load
- Defer non-critical sections (recommendations) below-the-fold
- Verify mobile LCP ≤ 1.5s (p75) on product pages

## 3) Accessibility
- All interactive elements keyboard-accessible; visible focus (`outline-none` + tokenized focus ring)
- Correct roles/ARIA for image gallery thumbnails, next/prev controls, buttons
- Text alternatives on images (first image → alt from product title)

## 4) Tailwind v4 Styling
- Use tokens/semantic utilities; no raw colors
- Tap targets: 44px primary, 36–40px standard controls
- Consistent spacing scale; use existing semantic utilities for menus/dialogs/banners

## 5) Data Wiring
- Validate inputs and SSR data for PDP route
- Show helpful empty/skeleton states when data missing
- Maintain snappy navigations with prefetch where available

## 6) QA and Validation
- Types/lint/build pass
- Playwright: add/extend PDP spec covering image zoom/swipe, add-to-cart/buy, scrolling behavior, focus order
- Lighthouse mobile p75 ≥ 90, LCP ≤ 1.5s; no CLS

## Acceptance Criteria
- PDP loads fast on mobile; LCP budget met; zero critical a11y issues
- Uses `@repo/ui` components for shared UI; no duplicates in app
- Tokenized Tailwind v4 styles only; no raw color literals
- Tests and build pass; PR contains clear summary and before/after notes

