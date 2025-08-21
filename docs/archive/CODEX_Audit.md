# CODEX Production Audit and Refactor Plan

Date: 2025-08-21
Scope: Monorepo (apps/web, apps/docs, packages/ui, packages/i18n, packages/database), Supabase, Stripe, Vercel, Turbo/PNPM

## Executive Summary

- Objective: Finalize a production-grade release with a pragmatic, low-risk refactor that hardens security, stabilizes auth/payments, improves performance, cleans up DX, and establishes robust CI/CD, testing, and observability.
- Current Posture: Strong foundation (SvelteKit 2 + Svelte 5, Turborepo, Supabase, Stripe, Playwright/Vitest, i18n). Several production concerns remain: commented-out rate limiting and CSRF, missing CSP/HSTS, env hygiene, payment flow stability, auth edge cases, and gaps in logging, SLOs, and operational runbooks.
- Outcome: A phased plan with acceptance criteria, prioritized backlog, and checklists per domain to reach production-readiness without changing existing product scope.

## Architecture Snapshot (as-is)

- Frontend: apps/web (SvelteKit 2, Vite 7, Tailwind 4), apps/docs (SvelteKit docs/admin), packages/ui (component lib), packages/i18n (paraglide), packages/database (Supabase types).
- Backend: Supabase (Postgres, RLS policies, Storage), Stripe payments (server+client), Resend emails, Vercel deploy.
- Cross-cutting: Sentry integration (optional via DSN), cookie/consent manager, i18n with URL/cookie detection, service worker, Playwright/Vitest tests, Turbo pipeline.

Notable files
- apps/web/src/hooks.server.ts: auth/session bootstrap, env checks, Sentry, i18n, guards. Rate limiter and CSRF are scaffolded but disabled.
- apps/web/vercel.json: security headers present (X-CTO, X-Frame, XSS filter, Referrer-Policy) but no CSP/HSTS. Global cache headers configured for fonts and immutable assets.
- packages/database: generated Supabase types; SQL policies present in repository (migrations + SUPABASE_POLICIES.sql).

## Key Risks and Gaps

- Security
  - CSP and HSTS headers are absent in production config; no nonce/sha256 CSP for inline assets; no explicit CORS policy definition at edges.
  - Rate limiting and CSRF guards exist in code but are commented out; auth endpoints lack active throttling.
  - Env validation mixes PUBLIC and private keys validation logic; need explicit segregation and enforcement by deployment targets.
  - Secret handling not standardized across local/preview/prod; rotation/runbooks missing.
- Payments
  - Stripe flows previously unstable; need end-to-end test coverage for intents, webhooks, idempotency, and error taxonomy.
- Reliability/Perf
  - No SLO/SLA/SLI definitions; no synthetic monitoring or alerts tied to KPIs.
  - Chunking/build output optimized, but missing real RUM metrics, long task monitoring, TTFB/CLS/LCP budgets.
  - Service worker present; ensure versioning, offline route coverage, and cache invalidation policy documented.
- Auth & Session
  - JWT validation added, but edge-case handling for refresh/rotation, token clock skew, and cookie flags require a threat model review.
  - Protected route policy is path-based; verify admin/tenant boundaries.
- Data & Policies
  - Supabase RLS policies are present; require penetration tests for over-permissive access (especially storage buckets) and migration drift checks.
- Observability & Ops
  - Sentry optional init; lack of log/event correlation IDs, deploy markers, and release health.
  - No dashboards/runbooks for oncall or incident management.
- Testing & CI
  - Good test scaffolding; need coverage thresholds, smoke suites for payments/auth, and gating rules in CI. Visual/a11y tests exist; wire into PR checks and reports.

## Production Hardening Checklist

Security
- Add strict CSP with nonces/hashes; block inline by default and enumerate script/style sources. Enforce per-route headers if needed.
- Enable HSTS (includeSubDomains; preload once proven stable) and ensure redirects to HTTPS everywhere.
- Reinstate and test rate limiting (auth and API), including mobile and SSR contexts. Verify 429 UX and Retry-After headers.
- Reinstate CSRF for state-changing API routes; document exemptions (webhooks/health).
- Verify SameSite/secure/httpOnly settings for auth cookies across mobile and desktop; document exceptions and rationale.
- Define and enforce CORS policies (origins, methods, headers) for any public API endpoints.
- Secrets: define owner/rotation cadence, store in Vercel/Supabase vaults, remove accidental plaintext in repo. Add pre-commit secret scans.

