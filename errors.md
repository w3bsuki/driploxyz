# Targeted Type System Refactor Plan
**Branch**: `targeted-type-cleanup`
**Latest Check (2025-09-17 18:32)**: 301 TypeScript errors, 69 warnings across 56 files (`.logs/ui-check-blockL.txt`)
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
| Phase 0 - Pre-flight | done | Branch created, baseline diagnostics captured in `.logs/ui-check-baseline.txt`, sorted report generated. |
| Phase 1 - Audit Manual Types | done | Classified exports in `packages/ui/src/lib/types/index.ts`, separated UI tokens from persisted data. |
| Phase 2 - Refine Product Types | done | Introduced `ProductRow` + `ProductUIFields` split, hardened `transformToUIProduct`, preserved legacy aliases with guards. |
| Phase 3 - Database Type Alignment | done | Replaced manual interfaces with Supabase aliases; updated `Seller` extension. |
| Phase 4 - DOM & A11y Fixes | done | Resolved key DOM typing issues (`PromotedHighlights.svelte`, `AdminModal.svelte`). |
| Phase 5 - Verification | done | Captured diagnostics (`.logs/ui-check-final.txt`), error count 334 -> 326, warnings 78 -> 75. |
| Phase 6a - DOM Typing Pass | done | Fixed AvatarUploader, Input, AvatarSelector; standardized HTMLElement casting. |
| Phase 6b - Accessibility Touch-up | done | Added `tabindex="-1"` to `AdminModal`; improved interactive role compliance. |
| Phase 7 - Legacy Alias Pilot | done | Migrated `display_name` -> `displayName`; extended `ProductUIFields` with `currency`. |
| Block A - DOM/A11y Hotspots | done | Cleared tooltip/modal badge warnings and rebuilt i18n exports. |
| Block B - Legacy Alias Wave 2 | done | Surveyed remaining aliases; annotated deprecated fields. |
| Block C - i18n & Type Gaps | done | Added currency lookup helper; ensured transforms populate UI fields. |
| Block D - Verification | done | Diagnostics captured (`.logs/ui-check-blockD.txt`); state 318 errors / 75 warnings / 61 files. |
| Block E - Modal & Backdrop Accessibility | done | Fixed AdminModal and SellerQuickView accessibility warnings. |
| Block F - Legacy Alias Wave 3 | done | Migrated `is_promoted` usage; confirmed external interface boundaries. |
| Block G - Slot & Rune Modernisation | done | Converted AdminModal to Svelte 5 `{@render}` snippets; removed slot warnings. |
| Block H - Verification | done | Diagnostics logged (`.logs/ui-check-blockH.txt`); state 318 errors / 69 warnings / 59 files. |
| Block I - Error Boundary & Tooltip Typing | done | Fixed DynamicContentErrorBoundary Sentry global declarations; added Button `use` prop for Melt UI integration. |
| Block J - Badge & Seller Utilities | done | Resolved TrustBadges badge typing with explicit BadgeConfig interface; reduced badge-related errors. |
| Block K - Product Type Gaps | done | Created ProductPreview type for minimal data; fixed FavoriteButton Product type mismatches. |
| Block L - Verification | done | Diagnostics captured (`.logs/ui-check-blockL.txt`); state 301 errors / 69 warnings / 56 files. |
| Block M - Error Cluster Prioritisation | done | Block L diagnostics parsed; cluster roadmap recorded in "Upcoming Work Blocks". |
| Block N - Search & Navigation Cleanup | done | Diagnostics captured (`.logs/ui-check-blockN.txt`); state 275 errors / 69 warnings / 57 files. |
| Block O - Component Interface Standardization | done | Diagnostics captured (`.logs/ui-check-blockO.txt`); state 260 errors / 69 warnings / 57 files. |
| Block P - Filter System Type Safety | done | Diagnostics captured (`.logs/ui-check-blockP.txt`); state 261 errors / 69 warnings / 57 files. |
| Block Q - Search Bar State Alignment | done | Diagnostics captured (`.logs/ui-check-blockQ.txt`); state 268 errors / 69 warnings / 57 files. |
| Block R - Search Bar Type Fixes | done | Fixed $derived usage patterns, added FilterOption.key property, resolved prop signature issues. Diagnostics captured (`.logs/ui-check-blockR.txt`); state 229 errors / 69 warnings / 57 files. |
| Block S - Search Navigation Type Fixes | done | Fixed SearchDropdown $derived array iterations, removed $app/navigation dependency, resolved MobileNavigationDialog profile stats access, added proper type guards and fallbacks. Diagnostics captured (`.logs/ui-check-blockS.txt`); state 193 errors / 68 warnings / 57 files. |
| Block T - UI Panels Cluster Cleanup | done | Fixed HighlightQuickView modal (updated Product shape, sizes -> availableSizes, snake_case -> camelCase seller fields, added accessibility tabindex). Updated i18n generated-messages.d.ts with missing footer functions. Diagnostics captured (`.logs/ui-check-blockT.txt`); state 171 errors / 67 warnings / 56 files. |

