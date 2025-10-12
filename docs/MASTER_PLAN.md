# Driplo Ultimate Master Plan

Last updated: 2025-10-12

This document consolidates and supersedes the prior Phase 4E plans and the various planning docs under `docs/`. It merges:
- Existing execution threads (Phase 4E series, project sitemap, refactor plans)
- IDEAL structure definitions (`docs/IDEAL_STRUCTURE.md`, `docs/sitemap.md`)
- Restructure guidance in `docs/RESTRUCTURE_PLAN.md`
- Official best practices: SvelteKit 2/Svelte 5 MCP, Turborepo, and Vercel

Use this as the single source of truth for the remaining journey: Restructure → Cleanup → Best-Practices Hardening → Validate → Ship.

---

## MCP usage policy (Svelte, Context7, Supabase)

Always ground changes in current, official guidance using MCP tools. For every phase and for each commit that touches the areas below, fetch the latest best practices and record them in the commit message under a "References (MCP)" section (or in a co-authored CHANGELOG entry for multi-file changes).

- Svelte/SvelteKit changes
  - Use the Svelte MCP to fetch relevant Svelte 5 runes and SvelteKit docs for: runes ($props, $derived, $effect, $bindable), load functions, form actions, SSR/CSR boundaries, environment modules.
  - Run a Svelte autofixer and address issues before merging.

- Monorepo/Tooling/Deploy changes
  - Use Context7 MCP to fetch docs for Turbo, ESLint flat-config, Tailwind v4, and @sveltejs/adapter-vercel. Prefer minimal configuration and defaults.

- Backend/Auth/DB changes
  - Use Supabase MCP to fetch: SSR client creation with @supabase/ssr, Auth/session patterns, RLS policy guidance, API keys (publishable/secret vs legacy anon/service_role), Types generation (CLI), Edge Functions patterns, Realtime conventions.

Acceptance (required in each commit touching these areas)
- [ ] "References (MCP)" section lists the specific docs/sections with dates
- [ ] Noted deltas vs. our current baseline and exactly what was applied
- [ ] Local gates pass (lint, types, tests) and relevant structural checks (aliases, SSR safety)

Note: This policy is additive to the guardrails below and should be enforced during review (even when committing directly to main).

---

## Objectives

- Land the IDEAL monorepo structure with clear app/package boundaries.
- Remove context bloat and duplicate configs; keep a concise, living docs set.
- Align code and tooling with Svelte 5 MCP runes, Turborepo caching, and Vercel deployment best practices.
- Reach zero TypeScript errors, reproducible builds, and green CI with caching.

## Compass: Source documents

- Where we’re going: `docs/IDEAL_STRUCTURE.md` (target structure) and `docs/sitemap.md` (ideal sitemap)
- What we’ve planned: `docs/RESTRUCTURE_PLAN.md` (phased restructure)
- What exists today: `docs/PROJECT_SITEMAP.md` (current inventory)

This Master Plan ties these together into a single execution track.

---

## Program phases (top-level)

1) Restructure (Weeks 1–3)
- Normalize app configs (SvelteKit + Vite) and use package exports instead of relative aliases
- Enforce package boundaries; move shared code into packages, route-specific components into routes, server-only code into `$lib/server`
- Make `@repo/ui`, `@repo/core`, `@repo/domain`, `@repo/database`, `@repo/i18n` publishable-quality internal packages with proper exports

2) Cleanup (Weeks 2–4, overlapping)
- Archive/remove legacy planning files and duplicate configs; keep a small, accurate docs set
- Centralize TypeScript, ESLint, Vitest/Playwright configs into shared packages; thin app-level wrappers
- Simplify `turbo.json` (topological `dependsOn`, minimal `inputs`/`outputs`), add package-level overrides only where necessary

3) Best-practices hardening (Weeks 3–5)
- Svelte 5 MCP runes cleanup (props, derived, effects, SSR safety, context patterns)
- Turborepo optimizations (task splitting, `$TURBO_DEFAULT$` inputs, cache hygiene)
- Vercel alignment (adapter defaults, move locale/host headers to middleware, minimal `vercel.json`)

4) Validation & Quality (Weeks 4–6)
- Zero TS errors; green `build/lint/test` across repo; reliable CI with Turbo cache
- Golden path E2E for storefront and admin; coverage baselines

5) Ship & enforce (Week 6+)
- Update READMEs and architecture diagrams
- Add guardrails (lint rules, boundaries checks, CI gates) to keep structure healthy

---

