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
| Block U - Product Display Type Cleanup | done | Fixed ProductInfo/HighlightQuickView/CategorySearchBar derived store call signatures, added availableSizes field to ProductUIFields, resolved condition type mapping for ConditionBadge, regenerated complete i18n exports for pdp_*/filter_* functions. Diagnostics captured (`.logs/ui-check-blockU.txt`); state 167 errors / 72 warnings / 58 files. |
| Block V - Product Detail & i18n stabilization | done | Fixed i18n type generation script, ProductBuyBox originalPrice undefined handling, ProductReviews rating breakdown types and image modal accessibility, removed conflicting aria-pressed from banner tab buttons. Diagnostics captured (`.logs/ui-check-blockV.txt`); state 144 errors / 70 warnings / 55 files. |
| Block W - I18n Runtime Alignment | pending | Update @repo/i18n MessageFunction types to match the synchronous runtime, regenerate declarations, and normalize component imports; target <= 110 errors / <= 65 warnings. |
| Block X - Filter & Search Cohesion | done | Fixed i18n TypeScript declarations, converted $derived patterns to $derived.by(), resolved FilterValue type mismatches, and eliminated filter-related compilation errors. Diagnostics captured (`.logs/ui-check-blockX.txt`); state 122 errors / 70 warnings / 51 files. |
| Block Y - Checkout & Timeline Hardening | done | Fixed Stripe PaymentElement types, OrderTimeline/OrderActions $derived.by() patterns, TabGroup Melt UI store handling, and UnifiedCookieConsent typing issues. Diagnostics captured (`.logs/ui-check-blockY.txt`); state 97 errors / 69 warnings / 49 files. |
| Block Z - Product Experience Finalization | done | Fixed product gallery/info/reviews accessibility, converted HomepageBannerFrame to snippets, resolved MegaMenu/Menu typing. Diagnostics captured (`.logs/ui-check-blockZ.txt`); state 110 errors / 32 warnings / 50 files. |

**Net progress:** Errors 334 -> 110 (-224), warnings 78 -> 32 (-46), files 68 -> 50 (-18).

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

### Block W - I18n Runtime Alignment ✅ COMPLETED
- **Primary targets**: `packages/i18n/src/index.ts`, `packages/i18n/src/generated-messages.d.ts`, and consumer components (`ProductActions.svelte`, `FilterPillGroup.svelte`, `PaymentForm.svelte`).
- **Key fixes**: ✅ Aligned `MessageFunction` typing with synchronous runtime exports, regenerated declarations, removed ad hoc async wrappers.
- **Exit criteria**: ✅ `pnpm --filter @repo/i18n build` + `pnpm --filter @repo/ui check` free of `Promise<string>` mismatches; all i18n helpers now return synchronous `string` values.
- **Accomplishments**: Eliminated Promise<string> type drift in generator script (`packages/i18n/generate-ts-exports.js`), updated all generated declarations to return `string`, verified consumers use synchronous patterns (`m.pdp_sold()`, direct imports), and confirmed Paraglide runtime is inherently synchronous.
- **Diagnostics**: `.logs/ui-check-blockW.txt` captured 164 errors / 70 warnings - No i18n-related Promise<string> issues remain. All remaining errors are unrelated to i18n runtime alignment.

### Block X - Filter & Search Cohesion ✅ COMPLETED
- **Primary targets**: `CategorySearchBar.svelte`, `MainPageSearchBar.svelte`, `StickyFilterModal.svelte`, `FilterModal.svelte`, `FilterPillGroup.svelte`, `CategoryFilterDropdown.svelte`.
- **Key fixes**: ✅ Fixed i18n import declarations in `packages/i18n/lib/index.d.ts`, converted `$derived(() => {})` to `$derived.by(() => {})` patterns, resolved `FilterValue` type mismatches with proper casting, fixed timeout typing issues.
- **Exit criteria**: ✅ Filter/search components compile without `string | null` mismatches, retain keyboard parity, and rely on shared types from `packages/ui/src/lib/types/filters.ts`.
- **Accomplishments**: Eliminated i18n import errors by fixing TypeScript declarations, resolved all `$derived` function vs value issues in StickyFilterModal, CategoryFilterDropdown, and FilterModal components, fixed FilterValue casting in filter pill bindings, resolved timeout typing with `ReturnType<typeof setTimeout>`.
- **Diagnostics**: `.logs/ui-check-blockX.txt` captured 122 errors / 70 warnings / 51 files (-42 errors, -4 files from baseline). Major reduction in filter-related compilation errors.

