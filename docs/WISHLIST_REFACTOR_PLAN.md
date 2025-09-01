# Wishlist/Favorites Refactor Plan

Problem summary
- Clicking the heart appears to toggle visually, but the like count stays 0.
- After refresh, items show as liked (red) but counts don’t update.
- Counts must be server-side so all users see the same number (until product is sold).

Root causes (current code)
- Dual endpoints with inconsistent behavior:
  - Primary toggle: `apps/web/src/routes/api/favorites/[productId]/+server.ts:1`
    - Assumes a DB trigger updates `products.favorite_count` (not present in repo), then returns that count.
  - Secondary API: `apps/web/src/routes/api/favorites/+server.ts:1`
    - Has a POST variant that also returns `favorite_count` but doesn’t update it.
    - GET uses a service to fetch statuses.
  - Batch status: `apps/web/src/routes/api/favorites/status/+server.ts:1`
    - Counts directly from `favorites`, but with user-scoped Supabase client, RLS likely undercounts (only current user’s rows), not global.
- UI depends on `products.favorite_count` for SSR and for post-toggle counts (FavoriteButton reads `favorite_count` via the toggle response).
- No visible trigger/migration to maintain `products.favorite_count`.

Goals
- Server‑authoritative favorite status and counts for everyone.
- Robust toggle endpoint with transactionality and RLS-safe counting.
- SSR provides correct counts; client no longer guesses.
- Disallow favoriting sold products; counts remain visible/historical.

---

Phase 1 — Database: schema, constraints, triggers
1) Constraints and indexes
- Ensure unique pair constraint on favorites so users can’t duplicate:
  - Unique index on `(user_id, product_id)`.
- Ensure `products.favorite_count` exists with default 0 and NOT NULL.
- Optional: check constraint to prevent favorites on sold items (handled in API too).

2) Triggers to maintain counts (preferred)
- On `favorites` INSERT: increment `products.favorite_count` for the `product_id`.
- On `favorites` DELETE: decrement `products.favorite_count`.
- Implementation: two functions + two triggers in a new Supabase migration. Use `SECURITY DEFINER` on functions if needed to bypass RLS safely, and restrict privileges.

3) RLS policies
- `favorites`:
  - SELECT: user can read rows where `user_id = auth.uid()`; Service-side endpoints doing totals should never rely on this table directly (or use RPC/definer).
  - INSERT/DELETE: only when `user_id = auth.uid()` and `product_id` exists, not sold, and not owned by that user.
- `products`:
  - `favorite_count` should be readable by anyone.

Fallback (if not using triggers)
- Create an RPC `get_favorite_count(product_id uuid)` and `get_favorite_counts(product_ids uuid[])` marked `SECURITY DEFINER`, returning global counts ignoring RLS. Then update API to call RPC after toggle.

---

Phase 2 — API normalization
- Source of truth: keep `[productId]` route only for per-item toggle + status.
  - File: `apps/web/src/routes/api/favorites/[productId]/+server.ts:1`
  - POST: toggle inside a single code path, then return `{ favorited, favoriteCount }`.
  - GET: return `{ isFavorited, favoriteCount }` based on `products.favorite_count` and the user’s own row.
- Deprecate POST on `apps/web/src/routes/api/favorites/+server.ts:1` to avoid confusion; keep its GET for full list if needed.
- Sold products: in POST, deny insert when product `is_sold = true` (return 409 or 400). Continue to allow removing favorites.
- Optionally: after toggle, return an ETag or version for optimistic updates.

---

Phase 3 — Client/store cleanup
- Keep SSR hydration of counts from server data.
  - Example: `apps/web/src/routes/+page.server.ts:91` includes `favorite_count` in selections.
  - Homepage hydrates counts: `apps/web/src/routes/+page.svelte:52`.
- Synchronized counts after toggle:
  - `apps/web/src/lib/stores/favorites-store.ts:17` updates `favoriteCounts[productId]` from API response (works once API returns correct counts).
- FavoriteButton improvements:
  - `packages/ui/src/lib/FavoriteButton.svelte:1` already calls `/api/favorites/{id}`. Keep this single flow.
  - On mount (optional), GET `/api/favorites/{id}` to sync the initial `{ isFavorited, favoriteCount }` for standalone renders.
- Batch counts (grids): if we need live refresh, add a client call to `/api/favorites/status` but ensure it uses RPC/definer or `products.favorite_count`, never raw `favorites` under RLS.

---

Phase 4 — Sold item behavior
- Toggle rules:
  - If `is_sold = true`: prevent adding new favorites; allow removal by the user (optional), keep count visible.
- Cleanup (optional): periodic cleanup to remove favorites for sold items after a period (already scaffolded in service: `cleanupSoldFavorites()`).
- UI:
  - Disable heart on sold items; show tooltip “Sold – likes frozen”.

---

Phase 5 — Migration & rollout plan
- Migration (SQL):
  - Add unique index on `(user_id, product_id)`.
  - Create functions and triggers to increment/decrement `products.favorite_count` on favorites insert/delete.
  - Review/add RLS policies as above.
- API updates:
  - Remove/disable POST on `/api/favorites/+server.ts`.
  - Ensure `[productId]` route returns the trigger-updated `favorite_count`.
- UI/store:
  - No functional changes beyond relying on the corrected counts.
- Verify end-to-end in staging:
  - User A favorites item → count increments; page refresh shows same count.
  - User B loads page → sees updated count.
  - Mark product sold → heart disabled, count visible.

