## Product Page (PDP) Revamp & Refactor Plan

> Scope: Convert the current PDP into a professional, conversion‑optimized ecommerce page with mobile‑first UX, clean visual hierarchy, and modular architecture. Align with existing patterns in `@repo/ui`, keep SSR correct, and hit Lighthouse budgets.

### Objectives
- Deliver a best‑in‑class PDP UX: intuitive gallery, crisp information, clear CTAs, strong trust, fast performance.
- Enforce a modular, maintainable structure: small focused components, explicit contracts, zero inline complexity.
- Mobile‑first by default: ergonomic controls, minimal clutter, sticky primary action, progressive disclosure of details.
- Performance budgets: LCP < 2.5s (mobile), TBT < 200ms, CLS < 0.1, Perf ≥ 90%. See `docs/LIGHTHOUSE_CI_SETUP.md`.

### Current Architecture (snapshot)
- Route: `apps/web/src/routes/product/[seller]/[slug]/+page.svelte` renders `SEOMetaTags` + `ProductPage`.
- Legacy route: `apps/web/src/routes/product/[id]/+page.svelte` still exists; a catch‑all `apps/web/src/routes/[...slug]/+page.svelte` proxies legacy formats.
- Main UI: `packages/ui/src/lib/ProductPage.svelte` orchestrates:
  - `ProductBreadcrumb.svelte`
  - `ProductGallery.svelte` (uses `ConditionBadge.svelte`, `primitives/tooltip/Tooltip.svelte`)
  - `ProductInfo.svelte` (uses `Badge.svelte`)
  - `BuyBox.svelte` (uses `Button.svelte`, Melt UI dialog)
  - `SellerCard.svelte`
  - `ProductActionBar.svelte` (mobile sticky CTAs)
  - Inline sections for Reviews, Similar Products, More from Seller
- SEO: `packages/ui/src/lib/SEOMetaTags.svelte` (already solid; keep).

### Component Inventory (used or should be used)

| Component | File | Role | Notes |
| --- | --- | --- | --- |
| ProductPage | `packages/ui/src/lib/ProductPage.svelte` | Container/orchestrator | Too large; needs extraction into submodules
| ProductBreadcrumb | `packages/ui/src/lib/ProductBreadcrumb.svelte` | Breadcrumb + JSON‑LD | Good; ensure canonical URL prop is set
| ProductGallery | `packages/ui/src/lib/ProductGallery.svelte` | Image viewer, swipe/keys, condition | Add lazy/zoom/ARIA refinements; unify sold overlay
| ProductInfo | `packages/ui/src/lib/ProductInfo.svelte` | Title, quick facts, description, details | Replace `<details>` with shared `Accordion.svelte`; add micro‑UX
| BuyBox | `packages/ui/src/lib/BuyBox.svelte` | Price, shipping, fees, CTAs | Guard rails + price formatting; defer dialogs until user intent
| ProductActionBar | `packages/ui/src/lib/ProductActionBar.svelte` | Mobile primary action bar | Keep; wire to same handlers as BuyBox
| SellerCard | `packages/ui/src/lib/SellerCard.svelte` | Seller info/CTA | Keep; align props to consistent types
| ProductCard | `packages/ui/src/lib/ProductCard.svelte` | Grid cards | Use for Similar and More from Seller sections
| RatingSummary | `packages/ui/src/lib/RatingSummary.svelte` | Aggregate rating | Show above reviews
| ReviewDisplay / ReviewModal / RatingModal | `packages/ui/src/lib/Review*.svelte` | Reviews & add‑review | Integrate; lazy‑mount modal
| TrustBadges | `packages/ui/src/lib/TrustBadges.svelte` | Trust signals | Embed in `ProductInfo` and/or `BuyBox`
| ConditionBadge | `packages/ui/src/lib/ConditionBadge.svelte` | Condition label | Reuse in gallery/info
| SizeSelector | `packages/ui/src/lib/SizeSelector.svelte` | Size selection | Optional if sizes are variants; else keep size info in facts
| ConditionReport | `packages/ui/src/lib/ConditionReport.svelte` | Detailed condition | Place in details tab/accordion
| SEOMetaTags | `packages/ui/src/lib/SEOMetaTags.svelte` | SEO/meta preload | Required on PDP route

Reference: `docs/PRODUCT_PAGE_COMPONENTS.md`, `docs/product-page-finalization-plan.md`.

## Revamp: Mobile‑First Structure & UX Blueprint

1) Above the fold (mobile)
- Gallery (aspect‑ratio 4/5 → 3/4 at sm+), swipe + dots, pinch‑to‑zoom on tap/expand
- Title + quick facts chips (brand/size/condition)
- Primary price + CTAs via `ProductActionBar` (sticky)

