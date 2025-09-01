# Category Routing, Filtering, and SEO Finalization

Owner: Frontend + Claude-Code
Status: In Progress
Target: Fix L1/L2/L3 navigation, establish canonical URLs, and strengthen SEO

## Symptoms

- Clicking Level 2 (e.g., Clothing) from `/category/women` changes URL to `/category/women-clothing` but listings do not update.
- Root cause: combined slug (women-clothing) is not mapped to filters; search expects `category=women&subcategory=clothing`.

## Goals

- Resolve L1/L2/L3 taxonomy clicks into filters and render listings immediately.
- Choose and enforce a single canonical URL strategy for taxonomy pages.
- Preserve SSR first page + client hydration + infinite scroll.

## Canonical Strategy (choose one)

Option A — Keep canonical search URL (minimal changes)
- Canonical: `/search?category=women&subcategory=clothing&specific=t-shirts`.
- `/category/*` routes 301 to canonical `/search` URL.
- Pros: smallest diff; single listing surface.
- Cons: path signal is weaker for SEO than semantic paths.

Option B — Make taxonomy paths canonical (recommended for ecommerce SEO)
- Canonical: `/category/women`, `/category/women/clothing`, `/category/women/clothing/t-shirts`.
- Server maps segments to filters; `/search` remains for keyword queries.
- Pros: clean, keyword-rich URLs; easier breadcrumbs and structured data.
- Cons: moderate route changes and redirects.

Recommendation: implement Option A immediately to fix the bug; plan Option B as an enhancement.

## Immediate Fix (Option A) — combined slug mapping

- In `/category/[slug]` redirect logic, parse:
  - `women` => `/search?category=women`
  - `women-clothing` => `/search?category=women&subcategory=clothing`
  - `women-clothing-t-shirts` => `/search?category=women&subcategory=clothing&specific=t-shirts`
- If slug does not match known L1 (women|men|kids|unisex), split by `-` and match L2/L3 against DB slugs.
- Preload before redirect to avoid layout flash.

Files
- `apps/web/src/routes/category/[slug]/+page.server.ts` (or +page.svelte): enhance redirect parser
- `apps/web/src/lib/utils/filter-url.ts`: add `parseCombinedCategorySlug()` helper

## Path Canonicalization (Option B) — nested segments

- Create catch-all route: `/category/[...segments]` (length 1–3).
- Map segments: [0]=L1, [1]=L2 (optional), [2]=L3 (optional).
- Build SSR filters: L1/L2 = descendants; L3 = leaf.
- Set `<link rel="canonical">` to the path; avoid duplicate content with `/search`.

Files
- `apps/web/src/routes/category/[...segments]/+page.server.ts` (new)
- `apps/web/src/routes/category/[...segments]/+page.svelte` (new)

## UX Behavior

- L1 page: show L2 grid (Clothing, Shoes, Bags, Accessories) and featured items; clicking L2 navigates to L2 path or redirects to search with subcategory.
- L2 page: show L3 list and listings for all descendants of L2; clicking L3 goes to L3 path or search with `specific`.
- L3 page: show listings for the leaf category; always show breadcrumbs.

## SEO Enhancements

- Breadcrumbs: render JSON-LD BreadcrumbList on L1/L2/L3 pages.
- ItemList: render ItemList schema with top N item URLs on listing pages.
- Canonical: exactly one canonical per taxonomy page (path for Option B; search URL for Option A).
- Redirects: 301 legacy params (level1/level2/level3) and combined slugs to canonical.
- Robust 404s: invalid L2/L3 fall back to higher-level page with helpful links.

## Data Rules

- Match against DB category slugs (case-insensitive); allow name fallback.
- L1/L2 filters include descendants (self + children + grandchildren).
- L3 filters by exact leaf `category_id`.
- Optional fast-path: denormalize L1/L2 IDs on products and index them.

## Pagination & Infinite Scroll

- Keep SSR page 1 and client append.
- Persist params to support back/forward and shareable links.

## Acceptance Checklist

