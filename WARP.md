# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project summary
- Monorepo managed by pnpm workspaces and Turborepo
- Primary app: apps/web (SvelteKit 2 + Svelte 5)
- Supporting apps: apps/admin (admin dashboard), apps/docs (marketing/docs)
- Shared packages: packages/ui (component library), packages/core (business logic), packages/database (Supabase types), packages/i18n (localization), packages/testing (shared Vitest configs), packages/eslint-config, packages/typescript-config
- Toolchain: Node 22.12.x (.nvmrc), pnpm 8.15.6, turbo, vite, vitest, playwright

Environment
- Node: 22.12.0 (see .nvmrc). Use nvm use or your platform’s equivalent before running commands.
- Package manager: pnpm (8.15.6). If needed: corepack enable; corepack prepare pnpm@8.15.6 --activate
- Build-time env used by Turborepo tasks (see turbo.json): PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NODE_ENV, PUBLIC_SENTRY_DSN, SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN, SENTRY_RELEASE, PUBLIC_SITE_URL
- Web app env: copy apps/web/.env.example to apps/web/.env and fill values for local/dev builds

Common workspace commands
- Install deps (workspace): pnpm -w install
- Start all apps (dev): pnpm dev
- Start a specific app:
  - Web: pnpm dev --filter web
  - Admin: pnpm dev --filter @repo/admin
  - Docs: pnpm dev --filter docs
- Build all: pnpm build
- Build a specific target:
  - Web: pnpm --filter web build
  - UI: pnpm --filter @repo/ui build
  - Core: pnpm --filter @repo/core build
- Lint all: pnpm lint
- Lint specific:
  - Web: pnpm --filter web lint
  - UI: pnpm --filter @repo/ui lint
  - Core: pnpm --filter @repo/core lint
- Type check (workspace): pnpm check-types
- Type check (app-level svelte-check): pnpm --filter web check
- Format: pnpm format

Testing
- Run all workspace tests: pnpm test (or use filters below)
- Web app tests:
  - Unit (watch): pnpm --filter web test:watch
  - Full test run (unit + smoke e2e): pnpm --filter web test
  - E2E only (Playwright): pnpm --filter web test:e2e
  - Vitest single test example:
    - By name: pnpm --filter web vitest -t "slug processor"
    - By file: pnpm --filter web vitest run src/lib/utils/format.test.ts
- UI package tests (@repo/ui):
  - Run: pnpm --filter @repo/ui test
  - Watch: pnpm --filter @repo/ui test:watch
  - Coverage: pnpm --filter @repo/ui test:coverage
  - Vitest UI: pnpm --filter @repo/ui test:ui
  - Single file: pnpm --filter @repo/ui test -- src/lib/primitives/toast/__tests__/store.test.ts
- Core package tests (@repo/core):
  - Run: pnpm --filter @repo/core test
  - Single test by name: pnpm --filter @repo/core test -- -t "data access"
  - Single file: pnpm --filter @repo/core test -- src/auth/__tests__/auth-helpers.test.ts

Notes on filters and pass-through args
- Use pnpm --filter <workspace> <script> to scope to an app/package
- To pass through flags to the underlying test runner, add -- after the script: pnpm --filter <workspace> test -- -t "pattern"

High-level architecture
- apps/web (SvelteKit 2 + Svelte 5)
  - src/lib: application modules
    - auth, security, rate limiting, middleware, validation, monitoring
    - server/: SSR-only utilities (Supabase integration, CSRF, Sentry config, route guards)
    - services/: domain services (orders, payouts, products, profiles, notifications, subscriptions, etc.)
    - utils/: shared utilities (formatting, URL helpers, i18n helpers, debounce, etc.)
  - src/routes: SvelteKit routes and API endpoints
    - +layout(.server).ts files manage session, locale, and global data
    - api/* folders implement JSON APIs for app features (auth, products, orders, etc.)
  - tests: Vitest for unit/integration and Playwright for E2E
- apps/admin: SvelteKit admin dashboard (vite dev/build scripts; currently no automated tests)
- apps/docs: SvelteKit docs site (uses Vitest and Playwright)
- packages/ui: Svelte 5 component library
  - Build with @sveltejs/package; tests run with Vitest (happy-dom) using shared config from @repo/testing
  - Exposes primitives (accordion, menu, tabs, toast, tooltip) and shared CSS tokens
- packages/core: Business logic and shared utilities
  - Built with tsup, tested with Vitest
  - Provides auth helpers, cookie utilities, and general utils consumed by apps
- packages/database: TypeScript types and generated bindings for Supabase
- packages/i18n: Paraglide-based localization bundle (scripts to generate and compile messages)
- packages/testing: Centralized Vitest configs (base/ui/app) consumed by packages and apps
- supabase/functions: Edge functions (e.g., send-message) for backend integrations

Conventions and rules (from CLAUDE.md)
- Svelte 5 runes: use $state/$derived/$effect as intended; avoid mutating state directly; prefer factories or context for shared state
- SvelteKit 2 patterns: data in load; actions return serializable data; navigation via helpers; keep secrets server-side and respect RLS
- TypeScript: strict types, explicit returns; prefer @repo/* workspace imports over deep relative paths
- Quality gates per change: lint, check-types (or check), test, build

CI reference
- Workflows in .github/workflows run: install → lint → type/static check → build on Node 20.x and 22.x matrices
- For minimal deploy flow, see ci-simple.yml (builds @repo/ui, @repo/i18n, then web with required PUBLIC_* env)

Tips for future Warp runs in this repo
- Prefer pnpm --filter to target a single app or package (web, @repo/ui, @repo/core, etc.)
- When running one test, pass arguments through the script using -- so Vitest receives -t or a file path
- Dev servers are uncached and persistent by design (see turbo.json); builds/tests are cached across the graph
