Category & Search Refactor Plan (Fix Virtual Categories, L1/L2/L3 Resolution, Empty Results)

Audience: claude-code (executor) with Supabase MCP
Goal: Restore products on /category/men|women|kids and /search, make virtual categories like /category/shoes work reliably, and harden category resolution end‑to‑end.

---

CODEX: Quick Diagnosis
- Symptom: /category/men, /women, /kids return no products. /search also returns empty unexpectedly after “virtual category” changes.
- Primary causes found:
  1) Category descendant resolution in server code relies on an RPC `get_category_descendants` (apps/web/src/lib/server/categories.remote.ts) that does not exist or returns incomplete sets. When it fails, the fallback only includes the parent category id (L1/L2), but products are assigned to L3 only → empty results.
  2) Virtual categories (apps/web/src/lib/server/virtual-categories.ts) aggregate L2 slugs (e.g., men-shoes, women-shoes) and then call descendant resolution. If the RPC fails or slugs don’t match actual rows, zero products.
  3) Divergent descendant resolution between category pages and /search: search has bespoke direct descendant queries (good), but category page used the (missing/buggy) RPC.
  4) Slug drift risk: virtual targets assume L2 slugs exist like men-shoes; DB may have different naming. This causes 0 target categories.

---

CODEX: High-Level Fix Strategy
1) Make descendant resolution robust without relying on an RPC (fallback implemented in code using our known 3‑level taxonomy), but also add a correct recursive SQL RPC in Supabase for consistency/performance.
2) Ensure virtual categories map to existing DB slugs, or update DB slugs; fail soft with a visible pill/notice rather than empty results.
3) Unify category resolution across /category and /search so both use the same reliable logic.
4) Add DB indexes needed for fast filtering on country/category.

---

CODEX: Concrete Changes (Frontend)

A) apps/web/src/lib/server/categories.remote.ts
- Replace reliance on `get_category_descendants` with a safe fallback that computes L1→L2→L3 IDs directly when RPC fails. Limit depth is 3, so we can do this with two simple queries.
- Implementation guidance:
  - Add helper (just like search uses) to fetch descendants:
    • Given categoryId, select ids where `id = categoryId OR parent_id = categoryId`, then select L3 where `parent_id in (L2 ids)` and `is_active = true`. Return union.
  - Update all calls to `getCategoryDescendants` inside `resolveCategoryPath` to try RPC first, then fallback.
- Ensure L1-only page returns ALL descendant L2+L3 ids.
- Ensure virtual category path returns aggregated descendant ids of all target L2 categories.

B) apps/web/src/routes/category/[...segments]/+page.server.ts
- Keep hierarchical filtering, but guard against empty `resolution.categoryIds`:
  - If empty, use fallback descendant resolver for the current level (L1→all, L2→children+grandchildren). If still empty, show newest products in that country (so the page isn’t blank) and add a small banner “No items found for this category yet”.
- Keep country filter; consider showing both BG/GB during empty preview only if product count is zero (optional toggle) — for V1 keep current country to avoid confusion.

C) apps/web/src/routes/search/+page.server.ts
- Replace fragmented category ID discovery with an import from categories.remote.ts (one unified resolver API), but keep its direct queries as a fallback. Prefer SLUGs over name-ilike whenever category/subcategory/specific are passed.
- Validate that the “condition” mapping uses DB enum values (already correct in current file).

D) apps/web/src/lib/server/virtual-categories.ts
- Verify targetSlugs exist in DB. If not, add a mapping layer:
  - Implement a small lookup that translates targetSlugs to actual existing slugs from the categories table (prefix stripping is handled elsewhere). If some slugs don’t exist, log a warning; do not fail resolution — just use the ones that exist.
- Provide a quick console.warn once per request if a virtual target had zero matches, so it’s visible in logs while not breaking UX.

