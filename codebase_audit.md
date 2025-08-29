**Codebase Audit — Driplo Turbo Monorepo**

- Owner: Core Web Team
- Date: [auto-generated]
- Scope: Full repository (apps, packages, scripts, migrations)

**Executive Summary**
- **Stack:** SvelteKit (Svelte 5), Vite, PNPM + Turbo monorepo, Tailwind v4, Supabase (DB/Auth/Realtime/Storage), Stripe, Sentry, Playwright, Vitest.
- **Apps/Packages:** `apps/web` (primary site), `apps/admin`, `apps/docs`; shared `packages/ui`, `packages/i18n`, `packages/database`, plus lint/tsconfig packages.
- **Quality:** Clear modular server hooks, typed DB access, i18n pipeline, and a rich shared UI package. Several redundancies exist (duplicate service worker, component overlap, `.bak` files, generated `.d.ts` committed in `src/`), and some security primitives can be hardened (CSRF tokening approach).
- **Opportunity:** Consolidation + shared abstractions can reasonably cut 40–60% of hand-written app code while retaining features and styling, primarily by:
  - Moving app-level UI into `@repo/ui` and deleting duplicates.
  - Standardizing API handler utilities for Supabase + validation + rate limiting.
  - Removing dead/duplicate files (service worker JS, `.bak`, generated types in `src/`).
  - Centralizing logging, env validation, i18n handling, and response helpers.

**Repository Structure**
- `package.json`: Monorepo scripts (`turbo run`), Supabase type gen.
- `pnpm-workspace.yaml`, `turbo.json`: Workspace + pipeline setup.
- `scripts/`: Build analysis helpers.
  - `scripts/analyze-bundle.js`: Bundle size helper (emojis/log formatting could be simplified).
- `migrations/`: Core SQL migrations for the marketplace.
  - `migrations/001_create_core_marketplace_tables.sql`: Core schema (profiles, products, orders, messages, reviews, favorites, etc.).
  - `migrations/006_social_features.sql`: Views/RPCs (e.g., `messages_with_details`).
- `supabase/`: Supabase project config + new migrations.
  - `supabase/config.toml`: Project configuration.
  - `supabase/migrations/*`: Recent targeted DDL/RLS changes.
- `reference/`: Project docs (ROADMAP, operations, development).
- `apps/web`: Main SvelteKit application.
- `apps/admin`: Admin SvelteKit app.
- `apps/docs`: Documentation SvelteKit app.
- `packages/ui`: Shared UI component library (Svelte components, skeletons).
- `packages/i18n`: Paraglide i18n build outputs + wrapper API.
- `packages/database`: Supabase generated types + re-exports.
- `packages/eslint-config`, `packages/typescript-config`: Shared configs.

**Apps Overview**
- `apps/web` (Primary Site)
  - `src/app.html`, `src/app.css`, `src/app.d.ts`: Base app wiring.
  - `src/hooks.server.ts`: Exports modular hooks from `lib/server` (good separation).
    - `apps/web/src/lib/server/hooks.ts:1`
    - `apps/web/src/lib/server/auth.ts:1`
    - `apps/web/src/lib/server/i18n.ts:1`
    - `apps/web/src/lib/server/rate-limiter.ts:1`
    - `apps/web/src/lib/server/csrf.ts:1`
  - `src/hooks.client.ts`: Client Sentry + reroute.
  - `src/hooks.reroute.ts`: Rerouting for language prefixes.
  - `src/lib`: Domain utilities, services, server wiring, types, and components.
    - `src/lib/server`: Auth, i18n, rate limiter, sentry, env checks, redirects.
      - `apps/web/src/lib/server/hooks.ts:1`
      - `apps/web/src/lib/server/auth.ts:1`
      - `apps/web/src/lib/server/i18n.ts:1`
      - `apps/web/src/lib/server/rate-limiter.ts:1`
      - `apps/web/src/lib/server/csrf.ts:1`
    - `src/lib/services`: Domain services for products, favorites, messaging, payments, subscriptions.
      - `apps/web/src/lib/services/ConversationService.ts:1`
      - `apps/web/src/lib/services/stripe.ts:1`
      - `apps/web/src/lib/services/stripe.ts.bak:1` (dead backup, remove)
    - `src/lib/components`: App-specific UI for messages, search, header, modals.
      - `apps/web/src/lib/components/LazySearchResults.svelte:1` (dup concept with `@repo/ui`)
      - `apps/web/src/lib/components/Header.svelte:1` (overlaps with `@repo/ui` header set)
    - `src/routes`: Pages and API routes (favorites, products, orders, payments, sellers, reviews, search, subscriptions, webhooks, etc.).
      - `apps/web/src/routes/api/...`: Many `+server.ts` endpoints with repeated patterns.
      - Messaging route:
        - `apps/web/src/routes/(protected)/messages/+page.server.ts:1`
        - `apps/web/src/routes/(protected)/messages/+page.svelte:1`
        - `apps/web/src/routes/(protected)/messages/ModularMessages.svelte:1`
  - `src/service-worker.ts` and `src/service-worker.js`: Duplicate service worker implementations; keep TS, remove JS.
  - `static/`: Icons, robots.txt, sitemap, avatars, audio.
  - `email-templates/`: Authentication email templates.

