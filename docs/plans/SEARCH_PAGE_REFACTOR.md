# /search Experience Refactor Plan

## Current Pain Points
- **Monolithic page script** mixes data fetching, stores, and UI logic (1000+ lines) making runes usage inconsistent and hard to test.
- **Single filter store** designed for products only; sellers/brands hack around missing fields causing runtime guards and broken bindings.
- **UI coupling**: SearchPageSearchBar attempts to own segmented control logic and product filters simultaneously, leading to duplicated search bars and brittle state.
- **Loader/API drift**: /search/+page.server.ts and /api/search manually map Supabase rows without shared typing or composable queries.
- **Supabase assumptions**: sellers/brands queries are inlined with minimal filtering and no caching/index guidance.

## Goals
1. Establish a modular, mode-aware search architecture that follows SvelteKit 2 + Svelte 5 runes best practices.
2. Separate product filtering from seller/brand lookup so each mode owns its data, state, and UI.
3. Improve maintainability by introducing typed data contracts, dedicated stores, and reusable UI primitives in @repo/ui.
4. Prepare for Supabase tweaks (indexes, RPCs) without blocking UI work; document requests clearly for MCP follow-up.

## Proposed Architecture
### Data Layer
- pps/web/src/lib/search/modes.ts: shared enums/types for search modes, filter payloads, and result DTOs.
- pps/web/src/lib/search/api.ts: wrapper helpers for calling Supabase (SSR + client) with typed responses.
- pps/web/src/routes/search/+page.server.ts: delegates to search/api.ts functions per mode; returns structured SearchPageData (products, sellers, brands, meta).

### State Layer
- createProductsFilterStore (existing logic trimmed & moved to lib/search/stores/products.svelte.ts).
- createSellersStore, createBrandsStore for managing query, loading, pagination.
- Mode coordinator store createSearchWorkbenchStore that exposes { mode, setMode, products, sellers, brands } and handles persistence (local storage, URL sync).

### UI Layer
- packages/ui/src/lib/SearchModeTabs.svelte: wraps segmented control with accessible labels and badge slots.
- packages/ui/src/lib/SearchProductFilters.svelte: encapsulates sticky filter modal + pills for product mode only.
- pps/web/src/routes/search/SearchResultsProducts.svelte, .SearchResultsSellers.svelte, .SearchResultsBrands.svelte: presentational components with minimal logic.
- SearchPageShell.svelte: orchestrates header, mode tabs, filter modal, bottom nav, delegating to result components based on active mode.

### Supabase Integration
- Define typed queries in lib/search/api.ts (e.g., etchProductResults, etchSellerResults, etchBrandResults).
- Document required indexes/RPC adjustments (seller search, brand search) for MCP execution after UI implementation.

## Implementation Steps
1. **Scaffold modules**: create lib/search directory, move product filter logic, add shared types.
2. **Loader/API alignment**: update /search/+page.server.ts and /api/search to use the new helpers and return unified data.
3. **State refactor**: introduce mode coordinator store and adjust URL/local-storage persistence to avoid undefined bindings.
4. **UI extraction**: build new components (SearchModeTabs, SearchProductFilters, result presenters) and integrate into a slimmer /search/+page.svelte.
5. **Clean legacy code**: remove unused dropdown logic from SearchPageSearchBar, keep it focused on input + tabs.
6. **QA & polish**: ensure mobile/desktop parity, ARIA correctness, empty states per mode, and analytics hooks ready.
7. **Supabase follow-ups**: list needed indexes/RPC updates (e.g., seller search optimized query, brand counts) for execution via MCP.

## Deliverables
- Refactored /search route using modular stores/components.
- Updated UI package with reusable mode tabs + product filter primitive.
- Documentation of Supabase changes for MCP (separate supabase_codex.md).
- Regression checklist (load states, filters, mode persistence, bottom nav behaviour).

## Detailed Module Specs
### apps/web/src/lib/search/modes.ts
- export type SearchMode = 'products' | 'sellers' | 'brands'.
- Shared filter/result interfaces: ProductFilters, SellerFilters, BrandFilters, ProductResult, SellerResult, BrandResult.
- Utility helpers for default filters and mode guards.

### apps/web/src/lib/search/api.ts
- etchProducts(request: ProductQueryArgs, client: SupabaseClient) returning { items, total, pageInfo }.
- etchSellers, etchBrands with typed sorting/pagination arguments.
- SSR-safe wrapper loadSearchPageData({ url, locals }) used by +page.server.ts.

### apps/web/src/lib/search/stores/
- products.svelte.ts: createProductSearchStore(initial: ProductResult[]) exposing runes state for filters, pending filters, and infinite scroll metadata.
- sellers.svelte.ts & rands.svelte.ts: lightweight stores tracking query text, items, loading state, and total counts.
- workbench.svelte.ts: orchestrator with $state mode, persists to localStorage, syncs URL parameters, exposes setMode, setQuery, loadMore per mode.

### packages/ui components
- SearchModeTabs.svelte: props { modes: Array<{ value; label; badge? }>, bind:value }, keyboard navigation, emits change event.
- SearchProductFilters.svelte: encapsulates sticky filter modal, pills, and events (onApply, onReset).
- SearchSellerResults.svelte, SearchBrandResults.svelte: purely presentational, accept arrays + loading flags.

### apps/web/src/routes/search components
- SearchProductsView.svelte: wires product store to SearchProductFilters and product grid.
- SearchSellersView.svelte, SearchBrandsView.svelte: consume respective stores/components.
- SearchWorkbench.svelte: shared layout (header, tabs, sticky nav) used by +page.svelte.

## Testing & QA Notes
- Unit test new stores (filters applied, mode switching, URL sync).
- Component-level tests for tabs (keyboard navigation, ARIA roles), modal behaviour, and mode persistence across reloads.
- Integration test flow: search -> switch modes -> apply filters -> deep link -> reload verifies state.
- Manual smoke: mobile/responsive check, skeleton states, bottom nav highlighting, back/forward navigation.