- [ ] Clicking Clothing from `/category/women` shows listings (no “stays on same page”).
- [ ] `/category/women-clothing` resolves to listings via redirect or path render.
- [ ] Breadcrumbs render correctly on L1/L2/L3.
- [ ] Canonical links set; no duplicate content between `/category/*` and `/search`.
- [ ] Legacy combined slugs and legacy params redirect to canonical.
- [ ] Infinite scroll and back/forward work for L1/L2/L3.

## Execution Plan (small PRs)

PR 1 — Immediate bugfix (Option A)
- Add combined-slug parser in `/category/[slug]`; map to `/search?category&subcategory&specific`.
- Unit tests for `women`, `women-clothing`, `women-clothing-t-shirts`.

PR 2 — SEO scaffolding
- Add BreadcrumbList JSON-LD and canonical link on taxonomy pages.
- Add robust invalid-category fallbacks.

PR 3 — Path canonical (Option B)
- Implement `/category/[...segments]` routes with SSR listings.
- Redirect combined slugs to segmented path.

PR 4 — Performance hardening (optional)
- Denormalize L1/L2 columns on products; use indexed columns for L1/L2 queries.

---

## Remote Functions Implementation (SvelteKit)

Use SvelteKit Remote Functions to centralize taxonomy resolution logic so both server loads and client navigation reuse the same, secure code path.

What to expose (server-only, callable from client):
- `resolveCategoryPath(segments: string[])` → `{ level: 1|2|3, l1?: Cat, l2?: Cat, l3?: Cat, categoryIds: string[], canonicalPath: string }`
- `breadcrumbsFor(segments: string[])` → `{ items: Array<{ name: string, href: string }> }`

Where:
- Create a server module, e.g. `src/lib/server/categories.remote.ts` (or `.ts` per your conventions) exporting remote functions as per docs
  (see SvelteKit docs: Remote functions). Keep all Supabase access (slug lookups, descendant queries) here.

Usage:
- In `/category/[slug]` (Option A) and `/category/[...segments]` (Option B) server `load`:
  - Call `resolveCategoryPath(segments)` to get `categoryIds` and the computed `canonicalPath`
  - If current path != canonical, 301 to canonical; else query listings using `categoryIds`
  - Call `breadcrumbsFor(segments)` to render JSON-LD and UI breadcrumbs
- In client-side transitions (e.g., clicking L2/L3 tiles):
  - Optionally call `resolveCategoryPath` to pre-validate then navigate, or navigate directly to path and rely on SSR

Pseudocode sketch:
```ts
// src/lib/server/categories.remote.ts
import { remote } from '@sveltejs/kit';

export const resolveCategoryPath = remote(async ({ segments }: { segments: string[] }) => {
  // 1) validate L1 slug; 2) find L2 under L1; 3) find L3 under L2
  // 4) build descendant categoryIds for L1/L2; exact leaf for L3
  // 5) return canonicalPath `/category/women[/clothing[/t-shirts]]`
  return { level: 2, l1: {...}, l2: {...}, categoryIds: ['...'], canonicalPath: '/category/women/clothing' };
});

export const breadcrumbsFor = remote(async ({ segments }: { segments: string[] }) => {
  // Return [{name:'Women',href:'/category/women'}, ...]
  return { items: [] };
});
```

Caching:
- Add short TTL caching inside the remote functions for category tree (e.g., in-memory per server instance or Supabase cache table) to avoid repeated lookups.

Security:
- Remote functions run server-side; do not expose DB details. Validate all input; only return what’s needed to render.

Testing:
- Unit test `resolveCategoryPath` with inputs: `['women']`, `['women','clothing']`, `['women','clothing','t-shirts']`, and invalid combinations.

---

## Copy-Paste Prompt For Claude-Code

"""
Fix category routing so L2/L3 clicks display the correct listings and finalize SEO.
1) In /category/[slug], parse combined slugs and 301 to `/search?category&subcategory&specific`.
2) Add helper in lib/utils/filter-url.ts to split/validate against DB slugs; preload before redirect.
3) Add BreadcrumbList JSON-LD and canonical link; add graceful fallbacks for invalid categories.
4) (Optional) Add /category/[...segments] canonical path routes and redirect combined slugs to them.
5) Tests: women -> clothing -> t-shirts flow renders listings and breadcrumbs; back/forward works.
Deliverables: minimal diffs, changed paths, short changelog.
"""