2) Details block
- Description (clamp + Read more)
- Item Details (Accordion) → brand, size, color, material; `ConditionReport` if present
- Trust badges row (authenticity, secure payments, returns)

3) Seller block
- Seller card (avatar, rating, response rate), CTA: Message Seller

4) Social proof
- `RatingSummary` + recent `ReviewDisplay`
- Button: View all reviews → lazy‑open `ReviewModal`

5) Discovery
- Similar items (category/brand proximity) using `ProductCard`
- More from this seller using `ProductCard`

6) Desktop enhancements
- Two‑column shell: Gallery left; Info + BuyBox right; sticky BuyBox
- Optional tabs (Details / Shipping / Reviews) using `Tabs.svelte` on md+ to organize content

## Refactor Plan (modularization)

Break `ProductPage.svelte` into composable sections with clear props and types. Keep `ProductPage` as a thin layout/controller.

New submodules to extract:
- `PDP/StickyHeader.svelte` – condensed title/brand/fav shown after scroll
- `PDP/InfoSection.svelte` – wraps `ProductInfo` + trust badges + details accordion
- `PDP/ReviewsSection.svelte` – `RatingSummary` + list of `ReviewDisplay` + lazy `ReviewModal`
- `PDP/RecommendationsSection.svelte` – Similar grid using `ProductCard`
- `PDP/SellerProductsSection.svelte` – Seller grid using `ProductCard`

Type safety:
- Promote the `ProductData` and `ReviewData` interfaces from `ProductPage.svelte` into `packages/ui/src/lib/types/index.ts` and import everywhere.
- Prefer exact prop contracts and avoid `any`. Align `BuyBox` product shape with `ProductData` subset.

Event and state flow:
- Event handlers (`onBuyNow`, `onMessage`, `onFavorite`, `onMakeOffer`) remain props from the route; components are dumb/presentational.
- Local UI state (e.g., selected image, description expand) stays within respective subcomponent.

Styling:
- Mobile‑first CSS. Remove inline style blocks from container; coalesce styles into each subcomponent using design tokens in `packages/ui/src/styles/tokens.css`.
- Replace native `<details>` with `Accordion.svelte` for consistent a11y and visuals.

Accessibility:
- Gallery: keyboard nav (Left/Right), proper `role="img"`, `aria‑label`, large tap targets.
- Buttons: `aria‑label` for favorite toggle; focus states using tokens.
- Landmarks: use `<main>`, section headings, and list semantics in grids.

Performance:
- Image optimization: correct sizes/srcset, eager load hero, lazy others, decode async.
- Defer non‑critical sections (Reviews, Recommendations) via `IntersectionObserver`.
- Preconnect/preload hooks handled by `SEOMetaTags` (already supports image preloads). Ensure canonical passed.
- Reduce hydration: move derived SEO strings and seller/category mapping server‑side in `+page.server.ts`.

Testing:
- Add Playwright flows covering mobile PDP: gallery swipe, sticky bar CTAs, add/remove favorite, read more/less, tab/accordion.
- Visual test key breakpoints (375, 768, 1024).

## Per‑Component Refactor Proposals

### ProductBreadcrumb
- Keep structure and JSON‑LD. Ensure `currentUrl` is always passed from route.
- Improve scroll container a11y (breadcrumb should not trap keyboard).

### ProductGallery
- Add pinch‑zoom/lightbox on tap (modal optional, lazy loaded).
- Ensure all thumbnails and controls are minimum 44px touch targets.
- Unify sold overlay by reusing `SoldOverlay.svelte` instead of bespoke markup.
- Add `sizes`/`srcset`; prefer `object-fit: contain` to avoid CLS.

### ProductInfo
- Replace native `<details>` with shared `Accordion.svelte`.
- Add optional `TrustBadges` at bottom.
- Expose a `facts` prop (normalized KV) for easy reordering and i18n.

### BuyBox
- Keep pricing calc; align product prop to a `BuyBoxProduct` derived from `ProductData`.
- Defer dialogs (protection info) until interaction; keep code‑split if bundle size regresses.
- Add `aria-live="polite"` on total updates.

### ProductActionBar
- Ensure price formatting matches BuyBox; unify handler props.
- On desktop, remains hidden; ensure no duplicate CTAs.

### SellerCard
- Ensure alignment with profile route; expose `onMessage`.
- Show seller rating and sales if present.

### ReviewsSection (new)
- Compose `RatingSummary`, multiple `ReviewDisplay`, and a lazy `ReviewModal` for add‑review.
- Only render initial 3 reviews; expand to all on demand.

### RecommendationsSection (new)
- Use `ProductCard` grid; responsive 2/3/4 columns; lazy load on viewport.
- Show skeletons using `ProductCardSkeleton` while loading.

