# Product Page: Supabase-First Refactor (No Mock/Placeholder)

Goal: Ensure the product detail page (`/product/[id]`) renders only real data from Supabase (products, product_images, profiles, reviews), removes demo/placeholder fallbacks, and works seamlessly after a user creates a listing from `/sell`.

## Current Issues (Why images/avatars look broken or mocked)

- Broken seller avatar fallback: `packages/ui/src/lib/ProductPage.svelte` falls back to `/default-avatar.png`, but that asset does not exist in `apps/web/static`.
- Placeholder image behavior: ProductPage shows a placeholder URL (`via.placeholder.com`) when `images` is empty. This reads as “mock/demo” rather than real data and may mask data issues.
- Possible invalid image URLs: Upload code builds public URLs using `PUBLIC_SUPABASE_URL`. If this env isn’t set (or is incorrect) during local/dev, images are stored with an invalid base (e.g. `undefined/storage/...`), producing broken images even though the DB row exists.
- Data shape friction: The UI expects `product.images: string[]` and `product.seller.avatar_url` to be full absolute URLs. Older rows or alternate flows may store paths instead of absolute URLs. The loader isn’t normalizing these, so UI may render “truthy but invalid” URLs instead of falling back.
- Hard-coded sections: The ProductPage includes demo-style content (e.g., shipping details) which is not bound to real data.

## Refactor Objectives

1) Supabase is the source of truth. No demo/placeholder imagery or text for product details.
2) One canonical Product DTO from the server (SSR) that matches exactly what the UI needs.
3) Normalize media URLs on the server (absolute image URLs only). Never pass paths.
4) Replace non-data-backed UI sections with real fields or hide them until data exists.
5) Keep the UI presentational; do zero fetching in the component.

## Data Contract (Canonical DTO)

Return from `apps/web/src/routes/product/[id]/+page.server.ts` as `product`:

```
type ProductDTO = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;            // from country or per-row field
  brand?: string | null;
  condition: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  images: string[];            // absolute public URLs only
  is_sold: boolean;
  favorite_count: number;
  seller: {
    id: string;
    username: string;
    full_name?: string | null;
    avatar_url?: string | null; // absolute public URL or null
    rating?: number | null;
    bio?: string | null;
    created_at: string;         // ISO date
    sales_count?: number | null;
  };
};
```

Only pass fields you will display. If something is missing in the DB, leave null/undefined and let the UI hide the section rather than showing mock text.

## Server Changes (SSR loader)

- Query products with the necessary relations and country filter. Keep it explicit about relations to reduce ambiguity:
  - `product_images!product_id ( image_url, sort_order )`
  - `profiles!products_seller_id_fkey ( id, username, full_name, avatar_url, rating, bio, created_at, sales_count )`
- Normalize media URLs (absolute URLs only): if any `image_url` looks like a storage path (no `http`), generate a public URL via Supabase Storage on the server. Do the same for `avatar_url` when needed.
- Currency: derive from `locals.country` (bg: BGN, gb: GBP, etc.) or from a product column if you store it. Avoid hard-coding `'EUR'`.
- Return the DTO fields only. Remove server-side placeholder filling (e.g., don’t inject default images).

Suggested loader hardening (pseudocode-level):

```ts
// apps/web/src/routes/product/[id]/+page.server.ts
// After fetching `product` with joins

const normalizeUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Fallback for legacy rows storing storage paths (example bucket: product-images)
  const { data } = supabase.storage.from('product-images').getPublicUrl(url);
  return data?.publicUrl || null;
};

const images = (product.product_images || [])
  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  .map((img) => normalizeUrl(img.image_url))
  .filter((u): u is string => !!u);

const seller = {
  id: product.profiles?.id,
  username: product.profiles?.username,
  full_name: product.profiles?.full_name,
  avatar_url: normalizeUrl(product.profiles?.avatar_url),
  rating: product.profiles?.rating,
  bio: product.profiles?.bio,
  created_at: product.profiles?.created_at,
  sales_count: product.profiles?.sales_count
};

return {
  product: {
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    currency: currencyFor(country),
    brand: product.brand,
    condition: product.condition,
    size: product.size,
    color: product.color,
    material: product.material,
    images,
    is_sold: product.is_sold,
    favorite_count: product.favorite_count ?? 0,
    seller
  },
  // ...similar/seller/reviews as today, but avoid mock fallbacks
};
```

