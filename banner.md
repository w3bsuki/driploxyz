# Homepage Banner Audit & Revamp Plan

## TL;DR
- Current banners fail core mobile heuristics: cramped hit areas, non-stretch CTAs, and fixed 1200px shells fight the page grid (`packages/ui/src/lib/components/home/HomepageBannerFrame.svelte:85-138`).
- Accessibility regressions slipped in: duplicated tab markup without keyboard support and document-wide focus targeting (`packages/ui/src/lib/components/home/NewestListingsBanner.svelte:59-82`, `packages/ui/src/lib/components/home/BannerTabs.svelte:70-84`).
- The refactor left design tokens idle and reintroduced bespoke CSS, so we lost Tailwind v4 utility parity and theme coherence (`packages/ui/src/lib/components/home/HomepageBannerFrame.svelte:55-56`, `packages/ui/src/lib/components/home/BannerContent.svelte:1-107`).
- We need a measured revamp: re-align with the shared Tailwind stack, restore accessible interactions, and add regression coverage before shipping.

## Critical Issues

### Layout & Responsiveness
- **Fixed-width container** – Shell hard-caps at 1200px and sets custom margins, so banners misalign with the global container and overflow gutters on tablets (`HomepageBannerFrame.svelte:85-97`). Adopt `max-w-screen-xl` with responsive padding utilities.
- **Non-stretch primary CTAs** – CTA buttons render as inline-flex links and ignore the `BannerButton` component, so they never grow wider than their label (`PromotedListingsBanner.svelte:118-123`, `FeaturedSellersBanner.svelte:82-87`). On small screens the promise of full-width buttons is still broken.
- **Action stack ordering** – `BannerActions` forces `mobileOrder="secondary-first"`, placing tabs above CTAs and navigation even when the CTA is the primary task (`BannerActions.svelte:110-221`). This sequence is confusing on mobile and inconsistent across banners.
- **Duplicated tab styling** – `NewestListingsBanner` copies tab markup and styles instead of using `BannerTabs`, so it misses responsive clamp values and keyboard affordances (`NewestListingsBanner.svelte:59-82`).

### Interaction & Accessibility
- **Keyboard trap risk** – `BannerTabs` calls `document.querySelector` to focus the next tab. With multiple banners on-page the first matching ID steals focus, breaking navigation (`BannerTabs.svelte:70-84`). Scope focus with `bind:this` or `Refs`.
- **ARIA regressions** – Inline `div` with `aria-label` for nav controls is not exposed as a group, and CTA links masquerade as buttons without proper semantics (`PromotedListingsBanner.svelte:83-115`). Use `role="group"` or a `nav` element and prefer `<button>` only when triggering JS.
- **Touch target drift** – Icon buttons shrink below 44px at the tablet breakpoint (`PromotedListingsBanner.svelte:171-177`), violating the 44px requirement the refactor set out to guarantee.

### Code Quality & Design System Drift
- **Dead code & unused tokens** – `getBannerPadding` and `getBannerGaps` are calculated but never applied (`HomepageBannerFrame.svelte:55-56`). `DESIGN_TOKENS` imports sit unused in two components (`BannerContent.svelte:1-40`, `BannerActions.svelte:1-61`).
- **Reintroduced bespoke CSS** – Large `<style>` blocks recreate spacing, radius, and color rules we already encode in Tailwind. This increases bundle size and breaks theming parity (`BannerContent.svelte:96-266`, `BannerActions.svelte:101-304`).
- **Imperative navigation** – Section-level CTA still calls `window.location.href`, locking us out of Kit`s router helpers and ruining SPA navigation metrics (`packages/ui/src/lib/PromotedListingsSection.svelte:64-72`).

## Revamp Roadmap

### Immediate Triage (today)
1. Swap inline CTA buttons back to `<BannerButton>` with `class="w-full sm:w-auto"` and update `BannerActions` to respect per-banner `mobileOrder` overrides.
2. Patch `BannerTabs` to manage focus locally (store button refs, rely on index lookup) and export a shared `TabDescriptor` type.
3. Replace the `div` nav wrapper with `nav role="group"` and enforce 44px min-size at all breakpoints.

### Phase 1 – Foundation (2-3 days)
1. Rebuild `HomepageBannerFrame` using Tailwind utilities + CSS variables for gradients: drop the 1200px cap, align padding with the page container, and expose slots via props typed with `Snippet` + `satisfies`.
2. Move spacing/typography to Tailwind tokens (`px-3 sm:px-4 lg:px-6`, `text-sm md:text-base`) and keep only gradient/theming rules in local CSS.
3. Consolidate tabs/actions into composable factories (e.g. `createBannerTabsStore`) so each banner only supplies data, not layout.

### Phase 2 – Experience (next sprint)
1. Introduce container queries for large-screen refinements and clamp typography (`clamp(1rem, 0.95rem + 0.5vw, 1.25rem)`).
2. Add optional media slot (thumbnail, animation) with lazy loading and reduced-motion fallbacks.
3. Implement analytics hooks for CTA clicks / tab switches to inform personalization work.

### Phase 3 – Guardrails
1. Author Vitest + Testing Library specs covering keyboard navigation, tab order, and CTA rendering.
2. Add Playwright smoke covering mobile + desktop banner interactions (tabs, nav buttons, CTA focus outline).
3. Track Lighthouse tap target + accessibility audits in CI before merge.

## Implementation Notes
- Lean on Tailwind v4 utilities inside markup; reserve `<style>` blocks for theme variables and container queries.
- Prefer runes for state: `const activeTab = $state(...)` within banner factories so we avoid prop drilling side effects.
- Ensure all shared exports live under `@repo/ui` with named exports so apps can tree-shake unused banners.
- When binding snippets, always destructure via `$props()` and document expected HTML structure to keep SSR stable.

## QA Checklist
- `pnpm -w turbo run lint check-types test` (unit + types).
- `pnpm --filter web test:e2e -- --grep "banner"` once Playwright specs land.
- Manual smoke: mobile Chrome emulation (360px) + iPad + desktop wide, verifying CTA width, tab focus loops, and color contrast.
