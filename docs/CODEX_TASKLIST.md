# CODEX Tasklist — Driplo Production Push

Note: All Melt UI migration tasks/status are centralized in `docs/MELT_UI_MIGRATION.md`. Update that file for UI migration work. Use this tasklist for non‑UI items (i18n, API/security, features, QA/release).

This is the operational playbook for Claude‑code. Execute tasks top‑down, keep commits small, and align to our docs:
- docs/END_GOAL.md
- docs/00-PROJECT.md
- docs/10-ARCHITECTURE.md
- docs/20-UI-UX.md
- docs/30-STANDARDS.md
- docs/40-OPERATIONS.md
- docs/REPO_UI_CLEANUP.md
- docs/MELT_UI_MIGRATION.md

Use this file to track progress with checkmarks. Keep it updated as you work.

## Current In‑Progress (Claude‑code)

- [ ] Fix UI barrel exports + load semantic.css
  - File: `packages/ui/src/lib/index.ts` — change `.js` export paths to extensionless TS and add `import '../styles/semantic.css'`
- [ ] Fix primitives barrel re‑exports
  - File: `packages/ui/src/lib/primitives/index.ts` — replace `./toast/index.js`, `./tabs/index.js`, `./tooltip/index.js` with extensionless paths
- [ ] Replace subpath import in web app
  - File: `apps/web/src/lib/components/PayoutRequestModal.svelte` — `from '@repo/ui/primitives'` → `from '@repo/ui'`
- [ ] Load `semantic.css` in app if not using barrel side‑effect
  - File: `apps/web/src/app.css` — add `@import '../../../packages/ui/src/styles/semantic.css';` under tokens import
- [ ] Clean invalid utilities across UI wrappers
  - Replace `outline-hidden` → `outline-none` and `focus-visible:outline-hidden` → `focus-visible:outline-none`

## Melt UI Fix Pack — Do Now (step‑by‑step)

Follow these steps exactly; re‑run types/build after each group. Keep commits small with clear messages.

1) UI barrel export + CSS side‑effect
- File: `packages/ui/src/lib/index.ts`
  - Add at file top: `import '../styles/semantic.css'`
  - Replace JS export paths with extensionless TS:
    - `export * from './utils/variants'`
    - `export * from './types'`
    - `export * from './tokens'`
  - Keep: `export * from './primitives'`

2) Primitives barrel re‑exports
- File: `packages/ui/src/lib/primitives/index.ts`
  - Change any `.js` re‑exports to extensionless (`./toast/index`, `./tabs/index`, `./tooltip/index`).

3) App import path cleanup
- File: `apps/web/src/lib/components/PayoutRequestModal.svelte`
  - Replace `from '@repo/ui/primitives'` → `from '@repo/ui'`.

4) Load semantic.css in app (if you skipped step 1)
- File: `apps/web/src/app.css`
  - Add under tokens import: `@import '../../../packages/ui/src/styles/semantic.css';`

5) Fix invalid utilities
- Repo‑wide: replace `outline-hidden` → `outline-none` and `focus-visible:outline-hidden` → `focus-visible:outline-none` in UI wrappers and semantic styles.

6) Select wrappers
- File: `packages/ui/src/lib/Select.svelte`
  - Import primitive: `import MeltSelect from './primitives/select/Select.svelte'`
  - Render `<MeltSelect ... />`; map props (value: `string|null`; `options: { value,label,disabled? }[]`).
- File: `packages/ui/src/lib/primitives/select/Select.svelte`
  - Use Melt actions from `createSelect`:
    - Destructure: `elements: { trigger, menu, option }`, `states: { open, selected }`, `helpers: { isSelected }`.
    - In markup: `use:trigger`, `use:menu`, `use:option={{ value,label,disabled }}`; set `aria-selected` via `isSelected(value)`.

7) Adopt Phase B primitives in web
- Tabs: migrate one tabbed view (e.g., dashboard sales) to `import { Tabs } from '@repo/ui'`.
- Tooltip: add to at least one product action icon.
- Toast: mount `ToastProvider` + `ToastContainer` in `apps/web/src/routes/+layout.svelte` and migrate one toast usage.

8) Header user menu — mobile alignment tweaks [✅ FIXED + HOTFIX]
- File: `packages/ui/src/lib/HeaderUserMenu.svelte`
  - ✅ Header menu visuals/positioning fixed; solid bg, z-index, gutter
  - ✅ HOTFIX: Fixed portal import error, restored semantic.css styling, proper animations

