# Melt UI Finalization Plan — Zero‑Slop, Token‑First

Purpose: verify and fix our Melt UI usage, remove hardcoding/bloat, and make menu/dialog/select surfaces behave consistently on mobile and desktop using Tailwind v4 tokens. Keep diffs small and LOC negative where possible.

## Guardrails
- Minimal diffs: ≤ 300–400 LOC per PR; no new deps.
- Token‑first styling: only use variables from `packages/ui/src/styles/tokens.css` via `semantic.css` utilities.
- No inline hardcoded colors or `!important` for shared UI.
- Use `@repo/ui` exports only in apps (no deep primitive imports).
- Single‑task mode + document in `docs/CONTEXT.md` after each step.

## Acceptance Criteria
- Header avatar menu opens under the avatar (no left slide), correct width on mobile/desktop, no black borders, and proper z‑index.
- All Melt surfaces (Menu/Dialog/Popover/Toast/Tooltip) use token colors: `--surface-base`, `--text-primary`, `--border-subtle`.
- No `bg-white !important`, no inline `style="background-color: ..."` in shared components.
- `semantic.css` loaded once via `@repo/ui` barrel; no duplicate imports.
- Apps import only from `@repo/ui`; app‑level duplicates removed.

## Phase 1 — Header Menu Fix Pack (Surgical)

Scope files only:
- `packages/ui/src/lib/primitives/menu/Menu.svelte`
- `packages/ui/src/lib/HeaderUserMenu.svelte`
- `packages/ui/src/styles/semantic.css`

Steps
1) Portal + menu width at call site
   - In `HeaderUserMenu.svelte` change the `<Menu>` props:
     - Add `portal="body"`.
     - Replace `menuClass="... w-screen ... mx-4 ... z-[60]"` with `menuClass="menu w-auto sm:w-56 z-[60]"`.
     - Keep `positioning="bottom-end"` and `gutter={12}`.

2) Remove hardcoded color overrides in primitive
   - In `Menu.svelte`, delete `style="background-color: white !important;"` on the menu container.
   - Ensure default classes are tokenized: `defaultMenuClasses = 'menu'` (let semantic.css define bg/border/text).

3) Stop cross‑axis hacks
   - In `Menu.svelte` `createDropdownMenu({ positioning })`, remove `offset: { mainAxis: 0, crossAxis: -40 }`.
   - Keep `placement: positioning`, `gutter` as provided.

4) Normalize shared surface CSS
   - In `semantic.css` under `.menu`:
     - Keep: `min-width: 10rem; max-width: 20rem; border: 1px solid var(--border-subtle); background-color: var(--surface-base);`.
     - Remove: `width: 100vw;` and mobile overrides that set `.menu { left: 1rem; right: 1rem; width: auto; }`.
     - Result: Floating‑UI handles x/y placement; we only constrain width.

5) Validate
   - Build UI + web, then on mobile viewport:
     - Menu anchors under avatar; no slide‑in from left.
     - No black border; correct token colors in light/dark/high‑contrast.
   - Commands:
     - `pnpm --filter @repo/ui build`
     - `pnpm --filter web build`

## Phase 2 — Hardcode/Import/Bloat Sweep

Scope files:
- `packages/ui/src/lib/**`, `apps/web/src/**`

Search (choose one available):
- ripgrep: `rg -n "bg-white|!bg-white|style=\\\".*background-color|@repo/ui/primitives"`
- git grep: `git grep -n -e "bg-white" -e "!bg-white" -e "style=.*background-color" -e "@repo/ui/primitives"`
- PowerShell: `grep -RIn "bg-white\|!bg-white\|style=.*background-color\|@repo/ui/primitives" apps web packages`

Fixes
1) Replace primitive subpath imports in app
   - Any `from '@repo/ui/primitives'` → `from '@repo/ui'`.
   - Rationale: wrappers are re‑exported; keeps boundary clean.

2) Remove inline color overrides
   - In shared UI (`packages/ui/**`), delete hardcoded `bg-white`, `!bg-white`, and inline `background-color` styles; rely on `.menu`, `.dialog-content`, `.toast` token classes.

3) Delete duplicates in app
   - If a component exists in `@repo/ui` and app has a local clone, migrate usage to `@repo/ui` and delete local file(s).
   - Verify with build, then remove. Update `apps/web/eslint.config.js` rule if needed.

4) Ensure single semantic.css load
   - Keep `semantic.css` imported via `@repo/ui` barrel only; do not import in app.css.
   - Confirm `apps/web/src/app.css` does not import semantic.css (tokens.css import is correct).

## Phase 3 — Wrapper Coverage (Only where used ≥ 2x)

Add minimal wrappers in `packages/ui/src/lib/primitives/` and export via index:
- `switch/Switch.svelte`, `checkbox/Checkbox.svelte`, `slider/Slider.svelte`
- Keep prop APIs tiny, typed, and aligned with Melt `create*` APIs.
- Adopt in sell form and filters where repeated. Do not migrate one‑offs.

A11y & UX checklist for wrappers
- Touch targets: `min-height: var(--touch-standard)` (or `--touch-primary` for primary actions).
- Keyboard: focus ring via tokens; Escape closes; tab order correct.
- Roles/aria: proper `role`, `aria-expanded`, `aria-selected` where applicable.

## Phase 4 — Verification & QA

Types, lint, build
- `pnpm -w turbo run check-types`
- `pnpm -w turbo run lint`
- `pnpm --filter @repo/ui build && pnpm --filter web build`

Playwright smokes (mobile viewport emulation)
- Validate header menu open/close, dialogs, select, tabs, tooltips.
- `pnpm --filter web test:e2e`

A11y checks
- Keep axe checks on home/product/search/checkout green.
- Fix label associations and aria as discovered.

## Documentation
- After each phase:
  - Update `docs/CODEX_TASKLIST.md` (tick Melt items you touched).
  - Append a short entry to `docs/CONTEXT.md` (files changed, validations, visual notes).

## Copy/Paste Prompts (Claude‑code)
- “In `HeaderUserMenu.svelte`, set `portal="body"` and change `menuClass` to `menu w-auto sm:w-56 z-[60]`. Keep `positioning="bottom-end"` and `gutter={12}`.”
- “In `Menu.svelte`, remove `style=\"background-color: white !important;\"` and the `offset: { crossAxis: -40 }`. Let tokens/semantic.css style the surface.”
- “In `semantic.css`, remove `.menu` overrides that set `width: 100vw` and mobile `left/right`. Keep tokenized border/bg/text only.”
- “Search for `bg-white`, `!bg-white`, and inline `background-color` in `packages/ui/**` and remove them in favor of tokens.”
- “Replace any `from '@repo/ui/primitives'` imports in apps with `from '@repo/ui'`, then delete local component duplicates.”

## Exit Criteria
- Header menu works as expected on mobile/desktop with tokens and no hacks.
- No inline hardcoded colors remain in shared UI; surfaces read tokens.
- Apps import UI only from `@repo/ui`; duplicates deleted; LOC decreases or stays flat.
- All checks green (types/lint/build/tests). 

Owner: UI Platform (you + Claude‑code)