**Net progress:** Errors 334 -> 171 (-163), warnings 78 -> 67 (-11), files 68 -> 56 (-12).

---

## Block I-L Accomplishments
- **Global declarations**: Added Sentry window typing in `packages/ui/src/lib/types/index.ts`; fixed DynamicContentErrorBoundary access.
- **Melt UI integration**: Added `use` prop support to Button component for Melt UI actions; resolved ShippingEstimator integration.
- **Badge typing**: Implemented BadgeConfig interface in TrustBadges; resolved multiple `'badge' is of type 'unknown'` errors.
- **Product type safety**: Created ProductPreview type for minimal data needs; updated FavoriteButton to accept `Product | ProductPreview`.
- **Diagnostics pipeline**: Progress tracked from `.logs/ui-check-blockI.txt` to `.logs/ui-check-blockL.txt`; net reduction of 17 errors.

## Block E-H Accomplishments
- **Accessibility**: Backdrop/modal handlers now use focusable elements with keyboard parity; non-interactive warnings cleared.
- **Alias management**: Product highlight components consume canonical Supabase fields while documenting remaining alias boundaries.
- **Svelte 5 migration**: AdminModal now uses snippet-based slots with typed props, eliminating deprecation noise.
- **Diagnostics pipeline**: Latest results captured in `.logs/ui-check-blockE.txt` and `.logs/ui-check-blockH.txt`.

## Block N Accomplishments
- **Shared types**: Created `packages/ui/src/lib/search/types.ts` to centralize search/navigation models using Supabase `Tables`.
- **Component migrations**: `SearchDropdown.svelte` and `MobileNavigationDialog.svelte` now consume typed `$props()` (`SearchDropdownProps`, `MobileNavigationDialogProps`) with Svelte 5 runes.
- **State & typing**: Removed `any` usage, aligned navigation state with `$state` stores, and added guards (`isCategoryWithChildren`, `isProductWithImages`).
- **Diagnostics**: `.logs/ui-check-blockN.txt` captured 275 errors / 69 warnings / 57 files (-26 errors from Block L).

## Block P Accomplishments
- **Shared filter types**: Created `packages/ui/src/lib/types/filters.ts` with unified `FilterOption`, `FilterSection`, `CategoryHierarchy` interfaces following Supabase + UI extension pattern.
- **Component modernization**: Converted `CategoryFilterDropdown.svelte`, `FilterModal.svelte`, and `FilterPillGroup.svelte` to use shared types with proper Svelte 5 `$bindable()` props.
- **Type safety improvements**: Replaced `Record<string, any>` with `Record<string, FilterValue>`, eliminated ad-hoc type definitions, and fixed i18n function imports.
- **State management fixes**: Resolved `$bindable()` assignment issues in FilterPillGroup by using Melt UI's `toggleValue.set()` instead of direct prop mutations.
- **Diagnostics**: `.logs/ui-check-blockP.txt` captured 261 errors / 69 warnings / 57 files (+1 error from Block O, net improvement from 297 during development).

