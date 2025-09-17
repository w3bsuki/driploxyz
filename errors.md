# Targeted Type System Refactor Plan
**Branch**: `targeted-type-cleanup`
**Latest Check (2025-09-17 18:14)**: 318 TypeScript errors, 69 warnings across 59 files (`.logs/ui-check-blockH.txt`)
**Goal**: Reduce error count below 150 while locking Supabase as the single data source and eliminating DOM/a11y regressions.

---

## Guiding Principles
- Prefer Supabase-generated types (`Tables`, `TablesInsert`, `TablesUpdate`) for persisted data models.
- Layer UI-only concepts (design tokens, variants, layout primitives) as additive types; avoid redefining Supabase rows.
- Derive presentation fields with helpers (`transformToUIProduct`, etc.) instead of mutating row types.
- Iterate in tight loops: fix a cluster, run `pnpm --filter @repo/ui check`, log diagnostics under `.logs/`, and document deltas here.
- Keep legacy aliases (`sellerId`, `createdAt`, `is_promoted`) only where external contracts demand; annotate `@deprecated` with TODO references for removal.

---

## Progress Log
| Phase / Block | Status | Highlights |
|---------------|--------|------------|
| Phase 0 - Pre-flight | ? | Branch created, baseline diagnostics captured in `.logs/ui-check-baseline.txt`, sorted report generated. |
| Phase 1 - Audit Manual Types | ? | Classified exports in `packages/ui/src/lib/types/index.ts`, separated UI tokens from persisted data. |
| Phase 2 - Refine Product Types | ? | Introduced `ProductRow` + `ProductUIFields` split, hardened `transformToUIProduct`, preserved legacy aliases with guards. |
| Phase 3 - Database Type Alignment | ? | Replaced manual interfaces with Supabase aliases; updated `Seller` extension. |
| Phase 4 - DOM & A11y Fixes | ? | Resolved key DOM typing issues (`PromotedHighlights.svelte`, `AdminModal.svelte`). |
| Phase 5 - Verification | ? | Captured diagnostics (`.logs/ui-check-final.txt`), error count 334 ? 326, warnings 78 ? 75. |
| Phase 6a - DOM Typing Pass | ? | Fixed AvatarUploader, Input, AvatarSelector; standardized HTMLElement casting. |
| Phase 6b - Accessibility Touch-up | ? | Added `tabindex"-1"` to `AdminModal`; improved interactive role compliance. |
| Phase 7 - Legacy Alias Pilot | ? | Migrated `display_name` ? `displayName`; extended `ProductUIFields` with `currency`. |
| Block A - DOM/A11y Hotspots | ? | Cleared tooltip/modal badge warnings and rebuilt i18n exports. |
| Block B - Legacy Alias Wave 2 | ? | Surveyed remaining aliases; annotated deprecated fields. |
| Block C - i18n & Type Gaps | ? | Added currency lookup helper; ensured transforms populate UI fields. |
| Block D - Verification | ? | Diagnostics captured (`.logs/ui-check-blockD.txt`); state 318 errors / 75 warnings / 61 files. |
| Block E - Modal & Backdrop Accessibility | ? | Fixed AdminModal and SellerQuickView accessibility warnings. |
| Block F - Legacy Alias Wave 3 | ? | Migrated `is_promoted` usage; confirmed external interface boundaries. |
| Block G - Slot & Rune Modernisation | ? | Converted AdminModal to Svelte 5 `{@render}` snippets; removed slot warnings. |
| Block H - Verification | ✓ | Diagnostics logged (`.logs/ui-check-blockH.txt`); state 318 errors / 69 warnings / 59 files. |
| Block I - Error Boundary & Tooltip Typing | ✓ | Fixed DynamicContentErrorBoundary Sentry global declarations; added Button `use` prop for Melt UI integration. |
| Block J - Badge & Seller Utilities | ✓ | Resolved TrustBadges badge typing with explicit BadgeConfig interface; reduced badge-related errors. |
| Block K - Product Type Gaps | ✓ | Created ProductPreview type for minimal data; fixed FavoriteButton Product type mismatches. |
| Block L - Verification | ✓ | Diagnostics captured (`.logs/ui-check-blockL.txt`); state 313 errors / 69 warnings / 57 files. |