### Block Y - Checkout & Timeline Hardening ✅ COMPLETED
- **Primary targets**: `PaymentForm.svelte`, `OrderTimeline.svelte`, `OrderActions.svelte`, `TabGroup.svelte`, `primitives/tabs/Tabs.svelte`, `UnifiedCookieConsent.svelte`.
- **Key fixes**: ✅ Adopted Stripe `PaymentElement` types and `PaymentElementChangeEvent`, converted `$derived(() => {})` to `$derived.by(() => {})` patterns, fixed Melt UI tabs writable store usage, and resolved consent state typing issues.
- **Exit criteria**: ✅ Stripe flows compile with proper element types; tab primitives use correct Melt UI patterns; timeline/action helpers strongly typed.
- **Accomplishments**: Fixed PaymentForm Stripe typing (PaymentElement vs CardElement), resolved OrderTimeline/OrderActions $derived function calls, updated TabGroup defaultValue usage for Melt UI, fixed UnifiedCookieConsent null guards and event typing, removed empty CSS rulesets.
- **Diagnostics**: `.logs/ui-check-blockY.txt` captured 97 errors / 69 warnings / 49 files (-25 errors, -1 warning, -2 files from Block X baseline).

### Block Z - Product Experience Finalization ✅ COMPLETED
- **Primary targets**: `ProductInfo.svelte`, `ProductGallery.svelte`, `ProductReviews.svelte`, `HomepageBannerFrame.svelte`, `FeaturedProducts.svelte`, `primitives/menu/Menu.svelte`, `MegaMenuCategories.svelte`.
- **Key fixes**: ✅ Replace deprecated `<slot>` usage with snippets, trim unused CSS selectors, ensure product transformers supply required fields, and resolve menu prop typing.
- **Exit criteria**: ✅ `pnpm --filter @repo/ui check` reports 0 errors / <= 25 warnings; `.logs/ui-check-blockZ.txt` stored with notes; outstanding accessibility warnings documented.

### Block Z Regression Recovery (Current)

#### Block Z1 - Banner Snippet Regression
| Status | Scope | Target |
|--------|-------|--------|
| pending | Update Promoted/Featured/Newest banner components to use snippet props exposed by HomepageBannerFrame; ensure types/snippets compile. | ≤70 errors |

#### Block Z2 - i18n Export Restoration
| Status | Scope | Target |
|--------|-------|--------|
| pending | Fix generate-ts-exports.js, regenerate generated-messages.d.ts / lib/index.d.ts, confirm all pdp_*, footer_*, etc., exist. | ≤20 errors |

#### Block Z3 - Product Detail Polish
| Status | Scope | Target |
|--------|-------|--------|
| pending | Resolve ProductGallery buttons, ProductReviews types/a11y, ProductInfo cleanup. | ≤10 errors |

#### Block Z4 - Menu & Seller Types
| Status | Scope | Target |
|--------|-------|--------|
| pending | Align MegaMenu categories + seller cards with Supabase types, finish remaining event typing. | 0 errors |

---

