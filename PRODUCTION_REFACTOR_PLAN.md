# Driplo Web Refactor Plan (Svelte 5 + Tailwind v4 + A11y)

This plan is a practical, production-focused guide for refactoring every component and view to a pixel‑perfect, mobile‑first UI with excellent a11y, performance, and clear code. It is designed for incremental execution by Claude‑Code or any engineer on the team.

Scope covers:
- apps/web (app shell, routes, components)
- packages/ui (design system + shared components)
- packages/i18n (language integration touchpoints only)

Out of scope: database schemas, external services (Stripe, Supabase) beyond minor timeout/non‑blocking improvements.

---

## Core Principles

- Mobile first: target small screens by default; progressively enhance for larger viewports.
- A11y first: semantic HTML, correct roles only when necessary, keyboard + screen reader support, 44px minimum touch targets, visible focus states.
- Svelte 5 runes: single `$props()` destructure; `$state`, `$derived`, `$effect`; component props typed; strict attribute forwarding.
- Tailwind v4: rely on tokens and semantics; use `@theme`, `@layer`; avoid custom CSS unless necessary; keep classes compact.
- Design system first: atomic → molecules → organisms. Apps compose, UI library provides primitives.
- Performance: abortable fetch, SSR timeouts, dynamic imports for heavy panels, skeletons, and progressive hydration.
- Consistency: naming, folder structure, component signatures, event names, prop shapes.

---

## Conventions

- Filenames: `PascalCase.svelte` for components, `kebab-case.ts` for utilities.
- Props: destructure in a single `$props()` call. Example:
  ```svelte
  <script lang="ts">
    let {
      id,
      class: className = '',
      disabled = false,
      // events to forward
      onclick: onClick,
      onkeydown: onKeyDown
    }: {
      id?: string;
      class?: string;
      disabled?: boolean;
      onclick?: (e: MouseEvent) => void;
      onkeydown?: (e: KeyboardEvent) => void;
    } = $props();
  </script>
  ```
- Attribute forwarding: use `{...$$restProps}` without declaring it.
- A11y: prefer implicit semantics (`<nav>`, `<button>`, `<ul>/<li>`, `<form>`) and only add ARIA roles when implementing patterns that require them (combobox, listbox, dialog).
- Keyboard: Arrow keys, Home/End, Enter, Escape as applicable; `aria‑activedescendant` patterns for listbox/combobox; focus management for dialogs.
- Touch targets: min height/width 44px; padding not margins; ensure accessible names and labels.
- Layout: avoid absolute overlays that intercept clicks; favor CSS grid/flex for alignment.
- Theming: `html[data-theme="dark"]` switch; no FOUC; early theme init in app.html.

---

## Tailwind v4 & Tokens

- Keep `apps/web/src/app.css` importing:
  - `@import 'tailwindcss';`
  - `@import '@repo/ui/styles/tokens.css';`
  - `@import '@repo/ui/styles/semantic.css';`
- Use `@theme` for color/scale mappings.
- `@layer base|components|utilities` for scoped customizations.
- Utilities: define `.no-scrollbar`, safe-area helpers, and minimal semantic utilities only once.

---

## A11y Patterns Reference

- Buttons: `<button type="button">` with text or `aria-label`. Do not add `role="button"`.
- Listbox (results dropdown): parent `role="listbox"` with id, child `role="option"` + `aria-selected`. Input uses `aria-controls` + `aria-activedescendant`.
- Dialog/Modal: `role="dialog"`, `aria-modal="true"`, focus trap, return focus on close, ESC handling, inert background (or aria-hidden).
- Tabs: `role="tablist"`; `role="tab"` with `aria-selected`, controls id of panel; `role="tabpanel"` labelled by active tab.
- Toggle: `<button aria-pressed=>`.
- Live regions: `role="status"` + `aria-live="polite"` for async results.
- Avoid redundant roles: never put `role="navigation"` on `<nav>`, etc.

---

## Performance & Resilience

