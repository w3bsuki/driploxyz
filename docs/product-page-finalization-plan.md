# Product Page Finalization Plan (URL, SEO, Supabase, Likes)

Owner: Web team  • Status: Draft for execution  • Last updated: {{DATE}}

## Objectives

- Ship a production-ready product detail page with:
  - Clean, SEO-friendly URLs (seller + slug)
  - Accurate likes/favorites count tied to Supabase
  - Full product attributes surfaced (brand, size, condition, color, material, badges)
  - Solid technical SEO (canonical, hreflang, Open Graph, JSON-LD)
  - Redirect strategy from legacy ID URLs
  - Mobile-first performance and accessibility polish

---

## Competitive Audit (URL + SEO)

- Vinted: Uses human-readable slugs with numeric IDs in URLs (e.g., `/items/4288282652-nike-dunk-low`). Canonical URLs include both slug and ID to keep uniqueness stable across edits.
- Depop: Uses seller + product slug paths (e.g., `/products/{seller}/{slug}`) and leans into social meta (Open Graph, Twitter) for shareability.
- Grailed: Uses listing IDs and slugs (e.g., `/listings/{id}-{slug}`) with 301 redirects for slug changes; strong schema.org Product JSON-LD.

Takeaway: A seller + slug or id + slug hybrid works best. Ensure canonical points to one “truth” and keep stable 301s when slugs change.

---

## URL Strategy (Decision)

Primary: `/product/{seller_username}/{product_slug}`

- Pros: Clean, memorable, keyword-rich; supports per-seller uniqueness
- DB constraint: Unique composite on `(seller_id, slug)`
- Canonical: Always set to the above
- Back-compat: Keep existing `/product/{id}` route but 308 redirect to canonical URL after lookup
- Optional: Safe fallback if slug mismatch → 301 to canonical

Slug rules:
- Slugify title (lowercase, ASCII, `-` separators), trim to ~80 chars
- On collision for same seller: append `-2`, `-3`, ...
- Slug shouldn’t include size/condition; add those to `<title>`/meta if needed

---

## Required Data (Supabase)

Products table must expose at least:
- id, title, description, price, currency, is_active, is_sold, created_at
- condition, size, brand, color, material, location
- favorite_count (kept via triggers), view_count
- seller_id, category_id, country_code, region
- slug (new: unique with seller_id scope)
- relations: product_images(id, image_url, sort_order), profiles(username, full_name, avatar_url, rating, sales_count), categories(id, name, slug, parent_id)

Validation in server load: enforce `is_active = true`, region filter by `country_code`.

---

## Likes/Favorites (Accurate Count)

Server
- Use existing endpoints:
  - `GET /api/favorites/[productId]` → `{ isFavorited, favoriteCount }`
  - `POST /api/favorites/[productId]` → toggle, returns `{ favorited, favoriteCount }`
- Ensure DB trigger maintains `products.favorite_count` on insert/delete in `favorites`.

Client
- ProductPage should optimistically toggle then reconcile with server response to set real `favoriteCount`.
- On mount, ensure initial state matches server (from load function or `GET /api/favorites/[productId]` if session changes client-side).

QA
- Rapid toggles debounce (server already dedupes via in-memory map). Confirm double-clicks don’t overcount.

---

## SEO Plan

Meta & Head
- Use `SEOMetaTags.svelte` on product pages with `type="product"`, `product`, and `seller` props.
- Canonical: `https://driplo.xyz/product/{seller_username}/{product_slug}`
- Hreflang: bg-BG (default) and en-GB (`/uk` prefix) variants.
- Open Graph: title, description, image (1,200×630), product price/currency, brand, category.
- Twitter: summary_large_image.

Structured Data (JSON-LD)
- Product schema with Offer:
  - price, priceCurrency, availability (InStock/OutOfStock), itemCondition.
  - brand if present.
  - seller as Person with username/display name.
- BreadcrumbList: Home → Seller → Category → Product.
- AggregateRating: if `ratingSummary` exists.

Redirects & Canonicalization
- 308 from `/product/{id}` → `/product/{seller_username}/{product_slug}`
- If slug in URL doesn’t match DB, 301 to the canonical.
- Always render canonical in head to the final resolved URL.

Sitemaps
- Add product URLs to sitemap with `lastmod` and `changefreq=weekly` while active; drop or de-prioritize once sold.

