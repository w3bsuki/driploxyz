# Refactor Roadmap

## Roles & Owners
- **FE** – Storefront/frontend team maintaining `apps/web`, shared UI, and docs site.
- **BE** – Backend/data team owning Supabase schema, edge functions, and shared core package.
- **PLAT** – Platform/DevOps team managing build tooling, CI/CD, and observability.
- **QA** – Quality engineering responsible for test automation and release gates.

## Phase 1 – Stabilize Environment & Schema (Week 1)
| Goal | Impact | Prerequisites | Owners |
| --- | --- | --- | --- |
| Align Supabase SDK versions (upgrade web to ^2.56.0, regenerate types) to remove auth/session drift.【F:apps/web/package.json†L21-L39】【F:packages/core/package.json†L42-L58】 | Prevent runtime mismatches in `safeGetSession` and ensure `@repo/core` helpers stay type-safe. | Verify Supabase migrations up to date; confirm no breaking API changes in release notes. | BE + FE |
| Enforce environment validation for rate limit secret and service-role keys, adding CI checks for required vars.【F:apps/web/src/lib/server/rate-limiter.ts†L1-L53】【F:turbo.json†L5-L25】 | Eliminates fallback secrets and build-time crashes; increases security posture. | Document env vars in `.env.example`; extend lint script to fail on missing keys. | PLAT |
| Audit Supabase migrations, add verification script to ensure conditional statements succeed post-deploy.【F:supabase/migrations/20250901_backfill_product_slugs.sql†L1-L120】【F:supabase/migrations/20250910_add_messaging_rpcs.sql†L1-L120】 | Avoid silent schema drift and ensure generated types stay accurate. | Supabase CLI installed; staging database snapshot available. | BE |

## Phase 2 – Consolidate Domain Logic (Weeks 2-3)
| Goal | Impact | Prerequisites | Owners |
| --- | --- | --- | --- |
| Extract `apps/web/src/lib/services`, stripe/email logic into `@repo/core` (or new `@repo/domain`) per roadmap.【F:ROADMAP.md†L44-L58】【F:apps/web/src/lib/stripe/server.ts†L1-L19】 | Centralizes business logic for reuse across admin/docs, simplifies testing. | Phase 1 complete; shared package structure documented.【F:packages/core/package.json†L35-L41】 | FE + BE |
| Split `@repo/ui` into pure design tokens/primitives vs application composites; remove service modules from UI package.【F:packages/ui/package.json†L11-L88】【F:packages/ui/src/lib/services/CategoryNavigationService.ts†L1-L74】 | Improves bundle size and enforces separation of concerns. | Confirm consuming apps can migrate imports; create migration guide. | FE |
| Refine service-role usage by lazy-loading clients and introducing audit logging for privileged operations.【F:apps/web/src/lib/server/supabase.server.ts†L1-L32】【F:supabase/functions/send-message/index.ts†L66-L176】 | Reduces risk of accidental RLS bypass and improves observability. | Phase 1 env validation; logging pipeline defined. | BE + PLAT |

## Phase 3 – Testing & Quality Automation (Weeks 3-4)
| Goal | Impact | Prerequisites | Owners |
| --- | --- | --- | --- |
| Remove `--passWithNoTests`, enforce coverage thresholds in Vitest config, and gate via Turbo pipeline.【F:apps/web/package.json†L6-L18】【F:packages/ui/package.json†L11-L23】【F:TESTING.md†L21-L48】 | Ensures regressions trigger failures; aligns practice with documented policy. | Shared testing utilities stabilized; CI ready for coverage uploads. | QA + FE |
| Build shared Playwright fixture package in `@repo/testing` with Supabase seeding utilities for deterministic E2E flows.【F:packages/testing/package.json†L1-L36】【F:supabase/migrations/20250910_add_messaging_rpcs.sql†L1-L120】 | Reduces flakiness, makes cross-app E2E tests easier to maintain. | Supabase CLI automation from Phase 1; database snapshots accessible. | QA + BE |
| Introduce admin app smoke tests and docs visual regression checks to cover currently untested apps.【F:apps/admin/package.json†L9-L33】【F:apps/docs/package.json†L9-L44】 | Raises baseline coverage, preventing regressions in secondary surfaces. | Shared Playwright setup delivered; Tailwind 4 build fixed (Phase 4 dependency). | QA + FE |

## Phase 4 – Performance, Observability, and Compliance (Weeks 4-6)
| Goal | Impact | Prerequisites | Owners |
| --- | --- | --- | --- |
| Update Vercel CSP to include analytics domains and ensure locale headers match i18n detection logic.【F:vercel.json†L1-L128】【F:apps/web/src/lib/locale/detection.ts†L1-L107】 | Prevent blocked analytics and align SEO/localization behavior across regions. | Domain logic refactor (Phase 2) to avoid duplicated detection logic. | PLAT + FE |
| Replace in-memory rate limiting (edge function + server) with durable storage (e.g., Redis, Upstash) and telemetry.【F:supabase/functions/send-message/index.ts†L1-L200】【F:apps/web/src/lib/server/rate-limiter.ts†L1-L53】 | Ensures consistent throttling in multi-instance deployments; adds monitoring. | Infrastructure selection (Redis/KV) approved; env validation from Phase 1. | BE + PLAT |
| Integrate Sentry health checks and logging pipeline using structured logger outputs for production monitoring.【F:apps/web/src/lib/server/sentry-config.ts†L1-L140】【F:apps/web/src/lib/utils/log.ts†L1-L140】 | Improves ability to trace incidents and correlate logs with Sentry issues. | Logging destinations defined (e.g., Vercel Log Drains). | PLAT |

## Ongoing Tasks (Parallel)
- Keep documentation (README/ARCHITECTURE/DEVELOPMENT) updated as ownership and package boundaries change.【F:README.md†L1-L120】【F:ARCHITECTURE.md†L1-L120】
- Maintain Supabase migrations hygiene with code reviews focused on security (RLS, service role usage).【F:supabase/migrations/20250901_backfill_product_slugs.sql†L1-L120】
- Track progress against existing backlog items in `ROADMAP.md`, updating statuses as phases complete.【F:ROADMAP.md†L1-L90】
