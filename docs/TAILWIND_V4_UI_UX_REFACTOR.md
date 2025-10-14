# Tailwind CSS v4 + UI/UX Refactor Playbook

This is the canonical, executable Tailwind v4 refactor guide for this repo. It outlines a cautious, incremental path to stabilize and improve our Tailwind v4 setup, UI primitives, and performance without breaking the site.

Note: This document supersedes and condenses overlapping content in `tailwindcss-v4-refactor-plan.md`. Use this document for execution.

- App: Svelte 5 + SvelteKit 2 + Vite 7
- Styling: Tailwind CSS v4.1.x via @tailwindcss/vite (CSS-first config)
- Tokens/design system: packages/ui/src/styles/tokens-v4/* (OKLCH, semantic tokens)
- Web entry CSS: apps/web/src/app.css (imports tokens, utilities, plugins)
- No Bits UI/shadcn/Skeleton dependency by default. We use native Svelte 5 components in `@repo/ui` with Tailwind v4 and our token system.

Links in repo:
- apps/web/src/app.css
- apps/web/vite.config.ts and vite.dev.config.ts
- packages/ui/src/styles/tokens-v4/*, base.css, components.css, utilities.css
- tailwindcss-v4-refactor-plan.md (deep-dive reference)

## Decisions and principles

- Use native Svelte 5 components in @repo/ui as the source of truth. Do not add Bits UI as a package right now. We can adopt/port proven patterns from Bits/Melt on a per-primitive basis where it adds clear value (menu, select, dialog, combobox) and vendor minimal code if needed.
- Keep Tailwind CSS v4.1 with @tailwindcss/vite; avoid mixing multiple Tailwind entry points. Prefer CSS-first config using @import, @theme, @utility, @plugin, @source.
- Favor semantic tokens from packages/ui/styles/tokens-v4 over raw palette values. Fix color contrast where needed; keep OKLCH as the primary color space with SRGB fallbacks.
- Migrate custom styles toward @utility (away from heavy @layer components) for predictability and smaller CSS.
- Performance is a P0: introduce metrics, budgets, and gates first, then iterate in small, reversible steps.

## Baseline and success metrics

Establish before/after to avoid regressions.
- Lighthouse CI (already wired as `pnpm audit:lh`): record FCP, LCP, TBT, CLS on 3 key routes (home, search/list, sell flow).
- CSS size budgets: max app.css + generated utilities under 200–300 KB gzip in production (adjust as needed based on baseline).
- Interaction tests: keyboard nav and focus management for menus, selects, dialogs, comboboxes.

Success criteria per phase are listed below; don’t advance phases if budgets fail.

## Scope and priorities

- P0 primitives (highest risk to UX): Dropdown/Menu, Select, Combobox, Dialog/Sheet, Tooltip, Toast.
- P1 surfacing: Navigation bars, Filters, Search, Cards/List items, Forms.
- P2 polish: Animations/motion, Empty states, Skeletons, Dark mode tweaks.

## Phase 0 — Stabilize the foundation (no UI changes)

Goals
- Confirm Tailwind v4 pipeline is correct, narrow @source scanning to reduce build time, and remove duplicated CSS work.

Tasks
1) Tailwind/Vite pipeline
- Ensure the Tailwind Vite plugin is active in `apps/web/vite.config.ts` and `apps/web/vite.dev.config.ts`.
- Confirm there is no `postcss.config.*` enabling Tailwind (we use ONLY the Vite plugin here).

2) Build configuration (faster, simpler)
- In `apps/web/vite.config.ts`, remove `minify: 'terser'` and rely on Vite default. This usually speeds up builds without hurting size.

3) TypeScript compatibility for the Vite plugin
- If TS complains about `@tailwindcss/vite` types, ensure `apps/web/tsconfig.json` has `"moduleResolution": "bundler"` (it does today).

4) @source hygiene and monorepo scanning
- apps/web/src/app.css currently has @source to packages/ui/src and local lib/routes. Keep only what’s required:
  - @source '../../../packages/ui/src/**/*.{svelte,ts}';
  - @source './lib/**/*.{svelte,ts}';
  - @source './routes/**/*.{svelte,ts}';
- Avoid globbing to html/js if not used here; keep scanning tight to reduce build work.

5) Preflight and plugin review
- We use @tailwindcss/forms and @tailwindcss/typography. Keep them; verify they don’t bloat critical pages (measure CSS size). If size issues, lazy-apply prose styles only where needed.

6) CSS structure sanity
- Prefer @utility for custom classes over @layer components in apps/web/src/app.css wherever feasible. Defer invasive moves until Phase 2 to avoid breakage.

