# Repository Guidelines

## Project Structure and Modules
See ProjectStructure.md for the target layout. The monorepo uses pnpm workspaces and Turborepo. Apps live under apps/ (web storefront, admin console, docs site). Shared code sits in packages/ (ui, core, database, i18n, config). Import shared pieces via @repo aliases. Within apps/web keep features inside src/lib and routes grouped for localisation.

## Build, Test, and Development Commands
Use nvm use 22.12.0 followed by pnpm install. Standard quality gates come from Turbo tasks: pnpm -w turbo run build, lint, check-types, and test. Launch all apps with pnpm -w turbo run dev or focus on the storefront via pnpm dev --filter web. Run pnpm --filter web test:e2e for Playwright smokes and pnpm performance-audit before publishing perf-sensitive work.

## Coding Style and Naming
Prettier (2-space indent, single quotes, no trailing commas) and the shared ESLint flat config gate every change. Use PascalCase for components, kebab-case for route directories, camelCase for variables. Promote shared UI into @repo/ui and utilities into @repo/core or @repo/utils equivalents. Prefer TypeScript, retain explicit return types, use satisfies helpers on load/action exports, and keep server-only code inside src/lib/server.

## Testing Expectations
Vitest and Svelte Testing Library cover units and components via pnpm --filter web test or test:watch. Playwright (pnpm --filter web test:e2e) handles end-to-end and accessibility checks. Turborepo writes coverage into coverage/; prevent regressions and document gaps. Performance baselines live in performance-tests/; run pnpm performance-audit when touching rendering, data fetching, or metrics code.

## Documentation Map
- MAIN.md – phase tracker and link hub.
- Turbo.md – tooling and CI pipeline instructions.
- ProjectStructure.md – folder layout and ownership.
- Svelte5.md, SvelteKit2.md, TailwindCSS.md, Paraglide.md, Supabase.md – subsystem guides.
Keep these updated as the source of truth; delete superseded docs when adding new guidance.

## Svelte 5 Checklist
- Declare state with $state or $state.raw and reassign rather than mutate collections.
- Derive data with $derived or $derived.by when no side effects are needed.
- Keep $effect for real side effects and guard against loops.
- Pull component props from $props, provide defaults in place, avoid renaming exports.
- Expose state through bind: on components and forward bindings when composing UI.
- Share state via factories or context instead of mutating imported module scope.

## SvelteKit 2 Data Rules
- Place data logic in +page.ts, +page.server.ts, or +layout files and UI in +page.svelte.
- Use actions in +page.server.ts for mutations and return serialisable data.
- Handle navigation using goto, invalidate, afterNavigate, beforeNavigate.
- Persist client-visible state in the URL when needed; avoid leaking state in server module scope.
- Keep aliases configured via svelte.config.ts; sync global types using pnpm svelte-kit sync.

Follow CLAUDE.md for detailed workflow and communication requirements.