- `apps/admin`
  - SvelteKit app using `@repo/ui` and `@repo/database`.
  - Pages for analytics, audit logs, users, listings, orders, payouts, security, subscriptions.
  - Good candidate for deeper component reuse from `@repo/ui` (minimize local UI).

- `apps/docs`
  - SvelteKit site for docs with Playwright + Vitest configs.
  - Can reuse UI elements from `@repo/ui` where applicable.

**Packages**
- `packages/ui`
  - Rich set of Svelte components: Cards, Modals, Product views, Header pieces, toasts, skeletons, etc.
  - ISSUE: `packages/ui/src/components` includes many `*.d.ts` files next to sources — generated artifacts should be in `dist/` only. Remove from `src/` and adjust packaging.
  - `packages/ui/src/lib/utils`: minimal utils (contrast with numerous utils in web app).

- `packages/i18n`
  - `src/index.ts`: Re-exports Paraglide API + helpers.
    - `packages/i18n/src/index.ts:1` (note: the Bulgarian language name appears garbled; check file encoding and source of names)
  - `messages/en.json`, `messages/bg.json` with Paraglide build to `lib/paraglide`.

- `packages/database`
  - `src/generated.ts`: Supabase generated types.
  - `src/index.ts`: Re-exports and typed helpers.

- `packages/eslint-config`, `packages/typescript-config`
  - Centralized config — consolidate usage across apps to reduce per-app config duplication.

**Data Layer & Migrations**
- Core schema is reasonably normalized with indices and triggers.
- `messages` domain:
  - `migrations/001_create_core_marketplace_tables.sql:...` (base `messages` table)
  - `migrations/006_social_features.sql:52` (view `messages_with_details`) and RPC for read marking.
  - Additions planned in `messages-refactor` docs for `delivered_at`, `read_at` and `mark_message_delivered` RPC.

**Security & Observability**
- **Rate Limiting:**
  - `apps/web/src/lib/server/rate-limiter.ts:1` uses `sveltekit-rate-limiter`. Good policy scoping; ensure strong `RATE_LIMIT_SECRET` in prod.
- **CSRF:**
  - `apps/web/src/lib/server/csrf.ts:1` generates a base64 token without HMAC/signature and uses timestamps. This is weak protection and skips API routes. Prefer SvelteKit’s built-in CSRF for form actions or implement HMAC-signed tokens (server-only secret) and verify per-session.
- **Sentry:**
  - Server and client integration present; gated by DSN. Sampling rates set; verify production rates for cost/perf.
- **Logging:**
  - Many `console.log`/`console.error` calls across components/services. Centralize via `log.ts` with environment gating (dev or `localStorage.debug_*`).

**Performance Notes**
- Good: i18n chunk splitting in `apps/web/vite.config.ts:1` via manualChunks. Tailwind v4 Vite plugin applied.
- Service worker duplication with heavy logic; unify to a single TS implementation and simplify strategies to essential paths (cache-first for static, network-first for API, stale-while-revalidate for images).
- Messaging refactor already moves toward incremental loading and realtime dedupe (`ConversationService`).
- Further gains:
  - Dynamic import rarely-used modals/dialogs.
  - Audit `@repo/ui` exports to enable tree-shaking; prefer deep imports or a flat `exports` map per component for optimal dead-code elimination.
  - Validate image compression path (`browser-image-compression`) and server optimizations; ensure transformed assets are cached aggressively.