Payments (Stripe)
- Create canonical payment intent flow with idempotency keys; document retry behavior and error taxonomy.
- Secure webhook endpoints with signatures and replay protection; add integration tests that simulate Stripe events.
- Reconcile order state transitions with payment events; define compensating actions and dead letter handling.
- Establish test data fixtures and seed flows for local and preview.

Auth & Session
- Validate refresh token flows (expiry, rotation, revocation) and error handling in SSR/CSR.
- Document protected route matrix and escalation paths (admin vs user). Add negative tests for unauthorized access.
- Strengthen email verification and password reset flows; rate-limit, add CAPTCHA where necessary.

Performance
- Define budgets (LCP < 2.5s, CLS < 0.1, TTFB < 0.8s under load) and wire Lighthouse CI with assertions.
- Add RUM (e.g., Sentry Performance/Replay) with PII scrubbing; enable Web Vitals capture.
- Revisit image pipeline (sharp, cache headers, next-gen formats, DPR variants). Confirm Tailwind JIT purge and tree-shaking.

Data & Migrations
- Establish migration workflow: dev → preview → prod with drift detection. Require approvals on destructive changes.
- Run RLS policy audit and add tests to enforce least-privilege (select/insert/update/delete).
- Storage buckets: verify path-based constraints; add lifecycle rules for orphaned assets.

Observability
- Sentry: required DSN in non-dev, release tracking, sourcemaps upload, trace sampling policy, PII scrubbing rules.
- Structured logging with correlation IDs; include request ID in responses and propagate to Sentry.
- Dashboards: availability, latency, error rate, checkout success, auth failures, web vital distributions.
- Alerts: on-call rotation, escalation policy, runbooks for incidents (payments down, auth outage, DB saturation).

CI/CD
- PR checks: typecheck, lint, unit, integration (smoke), e2e (critical path), a11y, visual diff (key pages), Lighthouse CI.
- Caching: turbo/PNPM caches in CI; artifacting of reports.
- Env: protected branches, required status checks, codeowners for sensitive areas (payments/auth/infra).

Compliance & Privacy
- GDPR: consent logs, DSR endpoints (export/delete), data retention policy, privacy policy alignment.
- PCI: scope payments via Stripe; avoid touching card data; validate webhook/storage scopes and least-privilege service accounts.

Documentation & Runbooks
- Security policy (threat model, secrets, rotation), operations (deploy, rollback), incident response, SLO docs.
- Developer onboarding: environment setup, seed data, test accounts, smoke scripts.

## Targeted Refactor Items (Codebase-aware)

- apps/web/vercel.json
  - Add Content-Security-Policy header with nonce or sha256 hashes (script-src, style-src, img-src, connect-src for Supabase/Stripe, frame-src for Stripe elements if embedded), base-uri, frame-ancestors, upgrade-insecure-requests.
  - Add Strict-Transport-Security (HSTS) and Permissions-Policy; remove deprecated X-XSS-Protection.
- apps/web/src/hooks.server.ts
  - Re-enable rate limiter and CSRF guards; parameterize thresholds and bypass lists. Add unit/integration tests for throttling and CSRF failures.
  - Split env validation: use $env/static/private for secrets and $env/static/public for PUBLIC_ keys where feasible; keep dynamic only where necessary for adapters.
  - Normalize mobile cookie path (documented exceptions) and add negative tests for cross-site contexts.
  - Ensure redirect logic for protected routes covers admin/tenant segments and avoids loops (test matrix).
- apps/web/src/lib/cookies/production-cookie-system.ts
  - Review global element appendChild override; ensure it doesn’t break legitimate script loaders. Prefer CSP-based enforcement + a consent-aware tag manager loader.
  - Add telemetry for consent changes and blocked resources for analytics.
- packages/database and migrations
  - Add automated RLS tests (can run via a lightweight Postgres+supabase-js in CI) ensuring only owners can mutate rows; test storage policy folder scoping.
  - Document migration strategy and rollback steps; integrate drift detection (e.g., Atlas or sqldef) if desired.
- Payments
  - Centralize Stripe client/server utils with idempotency, common error surface, and webhook signature validation; add Playwright smoke test for checkout.
- Tests
  - Stabilize Playwright fixtures for auth and payments; add a11y assertions on key flows; add visual snapshots for critical screens only to reduce noise.

## Phased Roadmap (with Acceptance Criteria)