9) Remove app‑level UI duplicates
- Replace any usage forwarding to `@repo/ui` (e.g., local `LazySearchResults`) with direct `@repo/ui` imports; delete the app wrapper after build is green.

10) Validate
- Commands:
  - `pnpm --filter @repo/ui build`
  - `pnpm --filter web check-types`
  - `pnpm --filter web build`
- Visual:
  - Header menu opens/closes, traps & restores focus; no clipping at 375px.
  - Payout dialog behaves (Escape/overlay); focus trap OK.
  - Select keyboard/ARIA correct; value updates.
  - Tabs/Tooltip/Toast visible where added.

Commit titles (use one per step):
- chore(ui): load semantic.css and fix barrel exports
- fix(primitives): extensionless re‑exports for toast/tabs/tooltip
- fix(web): use @repo/ui re‑export for Dialog in payout modal
- fix(ui): replace outline‑hidden with outline‑none
- refactor(ui): wire top‑level Select to Melt primitive
- feat(web): adopt Tabs/Tooltip/Toast in dashboard/product and mount provider
- fix(ui): header menu mobile alignment (menuClass)

## Phase A Review — Melt UI (Status)

- [x] Wrappers present: Dialog, Menu, Select under `packages/ui/src/lib/primitives/*`
- [x] Header user menu migrated to Menu wrapper (`packages/ui/src/lib/HeaderUserMenu.svelte`)
- [x] PayoutRequestModal uses Dialog (`apps/web/src/lib/components/PayoutRequestModal.svelte`)
- [x] `@melt-ui/svelte` added to `@repo/ui` dependencies
- [~] Semantic CSS exists but not loaded by default (import missing) — in progress
- [~] UI barrel exports still reference `.js` paths (should be TS/extensionless) — in progress
- [~] App keeps wrapper duplicate for `LazySearchResults` (replace usages with `@repo/ui` and delete wrapper) — in progress
- [ ] Fix any invalid utilities (e.g., `outline-hidden` → `outline-none`) in wrappers/semantic

Action: complete the three “~”/unchecked items before declaring Phase A fully done.

## Workflow Rules

- Read docs above before starting a phase; confirm assumptions in code.
- Work in small branches/PRs; keep diffs < 400 lines where possible.
- Prefer promoting shared UI to `@repo/ui` and delete app‑level duplicates once green.
- Never expose service keys to client bundles; keep server code in `src/lib/server`.
- For any new endpoints, use the API helper and zod validation.

## Phase 1 — Stabilize Build and UI Library

- [ ] Barrel exports: fix `@repo/ui` exports to TS paths; export primitives
  - File: `packages/ui/src/lib/index.ts`
  - Prompt: “Replace .js export paths with extensionless TS (‘./utils/variants’, ‘./types’, ‘./tokens’). Keep `export * from './primitives';`. Add `import '../styles/semantic.css';` at top (or import it in web app CSS).”
- [ ] Load semantic CSS
  - Option A (preferred): add `import '../styles/semantic.css'` in the UI barrel (single source)
  - Option B: add `@import '../../../packages/ui/src/styles/semantic.css';` to `apps/web/src/app.css`
- [ ] Fix invalid Tailwind classes
  - Search/replace `focus-visible:outline-hidden` → `focus-visible:outline-none` across UI wrappers and semantic.css
- [ ] Align Select wrapper with Melt
  - File: `packages/ui/src/lib/primitives/select/Select.svelte`
  - Prompt: “Use createSelect destructuring: elements { trigger, menu, option }, states { open, selected }, helpers { isSelected }. Use `use:trigger`, `use:menu`, `use:option={{value,label,disabled}}`.”
- [ ] Validate Dialog/Menu wrappers’ a11y (Escape to close, focus trap, focus restore)
- [ ] Replace app‑level duplicates with `@repo/ui`
  - Start with `LazySearchResults` and header internals
  - Remove duplicates after green build
- [ ] Add ESLint guardrail to block shared UI imports from `$lib/components/*`
  - File: `apps/web/eslint.config.js`
- [ ] Remove duplicates and backups
  - Delete `apps/web/src/service-worker.js` (keep `.ts`)
  - Delete `*.bak` under `apps/web/src/**`
- [ ] Gate logging
  - Add `lib/utils/log.ts` and replace noisy `console.*` in hot paths
- [ ] Drive TypeScript errors to zero
  - Run: `pnpm -w turbo run check-types`; fix remaining errors

## Phase 2 — i18n & Routing Hardening

