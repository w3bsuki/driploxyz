# Project Overview

## Monorepo Structure
- **Workspace management:** pnpm workspaces with Turborepo orchestrating builds, linting, and tests across apps and packages.【F:pnpm-workspace.yaml†L1-L2】【F:turbo.json†L1-L44】
- **Applications:**
  - `apps/web` – customer-facing SvelteKit storefront with extensive route modules, server hooks, and shared lib directories for auth, data access, analytics, and more.【F:apps/web/package.json†L1-L69】【F:apps/web/src/hooks.server.ts†L1-L18】【F:apps/web/src/lib/server/env.ts†L1-L41】
  - `apps/admin` – SvelteKit-based staff console consuming shared core and UI packages.【F:apps/admin/package.json†L1-L39】
  - `apps/docs` – SvelteKit marketing/docs site leveraging shared UI and tailwind tooling.【F:apps/docs/package.json†L1-L41】
- **Shared packages:**
  - `@repo/ui` – Svelte component library + design tokens, exported via svelte-package.【F:packages/ui/package.json†L1-L73】
  - `@repo/core` – business logic utilities (auth, cookies, supabase helpers) that depend on Supabase clients.【F:packages/core/package.json†L1-L52】
  - `@repo/database` – generated Supabase types and schema metadata.【F:packages/database/package.json†L1-L33】
  - `@repo/i18n` – Paraglide-based localization bundles and tooling scripts.【F:packages/i18n/package.json†L1-L38】
  - Tooling packages: shared ESLint config, TypeScript config, testing presets.【F:packages/eslint-config/package.json†L1-L28】【F:packages/typescript-config/package.json†L1-L18】【F:packages/testing/package.json†L1-L33】
- **Supabase:** SQL migrations, configuration, and edge functions (e.g., `send-message`).【F:supabase/config.toml†L1-L43】【F:supabase/migrations/20250910_add_messaging_rpcs.sql†L1-L120】【F:supabase/functions/send-message/index.ts†L1-L120】
- **Docs:** Repository-level guides outlining architecture, development workflows, testing expectations, and roadmap alignments.【F:README.md†L1-L120】【F:ARCHITECTURE.md†L1-L120】【F:TESTING.md†L1-L80】【F:ROADMAP.md†L1-L120】

## Entry Points & Runtime Flow
- **Frontend runtime:** SvelteKit handles requests through server hooks exported from `$lib/server/hooks`, layering env validation, auth, i18n, error handling, and monitoring. Hooks delegate to specialized modules within `apps/web/src/lib/server` for maintainability.【F:apps/web/src/hooks.server.ts†L1-L18】【F:apps/web/src/lib/server/hooks.ts†L1-L120】
- **Routing:** SvelteKit file-based routes under `apps/web/src/routes` cover e-commerce flows (`product`, `category`, `wishlist`, etc.), admin/protected segments, marketing pages, and machine endpoints (sitemap, robots).【F:apps/web/src/routes/(protected)/+layout.server.ts†L1-L44】【F:apps/web/src/routes/sellers/+page.server.ts†L1-L197】
- **Server-side services:** Business logic is centralized in `@repo/core` utilities that wrap Supabase client interactions and enforce domain rules (auth cookies, slug utils).【F:packages/core/src/cookies/index.ts†L1-L72】【F:packages/core/src/utils/slug.ts†L1-L80】
- **Data layer:** Supabase migrations define schema objects (profiles, products, orders, messages) with RLS, indexes, and helper RPCs; edge function `send-message` mediates messaging with rate-limiting safeguards.【F:supabase/migrations/20250901_backfill_product_slugs.sql†L1-L108】【F:supabase/functions/send-message/index.ts†L1-L176】
- **Admin & Docs apps:** share SvelteKit entry points (hooks, routes) but lighter domain logic; they reuse `@repo/core`, `@repo/database`, and `@repo/ui` for consistency.【F:apps/admin/package.json†L18-L39】【F:apps/docs/package.json†L23-L41】

## Build, Deploy, and Ops
- **Build orchestration:** Turborepo pipeline caches build outputs, runs tests, and enforces env variable availability for Stripe, Supabase, Resend, and Sentry integrations.【F:turbo.json†L1-L44】
- **Runtime targets:** Vercel deployment configured with strict security headers, multi-region locale headers, and CSP tuned for Stripe, Supabase, and analytics domains.【F:vercel.json†L1-L83】
- **Supabase local dev:** `config.toml` provisions Postgres 15, Auth, Storage, Studio, Inbucket, and edge function ports; email templates sourced from `apps/web/email-templates` for auth flows.【F:supabase/config.toml†L1-L43】
- **Testing expectations:** Coverage thresholds set for packages and apps; turbo tasks orchestrate vitest, playwright, and linting across the workspace.【F:TESTING.md†L1-L80】【F:turbo.json†L25-L44】

## Observability & Monitoring
- **Sentry integration:** Web app uses `@sentry/sveltekit` with server configuration modules under `$lib/monitoring` and environment validation to ensure DSNs are present.【F:apps/web/package.json†L21-L59】【F:apps/web/src/lib/server/sentry-config.ts†L1-L140】
- **Analytics:** Vercel Analytics and web vitals dependencies available for performance tracking.【F:apps/web/package.json†L21-L59】【F:package.json†L16-L24】

## Key Cross-Cutting Concerns
- **Auth & Session:** Locals typed in `app.d.ts`, hooks initialize Supabase client, and `@repo/core` cookies helpers manage session tokens shared across apps.【F:apps/web/src/app.d.ts†L1-L34】【F:packages/core/src/cookies/index.ts†L1-L44】
- **Internationalization:** Paraglide bundling in `@repo/i18n` with locale detection modules in web app; Vercel headers differentiate locales per hostname.【F:packages/i18n/package.json†L1-L38】【F:apps/web/src/lib/locale/detection.ts†L1-L137】【F:vercel.json†L30-L119】
- **Payments:** Stripe client usage across web app with server modules for checkout flows; environment variables required by Turbo pipeline ensure secrets available at build/test time.【F:apps/web/package.json†L21-L59】【F:apps/web/src/lib/stripe/server.ts†L1-L19】【F:turbo.json†L8-L24】

## Known Gaps & Assumptions
- Admin app lacks automated tests and production-grade auth hardening per package script comments.【F:apps/admin/package.json†L11-L36】
- Localization package has no runtime dependencies or automated tests; translation coverage likely requires manual validation.【F:packages/i18n/package.json†L19-L38】
- Database package defers schema validation to consuming apps; no direct tests ensure generated types remain in sync with migrations.【F:packages/database/package.json†L13-L33】