Phase 0 — Readiness (1–2 days)
- Define SLOs and error budgets for: homepage availability, login success rate, checkout success rate, p95 TTFB.
- Confirm environment matrix and secrets in Vercel/Supabase; remove plaintext keys from repo; enable secret scanning in CI.
- Decision on CSP strategy (nonce vs hashes) and consent/CSP interaction.

Acceptance: SLOs documented; secrets validated; CSP approach approved.

Phase 1 — Security Baseline (2–4 days)
- Implement CSP, HSTS, Permissions-Policy in vercel.json; add integration test to verify headers.
- Re-enable rate limiting (auth + API) and CSRF; add tests for 429 and 403 cases.
- Tighten cookie flags across flows; document mobile exceptions; add regression tests.

Acceptance: Security headers verified in preview; rate/CSRF tests pass; cookies set correctly across SSR/CSR and mobile.

Phase 2 — Payments Stabilization (2–4 days)
- Implement idempotent payment intent creation; robust webhook handling with retries; reconcile order state.
- Add end-to-end checkout smoke (happy path) and error-path tests.

Acceptance: E2E checkout passes in CI; webhook replay test passes; no flakey payment tests across 3 runs.

Phase 3 — Auth Hardening (2–3 days)
- Validate refresh flows, token expiry, and revocation; improve error UX.
- Add CAPTCHA/rate limits to signup/login as required; finalize email verification UX.

Acceptance: Auth test matrix passes (signup/login/reset/refresh/expired/unauthorized access). No regressions in protected routes.

Phase 4 — Observability & Perf (2–3 days)
- Sentry: release health, sourcemaps, performance tracing, PII scrubbing, sample rates.
- Add Lighthouse CI and Web Vitals capture; enforce budgets.
- Service worker: versioning, offline paths, and cache invalidation policy double-checked and documented.

Acceptance: Dashboards live; alerts configured; budgets enforced in CI.

Phase 5 — Data & Policies (2–3 days)
- RLS and storage policy tests; migration workflow and rollback docs.
- Add lifecycle for orphaned assets; backfill scripts as needed.

Acceptance: RLS/storage tests pass; migration docs validated by a dry run.

Phase 6 — DX/Docs/Runbooks (1–2 days)
- Consolidate developer onboarding; add seed scripts and test accounts; document smoke commands.
- Publish security/ops runbooks and incident playbooks.

Acceptance: New dev can run dev+tests in <30 minutes; oncall can respond to a simulated incident in <15 minutes.

## CI/CD Blueprint

- PR pipeline (web only as minimal filter; expand as needed)
  - pnpm -v && node -v check; pnpm install with frozen lockfile
  - turbo run lint check-types test:unit
  - Playwright smoke (auth, product view, checkout happy path) with test retries=1
  - Lighthouse CI on key pages with assertions
  - a11y (axe) and minimal visual tests on landing and checkout
  - Upload artifacts: junit, coverage, lighthouse, playwright reports; annotate PR
- Branch protection: require all checks; codeowners for /apps/web/src/hooks.server.ts, payments, auth, vercel.json
- Preview deploys: attach environment and test reports; promote to prod only on green.

## Success Metrics

- Functional: 99.9% homepage availability; >99% login success; >98% checkout success; <1% payment webhook errors.
- Performance: p95 TTFB < 800ms; LCP < 2.5s on 4G; CLS < 0.1.
- Quality: Unit coverage >= 70% on core libs; smoke tests mandatory; 0 P0 security findings.
- Operational: MTTR < 30 min; alert fatigue index < 0.2 (alerts/actionable).

## Open Questions

- Payment model: one-time only or platform fees/Connect? If Connect, define account flows and KYC boundaries.
- Webhook hosting location (Vercel Functions vs Supabase Functions) and failure handling/observability standards.
- Consent + CSP product stance (analytics/marketing stack choices) and jurisdictions served (GDPR/CCPA/UK).
- Internationalization strategy for SEO (localized routes vs hreflang only) and content sources.

## Next Actions (Concrete)

- Approve CSP/HSTS header additions in apps/web/vercel.json and policy values.
- Re-enable rate limiting and CSRF in apps/web/src/hooks.server.ts; finalize thresholds and exemptions.
- Implement Stripe e2e smoke tests and webhook signature validation path; define idempotency strategy.
- Turn Sentry DSN mandatory in non-dev and wire releases/sourcemaps.
- Add CI checks for Lighthouse, a11y, and smoke; set minimal budgets.

When you’re ready, I can implement these in small, reviewable PRs starting with Security Baseline (Phase 1).