- [ ] Consolidate locale reroute
  - Files: `apps/web/src/hooks.server.ts`, `apps/web/src/hooks.client.ts`, `apps/web/src/hooks.reroute.ts`
  - Prompt: “Export exactly one reroute impl on both client and server; strip `/uk|/bg`; set `locals.locale` in `setupI18n`.”
- [ ] Fix default sentinel in `setupI18n`
  - File: `apps/web/src/lib/server/i18n.ts`
  - Prompt: “Use `bg` as the default (no prefix). Remove branches that treat `en` as default.”
- [ ] Add `hreflang` and canonical per locale on product and key pages
- [ ] Link helper for localized URLs
  - Prompt: “Helper returns `/${prefix}${path}` where prefix is '' for bg and 'uk' for en.”
- [ ] Verify Vercel redirects for subdomains → path prefixes

## Phase 3 — API Abstraction & Security

- [ ] Add `lib/server/api.ts` helper
  - Prompt: “Compose auth guard, zod validation, rate limit, typed JSON. Export `withAuth`, `withValidation`, `respond`.”
- [ ] Migrate top 10 endpoints to API helper
  - Targets: favorites, products read, search, orders status, messages send
- [ ] CSRF & rate limiting
  - Ensure POST endpoints use actions/origin checks; apply `authLimiter`/`apiLimiter`
- [ ] Service role safety
  - `supabase.server.ts` stays server‑only; never import in client code

## Phase 4 — Features to Finish

- [ ] Reviews system (DB + UI)
  - Add CRUD endpoints, UI on order completion, and listing
- [ ] Payouts polish
  - Verify Connect flows; update balances and logs; admin cues
- [ ] SEO polish
  - Product schema, breadcrumbs, canonical/hreflang verified

## Phase 5 — QA Gates & Release

- [ ] E2E: Playwright smokes (auth, list, buy, message, payout)
- [ ] A11y checks on home/product/search/checkout (axe)
- [ ] Lighthouse budgets: Mobile p75 ≥ 90; LCP ≤ 1.5s p75
- [ ] Observability: Sentry DSNs set; handleErrorWithSentry wired
- [ ] Secrets/env audit complete; production values set
- [ ] Deploy preview → staging → production; monitor and rollback plan ready

## Short Prompts (Copy/Paste)

- Fix UI barrel + CSS
  - “Open `packages/ui/src/lib/index.ts`. Add `import '../styles/semantic.css';` at top. Change export paths to TS: `./utils/variants`, `./types`, `./tokens`. Keep `export * from './primitives';` at bottom.”
- Select wrapper alignment
  - “Open `packages/ui/src/lib/primitives/select/Select.svelte`. Refactor to Melt `createSelect` with `elements { trigger, menu, option }`. Replace `use:melt={$trigger}` with `use:trigger`, same for menu/option. Use `helpers.isSelected` to mark selection and `aria-selected`.”
- Replace duplicates
  - “Find imports from `$lib/components/*` that have `@repo/ui` equivalents. Replace imports, run build, then delete local components. Add an ESLint no‑restricted‑imports rule to block re‑adding.”
- i18n reroute
  - “Export `reroute` in both hooks from a single impl; strip `/uk|/bg` in internal routing. In `setupI18n`, treat `bg` as default and map `/uk` → `en`. Add canonical + hreflang utilities.”
- API helper
  - “Create `apps/web/src/lib/server/api.ts` with wrappers: withAuth, withValidation(zod), rateLimit, respond(json). Migrate favorites and products endpoints first.”

## Commands Cheat Sheet

- UI build/watch: `pnpm --filter @repo/ui dev`
- Web dev: `pnpm --filter web dev`
- Types: `pnpm -w turbo run check-types`
- Lint: `pnpm -w turbo run lint`
- Tests: `pnpm -w turbo run test`

## Definition of Done (Global)

- 0 TypeScript errors; CI green on types, lint, tests
- Shared UI only via `@repo/ui`; duplicates removed
- Melt wrappers power dialogs/menus/selects site‑wide
- i18n routing consistent; SEO tags correct
- API endpoints validated, rate‑limited, CSRF‑safe
- Release gates (perf/a11y/observability/secrets) all pass

## Tech Stack Playbooks — Execution

Read and execute each playbook in order (one PR per playbook section). Tick when done.