Acceptance (Phase 0)
- Dev build time stable/improved compared to baseline; no visual changes.
- Lighthouse neutral; CSS size stays same or smaller.

Execution steps
- Verify plugin usage: open `apps/web/vite.config.ts` and confirm `@tailwindcss/vite` is in `plugins`.
- Remove `minify: 'terser'` from `build` in `apps/web/vite.config.ts`.
- Confirm there is no `postcss.config.*` alongside; scanning the repo is enough.
- Run: dev server, quick LHCI on key pages (home, search/list, sell) to capture baseline.

## Phase 1 — Color, tokens, and contrast fixes (low-risk UI improvements)

Goals
- Fix the “some colors are bad” feedback by tightening semantic tokens and ensuring WCAG AA contrast without redesigning.

Tasks
- Audit semantic tokens in `packages/ui/src/styles/tokens-v4/{semantic.css,components.css}` for text/foreground vs surfaces.
- Adjust `text-secondary`/`text-muted` to meet AA on both light/dark surfaces.
- Unify focus tokens (e.g., `--state-focus`, `--input-focus-ring`): visible but not jarring; respect reduced motion.
- Replace ad-hoc color utilities in app code with semantic tokens: `bg-(--surface-*)`, `text-(--text-*)`, `border-(--border-*)`.

Acceptance (Phase 1)
- Axe-core passes for contrast on targeted pages.
- No color clashes with brand accents; screenshots show parity or improvement.

Execution steps
- Open the Sell flow files and replace raw colors with semantic tokens.
- Validate contrast with axe-core or a browser extension.

## Phase 2 — Accessible primitives (Dropdowns, Selects, Menus, Combobox, Dialog)

Goals
- Fix “dropdowns can be better” with native Svelte 5 primitives in @repo/ui, using robust a11y patterns.

Tasks
1) Positioning and layering (only if/where popovers are required)
- Use minimal positioning logic or introduce Floating UI inside `@repo/ui` internals when necessary.
- Standardize z-index tokens and portals where needed.

2) Keyboard and focus management
- Ensure ArrowUp/Down, Home/End, Typeahead, Esc close, Tab cycles; proper aria-* roles for menu, listbox, combobox, dialog.
- Trap focus in Dialog; restore focus on close.

3) Motion and reduced motion
- Subtle scale/fade transitions with prefers-reduced-motion respected; GPU-backed transforms only on interactive elements.

4) Styling via utilities
- Move legacy component styles to @utility in packages/ui/styles/components.css where possible; keep structure predictable.
- Provide size and variant utilities (e.g., menu-sm|md|lg, select-ghost|solid) driven by component tokens.

5) Integration path
- Replace primitives in `@repo/ui` first; then adopt incrementally (sell flow first). Provide a temporary feature flag per route to toggle old/new.

Acceptance (Phase 2)
- Playwright tests pass for keyboard navigation and focus management.
- Visual parity or controlled improvements; no layout jank on open/close.

## Phase 3 — Lists, cards, forms, and filters

Goals
- Improve perceived speed and clarity on search/listing and sell pages while keeping existing look-and-feel.

Tasks
- Container queries for product-card grids; reduce layout shifts.
- content-visibility: auto for offscreen long lists; contain: layout paint style for grid/list containers.
- Forms: keep @tailwindcss/forms; ensure consistent focus/hover/error styles using semantic tokens.
- Replace any space-y-* hacks with proper gap and @utility spacing shorthands where beneficial.

Acceptance (Phase 3)
- Lower CLS on list pages; no overflow/scrollbar jumps.
- Light DOM/CSS size delta; improved LH metrics by 10–15% on TBT/FID equivalents.

## Phase 4 — Performance polish and budgets

Goals
- Regain “the website was very fast” experience.

Build-time
- Ensure only @tailwindcss/vite processes Tailwind in apps/web.
- Narrow @source further if build logs show large scan counts.
- Switch build minify to Vite default (esbuild) unless there’s a strong reason to keep terser; compare build speed/size.

Runtime
- Audit use of heavy shadows, filters, and backdrops; reduce where not critical.
- Preload critical fonts with font-display: swap; subset where possible.
- Lazy-load non-critical images and modules; ensure @sveltejs/enhanced-img is leveraged correctly.

Budgets and gates
- Add `lighthouserc.cjs` budgets or a separate `budgets.json` for CSS/JS and key metrics. Fail CI on regression via `pnpm audit:lh`.

Acceptance (Phase 4)
- CSS bundle ≤ agreed budget; LHCI shows measurable wins vs Phase 0 baseline.

