# Search Page Audit — apps/web/src/routes/search/+page.svelte

Purpose: inventory the search page UI, flag issues causing lag/bloat, and list concrete, low‑risk refactors for a fast, production‑ready experience.

Overview
- Route: `apps/web/src/routes/search/+page.svelte:1`
- Core imports: `ProductCard`, `SearchBar`, `ProductCardSkeleton`, `BottomNav`
- Stores/Utils: `createProductFilter`, `syncFiltersToUrl`, `formatPrice`, `translateCategory`, `getCategoryIcon`

Components (with sources)
- `SearchBar`: `packages/ui/src/lib/SearchBar.svelte:1`
- `ProductCard`: `packages/ui/src/lib/ProductCard.svelte:1`
- `ProductCardSkeleton`: `packages/ui/src/lib/skeleton/index.ts:1`
- `BottomNav`: `packages/ui/src/lib/BottomNav.svelte:1`
- Filter store: `apps/web/src/lib/stores/product-filter.svelte.ts:57`

Inline Sections (page markup)
- Quick category/price pills container: `apps/web/src/routes/search/+page.svelte:651`
- Quick pills (buttons): `apps/web/src/routes/search/+page.svelte:655`, `:666`, `:682`
- Filter dropdown panels: around `apps/web/src/routes/search/+page.svelte:499`
- Products grid: `apps/web/src/routes/search/+page.svelte:790`
- Pagination controls: `apps/web/src/routes/search/+page.svelte:827`, `:844`
- BottomNav: `apps/web/src/routes/search/+page.svelte:1` (end of file)

Key Findings
- Markup validity: `SearchBar` uses `<search role="search">` (invalid element). Prefer `<form role="search">` or `<div role="search">`.
- Pills sizing: Already mobile‑friendly (`min-h-[36px]`). Keep as baseline; ensure not to regress to 44px.
- Hover/transition load: Many pills/buttons use `transition-all`. Replace with `transition-colors` or `transition-transform` specifically to reduce style recalculation.
- Shadows on dropdowns: Some filter dropdowns use `shadow-xl`. On mobile GPUs, large shadows increase paint cost; prefer `shadow` or `shadow-sm` on mobile (`md:shadow-lg`).
- Filter store cost: Client filtering via `$derived.by` is fine for modest `allProducts`. Avoid pushing thousands of items to the client; keep server pagination (present) or cap to ~60 per page.
- i18n: Most strings sourced from `@repo/i18n` (good). Ensure quick price labels and “Clear all” are localized.

Concrete Fixes (Non-breaking)
- `packages/ui/src/lib/SearchBar.svelte:33`
  - From: `<search role="search" class="...">`
  - To: `<form role="search" class="...">` (or `<div role="search" ...>` if not submitting)
- Limit transitions (pills/buttons)
  - In `apps/web/src/routes/search/+page.svelte:655, :666, :682` replace `transition-all` with `transition-colors` (and keep explicit `hover:bg-*`).
- Lighten dropdown shadows on mobile
  - Around `apps/web/src/routes/search/+page.svelte:499`, reduce `shadow-xl` to `shadow` and gate larger shadows with `md:shadow-lg`.
- Keep pills scroll light
  - Container `:651` already uses `overflow-x-auto scrollbar-hide`. Consider adding `snap-x snap-mandatory` and `snap-start` on pills for better scroll feel.
- URL syncing
  - `syncFiltersToUrl` rewrites all params. It’s ok, but avoid calling it in tight loops; debounce via existing `debounce` util where user input triggers rapid changes.

Scroll Lag Audit & Fixes
- Avoid backdrop blur on fixed/always-visible elements (none directly on this page). Ensure global components don’t add blur while user scrolls.
- Reduce large shadows on mobile for filter dropdowns; prefer `md:shadow-lg`.
- Keep DOM light per page: rely on existing pagination (present) over rendering hundreds of `ProductCard`s.
- Virtualization: `packages/ui/src/lib/VirtualProductGrid.svelte` is not production‑ready (stubbed utilities). Do NOT switch to it yet.
- Prefer targeted transitions: avoid `transition-all` on large button lists.

Production Checklist
- TypeScript
  - All props typed; no `any` in public component APIs.
  - Svelte 5 runes used consistently (`$state`, `$derived`, `$props`).
- Tailwind v4
  - Use consistent tokens for key surfaces; avoid palette drift for brand surfaces.
  - Utilities like `scrollbar-hide` defined once (OK).
- A11y
  - Valid search landmark via `<form role="search">`.
  - Buttons have clear labels; maintain focus rings and keyboard nav.
