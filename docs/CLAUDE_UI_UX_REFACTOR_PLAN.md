# Driplo UI/UX & Logic Refactor Plan (Home, Search, Category, Messages)

Owner: Claude-code
Status: Ready to execute
Scope: apps/web (SvelteKit), packages/ui (Melt UI-based components), packages/i18n

## Goals

- Fix language consistency: all user-facing labels render in Bulgarian for bg locale.
- Improve main page scannability without duplicating /search complexity.
- Make /search fast and obvious with quick one-tap filters (pills) and proper translations.
- Normalize category URLs and navigation so paths are clean (e.g. `/category/men/clothing`).
- Polish /messages header and tabs to fit viewport on mobile.

## Guiding Principles

- Home is for discovery (brands, sellers, promoted/newest). Deep filtering lives on /search and category pages.
- Prefer quick pills/toggles over deep dropdowns for common filters (BNWT, sizes, price).
- Use existing Melt UI primitives from `packages/ui/src/lib/primitives` (tabs, tooltip, menu) for consistency and a11y.
- Prefer server-backed canonical URLs that are human-friendly and stable for SEO.

## Deliverables (High-Level)

1) Localize category/meta text in highlight and product cards on Home (+ Featured/Newest).  
2) Add/adjust quick filters on Home “Newest listings” without turning it into /search.  
3) Translate and streamline /search header labels; add quick-condition pills and one-tap “New with tags” etc.  
4) Normalize category URLs to short form (`/category/men/clothing[/tshirts]`) while keeping DB slugs prefixed.  
5) Update category pills/links to navigate without manual refresh and reflect active state.  
6) Tweak /messages: remove “Входящи” header on mobile and ensure tabs fit without horizontal scroll.

---

## Tasks By Area (with file references and acceptance criteria)

### 1) Localization Fixes (Cards, Highlights)

- Bold: ProductHighlight translations
  - Files:
    - `packages/ui/src/lib/ProductHighlight.svelte:116`
    - `apps/web/src/routes/+page.svelte:696`
  - Changes:
    - Add a `translations` prop to `ProductHighlight` similar to `ProductCard` with:
      - `size`, `categoryTranslation`, `currency`, condition labels/tooltips.
    - Replace raw `product.main_category_name`, `product.subcategory_name`, and hardcoded `Size` with translated versions via `translations.categoryTranslation(product.main_category_name)` and `translations.size`.
  - Acceptance:
    - In Home highlights, all category labels and “Size” render in Bulgarian when locale = bg.
    - No English labels remain except brand names/sizes.

- Bold: FeaturedProducts → ProductCard category translation
  - Files:
    - `packages/ui/src/lib/FeaturedProducts.svelte:... ProductCard translations`
    - `apps/web/src/routes/+page.svelte:706`
  - Changes:
    - Ensure `translations.categoryTranslation` is passed down (it already is on Home). Verify same path is used in other grids if any.
  - Acceptance:
    - “Newest listings” cards show localized main/subcategory text.

- Bold: Central category translation util alignment
  - Files:
    - `apps/web/src/lib/categories/mapping.ts`
    - `packages/i18n/messages/bg.json`
  - Changes:
    - Continue using `translateCategory()` as fallback, but prefer i18n keys where present. Add missing i18n keys if we rely on them in UIs around search/category.
  - Acceptance:
    - No missing translation warnings; output consistent across Home/Search/Category.

### 2) Home “Newest listings” UX polish (lightweight)

- Bold: Add subtle quick pills (no deep filters)
  - Files:
    - `packages/ui/src/lib/FeaturedProducts.svelte`
    - `apps/web/src/routes/+page.svelte`
  - Changes:
    - Add an optional `quickPills` slot/prop for up to 3 common shortcuts beneath the section header:
      - BNWT (brand_new_with_tags)
      - Like New / Newest
      - “Under 50 лв” (configurable threshold) or “Top Brands” (Nike, Adidas…)
    - Clicking a pill navigates to `/search?...` with appropriate query params (not local filtering), keeping Home lean.
  - Acceptance:
    - Section displays at most 3 compact pills; tapping navigates to search with correct filters applied and translated.

- Bold: Typography and spacing tweaks
  - Files:
    - `packages/ui/src/lib/FeaturedProducts.svelte`
  - Changes:
    - Tighten vertical rhythm (section title → pills → grid). Preserve card density; no redesign.
  - Acceptance:
    - Visual hierarchy feels tighter; no overflow on small screens.

### 3) /search page UX: translations + quick filters