### SellerProductsSection (new)
- Same grid approach as recommendations; ensure clear section headings and links to seller profile/shop.

### SEOMetaTags
- Keep; ensure canonical, `hreflang`, preconnect to asset host, and preload first image.

## Routing & Data Plan
- Canonical route remains: `/product/[seller]/[slug]`.
- Migrate any usage of `/product/[id]` to canonical; keep legacy route only to redirect.
- Build all SEO strings on the server in `+page.server.ts` and pass typed data to `ProductPage`.

## Implementation Steps (PR‑sized)
1) Extraction PR
   - Move `ProductData`/`ReviewData` types to `@repo/ui` types.
   - Extract `PDP/*` subcomponents and rewrite `ProductPage` as a thin layout.
   - Replace `<details>` with `Accordion.svelte`.
2) UX/Visual PR
   - Apply mobile‑first layout polish; unify spacing via tokens.
   - Integrate `TrustBadges`, `SoldOverlay`, consistent quick facts.
   - Implement lightbox/zoom for gallery.
3) Performance/SEO PR
   - Lazy sections + IO, image `sizes/srcset`, JSON‑LD verify.
   - Ensure `SEOMetaTags` has canonical, hreflang, preloads.
4) Routing cleanup PR
   - Redirect legacy routes; keep `[...slug]` only as resolver.
5) Tests PR
   - Playwright coverage for PDP flows; visual snapshots at breakpoints.

## Acceptance Criteria
- LCP < 2.5s mobile on PDP; CLS < 0.1; Perf ≥ 90 on Lighthouse.
- `ProductPage.svelte` < 300 lines; all major sections extracted.
- Fully keyboard‑navigable gallery and controls; contrast meets WCAG AA.
- Zero console errors/warnings; no hydration mismatches.

## Notes on Consistency & Tokens
- Use `packages/ui/src/styles/tokens.css` for spacing, color, radius, focus.
- Prefer shared components (`Accordion`, `Button`, `Badge`, `Tabs`) over ad‑hoc markup.

## Full Audit Commentary
- Strengths
  - Modular pieces already exist (`ProductGallery`, `ProductInfo`, `BuyBox`, `ProductActionBar`, `SEOMetaTags`).
  - Breadcrumb JSON‑LD and SEO integration are solid.
- Issues
  - `ProductPage.svelte` is oversized and mixes layout, logic, and styles.
  - Mixed styling approaches (inline CSS + utility classes) create inconsistency.
  - Similar/Seller sections do not consistently reuse `ProductCard` and lack lazy loading.
  - Reviews UI is present but not modular; modal integration is ad‑hoc.
  - Some route variants duplicate logic; keep only canonical + redirects.

## Practical Tips
- Keep the mobile mental model: one scroll path, one primary action.
- Use progressive disclosure: clamp long description, accordion details, lazy reviews.
- Add scarcity/social proof sparingly and consistently (e.g., only when true, under 3 units left).
- Always pass `currentUrl` to breadcrumbs and `SEOMetaTags`; verify canonical and hreflang.
- Optimize first image aggressively (preload via `SEOMetaTags`, correct `sizes`).
- Ensure favorite toggles are optimistic but resilient; reconcile on failure.

—
For context and prior decisions, see `docs/PRODUCT_PAGE_COMPONENTS.md` and `docs/product-page-finalization-plan.md`.