- SSR timeouts (1.5–3s) for all server load functions for dev and resilience; fall back to empty data and render skeletons.
- Client fetches: use `AbortController` for search/autocomplete; debounce input (250–300ms).
- Dynamic imports: notification panel, heavy modals, large carousels.
- IntersectionObserver: lazy load below-the-fold sections.
- Preload: `preloadCode`/`preloadData` on hover/touch for navigations.
- Resource hints: `<link rel="preconnect">` for fonts; DNS prefetch for CDNs.

---

## Folder Strategy

- packages/ui/src/lib
  - atoms: Button, Input, Select, Badge, Avatar, Toggle, Spinner
  - molecules: CategoryPill, LanguageSwitcher, NotificationBell, SearchBar, Listbox, Modal
  - organisms: HeaderLogo, HeaderNav, HeaderUserMenu, MobileNavigation, Footer, HeroSearchDropdown
  - utils: a11y helpers, focus trap, keyboard navigation utils
- apps/web/src/lib/components: app-specific compositions only (e.g., Header wrapper, RegionSwitchModal, PageLoader)

---

## Component Templates

### Atom (Button.svelte)
```svelte
<script lang="ts">
  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    href = '',
    class: className = ''
  }: any = $props();
  const isLink = !!href;
  const el = isLink ? 'a' : 'button';
</script>

<svelte:element
  this={el}
  class={`btn ${variant} ${size} ${className}`}
  disabled={!isLink && disabled}
  href={isLink ? href : undefined}
  {...$$restProps}
>
  <slot />
</svelte:element>
```

### Listbox Skeleton (results dropdown)
```svelte
<div id={listId} role="listbox">
  {#each items as item, i}
    <button
      id={`${listId}-opt-${i}`}
      role="option"
      aria-selected={i === active}
      onclick={() => onSelect(item)}
    >
      {render(item)}
    </button>
  {/each}
  {#if items.length === 0}
    <div role="option" aria-selected="false" class="text-gray-500 px-3 py-2">No results.</div>
  {/if}
</div>
```

### Dialog Skeleton
```svelte
<div role="dialog" aria-modal="true" aria-labelledby={titleId}>
  <h2 id={titleId}><slot name="title" /></h2>
  <div><slot /></div>
  <button aria-label="Close" onclick={onClose}>×</button>
</div>
```

---

## Refactor Checklist (Global)

- [ ] Replace multiple `$props()` in any component with a single destructure.
- [ ] Remove redundant ARIA roles; add required roles for patterns only.
- [ ] Ensure all interactive elements are buttons/links (no divs with click). Add `type="button"` where needed.
- [ ] Normalize tap targets (>= 44x44) and focus styles.
- [ ] Ensure language and dir attributes propagate where needed; set `document.documentElement.lang` on change.
- [ ] Remove overlapping absolute containers that intercept pointer events.
- [ ] Replace fixed gap/icon spacing with conditional spacing logic (like CategoryPill’s `hasIcon`).
- [ ] Add AbortController and debounce to any live-search or autocomplete.
- [ ] Ensure SSR data fetching has timeouts + fallbacks; no blocking dev.
- [ ] Dynamic import heavy panels (NotificationPanel, large dropdowns, onboarding modals).

---

## Component-by-Component Plan

### Header (apps/web/src/lib/components/Header.svelte)
- [x] Mobile-first bar; left hamburger + logo, right actions.
- [x] Sticky controlled at layout wrapper; avoid double sticky.
- [x] Tap targets 44px; aria‑labels; `aria-expanded` only on toggles.
- [x] Avoid absolute centered logo overlays.
- [ ] Optional: scroll shadow on scroll (with `prefers-reduced-motion`).

### HeroSearchDropdown (packages/ui/src/lib/HeroSearchDropdown.svelte)
- [x] AbortController; cancel in-flight requests.
- [x] Listbox semantics: results list id, `role="listbox"`; items with `role="option"` + `aria-selected`.
- [x] Input `aria-controls` + `aria-activedescendant`.
- [x] Live region for loading/results.
- [x] No-results state with CTA.
- [ ] Add identical semantics to TrendingDropdown or keep click-first.

