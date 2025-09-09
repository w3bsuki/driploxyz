# Product Page Refactor Guide (Svelte 5 + Tailwind v4)

Audience: Claude-code + contributors

Refactor the product page for simplicity, reuse, and mobile-first UX while keeping our design system intact.

## Objectives

- Reduce complexity without losing reuse across apps/packages.
- Simplify mobile UX: one clear sticky action; fewer stickies.
- Adopt Tailwind v4 utilities; keep tokens/semantic CSS.
- Remove route-to-route coupling; share a presentational page component.

## Approach

- Keep: `@repo/ui` modular components and tokens (`tokens.css`, `semantic.css`).
- Change: collapse micro-components into coarse sections; use snippets for small internals.
- Change: introduce a presentational `ProductPage` in UI and render it from routes.
- Change: single bottom actions bar on mobile; no progress bar; no mobile sticky header.

Notes

- Svelte 5 snippets simplify internals but don’t replace cross-package components.
- Tokens are foundational; Tailwind v4 should map to them, not hardcode colors.

## Where Things Live

- Page assembly (today): `apps/web/src/routes/product/[seller]/[slug]/+page.svelte:1`
- SEO route (brittle import): `apps/web/src/routes/[...slug]/+page.svelte:1`
- Product UI: `packages/ui/src/lib/Product{Gallery,Info,BuyBox,Seller,Reviews}.svelte`
- PDP sections: `packages/ui/src/lib/PDP/sections/*`
- Sticky header: `packages/ui/src/lib/PDP/components/StickyHeader.svelte`
- Tailwind v4 setup: `apps/web/src/app.css:1`

## Architecture

- Presentational page in UI
  - `packages/ui/src/lib/PDP/ProductPage.svelte`
  - Accepts typed data + event handlers; no fetching.
  - Composes: Gallery, Info, BuyBox, Seller, Reviews, Recommendations (or sections).

- Thin routes
  - Prepare data/state/handlers with runes, render `<ProductPage>`.
  - SEO route imports the same UI component, not another route.

- Mobile/Styling
  - New `ProductActionsBar.svelte` (sticky bottom on small screens only).
  - Favor Tailwind v4 utilities (description lists, forms, container queries).
  - Keep tokens/semantic CSS; replace bespoke CSS gradually.

## Steps (Claude-code)

1) Add `ProductPage.svelte` in `packages/ui/src/lib/PDP/`
   - Export in `packages/ui/src/lib/index.ts:1`
   - Use snippets for small UI fragments.

2) Add `ProductActionsBar.svelte` in `packages/ui/src/lib/PDP/components/`
   - Primary CTA + message/offer; UI-only; export in index.

3) Refactor route pages
   - Product route: render `<ProductPage>`; remove mobile scroll progress and sticky header (keep sticky header for `md+` if desired).
   - SEO route: stop importing route `+page.svelte`; render `<ProductPage>` with same props.

4) Collapse micro-components where it helps
   - Replace trivial leaves with snippets inside sections/components.
   - Keep coarse-grained components for reuse.

5) Tailwind v4 alignment
   - Use description lists for details; `@container` queries for layout.
   - Ensure Tailwind maps to tokens set in `app.css`.

6) Perf/SEO
   - Use `packages/ui/src/lib/lazy/*` for below-the-fold.
   - Keep `SEOMetaTags` and preload hints.

## API Surface

```
interface ProductPageProps {
  product: ProductData;
  seller: SellerCardProps;
  reviews?: ReviewData[];
  ratingSummary?: RatingSummary | null;
  similarProducts?: ProductData[];
  sellerProducts?: ProductData[];
  isOwner?: boolean;
  isAuthenticated?: boolean;
  eventHandlers?: ProductPageEventHandlers; // onBuyNow, onMessage, onMakeOffer, onFavorite, onNavigate
}
```

Use existing types from `packages/ui/src/lib/types/product.ts:1`.

## Snippets (use judiciously)

- Keep snippets inside a component/section; don’t attempt cross-file reuse.

Example (InfoSection description rows):

```
{#snippet fact(label: string, value: string)}
  <div class="grid grid-cols-3 gap-4 px-4 py-3">
    <dt class="text-sm font-medium text-gray-900">{label}</dt>
    <dd class="col-span-2 text-sm text-gray-700">{value}</dd>
  </div>
{/snippet}
<dl class="divide-y divide-gray-100">
  {@render fact('Brand', product.brand)}
  {@render fact('Size', product.size)}
  {@render fact('Condition', translateCondition(product.condition))}
  {#if product.color}{@render fact('Color', product.color)}{/if}
  {#if product.material}{@render fact('Material', product.material)}{/if}
  {#if product.category}{@render fact('Category', product.category)}{/if}
  {#if product.location}{@render fact('Ships from', product.location)}{/if}
  {#if product.viewCount}{@render fact('Views', String(product.viewCount))}{/if}
  {#if product.favoriteCount}{@render fact('Favorites', String(product.favoriteCount))}{/if}
  {#if product.seller?.username}{@render fact('Seller', product.seller.username)}{/if}
</dl>
```

## Mobile Rules

- One sticky: `ProductActionsBar` at the bottom on small screens.
- No scroll progress bar on mobile.
- No sticky header on mobile; allow on `md+` if needed.
- Actions must be accessible (labels, roles, focus order).

## Acceptance Criteria

- SEO/routing unchanged; `[...slug]` and `/product/[seller]/[slug]` share the same UI component.
- LCP not worse; below-the-fold is lazy-loaded.
- Tokens/semantic CSS remain the source of truth.
- Basic a11y checks pass.
- No deep prop drilling; sections receive minimal typed props.

## Risks

- Divergent `PageData` → single presentational component with typed props.
- Overusing snippets → restrict to intra-component refactors.
- Style drift when dropping CSS → keep tokens and replace bespoke CSS gradually.

## Pointers

- Tailwind v4 + tokens: `apps/web/src/app.css:1`
- Sticky header: `packages/ui/src/lib/PDP/components/StickyHeader.svelte:1`
- Current page assembly: `apps/web/src/routes/product/[seller]/[slug]/+page.svelte:1`
- SEO route (to decouple): `apps/web/src/routes/[...slug]/+page.svelte:1`
- SEO meta: `packages/ui/src/lib/SEOMetaTags.svelte:1`

---

Want me to scaffold `ProductPage.svelte` and `ProductActionsBar.svelte` under `packages/ui/src/lib/PDP` and wire both routes to them?