## Phase 5 — Documentation and patterns

Goals
- Make it easy not to regress.

Tasks
- Document tokens and recommended utilities in packages/ui/README.md and a short “how to style” page for feature teams.
- Add examples for each primitive (menu, select, combobox, dialog) with keyboard/mouse/touch notes.
- Quick cheatsheet for @reference vs raw CSS variables in Svelte <style> blocks.

Acceptance (Phase 5)
- New examples render in Storybook (`pnpm --filter ui storybook`) and pass visual checks.

## Risks and rollback

- Risk: regressions from moving @layer components to @utility. Mitigation: migrate per component with feature flags and visual tests.
- Risk: focus/keyboard bugs in primitives. Mitigation: Playwright coverage; accessible roles/attributes checklists.
- Rollback: keep old primitive implementations available behind flags for two releases; revert per route if needed.

## What we will NOT do now (default path)

- Add Bits UI/shadcn/Skeleton as dependencies. We can revisit after stabilization if there’s clear ROI.
- Full visual redesign. We’ll fix contrast and UX quirks, not the brand.

## Concrete next steps (proposed)

1) Phase 0 tasks (1–2 days)
- Confirm TS moduleResolution fix if needed for @tailwindcss/vite types.
- Validate that only Vite plugin runs Tailwind.
- Tighten @source globs.
- Capture baseline LHCI and CSS sizes on key pages.

2) Phase 1 tasks (1–2 days)
- Contrast tune semantic tokens; update focus ring tokens.
- Swap a few ad-hoc colors in sell/search routes to semantic tokens.

3) Phase 2 tasks (3–5 days)
- Implement @repo/ui primitives: Menu, Select, Combobox, Dialog.
- Port over minimal positioning code (Floating UI) and a11y roles.
- Replace in sell flow with feature flag.

4) Phase 3/4 (ongoing 1–2 weeks)
- Container queries for cards; content-visibility for lists.
- Budgets and CI gates; remove hotspots causing layout thrash.

## Acceptance checklists

Foundation
- [ ] Only one Tailwind pipeline active in web app
- [ ] TS resolves @tailwindcss/vite without errors
- [ ] @source globs scoped; build time acceptable

UX/Primitives
- [ ] Keyboard navigation works for menu/select/combobox/dialog
- [ ] Focus visible and non-jarring; reduced-motion respected
- [ ] No pointer-events/z-index dead zones on overlays

Performance
- [ ] CSS ≤ budget in production
- [ ] LHCI metrics improved vs baseline
- [ ] No significant CLS on list/search

## Notes and references

- Tailwind v4 CSS-first config: @import, @theme, @plugin, @utility, @source
- Use @reference in component-scoped styles if applying Tailwind utilities there, or prefer raw CSS variables for speed.
- Prefer semantic tokens from tokens-v4; keep OKLCH with SRGB fallbacks for broader browser compatibility.

---

Open questions (to confirm before Phase 2)
- Do we need popover behavior for any specific control in the Sell flow, or are native selects sufficient there?
- Which primitives should be prioritized for a11y hardening (menu, dialog, combobox)?

## Appendix — Bits UI, Melt UI, and Floating UI (reference only)

### Bits UI vs Melt UI vs “behavior”

- Melt UI: Low-level, headless Svelte primitives that provide accessibility and interaction behavior (roles/attributes, keyboard support, focus management, dismissable layers). No styling.
- Bits UI: Higher-level Svelte components that are built on top of Melt primitives. More ergonomic out of the box, still generally unstyled so you can apply Tailwind.
- “Behavior”: The accessibility logic that makes components correct and usable (ARIA roles, keyboard nav, focus trapping/restoration, typeahead, escape/blur handling). Melt provides this; Bits re-exports as components.

### What is Floating UI?

Floating UI is a small, framework-agnostic library to position floating elements (popover, tooltip, dropdown) relative to a trigger. It handles offset, collision detection, flipping, shifting, arrows, and adaptive updates. Melt/Bits commonly use it under the hood; we can use it directly for our native components.

### Most optimal for this repo (default)

Given our stack (Svelte 5, Tailwind v4, strong internal token system) and the goal to avoid breakage and keep performance high:

- Primary approach: Keep native Svelte 5 components in `@repo/ui` and rely on our tokens/Tailwind v4. Introduce popover positioning only where needed inside `@repo/ui` internals.
- Optional: For complex behavior, you may wrap Melt primitives internally. Not a default requirement.
- We are not adopting Bits UI/shadcn/Skeleton by default in this plan.