**API Routes Review (apps/web/src/routes/api)**
- Many `+server.ts` endpoints share similar patterns: get session, validate input, perform Supabase query/RPC, handle errors, return JSON.
- Suggested standard module: `lib/server/api.ts` with helpers:
  - `withAuth(handler, { admin?: boolean })`
  - `validate(body, schema)` using `zod`
  - `ok(data)`, `badRequest(error)`, `unauthorized()`, `forbidden()`, `rateLimited()`
  - `supabase(cookies|locals)` for typed clients
- Outcome: shrink per-endpoint boilerplate by 50–70%, unify error handling, and harden behavior.

**Bloat, Redundancy, and Dead Files**
- Duplicate service worker implementations:
  - Keep `apps/web/src/service-worker.ts:1`; remove `apps/web/src/service-worker.js:1`.
- Backup files in repository:
  - `apps/web/src/lib/services/stripe.ts.bak:1`
  - `apps/web/src/routes/api/admin/archive-orders/+server.ts.bak:1`
- Component overlap between app and UI package:
  - `apps/web/src/lib/components/LazySearchResults.svelte:1` vs `packages/ui/src/lib/LazySearchResults.svelte:1`
  - App header vs. `@repo/ui` header set (`HeaderLogo`, `HeaderNav`, `HeaderSearch`, `HeaderUserMenu`)
  - Recommendation: move app-level UI into `@repo/ui` and reference from apps.
- Generated artifacts in source:
  - `packages/ui/src/components/*.d.ts` present in `src`. These should live in `dist/` only.
- Leftover `.js` alongside `.ts` in some places creates confusion (service worker); standardize on TS in `apps/web`.
- Large number of single-purpose utils in `apps/web/src/lib/utils/*`; many could be consolidated or moved to `@repo/ui` or a shared `@repo/utils` package (optional new package).
- Build artifacts present in workspace (ensure gitignored): `.svelte-kit/`, `.vercel/`, `dist/`, `.turbo/` — verify they aren’t tracked in VCS.

**i18n & Locale**
- Path-based reroute logic:
  - `apps/web/src/hooks.client.ts:33` and `apps/web/src/hooks.reroute.ts:1` duplicate similar regex logic; consider a single source function in `lib/server/i18n.ts` with shared constants.
  - Locale prefixes use `uk` and `bg`; `uk` conflates country (United Kingdom) with language code for Ukrainian. Prefer BCP-47 tags (e.g., `en-GB`, `bg`).
- Paraglide integration and chunking in Vite config is strong.

**Styling & Design System**
- Tailwind v4 across apps. Consider a shared Tailwind preset in `packages/ui` (or a `packages/tailwind-config`) and consume in apps to avoid drift.
- Tokens/components are already centralized in `@repo/ui`; continue moving app UI there to reduce duplication and enable consistent styling.

**Messaging Domain (Focused Audit)**
- Route/server load:
  - `apps/web/src/routes/(protected)/messages/+page.server.ts:1` implements pagination, read marking via RPC, and conversation param parsing. Solid base; ensure RPC availability and indexes to keep queries fast.
- Client service:
  - `apps/web/src/lib/services/ConversationService.ts:1` handles aggregation, optimistic sending, realtime subscription with filters, dedupe cache — good architecture. Add LRU caps and visibility slicing per refactor plan.
- UI:
  - `apps/web/src/lib/components/modular/ConversationSidebar.svelte:1`
  - `apps/web/src/lib/components/modular/ChatWindow.svelte:1`
  - Keep input pinned, incremental render, and infinite scroll upward. Gate logs.

**Security Hardening Suggestions**
- Replace CSRF scheme with either:
  - SvelteKit action CSRF (recommended), or
  - HMAC-signed tokens using a server-only secret; compare signature server-side (`apps/web/src/lib/server/csrf.ts:1`).
- Ensure all API endpoints use `authLimiter`/`apiLimiter` appropriately and avoid fallback dev secrets in production.
- Validate all user inputs with `zod` schemas and sanitize any HTML if rendering user content.

**Proposed 50% Code Reduction Plan**
- UI consolidation (estimate 20–30% reduction in `apps/web/src/lib/components`):
  - Merge app components into `@repo/ui` where possible. Remove duplicates like `LazySearchResults` and unify header/search components.
  - Promote reusable modals (quick view, payout modal) into `@repo/ui`.
