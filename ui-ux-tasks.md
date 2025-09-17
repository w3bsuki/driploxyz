# UI/UX Production Task List
_Read before each storefront slice; update status with Codex approval only._

## Phase 1 – Release Blockers
1. **Search Workbench Revamp**
   - Implement segmented search workbench using new stores (`createProductSearchStore`, `createSellerSearchStore`, `createBrandSearchStore`, `createSearchWorkbenchStore`).
   - Extract result presenters (`SearchProductsView`, `SearchSellersView`, `SearchBrandsView`) and integrate mode-aware tabs.
   - Refactor `SearchPageSearchBar` to accept mode props only (drop legacy Supabase wiring) and ensure bind safety.
   - Update `/api/search` + `/search/+page.server.ts` to serve typed payloads per mode; remove unused fetch logic in `+page.svelte`.
2. **Accessibility Remediation**
   - Audit app with Axe (Playwright) + manual checks; fix missing labels, contrast, focus traps.
   - Ensure every interactive element uses semantic tokens and 44px hit areas; adjust Tailwind classes where necessary.
   - Add lint/CI guard for a11y (Playwright axe or Pa11y) and document baseline in `docs/QA.md`.
3. **Typography & Spacing Standardisation**
   - Replace hard-coded font sizes/letter spacing with tokens across top-level components and routes (`apps/web/src/routes/*`).
   - Align heading hierarchy (H1–H6) with design spec; update shared components in `@repo/ui` accordingly.
   - Verify mobile fluid type scale; add unit tests/visual tests for regressions.
4. **Navigation Simplification**
   - Review mega-menu + pills: collapse to two-level hierarchy with inline search suggestions; ensure parity between desktop/mobile.
   - Update breadcrumb + quick pill behavior to reflect new structure; remove unused category dropdown state.

## Phase 2 – High Priority Enhancements
5. **Component Loading & Error States**
   - Ensure every `@repo/ui` composite component exposes consistent `loading`/`error` props and skeletons.
   - Add stories/docs (or MD snippets) showing states; hook into existing tests.
6. **Mobile Touch Polish**
   - Validate all bottom sheets, modals, and nav elements at 44px min; adjust padding/margins.
   - Add gesture handling tests for sticky filters + navigation.
7. **Search Analytics & Feedback**
   - Instrument mode switches, query submissions, filter usage (client -> Supabase/analytics pipeline).
   - Provide empty-state guidance per mode with actionable CTAs.

## Phase 3 – Polish & Monitoring
8. **Visual Refinements**
   - Audit shadows, border radii, and dark-mode palette; align with token definitions.
   - Introduce subtle micro-interactions (press, hover, skeleton shimmer) via semantic tokens only.
9. **Performance Follow-up**
   - Run Lighthouse mobile, ensure LCP <1.5s; address slow components via lazy import/skeleton.
   - Confirm image loading (sizes, `loading=lazy`) across product cards, hero assets.
10. **Documentation & QA Coverage**
   - Update UI/UX guidelines with final patterns.
   - Expand Playwright coverage (search flows, category nav, mobile gestures).

## Cross-Cutting Checks
- Keep CLAUDE.md standards enforced (runes, Kit load separation, Tailwind tokens).
- After each task, run `pnpm --filter web lint`, `check-types`, `test`, `test:e2e` as applicable and capture outputs.
- Coordinate with Supabase tasks for data dependencies (category counts, analytics hooks).