---

Acceptance checklist
- Toggle returns correct `{ favorited, favoriteCount }` in <150ms p95.
- SSR product lists show correct `favorite_count` for all users.
- No duplicate favorites per user due to unique index.
- Sold items cannot be newly favorited; count remains visible.
- No RLS leakage; no public access to per-user favorites rows.

Key file references
- Toggle endpoint: `apps/web/src/routes/api/favorites/[productId]/+server.ts:1`
- Legacy mixed endpoint: `apps/web/src/routes/api/favorites/+server.ts:1`
- Batch status (fix RLS or replace): `apps/web/src/routes/api/favorites/status/+server.ts:1`
- Favorite store: `apps/web/src/lib/stores/favorites-store.ts:1`
- Button + card: `packages/ui/src/lib/FavoriteButton.svelte:1`, `packages/ui/src/lib/ProductCard.svelte:1`
- SSR home load includes favorite_count: `apps/web/src/routes/+page.server.ts:91`

Notes
- Triggers are the most robust fix. If you prefer no triggers, implement RPC with `SECURITY DEFINER` and minimal surface area, then switch all count reads to RPC or to `products.favorite_count` populated via RPC after toggles.
- If you want, I can scaffold the SQL migration for triggers and remove the legacy POST endpoint in a follow-up.

---

## Remaining Jobs (Make It Bulletproof)

Required
- DB migrations in-repo:
  - Add unique constraint/index on `favorites(user_id, product_id)` (prevent duplicates).
  - Add SECURITY DEFINER functions + triggers to increment/decrement `products.favorite_count` on `favorites` INSERT/DELETE.
  - One-time backfill to recompute `products.favorite_count` from existing `favorites`.
  - Verify/adjust RLS: `favorites` rows selectable only by owner; public/counts always read from `products`.
- Store/API consistency:
  - Remove or update `removeFavorite()` to use the same POST toggle endpoint and trust the returned `favoriteCount`.
  - Ensure `/api/favorites/status` only reads counts from `products.favorite_count` and user flags from `favorites` where `user_id=auth.uid()`.
- UX correctness for sold items:
  - Deny new favorites on sold products at API level; allow unfavorite; disable heart in UI.

Hardening (nice-to-haves that catch regressions)
- Race safety: server still returns the DB count after toggle; client never “guesses”. Keep the in-memory dedupe in `[productId]` route.
- Monitoring: add a lightweight counter/log for favorite toggles (rate, errors) and Sentry breadcrumb.
- Cache control: add short `Cache-Control` on status endpoint (counts update quickly, but can be 10–30s cacheable for anon).
- Nightly repair job (optional): scheduled SQL or script to recompute and correct `favorite_count` if anything drifts.

Acceptance (copy into PR description)
- Toggle increments/decrements `products.favorite_count` in DB (verified via SQL) and API returns the updated value.
- Unique constraint prevents duplicate rows under rapid taps/concurrent requests.
- Status endpoint returns the same count as DB; UI reflects updated count immediately after POST.
- Sold product cannot be newly favorited; removing still works; count remains visible.
- No legacy endpoints remain; no console errors/hydration warnings.

---

## PR Breakdown (Small, Sequential)

PR 1 — DB foundation
- Migration: unique constraint; triggers (INSERT/DELETE) with SECURITY DEFINER; backfill counts; indexes.
- Include: up/down SQL and short README note if needed.

PR 2 — API alignments
- Keep only `/api/favorites/[productId]` for toggle; ensure responses always include `{ favorited, favoriteCount }`.
- Ensure `/api/favorites/status` reads from `products.favorite_count` and user favorites by `auth.uid()`.

PR 3 — Store cleanup
- Remove or refactor `removeFavorite()` to POST toggle; keep one flow.
- Sanity-check FavoriteButton optimistic UI vs returned counts; prefer server count.

PR 4 — UX edges & tests
- Disable heart for sold items; add tooltip copy.
- Add Playwright tests: toggle count up/down, cross-user visibility, duplicate-prevent, sold behavior, rapid taps.

---

## Copy‑Paste Prompt For Claude‑Code

"""
Finalize the wishlist refactor with migrations and small cleanups. Deliver minimal diffs and list files touched.

1) DB migrations (Supabase):
   - Create unique index/constraint on favorites(user_id, product_id).
   - Add SECURITY DEFINER functions + triggers:
     • On INSERT favorites → increment products.favorite_count.
     • On DELETE favorites → decrement products.favorite_count.
   - Add a one-time backfill to recompute products.favorite_count from favorites.
   - Verify RLS remains: favorites SELECT scoped to owner; counts read from products.

2) API/store alignment:
   - Confirm /api/favorites/[productId] POST/GET returns { favorited, favoriteCount } and uses products.favorite_count.
   - Ensure /api/favorites/status reads counts from products.favorite_count and user flags from favorites by auth.uid().
   - In apps/web/src/lib/stores/favorites-store.ts, remove or update removeFavorite() to use the POST toggle; rely on returned favoriteCount.

3) UX edges:
   - Block favoriting sold products at API level; allow unfavorite; disable the heart in UI for sold items (with tooltip).

4) Tests:
   - Add Playwright tests: toggle → count up; toggle again → count down; see count from another user; duplicate-prevent under rapid taps; sold items blocked.

5) Output:
   - Migration file(s) under supabase/migrations with clear naming.
   - Short changelog of files changed and what was removed/added.
"""