### Category Pills (apps/web/src/lib/components/CategoryPill.svelte)
- [x] Consistent spacing with/without emoji or spinner.
- [x] Loading indicator in reserved icon slot; configurable spinner colors.
- [x] 36px min height; 44px total tap target with vertical padding.
- [ ] Extract `CategoryPillsRow` if more pills or state required.

### Footer (packages/ui/src/lib/Footer.svelte)
- [ ] Validate semantic structure (`<nav>` for link groups), visible focus, reduced link density on mobile.
- [ ] Localized labels; aria‑labels for social icons.

### Forms (Input, Select, SearchBar)
- [ ] Use native inputs with labels and `aria-describedby` for helper/error text.
- [ ] Focus rings via Tailwind tokens; no custom outlines that conflict.
- [ ] Error state: `aria-invalid`, error messaging region.

### Dialogs/Modals (Modal.svelte, Sheet variants)
- [ ] `role="dialog"` + `aria-modal="true"`; focus trap + return focus on close.
- [ ] ESC to close; click outside optional.
- [ ] Announce with labelled title.

### Navigation (MobileNavigation, HeaderNav)
- [ ] Keyboard navigation: arrow keys if using menu/listbox patterns.
- [ ] `aria-current="page"` on active links.
- [ ] Ensure scroll locking when open (no background scroll).

### Product Components (Card, Gallery, Info, BuyBox)
- [ ] Image alt text; if decorative, empty alt.
- [ ] Buttons and prices readable with sufficient contrast.
- [ ] Suspense/skeletons for images; `loading="lazy"` where appropriate.

### Notifications (NotificationBell/Panel)
- [ ] Dynamic import panel; `aria-live` (polite) for badge updates.
- [ ] Panel uses list semantics; ESC to close; focus trap inside.

### Messaging (Chat Window, Threads)
- [ ] `aria-live` for new messages; annotate sender and timestamps accessibly.
- [ ] Keyboard shortcuts respected; input labelled.

### Lists & Grids
- [ ] Proper list semantics where needed; otherwise plain divs.
- [ ] Responsive columns via Tailwind; ensure reorder doesn’t hurt reading order.

---

## SSR/CSR Data Loading Guidelines

- Server load: wrap all Supabase calls in `withTimeout(promise, ms, fallback)` for dev and resilience.
- Client fetch: AbortController + debounce; check `value.trim().length` before searching.
- Use skeletons or optimistic UI for key areas.

---

## i18n + SEO

- Set `<html lang>` consistently (layout effect on change).
- Hreflang & canonical links in root layout (already present); keep updated.
- Avoid language flashes by initializing language early in layout.

---

## Testing & Tooling

- Linting: eslint + svelte plugin; run `svelte-check`.
- A11y: add playwright-axe checks on key pages (home, search, product, checkout).
- e2e basics: search flow, product view, add to favorites, login stubbed, checkout stub.
- Performance: Lighthouse CI budgets; ensure no regressions (first paint, TBT, LCP).

---

## Execution Plan (Phased)

1) Infrastructure & Guidelines (Day 1)
- Land this doc, lint config confirmations, `withTimeout` helper.
- Add a11y utilities and focus trap helper in `packages/ui/src/utils`.

2) Critical Header + Search (Day 1–2)
- Finalize Header spacing/sticky and MobileNavigation a11y.
- Implement HeroSearchDropdown a11y (done) + Trending dropdown optional.
- CategoryPill finalized (done) + row centering.

3) High-Traffic Pages (Day 3–4)
- Home, Search results, Product page: image alt, skeletons, keyboardable filters.
- BottomNav on mobile with a11y labels.

4) Dialogs/Modals (Day 5)
- Payouts, Review, Rating, BrandPayment: dialog semantics, traps, ESC.

5) Notifications & Messaging (Day 6)
- NotificationPanel: listbox semantics; ESC; focus.
- Messages: live updates, landmarks, input labelling.

6) Forms & Checkout (Day 7)
- Inputs/selects: labels, help text, errors.
- Stripe: defer heavy script; only load when needed; clear a11y labels.