- [ ] docs/playbooks/typescript.md — barrels, satisfies, no implicit any
- [ ] docs/playbooks/svelte5.md — runes/events normalization
- [ ] docs/playbooks/sveltekit2.md — server‑first, reroute, canonical/hreflang
- [ ] docs/playbooks/paraglide.md — messages, reroute, link helper, SEO
- [ ] docs/playbooks/tailwindcss-v4.md — semantic.css, token utilities
- [ ] docs/playbooks/melt-ui.md — wrappers, select, adoption, header alignment
- [ ] docs/playbooks/supabase.md — SSR auth, logout, onboarding, reviews RLS
- [ ] docs/playbooks/playwright.md — smokes + a11y

## Task 1.0 — Runes + A11y Sweep (Svelte 5 AA pass)

Read first
- CLAUDE.md, docs/CLAUDE_HOOKS.md
- docs/playbooks/svelte5.md (runes/event patterns)
- docs/playbooks/tailwindcss-v4.md (semantic.css/tokens)

Goal
- Remove Svelte 5 runes warnings and top a11y violations across UI and web without changing behavior. Silence terminal noise while improving accessibility.

Checklist
- Runes (declare state with `$state`) and deprecations
  - [ ] src/routes/+layout.svelte: make `headerContainer` a `$state`; remove `<svelte:component>`
  - [ ] src/routes/+page.svelte: replace `<svelte:component>` with `<Component/>`; remove redundant roles
  - [ ] src/lib/components/Header.svelte: make `NotificationPanel` a `$state`; remove `<svelte:component>`
  - [ ] packages/ui/src/lib/ProductGallery.svelte: `imageRef` as `$state`
  - [ ] packages/ui/src/lib/TutorialToast.svelte: `toastElement` as `$state`
- A11y (representative fixes — audit and apply similarly)
  - [ ] packages/ui/src/lib/Card.svelte, Avatar.svelte, ImageOptimized.svelte: remove noninteractive positive `tabIndex` or switch to `<button>`
  - [ ] CategoryDropdown.svelte, PayoutMethodSelector.svelte, OrderNotificationToast.svelte: add `aria-label` to icon-only buttons/links
  - [ ] RatingModal.svelte, ReviewModal.svelte, CategorySelector*.svelte, CollapsibleCategorySelector.svelte: ensure `label` is associated with control via `for`/`id`
  - [ ] AuthPopup.svelte, MobileNavigation.svelte, RegionSwitchModal.svelte: replace clickable `<div>` with `<button type="button">` or add `role="button"` + key handlers and `tabindex="0"`
  - [ ] ImageUploaderSupabase.svelte: add role/keyboard for drag/drop zone; replace self-closing non-void tags (`<div />`, `<textarea />`) with paired tags
  - [ ] primitives/tabs/Tabs.svelte: remove unused CSS selectors or wire states
  - [ ] primitives/toast/ToastContainer.svelte: move global CSS to semantic.css or mark styles as global via import; avoid bare <style> with no scopable elements
  - [ ] Remove redundant roles (region/navigation) where not needed
- Auth warning cleanup (SSR + client)
  - [ ] Server: rely on `locals.safeGetSession()`; when asserting identity, call `supabase.auth.getUser()`
  - [ ] Client: in `+layout.ts`, prefer `supabase.auth.getUser()` after session presence for sensitive checks; keep `onAuthStateChange` for reactivity only

Validate
- [ ] `pnpm -w turbo run check-types` → 0 errors
- [ ] `pnpm -w turbo run lint` → 0 warnings (or no new warnings)
- [ ] `pnpm --filter web build` → success
- [ ] Visual: header menu, product page, /sell function normally; no terminal runes/a11y spam remains for touched files

Documentation
- [ ] Tick svelte5.md items you addressed
- [ ] Add 2–4 line entry to `docs/CONTEXT.md` (files changed, validation)
- [ ] Update `docs/RUNBOOK.md` to next task when done

## Task 0 Audit — Melt UI Fix Pack (Status: COMPLETE)

All items verified and working correctly as of August 31, 2025:

- [x] UI barrel exports + CSS side‑effect
  - File: `packages/ui/src/lib/index.ts`
  - ✅ Already has `import '../styles/semantic.css'` at line 199
  - ✅ Exports use extensionless paths: `./utils/variants`, `./types`, `./tokens`, `./primitives`

- [x] Primitives barrel re‑exports
  - File: `packages/ui/src/lib/primitives/index.ts`
  - ✅ All re-exports use extensionless paths (no `.js` extensions found)

- [x] App import path cleanup
  - File: `apps/web/src/lib/components/PayoutRequestModal.svelte`
  - ✅ Correctly imports `import { Dialog } from '@repo/ui'` (line 9)

