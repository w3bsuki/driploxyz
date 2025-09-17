# Claude-Codex Task Board - Supabase Modernization Follow-up

_Last updated: 2025-09-17_

## Reality Check
- `pnpm --filter @repo/ui check` currently fails with 394 errors and 82 warnings; the UI package is not type-clean.
- `packages/ui/src/lib/ProductCardWithTracking.svelte` still requires a Supabase client and references a missing `$lib/utils/viewTracking.js` helper.
- `packages/ui/src/lib/types/product.ts` overrides required Supabase fields with optional variants (for example `boosted_until`), so the bridge type does not compile.
- Multiple UI components (`DynamicContentErrorBoundary`, `EngagementBanner`, `ErrorBoundary`, `MobileNavigationDialog`, `SearchDropdown`, `SellerQuickView`, `TopProgress`, `UnifiedCookieConsent`, `VirtualProductGrid`) import `$app/environment`, which breaks when the package is consumed outside SvelteKit.
- `$derived` runes that return objects/arrays are used as if they were plain values in templates (`SearchEmptyState`, `SearchFeedback`, `AppliedFilterPills`, `AppliedFilters`, `FilterModal`, others), generating the bulk of the current TypeScript errors.

## Error Category Snapshot
- **Type bridge conflicts**: Optional overrides and mismatched sample data in `packages/ui/src/lib/types/product.ts` plus downstream mocks.
- **Missing modules/types**: `SearchFeedback` and `SearchEmptyState` import `./types.js`; `ProductCardWithTracking` expects `$lib/utils/viewTracking.js`; `DynamicContentErrorBoundary` depends on `$lib/utils/log` that does not exist inside the package.
- **Svelte runes misuse**: `$derived(() => ...)` used without calling the function result, so TypeScript reports property access on `() => T`.
- **Environment-only imports**: `$app/environment` usage inside exported UI components prevents package consumers from compiling.
- **Legacy Supabase coupling**: `ProductCardWithTracking` still pushes a Supabase client through props; analytics hooks still assume a Supabase-backed pipeline.
- **General TS hygiene**: `EventTarget.contains`, nullable boolean comparisons, untyped `Object.entries`, `error` inferred as `unknown`, autocomplete attribute typing, etc.

## Claude Tasklist
1. **Stabilise Product Types**
   - Rework `packages/ui/src/lib/types/product.ts` so the exported interface no longer overrides Supabase fields with optional properties; introduce a companion `UIProduct`/transformer instead of mutating the base type.
   - Update sample/demo data to satisfy the new shape and remove the conflicting legacy aliases (`sellerId`, `createdAt`, etc.).
   - Re-run `pnpm --filter @repo/ui check` to verify the `Product` inheritance errors disappear.

2. **Restore Shared Search Types & Utilities**
   - Add `packages/ui/src/lib/types/search.ts` with `SearchBarMode`, empty-state payloads, and feedback prompt types; re-export from `types/index.ts`.
   - Point `SearchFeedback.svelte`, `SearchEmptyState.svelte`, and `hooks/analytics.ts` at the new module.
   - Replace missing imports (`./types.js`) and ensure derived data structures are typed.

3. **Provide Missing Utils & Remove Supabase Props**
   - Implement `packages/ui/src/lib/utils/viewTracking.ts` (IntersectionObserver action with analytics callback) and update `ProductCardWithTracking.svelte` to use it without a Supabase client prop.
   - Search `packages/ui` for `supabase` references and replace with callback/event-driven APIs so the package stays platform-agnostic.
   - Either vendor a lightweight logger or drop the dependency on `$lib/utils/log` in `DynamicContentErrorBoundary.svelte`.

4. **Decouple from SvelteKit Globals**
   - Introduce a runtime helper (e.g. `packages/ui/src/lib/utils/runtime.ts`) that exposes `isBrowser`/`now()` without `$app/environment`.
   - Replace `$app/environment` imports across the UI package (`DynamicContentErrorBoundary.svelte`, `EngagementBanner.svelte`, `ErrorBoundary.svelte`, `MobileNavigationDialog.svelte`, `SearchDropdown.svelte`, `SellerQuickView.svelte`, `TopProgress.svelte`, `UnifiedCookieConsent.svelte`, `VirtualProductGrid.svelte`).

5. **Fix Derived State Patterns**
   - Standardise `$derived` usage: convert to expression form or call signature via `$derived.by(() => ...)` and access through `derived()`; add explicit return types where Svelte's inference fails.
   - Prioritise high-noise files: `SearchEmptyState.svelte`, `SearchFeedback.svelte`, `AppliedFilterPills.svelte`, `AppliedFilters.svelte`, `FilterModal.svelte`, `BoostManagement.svelte`.

6. **Clear General TS Errors**
   - Patch DOM typings (`event.currentTarget as Node` before `.contains`, guard `nextElementSibling`).
   - Type `Object.entries` results and caught errors to eliminate `'unknown'` diagnostics in `TrustBadges`, `Toast`, etc.
   - Fix nullable boolean comparisons (`BoostManagement.svelte`, favorite/badge helpers) and align `Input.svelte` autocomplete typing with `HTMLInputElement['autocomplete']`.

7. **Validation & Reporting**
   - After each cluster above, run `pnpm --filter @repo/ui check` and `pnpm --filter @repo/ui lint`; capture remaining error counts in `supabase-tasks.md`.
   - Surface any residual blockers or unexpected Supabase coupling to Codex before moving on to admin/web app fixes.

---
Ping Codex once this checklist is green or if new Supabase-dependent APIs surface while typing everything.