## Svelte MCP-backed standards (authoritative)

Grounded by Svelte 5 and SvelteKit docs:

- Runes migration (Svelte 5)
  - Props: replace legacy `export let ...` with `$props()`; prefer destructuring with defaults; use `$props.id()` for stable IDs when needed
  - Events: replace `on:click` with `onclick` where appropriate; avoid legacy modifiers; prefer attachments/actions for DOM behaviors
  - Reactivity: prefer `$derived` for computed values; limit `$effect` to side-effects only; use `$effect.pre` sparingly; avoid state updates inside effects unless wrapped with `untrack`
  - Two-way: prefer function bindings or `bind:` when the child owns state; avoid mutating parent-owned props unless `$bindable` is used
  - Stores/legacy: avoid `$app/stores` in SvelteKit ≥2.12; prefer `$app/state`; remove legacy reactive statements `$:` where a rune fits better

- Data/SSR (SvelteKit)
  - Use server `load` (`+page.server.ts`/`+layout.server.ts`) for DB and private env access; universal `load` only when safe and beneficial
  - Form actions: prefer `actions` in `+page.server.ts` with `use:enhance` for progressive enhancement; use `fail` for validation
  - Streaming: return promises from server `load` to stream non-critical data; handle rejections properly
  - Reruns: rely on dependency tracking; use `depends()` and `invalidate()`/`invalidateAll()` intentionally to refresh data

- Environment & server-only safety
  - Env: prefer `$env/static/private` and `$env/static/public` for tree-shakable constants; reserve `$env/dynamic/*` for true runtime-only values
  - Server-only: keep private code in `$lib/server` or `*.server.ts`; illegal import detection must be zero in client bundles

- Routing & colocation
  - Keep route-only components/utilities alongside `+page`/`+layout` in `src/routes/**`
  - Use nested layouts; avoid monolithic root layouts; keep SEO metadata in `<svelte:head>` with `page.data`

Acceptance criteria
- No illegal server-only imports in client code (SvelteKit check = 0)
- No legacy `export let`/`on:` in new/changed components; runes-first patterns adopted
- All data requiring secrets is isolated to server `load`/actions

---

## Supabase backend alignment (authoritative)

This codifies our Supabase + SvelteKit 2 alignment. See also: `docs/BACKEND_SUPABASE.md` for a concise checklist.

Canonical SSR setup with @supabase/ssr
- Server hook (`src/hooks.server.ts`)
  - Create a server client with `createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll, setAll }})`.
  - Attach `event.locals.supabase` and a safe session helper (e.g., `safeGetSession` that uses `auth.getUser()` to validate before trusting `auth.getSession()`).
  - Use `filterSerializedResponseHeaders` on responses that include auth headers.
- Types (`src/app.d.ts`)
  - Declare `App.Locals.supabase` and `App.Locals.safeGetSession` types. Optionally add `PageData.session`/`user`.
- Root layout data
  - `+layout.server.ts`: retrieve the validated session/user and return minimal auth state for the client.
  - `+layout.ts`: create a browser client in the browser and subscribe to auth changes; keep dependencies explicit with `depends('supabase:auth')`.
- Auth confirm route
  - Add `routes/auth/confirm/+server.ts` using `supabase.auth.verifyOtp({ token_hash, type })` and redirect home on success.

Security & trust model
- Never trust server `getSession` alone for security decisions; prefer `getUser` on the server for critical checks.
- Do not expose the service role key to the client. Use publishable/secret key model (new API keys). Legacy `anon/service_role` must respect RLS: only use service role on the server in isolated contexts.

RLS policies (basics and performance)
- Enable RLS on exposed tables. Define clear `USING` and `WITH CHECK` clauses referencing `auth.uid()`.
- Add appropriate indexes that support common filters in policies and queries.
- Scope policies to specific roles (`TO authenticated`/`anon`) and avoid expensive joins inside policies where possible.

Types and @repo/database
- Use Supabase CLI to generate types and commit to `packages/database/src/generated`.
- Ensure `@repo/database` re-exports `Database` types and that any `createClient<Database>()` usage is typed.
- Add a CI check to keep generated types in sync (nightly or on schema change).

Migrations & environments
- Use Supabase CLI workflows for `init`, `link`, `db pull/diff/push`, and manage staging/production with CI.
- Track environment variables via `.env.example` per app; in production, rely on Vercel project envs.