---

## Routing & Server Implementation

1) New route: `/product/[seller]/[slug]`
- `+page.server.ts`: load product by `(seller_username, slug)`
- `+page.svelte`: render `ProductPage` + `SEOMetaTags`

2) Legacy route: `/product/[id]`
- Keep loader by `id` then `redirect(308, canonicalUrl)` based on seller + slug
- Preserve 404 for inactive/not-found

3) Link building
- Everywhere we link a product (cards, similar items), use builder:
  - `/product/${seller_username}/${product_slug}`
- Fallback to `/product/${id}` only if slug or username missing

---

## DB Tasks (Supabase)

1) Columns & indexes
```sql
-- Ensure slug exists
alter table products add column if not exists slug text;

-- Composite uniqueness per seller
create unique index if not exists products_seller_slug_unique
  on products (seller_id, slug);

-- Optional partial index for active products
create index if not exists products_active_idx
  on products (is_active) where is_active = true;
```

2) Slug generation (trigger or application-level)
- On insert/update of `title`, set slug if null or changed
- Use `slugify(lower(unaccent(title)))`, trim length, and append `-2`, `-3` on conflicts per seller

3) Favorites counter (ensure present)
```sql
-- Example trigger logic (pseudocode)
create or replace function update_favorite_count() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update products set favorite_count = coalesce(favorite_count, 0) + 1 where id = new.product_id;
  elsif (tg_op = 'DELETE') then
    update products set favorite_count = greatest(coalesce(favorite_count, 0) - 1, 0) where id = old.product_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists favorites_count_trg on favorites;
create trigger favorites_count_trg
after insert or delete on favorites
for each row execute function update_favorite_count();
```

4) View count (optional)
- Increment `view_count` via RPC or batched job (avoid 1:1 writes per view)

---

## Frontend Changes (SvelteKit)

Product page
- Integrate `SEOMetaTags` in `apps/web/src/routes/product/[seller]/[slug]/+page.svelte`
- Pass `product`, `seller`, `url`, and main `image` (first product image)

Product links
- Update `ProductCard.svelte` onclick to navigate to new URL builder
- Update similar products carousel in `ProductPage.svelte` to use builder

Favorites
- In `apps/web/src/routes/product/[id]/+page.svelte`, replace `console.log` favorite handler with a call to `POST /api/favorites/[productId]`; feed the response back to the UI to sync counts
- Optionally expose an async `onFavorite` in `ProductPage` that returns `{ favoriteCount, favorited }` to avoid drift

Breadcrumbs
- Ensure category links use slugs; parent category if present

Accessibility
- Ensure all interactive controls have roles, keyboard handlers, focus states (most present already)

---

## Page Copy & Titles

- `<title>`: `{brand ? brand + ' ' : ''}{title} | {seller_username} | Driplo`
- `<meta name="description">`: 150–160 chars, include brand, size, condition, category, location
- Share title: `{brand} {title} · {formatPrice(price)}`

---

## Performance & LCP

- Preload first product image (mobile and desktop sizes)
- Preconnect to Supabase storage domain (SEO component already supports dynamic preconnect)
- Lazy-load non-critical images and reviews
- Avoid layout shifts: lock image aspect ratios
- Serve compressed images (width params if using Supabase image transform)

---

## QA Checklist

- URL
  - Visiting `/product/{id}` 308-redirects to `/product/{seller}/{slug}`
  - Visiting wrong-slug canonicalizes to correct slug with 301
  - Links from cards and similar sections use new URL

- Data
  - Brand, Size, Condition, Color, Material all render
  - Condition badge text localized
  - Seller name/avatar, rating, sales count visible
  - Favorite count consistent across refreshes and toggles

- SEO
  - Canonical/hreflang present and correct
  - Open Graph/Twitter images resolve
  - JSON-LD validates in Google Rich Results Test

- Perf
  - LCP image preloaded
  - CLS < 0.1, TBT low on mobile

- A11y
  - Keyboard navigable, focus outlines visible
  - All images have alt text

---

## Rollout Plan

1. Ship DB migrations (slug + indexes + triggers)
2. Deploy new route, keep legacy `/product/[id]` with 308 redirects
3. Update client links and favorite handler
4. Add SEO meta on product page
5. Generate sitemap entries for canonical URLs
6. Monitor: 404s, redirect chain health, favorites API errors