CODEX: Architecture – consider extracting a tiny route-level container to own data fetching and pass pure props to `ProductPage` to minimize hydration payloads.
CODEX: Routing – add explicit 308 redirects from `/product/[id]` to `/product/[seller]/[slug]` and ensure trailing slash policy is consistent across the app.
CODEX: Types – define a single `ProductData` source-of-truth in `@repo/ui/types` and export narrower derived types (`BuyBoxProduct`, `GalleryImage`) to avoid ad-hoc picking.
CODEX: Data boundaries – ensure server computes all derived strings (price formatted, shipping label, SEO titles) to remove client re-computation and avoid flicker.
CODEX: Images – standardize `sizes` per breakpoint and ensure first image is `fetchpriority="high"` and preloaded via `SEOMetaTags` when it’s the hero.
CODEX: Gallery – add `prefers-reduced-motion` handling to disable autoplay/animated transitions for users who prefer reduced motion.
CODEX: Accessibility – verify all interactive controls in the gallery and action bar are ≥44px hit targets and keyboard reachable in a logical order.
CODEX: Accessibility – include proper `aria-controls`, `aria-expanded`, and focus management for the lightbox/modal; trap focus and restore on close.
CODEX: Accessibility – ensure color contrast uses tokens with AA compliance; include visible focus states across CTA buttons.
CODEX: Hydration – audit conditional rendering to avoid layout shift during client hydration; prefer SSR-stable markup and lazy-mount enhancements.
CODEX: Performance – add `IntersectionObserver` with root margin tuned for prefetching images/cards just before entering viewport; avoid eager JS in offscreen sections.
CODEX: Performance – verify bundle impact; code-split large modals and measurement libraries; keep `BuyBox` critical and small.
CODEX: Performance – add RUM (web-vitals) collection for LCP/CLS/INP to validate budgets outside Lighthouse CI; store with sampling to avoid noise.
CODEX: Caching – ensure images and product JSON are cached at the CDN edge with sensible revalidation; bust on updates via versioned URLs/ETags.
CODEX: State/events – keep components presentational; route provides `onBuyNow`/`onMessage` etc. Consider a minimal event map type to keep handlers aligned.
CODEX: BuyBox – include `aria-live="polite"` on total updates and guard against double-submit; disable button while awaiting server confirmation.
CODEX: Price formatting – centralize currency formatting with locale support; ensure consistent rounding and symbol placement.
CODEX: Trust – define a single `TrustBadges` configuration (icons + copy) with i18n keys to avoid duplication between `ProductInfo` and `BuyBox` placements.
CODEX: Reviews – lazy-load counts and first 3 reviews; fetch more on demand; include skeletons to reduce perceived latency.
CODEX: Recommendations – use a single `ProductCard` variant prop for density (compact/regular) rather than duplicating card markup.
CODEX: Seller section – add `rel="author"`/structured data links where appropriate to strengthen entity connections for SEO.
CODEX: SEO – confirm canonical, `hreflang`, Open Graph, and Twitter tags; ensure product `structured data` includes offers, availability, brand, and aggregateRating.
CODEX: SEO – avoid duplicating JSON-LD across breadcrumb and product; compose into a single script when possible to reduce bytes.
CODEX: Error states – design explicit UI for unavailable/sold products: disable CTAs, show sold overlay, offer similar items; return 410 where appropriate.
CODEX: Loading states – add deterministic skeletons for gallery, facts, and grids to prevent jank and keep layout stable.
CODEX: Analytics – instrument key events (image swipe, add-to-cart/buy-now, favorite, read-more, open-review-modal) with consistent event naming.
CODEX: Security – validate all user-provided fields (description) for safe rendering; keep HTML sanitized and avoid inline event handlers.
CODEX: Internationalization – ensure all user-facing strings are wrapped in translation utilities; avoid concatenating raw strings for SEO titles.
CODEX: Forms – for message/offer flows, use progressive enhancement; submit via fetch with server validation and optimistic UI where safe.
CODEX: Testing – add Playwright a11y scan (axe-core) for the PDP; verify keyboard traversal order and focus traps in modals.
CODEX: Testing – add visual snapshots for gallery zoom and sticky bar at 375/768/1024; ensure no overlap or clipping.
CODEX: Testing – unit tests for `ProductCard` variant props and `PriceFormatter` utilities to lock in behavior.
CODEX: Monitoring – track route-level error rates and hydration warnings in logs; fail CI on new client console errors in the PDP route.
CODEX: DX – add storybook stories for `PDP/*` submodules with controls for long titles, missing images, and edge conditions.
CODEX: Tokens – audit spacing and typography scale on mobile to ensure 4/8px rhythm; avoid one-off margins in PDP components.
CODEX: Accessibility – ensure headings follow a strict hierarchy (h1 page title, h2 sections, h3 within) for screen reader navigation.
CODEX: CLS – reserve image aspect ratios with CSS `aspect-ratio` and width/height attributes; avoid dynamic content insertion above the fold.
CODEX: INP – debounce non-critical handlers (resize, scroll listeners) and avoid heavy synchronous work on user input in gallery controls.
CODEX: Edge cases – handle missing images (fallback), missing seller data (skeleton with retry), and variants (size/color) either as separate products or explicit variant UI.
CODEX: Rollout – hide new sections behind a small feature flag to allow staged deployment and quick rollback if metrics regress.
CODEX: Migration – keep legacy `[id]` route returning 308 for 30 days while updating inbound links; monitor 404/redirect volumes in analytics.
CODEX: Documentation – add a short PDP readme in `packages/ui/src/lib/PDP/README.md` describing responsibilities, props, and composition rules.
CODEX: Ownership – define codeowners for `PDP/*` and set review rules to maintain consistency across future iterations.
CODEX: Success criteria – add a Lighthouse CI budget file specific to PDP and assert budgets per category (bytes, requests, LCP, TBT, CLS).
CODEX: Post-launch – schedule a follow-up pass to evaluate real-user metrics and refine image sizes and lazy thresholds based on field data.