Edge Functions & webhooks
- Use Deno Edge Functions for webhooks (e.g., Stripe) and offload tasks that don't fit well in SSR. Pass user context via `Authorization` header to enforce RLS per request where applicable.
- For WebSockets, follow the documented auth patterns and only disable JWT verification when absolutely necessary and safe.

Realtime conventions
- Prefer private channels with appropriate auth; enforce RLS-compatible access and ensure subscriptions are cleaned up on navigation.

Acceptance criteria
- [ ] SSR pattern implemented: server hook, locals, types, root layout server/client split, and auth confirm route
- [ ] No service role exposure in any client bundle; keys handled via `$env/*` with server-only access
- [ ] Representative RLS policies exist for user-owned data and are covered by at least one test
- [ ] `@repo/database` exports current `Database` types; at least one typed `createClient<Database>()` reference exists
- [ ] A documented workflow exists to regenerate types and run migrations in CI

## Detailed workstreams and tasks

### A. Apps restructure (web, admin, docs)

- Replace manual aliases in `svelte.config.js` and `vite.config.ts` with clean package imports (`@repo/ui`, `@repo/i18n`, etc.)
- Keep app-specific utilities in `src/lib`; colocate route-only components in `src/routes/**`
- Move server-only code (auth, DB, private env usage) to `src/lib/server` and audit imports
- Unify plugin stacks (Tailwind v4, Paraglide, enhanced-img) via a reusable helper module consumed by each app
- Normalize `.env.example` per app; document required variables once; prefer Vercel env management in prod

Deliverables:
- Minimal `svelte.config.js` and `vite.config.ts` per app
- No relative `../../packages/...` aliasing; all workspace deps via exports
- `$lib` vs `$lib/server` separation enforced by build


### B. Packages hardening

- `@repo/ui` (Svelte component library)
  - Use `@sveltejs/package` to emit `dist` with `types`/`svelte`/`default` exports
  - Keep publishable code in `src/lib/**`; demo-only code lives under `src/routes` if needed (excluded from package)
  - Consolidate styles under `src/lib/styles`; export tokens as needed

- `@repo/core` (framework-agnostic)
  - Pure TypeScript; no `$app/*`, `$env/*`, or Svelte imports
  - Build with `tsup` or project references; stable `exports` map

- `@repo/domain` (types + validators)
  - Pure types/zod; no runtime framework deps

- `@repo/database`
  - Generated Supabase types under `src/generated` with scripts; thin re-exports; no SvelteKit imports

- `@repo/i18n`
  - Single source of messages; Paraglide build outputs stable module paths; all apps import from the package

Deliverables:
- Clean `exports` per package; correct `files` and `sideEffects` entries
- Shell-agnostic scripts; consistent builds


### C. Toolchain alignment

- ESLint: Fix shared config to use valid schema, scope `no-restricted-imports` (or prefer `eslint-plugin-import` rules) per package
- TypeScript: All apps/packages extend `@repo/typescript-config`; apps also extend `.svelte-kit/tsconfig.json` via the base
- Testing: Apps/packages use `@repo/testing` Vitest/Playwright configs
- Turbo: Root `turbo.json` uses topological `dependsOn` (e.g., `^build`), `$TURBO_DEFAULT$` inputs with precise ignores; package-level `turbo.json` only where truly needed

Deliverables:
- `pnpm lint`, `check-types`, `test`, `build` succeed locally and on CI
- CI pipeline with `.turbo` caching and fast re-runs

Blueprints
- ESLint (flat config)
  - Use `svelte-eslint-parser` and `eslint-plugin-svelte`; include TypeScript support; enable accessibility rules
  - Apply workspace-level boundaries: block importing `@repo/*/src` from apps; enforce import groups; enable `no-restricted-imports` for `$lib/server` in client contexts
  - Add `eslint-config-prettier` to avoid formatting conflicts

- TypeScript
  - Use project references for packages; `types` emitted for publishable packages (`ui`, `core`, `domain`, `database`, `i18n`)
  - Apps extend SvelteKit generated `.svelte-kit/tsconfig.json` via base config hook

- Turborepo
  - Root tasks: `build`, `lint`, `check-types`, `test`, `dev` with `dependsOn: ['^build']` where appropriate
  - Inputs: prefer `$TURBO_DEFAULT$` plus minimal globs; exclude `.svelte-kit/**`, `.turbo/**`, `dist/**` as outputs
  - Use remote cache in CI; keep package-level overrides minimal


### D. Svelte 5 MCP best practices