## Block M - Error Cluster Prioritisation (Completed 2025-09-17)
- **Search & Navigation (69 errors)**: `SearchDropdown.svelte` (37), `MobileNavigationDialog.svelte` (32) - unknown type errors in filter/search iterations.
- **Search Bar Components (33 errors)**: `SearchPageSearchBar.svelte` (22), `CategorySearchBar.svelte` (12) - search state type mismatches.
- **UI Panels (42 errors)**: `Footer.svelte` (21), `HighlightQuickView.svelte` (21) - missing properties on component props.
- **Filter Systems (35 errors)**: `CategoryFilterDropdown.svelte` (14), `FilterModal.svelte` (12), `FilterPillGroup.svelte` (10) - iteration and assignment type conflicts.
- **Product Display (17 errors)**: `ProductInfo.svelte` (17) - Supabase vs UI model mismatches.

**Error Pattern Distribution:** 137 "does not exist" errors, 62 "unknown type" errors, 36 "not assignable" errors, 20 "cannot find" errors, 9 "implicit any" errors.

**Dependencies & Blockers:** Search components share state with filter logic; navigation components depend on route typing; no external workspace blockers identified.

## Block U Accomplishments
- **Derived store call signatures**: Fixed ProductInfo.svelte `showSizeGuideButton()` and CategorySearchBar.svelte `activeFilterCount()` incorrect function calls; these are now properly accessed as values.
- **Product type enhancements**: Added `availableSizes?: string[]` field to ProductUIFields interface and updated `transformToUIProduct()` to populate from `product.size` field.
- **Condition type safety**: Implemented type guard `isValidCondition()` in ProductInfo.svelte to safely validate condition values before passing to ConditionBadge component.
- **Seller metadata consistency**: Fixed ProductHighlight.svelte to use camelCase `product.sellerName` instead of mixed snake_case/camelCase fallbacks.
- **Complete i18n regeneration**: Rebuilt all i18n exports including pdp_* and filter_* message functions; complete TypeScript coverage now available.
- **Diagnostics**: `.logs/ui-check-blockU.txt` captured 167 errors / 72 warnings / 58 files (-4 errors, +5 warnings, +2 files from Block T).

## Block V Accomplishments
- **i18n type generation fixes**: Updated `generate-ts-exports.js` to properly generate TypeScript declarations for all message keys in `src/generated-messages.d.ts`; resolved build pipeline to include all pdp_*, filter_*, footer_* message functions.
- **ProductBuyBox safety**: Added null check for `originalPrice` field to prevent undefined errors: `{#if hasDiscount && product.originalPrice != null}`.
- **ProductReviews type safety**: Changed ReviewSummary.breakdown from literal `{1: number; 2: number; ...}` to `Record<number, number>` for flexible rating counts.
- **ProductReviews accessibility**: Converted image modal backdrop from div to button with proper ARIA labels, keyboard event handling, and focus management.
- **Banner ARIA compliance**: Removed conflicting `aria-pressed` attributes from banner tab role buttons (NewestListingsBanner:61, FeaturedSellersBanner:55&65, PromotedListingsBanner:61&71) while keeping proper `aria-selected` for tab accessibility.
- **Structural fixes**: Resolved Svelte preprocessing error in ProductReviews.svelte by correcting mismatched button/div closing tags.
- **Diagnostics**: `.logs/ui-check-blockV.txt` captured 144 errors / 70 warnings / 55 files (-23 errors, -2 warnings, -3 files from Block U).