- Bold: Translate all “All …” labels
  - Files:
    - `apps/web/src/routes/search/+page.svelte:385, 390, 436, 495, 554, 587, 685, 712, 739, 828, 840, 852, 899, 1033`
    - `packages/i18n/messages/bg.json`
  - Changes:
    - Replace hardcoded “All”, “All Categories”, “All Conditions”, “All Brands”, “All Sizes”, “items found” with i18n keys.
    - Add missing i18n keys where needed (e.g., `search_allCategories`, `search_allConditions`, `search_allBrands`, `search_allSizes`, `search_itemsFound`).
  - Acceptance:
    - No English “All …” strings on bg locale; counts and labels are translated.

- Bold: Quick condition pills row
  - Files:
    - `apps/web/src/routes/search/+page.svelte` (existing `quickConditionFilters` and mobile/desktop header blocks)
  - Changes:
    - Promote “New with tags”, “Like new”, “Good” as prominent pills directly under the search bar on mobile and desktop.
    - Ensure pills toggle the `filterStore` condition and sync to URL via existing `syncFiltersToUrl` logic.
  - Acceptance:
    - One tap toggles condition; the grid updates without page refresh; URL reflects `condition=`.

- Bold: Optional size/brand micro-pills (scoped by category)
  - Files:
    - `apps/web/src/routes/search/+page.svelte` (existing `commonSizes`, `popularBrands`)
  - Changes:
    - Show a small horizontally scrollable pill strip for sizes or brands (pick one by default) controlled by selected main category. Keep under one line on mobile.
  - Acceptance:
    - Pills apply `size` or `brand` filter. No layout overflow on 360–390px widths.

- Bold: Keep heavy filtering in the dropdown/drawer
  - Rationale:
    - The main page stays light. /search remains the “global browse” with full filter panel. Don’t duplicate drawers on Home.

### 4) Category pages: URL normalization + navigation

- Bold: Canonical path normalization
  - Files:
    - `apps/web/src/lib/server/categories.remote.ts` (canonicalPath + breadcrumbs hrefs)
  - Changes:
    - When building `canonicalPath` and breadcrumb `href`s, strip the Level 1 prefix from Level 2/3 slugs for URLs:
      - L2: `${l1.slug}/${stripPrefix(l2.slug, l1.slug + '-')}`
      - L3: `${l1.slug}/${stripPrefix(l2.slug, l1.slug + '-')}/${stripPrefix(l3.slug, l1.slug + '-')}`
    - Keep DB resolution tolerant: incoming paths like `/category/men/clothing` still resolve to the prefixed DB slugs.
  - Acceptance:
    - Visiting `/category/men/clothing` does NOT redirect to `/category/men/men-clothing`.
    - Breadcrumb links and rel=canonical use the short form.

- Bold: Update internal links to short slugs
  - Files:
    - `apps/web/src/routes/category/[...segments]/+page.svelte:373, 385`
    - `apps/web/src/routes/+page.svelte` (category pills prefetch/navigation)
  - Changes:
    - Replace `href="/category/{resolution.l1?.slug}/{subcat.slug}"` with a helper using short slugs: `href="/category/{l1}/{stripPrefix(subcat.slug, l1 + '-')}"`.
    - Same for L3 links: short slugs only.
  - Acceptance:
    - Clicking “Clothing” from `/category/men` navigates to `/category/men/clothing` and renders immediately (no manual refresh needed).

- Bold: Ensure immediate client navigation
  - Files:
    - `apps/web/src/routes/category/[...segments]/+page.svelte` (buttons/anchors for subcategories)
  - Changes:
    - Use standard `<a href>` anchors (SvelteKit aware) or `goto()` with short path. Add `data-sveltekit-preload-code="hover"` to improve perceived speed.
  - Acceptance:
    - Navigation feels instant; no need to refresh to see subcategory content.

### 5) Messages: header and tabs

- Bold: Remove “Inbox” title on small screens, keep on ≥sm
  - Files:
    - `apps/web/src/lib/components/modular/ConversationSidebar.svelte:... header block`
  - Changes:
    - Wrap the `<h1>{i18n.messages_inbox()}</h1>` with `class="hidden sm:block"` or move to an accessible sr-only label on mobile.
  - Acceptance:
    - On mobile, no tall header; more vertical room for tabs and list. On desktop, title remains.

- Bold: Ensure tabs fit viewport without horizontal scroll
  - Files:
    - `apps/web/src/lib/components/modular/ConversationSidebar.svelte` or swap to `packages/ui/src/lib/primitives/tabs/Tabs.svelte`
  - Changes:
    - Either slim the current pill buttons (min-width, padding) or replace with Tabs primitive configured as scrollable=false on ≥sm.
  - Acceptance:
    - The four tabs render within viewport width on 360–390px devices.

