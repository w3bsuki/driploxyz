# Operations & Release

How we run the app across environments with safety and confidence.

## 1) Environments

- Local: `.env.local`; fast iteration; local Supabase or remote project with safe data.
- Preview: per‑PR deploy with isolated URL; seeded test data.
- Production: protected branch; controlled secrets; observability enabled.

## 2) Secrets & Config

- Required envs (per app):
  - Supabase: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server‑only)
  - Stripe: `PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Sentry: `PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
  - Email: `RESEND_API_KEY`
  - Site: `PUBLIC_BASE_URL`
  - i18n: configured via Paraglide project in `packages/i18n`
- Use platform secret manager (e.g., Vercel) and never commit `.env` with secrets.

## 3) Database & Migrations

- Apply migrations via Supabase CLI; versioned in `migrations/`.
- RLS policies reviewed with each table change; keep `SUPABASE_POLICIES.sql` current.
- Generate types post‑migration and commit.

## 4) CI/CD Pipeline

- Steps: install → typecheck → lint → test → build → preview deploy.
- Block merge if type/lint/tests fail; production deploy only from `main`.
- Run Playwright E2E against preview; gate production on pass.

## 5) Release QA Gates

- Types: `pnpm -w turbo run check-types` passes across workspace.
- Lint: `pnpm -w turbo run lint` passes, zero warnings on changed files.
- Tests: Unit + component tests pass; Playwright smokes (auth, list, buy, message) pass on preview.
- Performance: Lighthouse mobile p75 ≥ 90; LCP p75 ≤ 1.5s; no CLS regressions.
- A11y: No critical issues on key pages (home, product, search, checkout).
- Security: RLS verified; all mutations behind CSRF protection and rate limits; no service keys in client bundles.

## 5) Monitoring & Alerts

- Error tracking configured for server and client; alert on spikes.
- Basic performance telemetry (TTFB, LCP, API latency) with budgets.

## 6) Release Process

- Version using Conventional Commits + auto‑changelog.
- Pre‑release checks: a11y, Lighthouse, E2E pass, smoke of critical paths.
- Feature flags for risky features with gradual rollout.

Checklist snapshot (from PRODUCTION_PUSH.md):
- Zero TypeScript errors; no `console.log` or TODOs in production code.
- Images lazy loaded; code split critical routes; bundle ≤ 200KB initial.
- Reviews system active or feature‑flagged; payouts flow verified; Stripe keys live.

## 7) Incident Response

- Rollback plan: redeploy last good build; DB change rollback/migrations down if safe.
- Post‑mortem template with action items and owners.

## 8) Backups & Data

- Daily automated DB backups; verify restore quarterly.
- Storage bucket lifecycle rules (if used) for cost control.