---

## Open Questions

- Do we want to expose localized paths (e.g., `/uk/product/...`) or keep locale inference only for hreflang/canonical?
- Should sold items return 410 Gone or keep 200 with a “Sold” state for long-tail SEO?

---

## Pseudo Code / Snippets

Canonical URL builder
```ts
function buildProductUrl(p: { seller_username?: string; slug?: string; id: string }) {
  if (p.seller_username && p.slug) return `/product/${p.seller_username}/${p.slug}`;
  return `/product/${p.id}`; // fallback
}
```

308 redirect from legacy route
```ts
// apps/web/src/routes/product/[id]/+page.server.ts
import { redirect } from '@sveltejs/kit';

// after loading product by id
const canonical = `/product/${product.profiles.username}/${product.slug}`;
throw redirect(308, canonical);
```

Favorite toggle handler passthrough
```ts
// apps/web/src/routes/product/[seller]/[slug]/+page.svelte
async function handleFavorite() {
  const res = await fetch(`/api/favorites/${data.product.id}`, { method: 'POST' });
  if (!res.ok) return;
  const json = await res.json();
  return { favoriteCount: json.favoriteCount, favorited: json.favorited };
}
```

---

## Definition of Done

- New URL loads, legacy redirects, canonical consistent
- Favorites toggle reliable and count persists across refresh
- All priority product attributes visible on PDP and cards
- SEO checks pass (Lighthouse > 90 SEO), Rich Results validate
- No major regressions in navigation or performance

---

## UI/UX & Layout Audit (Current State)

Findings reference current files for clarity:
- apps/web/src/routes/product/[id]/+page.svelte: renders `ProductPage` only; no `SEOMetaTags` component; `handleFavorite()` logs to console instead of calling favorites API; `onBuyNow`/`onMessage` navigate but CTAs are not visible in `ProductPage` UI.
- apps/web/src/routes/product/[id]/+page.server.ts: returns `similarProducts` (same category) and `sellerProducts` (same seller) correctly, but the UI uses `similarProducts` under the heading “More from {displayName}”.
- packages/ui/src/lib/ProductPage.svelte: 
  - Uses `similarProducts` list to label “More from {displayName}” instead of `sellerProducts`.
  - Product cards navigate with `window.location.href = /product/${id}` rather than the canonical seller/slug URL.
  - Optimistic likes UI with no server reconciliation.
  - No sticky bottom action bar (Buy Now / Favorite / Message). `ProductActionBar.svelte` exists and should be integrated.
  - Share button uses `navigator.share` without copy-link fallback.
  - Seller avatar button routes to `/profile/{seller.id}` instead of username; propose `/profile/{seller.username}`.
  - Thumbnails alt text is generic (e.g., “View 2”); improve with product title context.
- packages/ui/src/lib/SEOMetaTags.svelte: solid and production-ready; must be included on PDP route.
- packages/ui/src/lib/ProductCard.svelte: navigates via onclick handler; consider anchor semantics or `svelte:component` link wrapper for a11y and prefetch.

---

## UI/UX & Layout Improvements (Proposed)

Above the Fold
- Hero gallery: maintain 3:4 aspect, add keyboard left/right navigation and swipe on touch; preload next/prev images.
- Title block: H1 with brand prefix; inline chips for condition, size, color; show likes count near title.
- Sticky action bar (mobile): integrate `ProductActionBar.svelte` with Buy Now, Favorite, Message; shows formatted price; hides for owners and when sold.
- Desktop layout: two-column; left = gallery; right = details + CTAs; keep primary CTA visible without scrolling.

Content Sections
- Details: promote badges (ConditionBadge, BrandBadge) and specs (brand, size, material, color) as compact tag list.
- Shipping & returns: show `ShippingEstimator.svelte` and concise policy text; collapse long content with Accordion.
- Seller: avatar, display name, rating, member since, sales count, “View profile” and “Message”. Link to username route.
- Recommendations: split into two rows
  - “More from {seller}” → `sellerProducts`
  - “Similar items” → `similarProducts`
- Reviews: show average rating and distribution; provide “See all” linking to seller reviews.

