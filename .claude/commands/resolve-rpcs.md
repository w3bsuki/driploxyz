# /resolve-rpcs — Decide and fix RPC-related TS errors

Context
- Code calls two RPCs that may be missing from DB types or the DB itself:
  - `apps/web/src/routes/(protected)/sell/+page.server.ts:195` → `queue_slug_generation`
  - `apps/web/src/routes/search/+page.server.ts:406` → `get_category_hierarchy`

Choose ONE path below.

Option A — Implement RPCs (keep behavior)
1) Create RPCs via Supabase MCP (propose SQL, apply with approval)
- `queue_slug_generation(p_product_id uuid)` → enqueues ID into a queue table (or updates a slug immediately)
- `get_category_hierarchy(category_uuid uuid)` → returns `{ level_1_name, level_2_name, level_3_name }`
2) Regenerate types
- Run your types generation (e.g., `pnpm -C packages/database build` or project’s script)
3) Verify and build
- `pnpm check-types` and `pnpm -C apps/web build`

Option B — Remove RPC usage (recommended to ship faster)
1) Sell page: remove background slug RPC
- File: `apps/web/src/routes/(protected)/sell/+page.server.ts`
- On insert, set `slug: serviceUtils.slugify(title)` (import from `$lib/services`) instead of leaving `slug: null`
- Remove the try/catch block that calls `supabase.rpc('queue_slug_generation', ...)`
2) Search page: remove hierarchy RPC
- File: `apps/web/src/routes/search/+page.server.ts`
- Remove the `rpc('get_category_hierarchy', ...)` call, and derive names from the joined `categories` row already selected
  - Use `product.categories.name` and `product.categories.level` (or walk parent chain if needed)
3) Build and check types
- `pnpm check-types` and `pnpm -C apps/web build`

Acceptance
- No TS errors referencing those RPCs
- Search and sell flows still work (manual smoke)
- PR includes a brief note on the chosen path and why