- Convert remaining legacy props/events to `$props()`, `onclick`, etc.
- Prefer `$derived` over `$effect` for computed values; keep load functions pure (no side effects)
- SSR safety: avoid global mutable state and client-only APIs in server paths
- Context for per-request state; URL search params for filters/sorting
- Route colocation complete

Deliverables:
- Svelte autofixer warnings addressed; consistent runes usage
- Architecture patterns documented in `docs/ARCHITECTURE.md`

Runes migration checklist
- Replace `export let` with `$props()` (with defaults); update all samples/docs
- Convert `on:click` to `onclick`; remove legacy event modifiers unless strictly needed via actions/attachments
- Replace `$:` computed blocks with `$derived`; reserve `$effect` for side-effects; use `$effect.pre` only for DOM-timing dependent code
- Adopt function bindings for two-way relationships; avoid mutating parent-owned objects without `$bindable`
- Remove `$app/stores` usages in favor of `$app/state` where applicable


### E. Vercel alignment

- Keep `vercel.json` minimal (security headers if truly needed)
- Push host/locale behavior into middleware when appropriate
- Use `@sveltejs/adapter-vercel` defaults unless constraints demand tuning

Deliverables:
- Verified production build behavior with preview; simple deployment steps documented

Notes
- Prefer zero-config deploys; only add `vercel.json` for headers or edge needs
- Keep images/fonts perf-friendly; consider `@sveltejs/enhanced-img` and font preloading via `handle` with `preload` if necessary


### F. Docs & cleanup

- Archive phase/prompt files into `docs/archive/`; keep these living docs updated:
  - `docs/MASTER_PLAN.md` (this file)
  - `docs/RESTRUCTURE_PLAN.md` (execution details)
  - `docs/IDEAL_STRUCTURE.md` and `docs/sitemap.md` (targets)
  - `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`, `docs/deployment.md`

Deliverables:
- Concise documentation; updated links from `README.md`

---

## Milestones & acceptance criteria

- M1 (end of Week 1): Hygiene & alignment
  - Apps build after alias cleanup; `turbo run lint check-types` passes on at least one app
  - Root `turbo.json` simplified; CI pipeline runs

- M2 (end of Week 2–3): Structure locked
  - `$lib` vs `$lib/server` separation enforced; route colocation done for major routes
  - Packages export from `dist` (where applicable) with typings; no app consuming `src` paths

- M3 (end of Week 4–5): Best-practices hardened
  - Runes migration done; zero SSR safety issues
  - Turbo caches effective; CI runs complete quickly with cache hits

- M4 (end of Week 6): Green gates
  - Zero TS errors; green lint/test/build across repo
  - Minimal `vercel.json`; documented deploys; golden-path E2Es passing

Cross-cutting metrics (ongoing)
- 0 illegal server-only imports in client paths
- 0 legacy `on:`/`export let` in changed code
- `sv check` clean (or tracked exceptions)

---

## Guardrails (to keep it great)

- Import rules to block cross-layer leaks (domain/core/ui constraints)
- `turbo boundaries` checks during CI (optional)
- Pre-push hooks for `lint` and `check-types` (optional)

CI outline (GitHub Actions)
- Cache pnpm store and Turbo `.turbo`
- Jobs: lint → typecheck → test → build; artifacts: preview output for apps
- Enable remote cache for PRs and main

---

## Quick-start execution checklist (next 7 days)

1) Root hygiene
- Slim `turbo.json` (topological deps, correct outputs)
- Fix shared ESLint config schema and enable in apps

2) Apps un-alias
- Remove `../../packages/...` aliases; switch to package exports
- Audit `$lib/server` usage; move violations

3) Packages
- `@repo/ui` -> `svelte-package` outputs; exports from `dist` + types
- Standardize scripts across packages; remove shell-specific bits

4) i18n
- Centralize Paraglide message sources under `packages/i18n`; ensure apps import from `@repo/i18n/messages`
- Add compile step to packages/i18n and wire into Turbo `build`

5) CI & tests
- Enable GitHub Actions with Turbo cache
- Point apps/packages at `@repo/testing` configs

6) Docs
- Link `docs/MASTER_PLAN.md` from `README.md`
- Move legacy planning docs to `docs/archive/`

---

## Mapping to prior materials

- Phase 4E intent: structural consolidation → covered by Phases A/B and M1–M2 here
- `PROJECT_SITEMAP.md`: current inventory → use to drive route colocation and server/client audit tasks
- `IDEAL_STRUCTURE.md` & `docs/sitemap.md`: target → acceptance criteria for restructure completion
- `RESTRUCTURE_PLAN.md`: execution details → keep as the tactical checklist while this master plan sets strategy