Notes:
- If a product has zero images, consider returning 404 or gating the publish flow to require at least one image. Don’t inject placeholders from the server.
- If your buckets are private, switch to creating signed URLs in the loader.

## UI Changes (packages/ui ProductPage)

- Remove placeholder image sources (no `via.placeholder.com`, no `/default-avatar.png`). Render images only if present:
  - If `product.images.length === 0`, hide the gallery entirely (or show an empty state label).
  - If `product.seller.avatar_url` is null, hide the avatar `<img>` and just show initials or nothing.
- Remove “demo” content blocks not backed by data (e.g., hard-coded “Free Shipping for €75” rows). Either:
  - Bind them to real fields (e.g., shipping_cost, delivery_estimates), or
  - Hide them until real data lands.
- Avoid re-transforming the server DTO on the client. Accept `product` as is.
- Keep price formatting minimal and data-driven. Consider a country-aware formatter supplied from SSR.

Concrete edits:
- `packages/ui/src/lib/ProductPage.svelte`
  - Main gallery `<img>`: do not fall back to placeholder URLs; conditionally render only when `product.images.length > 0`.
  - Avatar `<img>`: remove `/default-avatar.png` fallback. Use `{#if product.seller?.avatar_url}<img ...>{/if}`.
  - Remove or guard hard-coded shipping/returns blocks with data flags.

## `/sell` Flow (Images → DB → Product page)

The creation flow is already close:

- Uploader builds public URL via `PUBLIC_SUPABASE_URL` and inserts into `product_images.image_url`.
- The product page reads `product_images.image_url` and maps to `product.images`.

To guarantee correctness:

- Ensure `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set in `apps/web/.env.local` (or env). If missing, uploaded `image_url` values will be broken.
- Ensure `product-images` and `avatars` buckets are public, or switch to signed URLs in SSR.
- Consider enforcing “at least one image” in `/sell` before insert (or issue a warning) to avoid image-less products.

## Acceptance Criteria

- After listing via `/sell`, user is redirected to `/product/{id}`.
- Product page renders:
  - Main image(s) from Supabase Storage (no `via.placeholder.com`).
  - Seller name and optional avatar (no `/default-avatar.png` fallback).
  - Only real data-driven sections; demo blocks hidden or removed.
- View source/Network shows image URLs starting with your Supabase project domain.

## Quick Checks & Fixes

- Missing avatar asset: Either add a real fallback (e.g., `apps/web/static/avatar-fallback.svg`) and reference it where appropriate, or hide the image when `avatar_url` is empty.
- Country scoping: Loader filters by `country_code`. If you don’t see your listing, confirm `products.country_code` matches `locals.country`.
- Encoding nit: Replace the mis-encoded euro sign occurrences (`â‚¬`) in UI with proper currency formatting.

## Test Plan

- E2E: `tests/sell.spec.ts` should create a product, wait for redirect to `/product/{id}`, and assert:
  - `[data-testid="product-gallery"] img` exists and `src` includes `supabase.co/storage`.
  - No `img[src*="via.placeholder.com"]` present.
  - No requests to `/default-avatar.png`.
- Unit: Add a small unit for the server loader to ensure `images` are absolute URLs after normalization.

## Rollout

1) Implement server normalization + DTO in `+page.server.ts`.
2) Simplify `+page.svelte` to pass through `data.product` without client-side re-shaping.
3) Strip placeholders in `ProductPage.svelte`; guard demo sections.
4) Verify buckets and env; run E2E checks.
5) Optional: data backfill for older rows storing paths instead of URLs.

— End —