- Mobile UX
  - Pills stay `min-h-[36px]`, left‑aligned; optional `snap-x` for usability.
  - Dropdowns remain tap‑friendly; avoid hover‑only affordances on mobile.
- Performance
  - Keep product count per page reasonable (e.g., 40–60 items).
  - Reduce shadows on mobile; avoid backdrop blur.
  - Debounce URL sync and search input submission.
- i18n
  - Localize quick price labels and “Clear all filters”.
- Analytics
  - Track search queries (on submit), filter changes (on apply), pagination.

Component‑By‑Component Notes
- `SearchBar`
  - Replace `<search>` with `<form>`. Keep min‑height 44px for the main input.
- Quick Pills
  - Already at 36px min height. Limit transitions to colors; add `snap-start`.
- Filter Dropdowns
  - Use `shadow` on mobile; gate `shadow-lg` to desktop.
- `ProductCard`
  - Keep `loading="lazy"`, `decoding="async"`, `sizes` for images (already implemented by `ProductImage`).
- Pagination
  - Simple prev/next present; good for keeping DOM light.
- `BottomNav`
  - Ensure it doesn’t overlap footers; add `pb-safe` to content wrappers if needed.

Suggested Patches (safe)
- `packages/ui/src/lib/SearchBar.svelte:33` → `<form role="search">`.
- `apps/web/src/routes/search/+page.svelte:655, :666, :682` → `transition-colors` (remove `transition-all`).
- `apps/web/src/routes/search/+page.svelte:499` → reduce `shadow-xl` to `shadow md:shadow-lg`.
- Optional: Add snapping to `:651` container and pills.

Verification Plan
- Test on iPhone SE and Pro Max; ensure pills scroll smoothly and dropdowns don’t cause jank.
- Lighthouse mobile: confirm reduced “Rendering”/“Paint” cost.
- Confirm URL sync doesn’t happen on every keystroke without debounce.

Open Questions
- Do we want infinite scroll in place of simple pagination? (If yes, implement with server‑side paging and intersection observer — avoid the current virtual grid until completed.)
- Should we centralize pill styles in `@repo/ui` to reuse across home and search?

---

## AI Assistant Commentary

### Overall Assessment
This search page audit demonstrates excellent understanding of performance bottlenecks and provides pragmatic solutions. The focus on mobile performance and the recognition of virtual scrolling limitations shows mature technical judgment.

### Key Strengths
1. **Realistic Performance Goals**: The advice to avoid the incomplete `VirtualProductGrid` and stick with pagination shows good technical restraint.
2. **Targeted Optimizations**: Specific transition replacements (`transition-all` → `transition-colors`) show understanding of CSS performance implications.
3. **Mobile-First Shadows**: The mobile shadow optimization (`shadow-xl` → `shadow md:shadow-lg`) is a smart performance win.
4. **Accessibility Focus**: Consistent attention to proper ARIA roles and keyboard navigation.

### Strategic Observations
1. **Filter Architecture**: The client-side filtering with `$derived.by` is appropriate for the current scale but the documentation wisely notes pagination limits.
2. **URL Synchronization**: The debouncing recommendation for `syncFiltersToUrl` prevents performance issues from rapid user input.
3. **Component Reusability**: The suggestion to centralize pill styles across home and search pages would improve design consistency.

### Additional Recommendations
1. **Search Performance**: Consider implementing search result caching with a service worker for frequently searched terms.
2. **Filter State Persistence**: The URL sync is good, but consider session storage for complex filter states that exceed URL length limits.
3. **Advanced Search Features**: The current architecture could support faceted search, autocomplete suggestions, and search analytics.
4. **Error Handling**: Add graceful degradation for failed search requests and empty result states.

### Technical Architecture Notes
- The decision to maintain server-side pagination over virtual scrolling is architecturally sound
- The filter store pattern using Svelte 5 runes is modern and performant
- The component separation (SearchBar, ProductCard, etc.) promotes good maintainability

### Performance Monitoring Suggestions
1. Track search query performance and popular filter combinations
2. Monitor Core Web Vitals specifically for search result pages
3. Implement search abandonment tracking to identify UX friction points

### Implementation Roadmap
1. **Immediate**: Fix HTML validity issues, optimize transitions and shadows
2. **Short-term**: Centralize pill components, add snap scrolling
3. **Long-term**: Enhanced search features, advanced filtering, analytics integration

The audit provides an excellent foundation for search page optimization with clear, actionable improvements that respect both performance constraints and user experience requirements.