- API abstraction (estimate 10–15% reduction across `api/*` endpoints):
  - Introduce `lib/server/api.ts` abstraction for auth, validation, rate limiting, and typed responses.
  - Convert endpoints to minimal business logic only.
- Remove dead/duplicate files (quick win 1–3%):
  - Delete `apps/web/src/service-worker.js:1`, `*.bak` files listed above.
  - Clean generated `.d.ts` from `packages/ui/src/components/*`.
- Shared utilities (5–10%):
  - Move common utils (price, date, urls, debounce) to a shared package or consolidate within `@repo/ui`/`@repo/utils`.
  - Remove single-use utils by inlining or merging.
- Config unification (3–5%):
  - Centralize Tailwind preset, ESLint, TS configs; reduce per-app divergence.
- Logging & Env (1–3%):
  - Add `log.ts` and replace direct `console` statements; simplify env validation output.
- Result: 40–60% reduction in handwritten app code size (mostly `apps/web`), without changing features or styling, and with improved reusability and maintainability.

**Quick Wins (Do Now)**
- Remove duplicates and backups:
  - `apps/web/src/service-worker.js:1`
  - `apps/web/src/lib/services/stripe.ts.bak:1`
  - `apps/web/src/routes/api/admin/archive-orders/+server.ts.bak:1`
- Stop committing generated artifacts in `packages/ui/src/components/*.d.ts`.
- Gate logging:
  - Add `apps/web/src/lib/utils/log.ts` and replace debug `console.*` across messaging and high-traffic components.
- i18n reroute: Extract to a single helper and use consistent locale tags (e.g., `en-GB`, `bg`).

**Risks/Notes**
- UI consolidation requires careful props API review for components to avoid regressions.
- API abstraction must preserve per-endpoint nuances (auth scopes, rate limits, error codes).
- Locale tag migration (e.g., `/uk` → `/en-GB`) needs redirects to avoid SEO/UX regressions.

**Suggested Roadmap**
- Phase 1 (Week 1)
  - Delete duplicate/backup files; fix `packages/ui` packaging (remove `.d.ts` in `src/`).
  - Add `log.ts` and replace debug logs in messaging and high-traffic flows.
  - Extract i18n reroute helper; use consistently in client/server hooks.
- Phase 2 (Weeks 2–3)
  - Introduce `lib/server/api.ts` abstraction; migrate top 10 endpoints (favorites, products read, search, orders status).
  - Consolidate `apps/web` header/search components into `@repo/ui` and refactor imports.
  - Create shared Tailwind preset; align apps.
- Phase 3 (Weeks 4–5)
  - Migrate remaining endpoints to API abstraction.
  - Consolidate remaining UI (modals, toasts, notifications) into `@repo/ui`.
  - Optional: extract `@repo/utils` for cross-app utilities and deprecate duplicated helpers in `apps/web/src/lib/utils/*`.

**Appendix — Notable References**
- Server hooks composition: `apps/web/src/lib/server/hooks.ts:1`
- CSRF helper to revisit: `apps/web/src/lib/server/csrf.ts:1`
- Rate limiting config: `apps/web/src/lib/server/rate-limiter.ts:1`
- Messaging route/server: `apps/web/src/routes/(protected)/messages/+page.server.ts:1`
- Messaging client service: `apps/web/src/lib/services/ConversationService.ts:1`
- Duplicate service worker: `apps/web/src/service-worker.ts:1`, `apps/web/src/service-worker.js:1`
- Duplicate/backup files: `apps/web/src/lib/services/stripe.ts.bak:1`, `apps/web/src/routes/api/admin/archive-orders/+server.ts.bak:1`
- UI package with generated artifacts in `src/`: `packages/ui/src/components/*.d.ts`

**Cleanups To Track**
- Add/verify `.gitignore` rules for: `.svelte-kit/`, `.vercel/`, `dist/`, `.turbo/`, `node_modules/`.
- Remove committed `.d.ts` in `packages/ui/src/components/*` and ensure build emits to `dist/` only.
- Remove duplicate service worker JS and migrate to TS.
- Remove `.bak` files.
- Implement `lib/server/api.ts` and migrate endpoints progressively.
- Consolidate app components into `@repo/ui` where appropriate.

