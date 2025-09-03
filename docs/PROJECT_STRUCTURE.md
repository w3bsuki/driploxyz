# Project Structure

Authoritative map of the workspace. Use this to understand where code lives and how to wire imports.

- apps/
  - web/ — Primary SvelteKit app (customer-facing)
  - admin/ — Admin UI (lightweight SvelteKit app)
  - docs/ — Internal docs/demo app
- packages/
  - ui/ — Shared UI library (single source of truth for components)
  - utils/ — Cross-app utilities (pure TS)
  - database/ — DB types/migrations helpers
  - i18n/ — Paraglide project and messages
  - eslint-config/ — Shared ESLint configuration
  - typescript-config/ — Shared tsconfig bases

Key app directories (apps/web):
- src/lib/components — App-only components; prefer promoting shared ones to `@repo/ui`
- src/lib/server — Server helpers/APIs (auth, validation, rate limit)
- src/lib/stores — Svelte stores (state)
- src/lib/styles — App styles and Tailwind entry (`app.css`)
- src/routes — SvelteKit routes (SSR-first)

Path aliases (dev):
- `@repo/ui` → `packages/ui/src/lib/index.ts` (named exports)
- `@repo/ui/types` → `packages/ui/src/types`
- `@repo/ui/primitives` → `packages/ui/src/lib/primitives`
- `@repo/ui/styles/*` → `packages/ui/src/styles/*`

Turborrepo pipelines: see `turbo.json`. Type/lint/test/build must pass per package.

