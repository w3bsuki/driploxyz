# Driplo v1 Launch — Claude‑Code Tasks

Status: Drafted for immediate execution. Focus: fix broken condition filters, add quick navigation on search, and reduce clicks to purchase. Each task includes exact files, minimal diffs, and acceptance criteria.

---

## Blocker 1 — Condition Filters Are Inconsistent (Search shows no items for “Нов”)

Problem
- Search UI mixes different condition keys: `new`, `like-new` vs canonical DB enum keys `brand_new_with_tags`, `new_without_tags`, `like_new`, `good`, `worn`, `fair`.
- Effect: Selecting “Нов”/New returns no items; quick filters and desktop select disagree.

Goal
- Unify on the 6 canonical condition keys everywhere (client + server + labels). Preserve localized labels.

Files To Edit
- `apps/web/src/routes/search/+page.svelte:1` — Replace the `conditions` array with the 6 canonical keys and correct labels; update desktop select + chips usage.
- `apps/web/src/lib/stores/product-filter.svelte.ts:1` — Verify `filteredProducts` compares `product.condition` to the canonical values (no change if exact string equality is already used).
- `packages/i18n/messages/bg.json:570`+ — Ensure labels exist for:
  - `sell_condition_brandNewWithTags`, `sell_condition_newWithoutTags`, `condition_likeNew`, `condition_good`, `sell_condition_worn`, `condition_fair`.
- `apps/web/src/routes/(protected)/sell/+page.svelte:170` — Keep the fix converting old values if encountered, but ensure new UI only emits canonical values.
- Add migration (see Blocker 3) to codify enum shape in repo.

Steps
- Replace `conditions` in `+page.svelte` with:
  - `{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags() }`
  - `{ key: 'new_without_tags', label: i18n.sell_condition_newWithoutTags() }`
  - `{ key: 'like_new', label: i18n.condition_likeNew() }`
  - `{ key: 'good', label: i18n.condition_good() }`
  - `{ key: 'worn', label: i18n.sell_condition_worn() }`
  - `{ key: 'fair', label: i18n.condition_fair() }`
- Ensure desktop select, mobile chips, and quickConditionFilters use the same keys and update the store with canonical values.
- Confirm server handlers already accept the 6 keys (they do).

Acceptance Criteria
- Selecting “Ново с етикети” or “Нов без етикети” filters results correctly.
- Desktop Condition select and mobile chips use identical values and stay in sync with URL.
- No regressions to infinite scroll; `?condition=` query param matches canonical string.

Claude Code — Prompt
You are Claude Code working in a SvelteKit monorepo. Fix condition filters to use the 6 canonical keys everywhere on the search page. Do not change server code. Make minimal, targeted changes.

Files
- `apps/web/src/routes/search/+page.svelte`
- `apps/web/src/lib/stores/product-filter.svelte.ts` (read/verify only)
- `packages/i18n/messages/*` (read/verify labels)

Constraints
- Keep existing quickConditionFilters, but align the desktop/mobile `conditions` list to the same keys/labels.
- Don’t add new dependencies.
- Keep diff under 80 LOC.

Steps
1) In `+page.svelte`, replace the `conditions` constant with the 6 canonical keys and correct labels.
2) Update desktop select options to use these keys. Ensure toggling sets `filterStore.updateFilter('condition', key)`.
3) Verify URL sync (`syncFiltersToUrl`) uses the value without translation.
4) Run typecheck and build.

Definition of Done
- Selecting any condition yields matching results. URL reflects canonical keys.
- No console errors.

---

## Task 2 — Search Quick Navigation (Tabs/Pills) to Reduce Clicks

Goal
- Add a sticky quick navigation row on `/search` for fast category and condition switching (similar to Vinted). Optionally use Melt UI Tabs if simpler.

Files To Edit
- `apps/web/src/routes/search/+page.svelte:1` — Add a horizontal “Quick Nav” under the search bar:
  - Category pills: Women, Men, Kids, Unisex (uses existing `mainCategories`).
  - Condition chips: Brand new with tags, New without tags, Like new, Good (toggle; use canonical keys).

Steps
- Below the search input, render a horizontally scrollable container (mobile) with:
  - Category pills → `handleCategorySelect(cat.key)`.
  - Condition chips → toggle via `handleQuickCondition(key)`.
- Make the bar sticky with the existing header offset variable.
- Keep desktop minimal (pills visible) and avoid introducing new layout shifts.