**Net progress:** Errors 334 → 313 (-21), warnings 78 → 69 (-9), files 69 → 57 (-12).

---

## Block I-L Accomplishments
- **Global declarations**: Created `packages/ui/src/types/global.d.ts` for Sentry window typing; fixed DynamicContentErrorBoundary access.
- **Melt UI integration**: Added `use` prop support to Button component for Melt UI actions; resolved ShippingEstimator integration.
- **Badge typing**: Implemented BadgeConfig interface in TrustBadges; resolved multiple `'badge' is of type 'unknown'` errors.
- **Product type safety**: Created ProductPreview type for minimal data needs; updated FavoriteButton to accept Product | ProductPreview.
- **Diagnostics pipeline**: Progress tracked from `.logs/ui-check-blockI.txt` to `.logs/ui-check-blockL.txt`; net reduction of 21 errors.

## Block E?H Accomplishments
- **Accessibility**: Backdrop/modal handlers now use focusable elements with keyboard parity; non-interactive warnings cleared.
- **Alias management**: Product highlight components consume canonical Supabase fields while documenting remaining alias boundaries.
- **Svelte 5 migration**: AdminModal now uses snippet-based slots with typed props, eliminating deprecation noise.
- **Diagnostics pipeline**: Latest results captured in `.logs/ui-check-blockE.txt` and `.logs/ui-check-blockH.txt`.

---

## Upcoming Work Blocks

### Block I ? Error Boundary & Tooltip Typing
1. `pnpm --filter @repo/ui check > .logs/ui-check-blockI.txt` for a fresh snapshot.
2. `packages/ui/src/lib/DynamicContentErrorBoundary.svelte`: add a `declare global` augmentation for `window.Sentry` (or wrap access with `in` checks) to satisfy TypeScript.
3. `packages/ui/src/lib/primitives/tooltip/Tooltip.svelte`: resolve `"use"` prop typing by aligning component Props with Melt UI API or exporting a union type for supported options.
4. Verify fixes with `pnpm --filter @repo/ui check` before moving on.

### Block J ? Badge & Seller Utilities
1. Address repeated `'badge' is of type 'unknown'` errors (Seller badge utilities); tighten typings in the badge helper module.
2. Ensure badge arrays use typed return values (`Array<BadgeConfig>`), updating consumers accordingly.
3. Update associated tests/fixtures and rerun diagnostics.

### Block K ? Product & Shipping Type Gaps
1. `packages/ui/src/lib/ShippingEstimator.svelte` and related helpers: resolve iterable typing errors (ensure derived stores return arrays rather than lazily evaluated functions).
2. Fix product casting issues (`Type '{ favorite_count: number; id: string; }' is not assignable to type 'Product'`) by creating lightweight DTOs or adjusting function signatures.
3. Reassess remaining alias usage (`sellerId`, `createdAt`) and continue migration where possible.

### Block L ? Verification & Reporting
1. Commands:
   - `pnpm --filter @repo/ui check`
   - `pnpm --filter @repo/ui test`
2. Save diagnostics to `.logs/ui-check-blockL.txt`.
3. Update this file with new totals, list blockers, and capture follow-up tasks.
4. Prepare Conventional Commits summarizing each block (e.g., `fix(ui): type guard error boundary Sentry access`).

---

## Reference Commands
- `pnpm --filter @repo/ui check`
- `pnpm --filter @repo/ui test`
- `rg "sellerId" packages/ui/src`
- `rg "createdAt" packages/ui/src`
- `rg "is_promoted" packages/ui/src`
- `pnpm --filter @repo/i18n build`

---

## Success Criteria
- Error count ? 150 with zero unresolved DOM/a11y warnings.
- Legacy alias references reduced to single digits, all annotated with actionable TODOs.
- Svelte 5 runes adopted across slot-heavy components; no deprecated slot warnings remain.
- Diagnostics for every block stored under `.logs/` for traceability.