---

## i18n Additions (bg)

- Add/ensure keys:
  - `search_allCategories`, `search_allConditions`, `search_allBrands`, `search_allSizes`, `search_itemsFound`.
  - `ui_partners` label for Home partners row.
  - If using quick pills on Home: `home_bnwt`, `home_likeNew`, `home_underPrice` (with a formatter), or reuse existing condition keys.
- Validate existing condition strings map to ProductCard tooltips in Bulgarian.

---

## Implementation Order (Phases)

1) Phase 1 – Localization & URL normalization
   - ProductHighlight translations
   - Translate /search header strings
   - Canonical URL + breadcrumb normalization (short slugs)
   - Update category links to short form

2) Phase 2 – Quick filters
   - Home quick pills (navigate to /search)
   - /search quick condition pills refinements (ensure toggle + URL sync)

3) Phase 3 – Messages polish
   - Remove mobile header, fit tabs

4) Phase 4 – QA & polish
   - Visual QA on 360–1440px widths
   - Lighthouse pass (no regressions)

---

## Concrete TODOs (for Claude)

1) ProductHighlight: add `translations` prop; replace raw labels with translated ones.  
   - files: `packages/ui/src/lib/ProductHighlight.svelte`, update usage in `apps/web/src/routes/+page.svelte` to pass i18n + categoryTranslation.

2) /search: replace hardcoded “All …” strings with i18n.  
   - file: `apps/web/src/routes/search/+page.svelte` (multiple spots via grep). Add missing keys to `packages/i18n/messages/bg.json`.

3) Category URL normalization: short canonical + breadcrumbs.  
   - file: `apps/web/src/lib/server/categories.remote.ts` (build helper `stripPrefix(slug, prefix)`). Use short slugs in `canonicalPath` and breadcrumb `href`s.

4) Category page links: emit short slugs.  
   - file: `apps/web/src/routes/category/[...segments]/+page.svelte` (use a local `toShortSlug(l1, slug)` helper). Update Home category pills in `apps/web/src/routes/+page.svelte` to prefetch/navigate using short slugs.

5) Home quick pills: add up to 3 pills below “Newest listings” header that navigate to `/search` with query params.  
   - files: `packages/ui/src/lib/FeaturedProducts.svelte` (slot or prop), `apps/web/src/routes/+page.svelte` wiring.

6) Messages: hide Inbox title on mobile; ensure tabs fit without scroll.  
   - file: `apps/web/src/lib/components/modular/ConversationSidebar.svelte` (responsive classes or Tabs primitive).

7) Sanity sweep for Bulgarian consistency across touched UIs.

---

## Acceptance Criteria (DoD)

- Home
  - Highlights and “Newest listings” show Bulgarian category labels everywhere (no English category labels left).
  - Home pills, when present, route to /search with correct filters; back/forward preserves state.

- Search
  - Top segment pills “Всички/Жени/Мъже/Деца/Унисекс” translate and filter correctly.
  - “All …” menus/labels are fully localized.
  - Quick-condition pills toggle and sync `condition=` in URL; grid updates instantly.

- Category
  - `/category/men/clothing` is stable and canonical; no redirect to `/men/men-clothing`.
  - Clicking L2/L3 links navigates instantly without requiring a manual refresh.

- Messages
  - On mobile, no “Входящи” header; 4 tabs fit comfortably without horizontal scroll.

- QA
  - No console errors. No i18n key misses.
  - E2E happy path on Home, /search, /category/men/clothing, and /messages.

---

## Notes / References

- Home
  - `apps/web/src/routes/+page.svelte`
  - `packages/ui/src/lib/PromotedHighlights.svelte`
  - `packages/ui/src/lib/ProductHighlight.svelte`
  - `packages/ui/src/lib/FeaturedProducts.svelte`
  - `packages/ui/src/lib/ProductCard.svelte`

- Search
  - `apps/web/src/routes/search/+page.svelte`
  - `apps/web/src/lib/stores/product-filter.svelte.ts`

- Category
  - `apps/web/src/routes/category/[...segments]/+page.svelte`
  - `apps/web/src/lib/server/categories.remote.ts`

- Messages
  - `apps/web/src/lib/components/modular/ConversationSidebar.svelte`
  - `apps/web/src/routes/(protected)/messages/ModularMessages.svelte`

- Melt UI primitives
  - `packages/ui/src/lib/primitives/tabs/Tabs.svelte`
  - `packages/ui/src/lib/primitives/tooltip/Tooltip.svelte`