Acceptance Criteria
- On mobile, users can switch category/condition with one tap from the top row.
- Bar is sticky beneath the header and does not overlap the search input.
- State syncs with URL and existing dropdowns (no duplicated state bugs).

Claude Code — Prompt
Add a sticky “Quick Nav” row to `/search` with category pills and condition chips (canonical keys). Keep changes in `+page.svelte`. No new dependencies.

Constraints
- Reuse `mainCategories` and `quickConditionFilters`.
- Keep styles consistent with Tailwind v4 utilities already used.
- Keep diff under 120 LOC.

---

## Task 3 — Reduce Clicks to Purchase (Buy Now → Checkout)

Problem
- “Buy Now” opens BundleBuilder even for single item, adding steps.

Goal
- Make Buy Now go directly to `/checkout/[productId]`.
- Keep Bundle as a separate, secondary action (“Build Bundle”).

Files To Edit
- `apps/web/src/routes/product/[id]/+page.svelte:1`
- If needed, minor prop change in `@repo/ui` ProductActionBar usage only.

Steps
- Change `handleBuyNow()` to `goto('/checkout/${product.id}')`.
- Keep a separate button or overflow menu entry for “Build a bundle” that opens the modal.
- Ensure checkout page loads and initializes Stripe as it does today.

Acceptance Criteria
- Tapping “Buy Now” routes immediately to the checkout page.
- Bundle can still be launched manually from the product page.
- No change to server API.

Claude Code — Prompt
Modify the product page so the primary “Buy Now” navigates directly to `/checkout/[productId]`. Keep the BundleBuilder behind a secondary action. Minimal changes; no new UI components.

---

## Blocker 2 — Add Reproducible DB Migration for product_condition Enum

Problem
- Live DB enum includes 6 values, but migrations in repo still show the old 4‑value enum. This breaks reproducibility.

Goal
- Add a forward‑safe migration that aligns the enum with the 6 canonical values.

Files To Add
- `migrations/007_update_product_condition_enum.sql`

Migration Content (idempotent)
```sql
-- Align product_condition enum with canonical 6 values
DO $$ BEGIN
  ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'brand_new_with_tags';
  ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'new_without_tags';
  ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'like_new';
  ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'good';
  ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'worn';
  ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'fair';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

Acceptance Criteria
- New environments created from migrations match the 6‑value enum.
- No data migration required; existing rows remain valid.

Claude Code — Prompt
Create `migrations/007_update_product_condition_enum.sql` with the SQL above. Do not modify existing migrations.

---

## Task 4 — QA: E2E Checks for Search Filters and Checkout

Goal
- Add thin vitest/playwright tests to cover the critical flows.

Files To Add/Edit
- `apps/web/tests/search.filters.spec.ts`
- `apps/web/tests/checkout.flow.spec.ts`

Scenarios
- Search: visit `/search`, click “Ново с етикети”, verify URL contains `condition=brand_new_with_tags`, assert at least 1 product card rendered (mock if needed).
- Search (desktop): select condition from the dropdown, verify same behavior.
- Product → Buy Now: navigate to a product page, click “Buy Now”, assert route becomes `/checkout/...`.

Acceptance Criteria
- Tests run locally with `pnpm --filter web test:e2e`.
- No flakiness in headless mode.

Claude Code — Prompt
Add two basic Playwright specs to validate search condition filtering and the direct “Buy Now” checkout navigation. Keep selectors resilient and avoid coupling to texts other than stable data‑testids if available.

---

## Optional — Melt UI Tabs (If You Prefer Tabs Over Pills)

Alternative UX
- Use `@melt-ui/svelte` Tabs for top‑level category switching (All/Women/Men/Kids/Unisex).
- Wire `on:change` to update `filterStore`.

Files
- `apps/web/src/routes/search/+page.svelte`

Constraints
- Keep keyboard accessibility; ensure tab focus isn’t trapped by sticky header.

Acceptance Criteria
- Visible tabs reflect active category; changing tabs updates results and URL.

---

## Validation & Handoff Checklist

- [ ] Types: `pnpm -w check-types`
- [ ] Lint: `pnpm -w lint`
- [ ] Build: `pnpm --filter @repo/ui build && pnpm --filter web build`
- [ ] E2E: `pnpm --filter web test:e2e`
- [ ] Manual: Mobile Safari/Chrome — search quick nav, condition filters, Buy Now → Checkout.

Notes
- Keep diffs scoped and reversible. No new deps.
- If any step conflicts with code reality, document the exact file/line and propose the minimal alternative.