---

## Success definition

- Dev onboarding < 15 minutes: `pnpm install && pnpm dev --filter web` works
- Zero TypeScript errors; green CI with cache hits; deployable from main branch
- Clear layering: apps → packages; no framework leakage into core/domain
- Clean docs set reflecting reality and enforced by reviews

---

Appendix: package blueprints (concise)
- @repo/ui
  - Build with `@sveltejs/package`; exports map includes `svelte` + `types`; `files` includes `dist` and optionally `src/lib` for d.ts maps
  - No business logic; tokens and styles colocated under `src/lib`
- @repo/core
  - Pure TS; no `$app/*` or Svelte imports; stable `exports` map
- @repo/domain
  - Types and validators (zod); framework-agnostic
- @repo/database
  - Generated Supabase types; thin re-exports; scripts for `db:types`
- @repo/i18n
  - Paraglide compile step; stable `messages` import path; documented locale switching

---

## Structure fix spec (authoritative and enforceable)

This section translates the high-level plan into explicit, checkable constraints. Implement these deltas in small PRs. Do not begin code changes until this spec is approved.

Target state (applies to all apps unless noted)
- Package imports only: no aliases to `../../packages/*/src/**` in any `svelte.config.*`, `vite*.{ts,js}` or TS configs. All references must resolve through each package’s `exports` map.
- Adapter: `@sveltejs/adapter-vercel` with defaults for deployable apps. No custom `runtime`, `split`, or over-tuned settings unless we document a measured need.
- Paraglide/i18n: compile exclusively in `@repo/i18n` during `pnpm -w build` via Turbo. Apps consume `@repo/i18n` exports only (no Vite paraglide plugin inside apps, no reading generated files directly).
- Tailwind v4: use `@tailwindcss/vite` in apps that need it. No per-component or ad-hoc PostCSS files in packages unless exported as part of `@repo/ui` styles.
- SSR safety: no server-only imports in client code; keep secrets access in `+page.server.ts`/`+layout.server.ts` or `$lib/server/**` only.
- Testing: adopt shared Vitest/Playwright presets from `@repo/testing` where available.

Normalization by app
- web
  - Remove `resolve.alias` entries pointing at package `src` and delete alias blocks in `svelte.config.js` and `vite.config.ts` that import from `../../packages/**` directly.
  - Remove the Paraglide Vite plugin from the app; rely on `@repo/i18n` build output. Keep only `@sveltejs/enhanced-img` and `@tailwindcss/vite` as needed.
  - Use `adapter-vercel` defaults; remove `prerender.entries = []` unless there’s a documented 404 risk that can’t be solved with proper routing.
  - Keep `ssr.noExternal` minimal or empty once packages are consumed via `dist` exports; avoid forcing bundling of workspace deps.

- admin
  - Use `adapter-vercel` defaults (no explicit `runtime`).
  - Ensure no app-level `src` aliasing to packages; consume via package exports.

- docs
  - Can stay on `adapter-auto` locally; use `adapter-vercel` for Vercel deploys. No package `src` aliasing.

Packages enforcement (UI/Core/Domain/Database/I18n)
- No imports from apps in any package. No `$app/*`, `$env/*`, or `svelte` imports in `core`, `domain`, or `database`.
- `ui` may depend on Svelte and export styles via `exports` and `files`; keep demo-only code out of the package build (no route code inside package).
- `i18n` compiles messages to `lib/` and exports stable entrypoints. No consumers should import generated internals by path.

Tooling constraints
- ESLint flat-config: enable `no-restricted-imports` rules to block `../../packages/**/src/**` from apps, and block `$lib/server/**` in client contexts. Prefer `eslint-plugin-import` for boundaries and groups. Include `svelte-eslint-parser` + `eslint-plugin-svelte` with a11y rules.
- TypeScript: apps extend SvelteKit’s generated config through `@repo/typescript-config` base. Packages use project references or `tsup` (for core/domain) and `@sveltejs/package` (for ui).
- Turbo: root-only configuration with topological `dependsOn` and minimal `inputs`/`outputs`; avoid listing secrets in `env` unless strictly needed by Turbo’s cache key.

Verification gates (must pass before merging structure PRs)
- Grep proof: 0 matches for `../../packages/` in any app `svelte.config.*`, `vite*.{ts,js}`, or `tsconfig*`.
- SvelteKit illegal import check: 0 server-only imports in client bundles.
- Apps fully build and preview with no aliases to package `src`.
- `pnpm -w build` builds packages first, then apps; removing per-app i18n compile steps does not break translations.