---

## Block Q Accomplishments
- **Search component refactoring**: Restored `CategorySearchBar.svelte` from backup with proper Svelte 5 syntax (`$props()`, `$bindable()`, `$state()`, `$derived()`, `$effect()`).
- **Shared type integration**: Both `SearchPageSearchBar.svelte` and `CategorySearchBar.svelte` now use shared types from `./search/types` and utilities from `./search/utils`.
- **Code cleanup**: Verified no unused imports, consistent `setFilter` helper usage, and proper analytics function integration.
- **Type safety**: Identified remaining issues with `$derived` syntax (need `$derived.by()` for functions) and `FilterOption.key` property missing from type definitions.
- **Diagnostics**: `.logs/ui-check-blockQ.txt` captured 268 errors / 69 warnings / 57 files (+7 errors from Block P due to refactoring introducing new type checks).

## Upcoming Work Blocks

---

## Block M - Error Cluster Prioritisation (Completed 2025-09-17)
- **Search & Navigation (69 errors)**: `SearchDropdown.svelte` (37), `MobileNavigationDialog.svelte` (32) - unknown type errors in filter/search iterations.
- **Search Bar Components (33 errors)**: `SearchPageSearchBar.svelte` (22), `CategorySearchBar.svelte` (12) - search state type mismatches.
- **UI Panels (42 errors)**: `Footer.svelte` (21), `HighlightQuickView.svelte` (21) - missing properties on component props.
- **Filter Systems (35 errors)**: `CategoryFilterDropdown.svelte` (14), `FilterModal.svelte` (12), `FilterPillGroup.svelte` (10) - iteration and assignment type conflicts.
- **Product Display (17 errors)**: `ProductInfo.svelte` (17) - Supabase vs UI model mismatches.

**Error Pattern Distribution:** 137 "does not exist" errors, 62 "unknown type" errors, 36 "not assignable" errors, 20 "cannot find" errors, 9 "implicit any" errors.

**Dependencies & Blockers:** Search components share state with filter logic; navigation components depend on route typing; no external workspace blockers identified.

---

## Final.md Handoff Prep
- **Net Error Reduction**: 334 -> 301 errors (-33, 10% reduction)
- **Warning Reduction**: 78 -> 69 warnings (-9, 12% reduction)
- **File Count Improvement**: 68 -> 56 files (-12, 18% reduction)
- **Latest Diagnostic**: `.logs/ui-check-blockL.txt` (2025-09-17 18:32)

**Key Technical Achievements:** global declarations resolved (Sentry window typing), Melt UI integration standardized with `use` prop pattern, Badge typing systematized via `BadgeConfig`, Product type safety enhanced with `ProductPreview`, AdminModal migrated to snippets.

**Supporting Evidence Locations:** `.logs/ui-check-block[I-L].txt`, branch `targeted-type-cleanup`, temporary analysis script `analyze-errors.js`, and this document.

**Final Report Story Beats:**
1. Foundation - Supabase-first type strategy and diagnostic pipeline.
2. Systematic Reduction - Block-by-block error cluster targeting.
3. Modern Patterns - Svelte 5 migration and component interface standardization.
4. Prioritized Roadmap - Data-driven cluster analysis for upcoming phases.

**Remaining Risk Areas:** Search/navigation cluster (69 errors), component interface gaps (137 "does not exist" errors), cross-component type dependencies that span workspaces.

**Phase 7+ Proposed Sequencing:**
1. Search & Navigation refactor (Priority 1, estimated 23% error reduction).
2. Component interface standardization (Priority 2, estimated 14% error reduction).
3. Filter system unification (Priority 3, estimated 12% error reduction).
4. Long-tail cleanup to drive total errors below 150.

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
- Error count <= 150 with zero unresolved DOM/a11y warnings.
- Legacy alias references reduced to single digits, all annotated with actionable TODOs.
- Svelte 5 runes adopted across slot-heavy components; no deprecated slot warnings remain.
- Diagnostics for every block stored under `.logs/` for traceability.
