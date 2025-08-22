# Svelte 5 + SvelteKit 2 Best Practices

Opinionated, pragmatic guidance for this codebase (Svelte 5 runes, SvelteKit 2, Tailwind CSS v4, TypeScript). Mobile-first by default.

## Core Principles

- Simplicity: prefer small, focused components and stores.
- Mobile-first: design and test at 360px before desktop.
- SSR-first: make things SSR-safe; guard browser-only logic.
- Type-safety: avoid `any`; model inputs/outputs and events.
- Performance: derive state instead of effects; lazy-load where it matters.

## Svelte 5 Runes

- State: use `$state` for local mutable state.
  - Keep state minimal; compute everything else with `$derived`.
- Derivations: prefer `$derived(...)` over `$effect` for computed values.
  - Example: `const isLoggedIn = $derived(!!$authState.user)`.
- Effects: use `$effect` only for side-effects (subscriptions, timers, DOM, services) and always return cleanups.
  - Guard CSR-only effects: `if (!browser) return;`.
- Props: destructure with `$props()` and give a typed interface.
  - Avoid optional `any`; prefer concrete types or narrow interfaces.
- Events: use Svelte event directives `on:*` for DOM and components.
  - `on:click` supports modifiers (`|preventDefault`, `|stopPropagation`, `|once`, `|capture`, `|passive`).
  - When attaching to Svelte components, `on:click` is required; `onclick` becomes a prop.

## Component Architecture

- Single responsibility: avoid “god components.” Extract menus, panels, and buttons.
- Slots first: expose composition (header, actions) via `<slot>` props.
- Event contract: components dispatch named events (`createEventDispatcher`) instead of leaking internals.
- Props vs stores: components take props; stores are for cross-cutting/app state only.
- Avoid deep imports: import via public entry points.

## SvelteKit 2 Data & Navigation

- Load functions: use `+page.server.ts` for server-only data; `+page.ts` for universal.
  - Keep loads lean; return only what the page needs.
  - Use `throw redirect(status, location)` for auth redirects.
  - For errors, `throw error(status, message)` with typed shapes.
- Form actions: prefer progressive enhancement (`enhance`) for mutations.
  - Validate with Zod on the server; return structured errors.
- Navigation: use `goto(url, opts)` instead of `window.location` for client nav.
- Hooks: centralize auth/session in `handle`, `handleFetch`, and `handleError`.
- Caching: set `cache-control` where possible; leverage `depends()` for invalidation.

## Stores & Realtime

- Create small, focused stores per concern (auth, notifications, toasts).
- In components: subscribe via `$store` or `store.subscribe` inside `$effect` with cleanup.
- Realtime/services: init/destroy in `$effect` with `if (!browser) return;` guard to prevent SSR execution.

## TypeScript

- Props: define `interface Props` and destructure via `$props<Props>()`.
- No `any`: model minimal domain types (e.g., `User`, `Profile`) or narrow shapes.
- Keep event payloads typed (`dispatch<CustomEvent<Payload>>`).
- Enable strictness (already in repo config); fix implicit `any` and `unknown`.

## Tailwind CSS v4

- CSS-first: use `@import 'tailwindcss'`, `@plugin`, `@theme`, `@utility`, and `@source` (as this repo does).
- Design tokens: define colors/spacing/radii in `@theme`; reuse in components.
- Prefer utilities over custom CSS; only use `@apply` in leaf utility classes.
- Audit classes: use valid v4 utilities (e.g., `shadow-sm`, `backdrop-blur-sm`)
  - Avoid non-existent sizes like `shadow-xs` / `backdrop-blur-xs`.
- Content scan: keep `@source` tight to avoid bloated builds.
- Motion: minimize heavy blurs/animations on mobile (battery/perf).

## Accessibility