7) Polish & Budgets (Day 8)
- Axe pass, Lighthouse pass, bundle analysis; trim dead code.
- Docs updated where needed.

---

## Definition of Done

- No a11y violations in axe on critical pages (home, search, product, checkout). Zero criticals.
- Lighthouse: Mobile LCP < 2.5s on staging, TBT < 200ms, CLS < 0.1.
- All interactive elements keyboard accessible; visible focus.
- No SSR hangs in dev: first load < 2s even offline for DB (renders skeletons).
- Consistent component APIs; single `$props()` per component; no redundant roles.
- Tailwind classes consistent with tokens; minimal custom CSS.

---

## Open Questions / Decisions

- TrendingDropdown keyboard support: add listbox or keep click-only?
- BottomNav default presence: always on mobile or per route?
- Dark mode: default auto or user‑persisted choice? (Current: persisted.)
- Country/Region switch: modal vs. banner; when to prompt (current: delayed modal).

---

## Quick Reference: Patterns to Copy

- Listbox/Autocomplete: `HeroSearchDropdown.svelte` (after refactor).
- Tight pill with/without icon: `CategoryPill.svelte`.
- Sticky header without overlap: app layout sticky wrapper + header height CSS var.
- SSR timeouts: `withTimeout` helper in server load functions.

---

Owner: UI/Frontend Team
Last updated: 2025-09-07


CURSOR: Additional production notes and action items

- i18n/Paraglide:
  - Ensure all PDP atoms/molecules use Paraglide messages (breadcrumb, gallery a11y strings, seller card, trust signals, accordion headers, buttons/aria-labels).
  - Set and persist `<html lang>` on SSR and hydrate without flicker; write a quick Playwright check for parity (server vs client lang).
  - Locale cookie should be set only with functional consent; verify cookie manager paths and defaults.

- Svelte 5 (runes) correctness:
  - One `$props()` per component; no `export let`.
  - Replace `$$restProps` with explicit attribute forwarding in runes mode where needed (pattern used in `CategoryPill.svelte`).
  - Use event attributes (`onmouseenter`, `ontouchstart`) instead of deprecated `on:` directive.

- A11y polish (high priority):
  - Replace non-interactive containers with real `<button>`s where keyboard handlers exist (e.g., main gallery container if keyboard nav is kept).
  - Ensure min 44px targets, visible focus, proper names for icon-only buttons.
  - Add axe checks for home, category, PDP, checkout in CI.

- Tailwind v4 alignment:
  - Prefer utility classes over `@apply` in component `<style>` blocks; or ensure PostCSS pipeline supports current `@apply` usage.
  - Centralize semantic utilities (no-scrollbar, safe area paddings) once.

- Performance:
  - Keep progressive hydration and dynamic imports for heavy panels (notifications, large carousels, modals).
  - Add `withTimeout` to all route loads; render skeletons on timeout; instrument durations.
  - Maintain `preloadCode`/`preloadData` on hover/touch for category/product links.

- Testing/Tooling:
  - svelte-check strict; ESLint zero warnings in changed files.
  - Playwright flows: search → view PDP → favorite (unauth prompts) → login stub → favorite success.
  - Lighthouse mobile budgets in CI; fail on regression (LCP/TBT/CLS).

- Observability/Security:
  - Sentry: scrub PII, tag `locale` and consent flags; add error boundaries to high-traffic UI.
  - CSP + nonce pipeline for any third-party scripts; verify no inline script violations.

- Quick wins already applied:
  - PDP messages localized end-to-end (buttons, headings, a11y strings).
  - `CategoryPill.svelte` updated for runes mode with explicit prop forwarding, optional `spinnerColor`, and consistent spacing when icon/spinner present.

> Suggested next steps (1–2 days):
> 1) Convert remaining legacy components to single `$props()` and remove `$$restProps`.
> 2) Address any non-interactive/keyboard interaction a11y warnings in gallery/details.
> 3) Add axe checks + Lighthouse CI to the pipeline and gate PRs.