- [x] Top‑level Select wrapper import
  - File: `packages/ui/src/lib/Select.svelte`
  - ✅ Correctly imports `import { Select as MeltSelect } from './primitives/select/index'` (line 3)
  - ✅ Props properly mapped (value: `string|null`; options: `{ value,label,disabled? }[]`)

- [x] Primitive Select actions API
  - File: `packages/ui/src/lib/primitives/select/Select.svelte`
  - ✅ Uses correct Melt UI actions: `use:trigger` (line 113), `use:menu` (line 146), `use:option` (line 154)
  - ✅ Properly destructures from `createSelect` with `elements: { trigger, menu, option }`
  - ✅ Sets `aria-selected` via `$isSelected` helper (line 158)

- [x] Invalid utilities
  - ✅ Fixed `outline-hidden` → `outline-none` in auth pages (login, signup, forgot-password)
  - ✅ No `outline-hidden` found in UI package components

- [x] semantic.css load
  - ✅ Loaded via barrel side-effect in `packages/ui/src/lib/index.ts` (line 199)

- [x] Phase B adoption on at least one page
  - ✅ `Tabs` used in `apps/web/src/routes/(protected)/dashboard/sales/+page.svelte` (line 106)
  - ✅ `Tooltip` used in `packages/ui/src/lib/FavoriteButton.svelte` (line 86)
  - ✅ `ToastProvider` mounted in `apps/web/src/routes/+layout.svelte` (line 218)
  - ✅ `ToastContainer` mounted in `apps/web/src/routes/+layout.svelte` (line 264)
  - ✅ Legacy toast API working (`toasts.success()`, `toasts.error()` calls throughout app)

- [x] Header user menu mobile alignment
  - File: `packages/ui/src/lib/HeaderUserMenu.svelte`
  - ✅ Already has proper mobile classes: `w-screen max-w-xs sm:w-56 mx-4` (line 56)
  - ✅ Uses `positioning="bottom-end"` (line 55)

## Validation Results
- ✅ UI package builds successfully
- ✅ Web app builds successfully
- ✅ All Melt UI primitives working with proper accessibility

## Phase B Review — Melt UI (Status)

- [x] New primitives present: `Tabs`, `Tooltip`, `Toast` under `packages/ui/src/lib/primitives/*`
- [~] UI barrel still exports `.js` paths (should be TS/extensionless) and does not import `semantic.css` — in progress
- [~] Primitives barrel exports types from `.js` paths (e.g., `./toast/index.js`, `./tabs/index.js`); fix to extensionless — in progress
- [ ] App migration usage missing: no imports of `Tabs`/`Tooltip`/`Toast` in `apps/web/src/**`
- [ ] Subpath import detected: `import { Dialog } from '@repo/ui/primitives'` (bad alias); replace with `import { Dialog } from '@repo/ui'`
- [ ] `semantic.css` not loaded anywhere → wrappers’ utility classes won’t apply consistently
- [ ] Invalid utilities remain (`outline-hidden`) in wrappers and UI

Action items
- Fix barrels
  - File: `packages/ui/src/lib/index.ts`
    - Add at top: `import '../styles/semantic.css'`
    - Change exports to TS/extensionless: `./utils/variants`, `./types`, `./tokens`
  - File: `packages/ui/src/lib/primitives/index.ts`
    - Change `./toast/index.js`, `./tooltip/index.js`, `./tabs/index.js` to extensionless
- Replace subpath imports in app
  - Search: `from '@repo/ui/primitives'` → replace with `from '@repo/ui'` (primitives are re-exported)
- Apply primitives in web
  - Migrate an existing tooltip usage to `@repo/ui` `Tooltip`; migrate a tabbed view (e.g., dashboard sales) to `Tabs`
  - Adopt the new Toast Provider/Container on root layout and migrate one toast usage
- Load CSS once if you skip barrel side‑effect
  - Add `@import '../../../packages/ui/src/styles/semantic.css';` to `apps/web/src/app.css` under tokens import
- Clean invalid utilities
  - Replace `focus-visible:outline-hidden` → `focus-visible:outline-none` across UI wrappers and semantic.css

Quick prompts
- “Open `packages/ui/src/lib/primitives/index.ts`; update any `.js` re-exports to extensionless TS paths; no `.js` in src.”
- “Replace `from '@repo/ui/primitives'` with `from '@repo/ui'` in `apps/web/src/lib/components/PayoutRequestModal.svelte`.”
- “Add `import '../styles/semantic.css';` at the top of `packages/ui/src/lib/index.ts` (or import CSS in `apps/web/src/app.css`).”
- “Search repo for `outline-hidden` and replace with `outline-none`.”