Interaction & A11y
- All buttons `type="button"`; provide aria-labels for icon-only controls.
- Tooltip trigger elements receive `aria-describedby` and are keyboard focusable.
- Thumbnail buttons: role=button, Enter/Space activate, alt text “{title} image {n}”.
- Focus rings use `--state-focus`; ensure 3:1 contrast minimum.

Copy & Microinteractions
- Share: fallback to copy-to-clipboard with toast “Link copied”.
- Favorite: optimistic update with vibration; reconcile count from API; rate-limit rapid toggles.
- Sold state: overlay on hero + replace Buy Now with “Sold Out”.

Styling & Systemization
- Use tokens from `packages/ui/src/styles/tokens.css` for spacing, radius, color.
- Reduce shadow intensity on hero container; prefer subtle elevations.
- Ensure consistent spacing scale between sections (e.g., 16/24/32px).
- Use `container-type: inline-size` where helpful for responsive adjustments.

Performance
- Use `srcset`/`sizes` for gallery images with Supabase transformation params (width, quality).
- Preconnect to Supabase asset host (already supported in SEOMetaTags via dynamic preconnect).
- Defer non-critical sections (reviews) with `loading=lazy` images.

---

## Concrete Implementation Tasks

Routing & URLs
- Add `/product/[seller]/[slug]` route; SSR load by `(seller_username, slug)`.
- Update `/product/[id]` to `redirect(308)` to canonical.
- Introduce shared `buildProductUrl(product)` helper and use it in cards, similar items, seller items.

PDP Page
- Integrate `SEOMetaTags.svelte` with `type="product"` and pass canonical URL, product, seller, main image.
- Replace `similarProducts` section header to “Similar items” and add a separate “More from {seller}” for `sellerProducts`.
- Swap product card links to canonical URL builder.
- Integrate `ProductActionBar.svelte`; wire `onBuyNow`, `onMessage`, `onFavorite` handlers from route.
- Implement copy-link fallback for share button.
- Link seller avatar and View button to `/profile/{username}`.
- Improve thumbnail alt text: “{title} image {index+1}”.

Favorites
- In route `+page.svelte`, implement async `onFavorite` that calls `POST /api/favorites/[id]` and returns `{ favoriteCount, favorited }` to the component.
- In `ProductPage.svelte`, accept an async `onFavorite` and reconcile UI state from result.

Styling
- Normalize section paddings using tokens (space-4/6/8); remove ad-hoc values.
- Ensure all interactive elements have hover/focus styles consistent with design system.

Accessibility
- Verify heading order (single H1, logical H2/H3).
- Ensure keyboard navigation for gallery and thumbnails; add aria-live for like count changes.

SEO
- Ensure canonical matches new route; add `hreflang` via SEOMetaTags.
- Verify JSON-LD product and breadcrumbs render and validate.

---

## Code Pointers (Where to Change)

- apps/web/src/routes/product/[id]/+page.svelte: replace `handleFavorite()` console log with API call; render `SEOMetaTags`; later, convert to new route variant.
- apps/web/src/routes/product/[id]/+page.server.ts: build canonical URL and `redirect(308)` to `/product/{seller}/{slug}` once new route exists.
- packages/ui/src/lib/ProductPage.svelte: 
  - Use `sellerProducts` for “More from {displayName}”; keep `similarProducts` for category recommendations.
  - Replace product card `window.location.href = /product/${id}` with `buildProductUrl(product)`.
  - Add optional async `onFavorite` prop; reconcile `favorite_count` from response.
  - Integrate `ProductActionBar.svelte` at bottom for mobile; add a desktop CTA block.
  - Improve alt text and aria labels; add copy-link fallback in Share.
- packages/ui/src/lib/ProductCard.svelte: switch to anchor-based navigation or add `role="link"` semantics and use canonical URL builder.
- packages/ui/src/lib/SEOMetaTags.svelte: no changes; just ensure it’s used.

---

## Acceptance Criteria (UI/UX)

- Two distinct recommendation sections appear and link correctly.
- Sticky action bar visible on mobile with Buy Now, Favorite, Message.
- Likes count matches server after toggles; rapid toggles don’t double count.
- All image elements have descriptive alt; keyboard users can navigate gallery.
- Share button works on desktop (copies link) and mobile (Web Share API).
- Canonical URLs and redirects verified; sitemap includes canonical paths.