### Where Sell “dropdowns” currently are

- `apps/web/src/routes/(protected)/sell/components/StepPhotosDetails.svelte`
  - Imports and uses `Select` from `@repo/ui` (native selects, not popovers).
- `apps/web/src/routes/(protected)/sell/components/StepProductInfo.svelte`
  - Brand/size/color pickers behave like inline lists/buttons rather than floating dropdowns.

### Immediate implementation options

- Option A — Polish native `<select>` now (quick, safe):
  - Improve contrast, focus ring, spacing, and error states using our semantic tokens and Tailwind v4 utilities.
  - Zero behavior change, low risk, immediate UX lift.

- Option B — Introduce a headless Select Popover behind a feature flag (richer, still safe):
  - Implement a new `@repo/ui` SelectPopover: Svelte 5 runes + Floating UI positioning + a11y roles/keyboard.
  - Style via tokens/Tailwind. Replace the Sell step `Select` with the popover variant behind a flag for A/B and easy rollback.

Recommendation: Start with Option A for immediate polish; add Option B later if a richer dropdown experience is truly needed.

## Execution appendix — concrete recipes

### Select styling recipe (native <select> or @repo/ui Select)

Base
- `h-[var(--touch-primary)]`
- `px-[var(--space-4)]`
- `rounded-[var(--radius-md)]`
- `bg-(--surface-base)`
- `text-(--text-primary)`
- `border border-(--border-default)`

Interactions
- `hover:border-(--border-emphasis)`
- `focus:outline-none focus:ring-3 ring-(--state-focus)`
- `focus:border-(--border-emphasis)`

Extras
- `placeholder:text-(--text-muted)`
- `disabled:opacity-50 disabled:cursor-not-allowed`

Error (apply conditionally)
- `border-(--status-error-solid)`
- `ring-(--status-error-soft)`

### Vite build speed recipe
- Remove `minify: 'terser'` in `apps/web/vite.config.ts` build config to use the faster default.

### LHCI budget (example)
- Define a simple budget (CSS ≤ ~250KB gzip) and wire `pnpm audit:lh`.
- Example budgets entry:
  - resourceSizes: { resourceType: 'stylesheet', budget: 250 }
  - performance: thresholds for FCP/LCP/TBT appropriate to baseline

## Alternative track — adopt a styled component library (Skeleton v4 or shadcn-svelte)

If styling velocity is the bottleneck, we can integrate a pre-styled library to reduce churn and risk. This track can run in parallel and be limited to a pilot scope.

### Why consider it
- Pre-styled, accessible components and themes reduce time spent on CSS details.
- Faster iteration for product and fewer regressions if we map tokens correctly.

### Candidates
- Skeleton v4 (Svelte 5 support, Tailwind-based, themes)
- shadcn-svelte (component blueprints; often depends on Melt/Floating patterns under the hood)

### Risks
- Design system drift: styles may conflict with our tokens and utilities.
- Extra CSS weight and potential specificity conflicts.
- Long-term maintenance if upstream APIs change.

### Pilot scope (recommended)
- Limit to 2–3 primitives on Sell flow: Button, Select, Dialog/Sheet.
- Keep our `@repo/ui` API; internally render Skeleton/shadcn components to minimize surface change.
- Feature flag the new render path per route.

### Token bridge (executable)
1) Map our semantic tokens to library theme variables (colors, radius, shadows, spacing, typography):
  - Prefer setting CSS variables to point at `packages/ui/src/styles/tokens-v4/*` values.
  - Avoid hard-coded hex in library overrides; always use our OKLCH-backed tokens.
2) Verify dark mode mapping with `[data-theme="dark"]`.
3) Add `@reference` to `app.css` if component-scoped styles need Tailwind utilities.

### Step-by-step execution
1) Install library in web app only.
2) Create `@repo/ui` adapter components (e.g., `Button.svelte`, `Select.svelte`, `Dialog.svelte`) that:
  - Preserve our public props/events.
  - Internally render the library component.
  - Apply our semantic tokens via classes/variables.
3) Add a build-time or runtime feature flag (e.g., `VITE_UI_LIB=SKELETON`) to switch implementations.
4) Replace usages in Sell flow behind the flag.
5) Run LHCI and a11y checks; compare bundle/CSS sizes and interactivity.

### Rollback
- The feature flag swaps us back to native `@repo/ui` instantly.
- Keep both implementations for two releases; remove the slower one after data.

### Acceptance
- Time-to-implement ≤ 2 days for pilot.
- No regressions in keyboard/focus behavior.
- CSS size within budget; performance neutral or improved.