Known deltas to implement (non-executable checklist)
- Remove web’s `svelte.config.js` alias block and Vite `resolve.alias` pointing to `packages/*/src/**`.
- Remove Paraglide Vite plugin usage from web; wire i18n through `@repo/i18n` only.
- Normalize admin’s adapter config to defaults; verify no custom runtime is necessary.
- For docs, decide deployment adapter (vercel) and remove any `src` aliasing if present.

---

## Bloat cleanup program (context pruning with safety)

Goal: retain a small set of living docs; archive the rest for reference. No content loss—just relocation to `docs/archive/**`.

Keep (actively maintained)
- `docs/MASTER_PLAN.md` (this file)
- `docs/RESTRUCTURE_PLAN.md`, `docs/IDEAL_STRUCTURE.md`, `docs/sitemap.md`
- `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`, `docs/deployment.md`
- Critical audits that reflect current state (move older versions to archive)

Archive (safe globs; adjust as needed)
- Root-level planning/prompts/checklists: `*_PROMPT.md`, `*_AUDIT*.md`, `*_CHECKLIST*.md`, `PHASE_*`, `PARALLEL_EXECUTION*`, `SVELTE*_MCP_REFACTOR.md`, `TYPESCRIPT_MCP_REFACTOR.md`, `TAILWINDCSS_V4_MCP_REFACTOR.md`, `SUPABASE_MCP_REFACTOR.md`, `ROADMAP.md`, `REFACTOR_STATUS.md` → move under `docs/archive/` (preserve directories like `agents/`, `planning/`, `audits/` beneath archive for structure)
- Legacy scripts: `scripts/legacy/**`, `fix-*.mjs|.ps1|.sh`, `update-phase4c-imports.sh` → move into `scripts/archive/` unless still required; reference in `docs/DEVELOPMENT.md` if they remain useful.
- Redundant top-level duplicates that exist inside `docs/**` → keep the `docs/**` copy, archive/remove the top-level duplicate.

Guardrails
- Add an “Allowed docs set” note in `README.md` linking only the living docs list.
- CI (optional): a check that warns on adding new root-level planning files outside `docs/**`.

Acceptance criteria
- All root-level planning/phase/prompt docs relocated under `docs/archive/**`.
- README links only to living docs.
- No broken relative links from moved files (best-effort update or add pointers).

---

## Context7-backed Turbo & Vercel guardrails

Turbo (root turbo.json)
- Keep `tasks.build.dependsOn` topological (e.g., `^build`) rather than explicit cross-package pins where possible. Use direct pins only for true cross boundaries (e.g., `@repo/i18n#build`).
- Prefer `$TURBO_DEFAULT$` inputs plus minimal globs. Outputs: `.svelte-kit/**`, `dist/**`, `build/**` (avoid including `.vercel/**` unless required for previews).
- Avoid listing secrets under `env` unless a task truly reads env at build time and affects cache keys.
- Use remote caching in CI; keep package-level overrides rare.

Vercel (adapter-vercel)
- Use defaults for `runtime` and function splitting. Only tune when a measured constraint exists (e.g., function count limits) and document it.
- Centralize headers/middleware in SvelteKit where possible; keep `vercel.json` minimal.
- Ensure Node/engine versions are consistent across root and apps; prefer Node 22 LTS.

Acceptance criteria
- Turbo caches hit in CI on subsequent runs for unchanged packages/apps.
- No bespoke adapter tuning present without a justification note in `docs/deployment.md`.
- Single, consistent Node engine range across the monorepo.

---

## Verification playbook (plan-only, for future execution)

Structural
- Search-and-destroy aliases: prove 0 occurrences of `../../packages/` in app config and TS files.
- Build order: ensure `pnpm -w build` builds packages first (watch dist timestamps), then apps without referencing package `src`.

Safety
- SvelteKit illegal imports report clean (0); any regressions block merge.
- SSR/env audit: secrets only used in server files and server `load`/actions.

Performance/CI
- Turbo cache hit rate improves after first CI run; build times stable within variance.
- Optional bundle analyzer performed once for web, results captured in `docs/deployment.md`.

Documentation
- After moves, check that README links work and that `docs/MASTER_PLAN.md` remains the single entry point.

Note: The above are acceptance checks; when we proceed to execution, we’ll implement them as CI gates and local scripts. No code changes are made by this document update.