- Semantics: use proper elements (`button`, `nav`, `header`, etc.).
- State: wire `aria-expanded`, `aria-controls`, `aria-busy`, etc., where relevant.
- Keyboard: support `Enter/Space` on interactive elements; close menus on `Escape` and `on:focusout`.
- Focus: manage focus when opening dialogs/menus; restore on close.
- Icons: mark decorative SVGs `aria-hidden="true"`.
- Color contrast: ensure 4.5:1 minimum for text; verify in dark/light contexts.

## Mobile-First

- Layouts: design at 360–400px first; avoid horizontal scroll.
- Targets: minimum `44px` height for taps; ample spacing.
- Search: available and prominent on mobile when present on desktop.
- Performance: avoid parallax/heavy shadows/filters on low-end devices.
- Safe areas: pad footers/headers with `env(safe-area-inset-*)` when fixed.

## Performance

- Derive > Effect: compute UI state with `$derived`, not effects.
- Keyed each: always key list items with stable ids.
- Lazy mount: conditionally render heavy elements (panels, modals) when opened.
- Code split: dynamic import large feature components if not on initial route.
- Avoid thrash: debounce inputs, don’t write state inside tight loops or `scroll` without throttling.

## Patterns to Prefer

- Event directives: `on:click={handler}` with modifiers where needed.
- Conditional rendering: `{#if open}{...}{/if}` instead of toggling `hidden` for expensive DOM.
- Derived flags: `const canSell = $derived(canSellHelper($profile))`.
- Navigation: `<a href>` for normal links, `goto` for programmatic.
- Data prefetch: `data-sveltekit-preload-data="hover"`/`preload-code` on anchors for snappier UX.

## Patterns to Avoid

- Monolithic components that mix auth, nav, notifications, language, and toasts.
- `onclick` on Svelte components (becomes a prop, not a listener).
- Unused imports/props/effects.
- Client-only side effects on the server (missing `browser` guard).
- Wide `any` types and leaking server objects into the client bundle.

## Testing

- Unit: use Testing Library for components (DOM-first assertions).
- a11y: add `axe` checks for critical UI (header, menus, modals).
- Integration: Playwright for flows (auth, search, sell item).
- Keep tests fast and deterministic; stub network/services.

## Error Handling & UX

- SvelteKit: throw `error(status, message)` from loads/actions and show friendly pages.
- Toasts: use a central toast store for transient messages; auto-dismiss.
- Retries: for realtime/services, surface retry actions and backoff.

## Internationalization

- Single source: read language from i18n store; avoid duplicate local state.
- SSR: initialize language tag on the server; sync on the client via a guarded `$effect`.
- Avoid FOUC: gate UI that depends on language until initialized.

## Auth

- Server-first: read session in `+layout.server.ts` and expose minimal data via `load`.
- Client: subscribe to an auth store; guard effects with `browser`.
- Redirect rules in hooks/loads; never rely on client-only redirects for protected pages.

## File & Naming Conventions

- Files: `kebab-case.svelte` / `kebab-case.ts`.
- Components in `src/lib/components/` grouped by feature.
- Public exports from index files; avoid deep nested imports.

## Checklists

### Component PR Checklist

- [ ] Uses `$state`/`$derived` appropriately; minimal `$effect`.
- [ ] Event handlers use `on:*` and necessary modifiers.
- [ ] SSR-safe: no browser-only code without `browser` guard.
- [ ] Props and events are typed; no `any`.
- [ ] a11y basics: semantics, focus, keyboard, labels.
- [ ] Mobile layout verified at 360–400px; no horizontal scroll.
- [ ] No unused imports/props; CSS classes are valid in Tailwind v4.

### Page/Data PR Checklist

- [ ] Data fetched in `+page(.server).ts` with minimal payload.
- [ ] Redirects/errors via `redirect()` / `error()`.
- [ ] Mutations via actions; forms enhanced progressively.
- [ ] Caching/invalidation considered (`cache-control`, `depends()`).

---

Adopt these incrementally: touch files you modify, don’t sweep the repo. Start with navigation, header, and auth flows for maximum impact.