E) Product querying (already correct): apps/web/src/lib/services/products.ts
- The main `getProducts` method filters by `country_code`, `category_id`, etc. Once correct `category_ids` are passed, results should populate. No changes required aside from ensuring relations select correct columns (`product_images.sort_order` exists; `display_order` is tolerated for now by some callers — don’t break).

---

CODEX: Supabase Backend (MCP) Changes

1) Create recursive RPC: get_category_descendants
```sql
CREATE OR REPLACE FUNCTION public.get_category_descendants(category_uuid uuid)
RETURNS TABLE (id uuid) AS $$
WITH RECURSIVE tree AS (
  SELECT id, parent_id, level, is_active
  FROM public.categories
  WHERE id = category_uuid
  UNION ALL
  SELECT c.id, c.parent_id, c.level, c.is_active
  FROM public.categories c
  JOIN tree t ON c.parent_id = t.id
)
SELECT id FROM tree WHERE is_active = true;
$$ LANGUAGE sql STABLE;
```

2) Indexes for performance
```sql
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level_active ON public.categories(level, is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_country ON public.products(category_id, country_code) WHERE is_active = true AND is_sold = false;
```

3) Optional: slug normalization migration (if slugs don’t exist)
```sql
-- Example remap if needed; adapt to your seed
-- UPDATE public.categories SET slug = 'men-shoes' WHERE name = 'Shoes' AND parent_id = (SELECT id FROM categories WHERE slug = 'men');
-- Repeat for women/kids/unisex as needed.
```

4) Search RPC (if used elsewhere)
- Ensure `search_products` RPC exists; otherwise /search falls back to ILIKE. This plan doesn’t require changing it now.

---

CODEX: Code Snippet (Fallback Descendants Helper)

Add in apps/web/src/lib/server/categories.remote.ts:
```ts
async function getCategoryDescendantsSafe(supabase: SupabaseClient<Database>, categoryId: string): Promise<string[]> {
  try {
    const rpc = await supabase.rpc('get_category_descendants', { category_uuid: categoryId });
    if (!rpc.error && Array.isArray(rpc.data) && rpc.data.length) {
      return rpc.data.map((d: any) => d.id);
    }
  } catch {}
  // Fallback: 3-level taxonomy direct fetch
  const { data: level1 } = await supabase
    .from('categories').select('id').or(`id.eq.${categoryId},parent_id.eq.${categoryId}`).eq('is_active', true);
  const l1Ids = (level1 || []).map((d: any) => d.id);
  if (!l1Ids.length) return [categoryId];
  const { data: level2 } = await supabase
    .from('categories').select('id').in('parent_id', l1Ids).eq('is_active', true);
  const l2Ids = (level2 || []).map((d: any) => d.id);
  return Array.from(new Set([...l1Ids, ...l2Ids]));
}
```
Then replace existing internal calls to `getCategoryDescendants(...)` with `getCategoryDescendantsSafe(...)`.

---

CODEX: Validation Scenarios
- /category/men → returns products assigned to any L2/L3 under men.
- /category/men/shoes → returns products assigned to that L2 or any L3 under it.
- /category/shoes (virtual) → aggregates men‑shoes, women‑shoes, kids‑shoes, unisex‑shoes and returns union.
- /search with category pills → correct products appear; switching subcategory/specific works.
- Empty state: if no results, UI shows helpful message and suggests popular categories.

---

CODEX: Rollout Plan
1) Apply the SQL migration for RPC/indexes to staging.
2) Patch `categories.remote.ts` with fallback helper + wire-ups; adjust `/category` page guard.
3) Verify on staging with sample data: men/women/kids L1, several L2/L3, and virtual categories.
4) Validate /search category selection flows.
5) Promote to production.

---

CODEX: File Pointers
- Category resolver: apps/web/src/lib/server/categories.remote.ts:1
- Virtual categories: apps/web/src/lib/server/virtual-categories.ts:1
- Category page: apps/web/src/routes/category/[...segments]/+page.server.ts:1
- Search page: apps/web/src/routes/search/+page.server.ts:1
- Product queries: apps/web/src/lib/services/products.ts:1

