# Repository Guidelines

## Project Structure & Module Organization
The monorepo runs on pnpm workspaces and Turborepo. Frontend apps live under `apps/` (`web` is the customer storefront, `admin` the staff console, `docs` the marketing/documentation site). Shared code graduates into `packages/` (`ui`, `utils`, `database`, `i18n`, `core-*`) and should be imported via the `@repo/*` aliases. Within `apps/web`, keep features inside `src/lib/{components,features,server}` and route code under `src/routes/(lang)` so Paraglide can localise pages. Automation, CI hooks, and perf tooling sit in `scripts/`, `performance-tests/`, `performance-test-data/`, and `performance-test-results/`. Database changes flow through `migrations/` and the Supabase bundle in `supabase/`.

## Build, Test, and Development Commands
Install with `pnpm install` after `nvm use` (Node 20.19.x). Use `pnpm -w turbo run dev` to launch all apps or `pnpm dev --filter web` when focusing on the storefront. Standard quality gates are `pnpm -w turbo run build`, `lint`, `check-types`, and `test`. Run `pnpm --filter web build` for isolated builds, `pnpm --filter web test:e2e` for Playwright smokes, and `pnpm performance-audit` before publishing perf-sensitive work.

## Coding Style & Naming Conventions
Prettier (2-space indent, single quotes, no trailing commas) and ESLint from `@repo/eslint-config` gate every change. Use PascalCase for components, kebab-case for route directories, and camelCase for variables. Promote shared UI into `@repo/ui` and utilities into `@repo/utils`; avoid deep relative imports. TypeScript is strict; retain explicit return types, prefer `satisfies` on load/action exports, and keep server-only code under `src/lib/server`.

## Testing Guidelines
Vitest plus Svelte Testing Library cover units and components via `pnpm --filter web test` or `test:watch`. Playwright (`pnpm --filter web test:e2e`) handles journey and accessibility checks with Axe. Turborepo writes coverage into `coverage/`; keep deltas non-regressive and document any intentional gaps. Performance baselines live in `performance-tests/`; run `pnpm test:performance` when touching rendering, data fetching, or metrics code.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) with concise, imperative subjects mirroring the existing history. Branches map to the work type (`feat/*`, `fix/*`, `docs/*`). Each PR should link the issue or runbook task, summarise scope, list validation commands, and attach Lighthouse/Playwright evidence plus mobile screenshots for UI changes. Do not request review until `pnpm -w turbo run check-types`, `lint`, `test`, and relevant Lighthouse targets pass locally.
## Svelte 5 Runes Checklist
- Declare interactive state with `$state` (or `$state.raw` for immutable snapshots); reassign arrays/objects instead of mutating them in place.
- Derive values with `$derived` / `$derived.by` instead of `$effect` when no side effects are needed; destructure via `$state.snapshot` if you must pass plain objects.
- Keep effects side-effect only: guard against feedback loops, and use `$effect.pre`/`.pending`/`.root` when you need commit-time control.
- Component props come from `$props()`: provide defaults there, avoid renaming `export let` bindings, and never bind to `undefined` when a prop has a fallback value.
- Expose component state via `bind:`; for inputs prefer `bind:value`, `bind:checked`, etc., and forward bindings on composite components.
- Share state explicitly (factory functions, context) rather than mutating imported module state; respect pass-by-value when calling helpers.

## SvelteKit 2 Routing & Data Guidelines
- Keep data logic in `+page.ts` / `+page.server.ts` / `+layout*.ts` and UI in `+page.svelte`; use layout `load` to share data via `parent()`.
- `+page.server.ts` is for server-only concerns (auth, DB writes); universal loads must stay side-effect-free and return serializable data.
- Handle navigation using Kit utilities (`goto`, `invalidate`, `afterNavigate`, `beforeNavigate`) instead of direct `window.location` tweaks.
- Persist client-visible state in the URL when necessary; avoid storing long-lived data in global variables or leaked module scope on the server.
- Use form actions in `+page.server.ts` for mutations, return `{ errors }` for validation, `throw redirect(...)` for navigation.
- Configure adapters via `svelte.config.js`; prefer `$lib/*` aliases for shared modules and keep the global types in `src/app.d.ts` in sync with `pnpm svelte-kit sync`.