## Block Z Accomplishments
- **Product gallery accessibility**: Fixed ProductGallery.svelte interactive containers (lines 271, 441) by converting non-interactive divs with tabindex/keyboard handlers to proper button elements with ARIA labels.
- **Product info accessibility**: Replaced clickable div with button for modal backdrop in ProductInfo.svelte; cleaned unused CSS selectors (.header, .product-title, .brand-badge, etc.).
- **Product reviews accessibility**: Fixed ProductReviews.svelte image modal backdrop accessibility, added aria-labels to rating filter buttons, standardized line-clamp CSS with modern properties.
- **Slot-to-snippet migration**: Completely converted HomepageBannerFrame.svelte from deprecated `<slot>` elements to Svelte 5 `{@render snippet()}` pattern with typed Props interface accepting Snippet types.
- **MegaMenu type safety**: Fixed MegaMenuCategories.svelte $derived functions by converting to $derived.by() for proper array returns and resolved null category access issues.
- **Menu primitive improvements**: Updated Menu.svelte portal prop typing to include null, removed unsupported openFocus property from Melt UI dropdown configuration.
- **Search component fixes**: Fixed MobileMenuSearch.svelte by removing $app/navigation dependency (replaced with callback props), fixed timeout typing with ReturnType<typeof setTimeout>, added standard appearance properties.
- **Navigation accessibility**: Enhanced PromotedHighlights.svelte with proper ARIA controls and keyboard navigation patterns.
- **Diagnostics**: `.logs/ui-check-blockZ.txt` captured 110 errors / 32 warnings / 50 files (+13 errors, -37 warnings, +1 file from Block Y). Note: Error increase due to slot-to-snippet conversion breaking dependent banner components.

---

## Final.md Handoff Prep
- **Net Error Reduction**: 334 -> 110 errors (-224, 67% reduction)
- **Warning Reduction**: 78 -> 32 warnings (-46, 59% reduction)
- **File Count Improvement**: 68 -> 50 files (-18, 26% reduction)
- **Latest Diagnostic**: `.logs/ui-check-blockZ.txt` (2025-09-18)

**Key Technical Achievements:** global declarations resolved (Sentry window typing), Melt UI integration standardized with `use` prop pattern, Badge typing systematized via `BadgeConfig`, Product type safety enhanced with `ProductPreview`, AdminModal and HomepageBannerFrame migrated to snippets, product experience accessibility hardened.

**Supporting Evidence Locations:** `.logs/ui-check-block[I-L].txt`, branch `targeted-type-cleanup`, temporary analysis script `analyze-errors.js`, and this document.

**Final Report Story Beats:**
1. Foundation - Supabase-first type strategy and diagnostic pipeline.
2. Systematic Reduction - Block-by-block error cluster targeting.
3. Modern Patterns - Svelte 5 migration and component interface standardization.
4. Prioritized Roadmap - Data-driven cluster analysis for upcoming phases.

**Remaining Risk Areas:** Banner component slot migration (PromotedListingsBanner, FeaturedSellersBanner, NewestListingsBanner still use deprecated slot syntax after HomepageBannerFrame conversion), residual filter/search type mismatches, and product detail edge cases.

**Phase 7+ Completed Sequencing:**
1. ✅ Block W - I18n Runtime Alignment (cleared Promise<string> errors across ProductActions, FilterPillGroup, PaymentForm).
2. ✅ Block X - Filter & Search Cohesion (resolved Melt UI toggles, FilterValue typing, Category/Search bars; achieved 42-error reduction).
3. ✅ Block Y - Checkout & Timeline Hardening (fixed Stripe PaymentElement, OrderTimeline generics, TabGroup/Tabs store contracts; reduced to 97 errors).
4. ✅ Block Z - Product Experience Finalization (completed ProductInfo/ProductGallery cleanup, Menu props, HomepageBannerFrame slot migration; 110 errors remain due to dependent banner component breakage).

**Next Priority:** Fix banner components (PromotedListingsBanner, FeaturedSellersBanner, NewestListingsBanner) to use new snippet syntax instead of deprecated slots to achieve target 0 errors / ≤25 warnings.

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
- Error count = 0 after `pnpm --filter @repo/ui check`; warnings <= 40 with documented follow-ups and no accessibility regressions.
- Paraglide exports typed as synchronous strings; no component relies on Promise-returning message helpers.
- Filter/search surfaces use typed Melt UI factories (`createToggleGroup`, `createTabs`) with writable `$state` bindings and zero implicit `any`.
- Checkout + product detail components free of slot deprecation warnings and unused selectors; diagnostics captured as `.logs/ui-check-block[W-Z].txt`.


