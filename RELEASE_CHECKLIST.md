# Release Checklist — Driplo

Owner: Engineering • Applies to: `apps/web` (+ other apps if kept)

## 1) Scope & Freeze

- Confirm which surfaces are shipping: `apps/web` only, or include `apps/admin`/`apps/docs`.
- Merge de‑bloat tasks marked for this release in `codex_refactor.md`.
- Lock versions (pnpm lockfile up to date); no new features during freeze window.

## 2) Environment & Secrets

- Env sources
  - All secrets stored in platform (e.g., Vercel/Supabase/Stripe), not in repo.
  - `.env.example` updated and committed for each app.
- Required variables (sample)
  - `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only)
  - `PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `RESEND_API_KEY`
  - `SENTRY_DSN`/`PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- Rotation: verify last rotation date for Stripe and Sentry tokens.

## 3) Data & Migrations

- Review pending SQL in `migrations/` and `SUPABASE_POLICIES.sql`.
- Run migrations on staging; verify RLS policies for user and anon roles.
- Backup: take a DB snapshot before prod migration.
- Rollback plan: script to revert last migration or restore snapshot.

## 4) Build & Quality Gates (CI)

- Install: `pnpm install --frozen-lockfile`
- Types/Lint: `pnpm check-types` and `pnpm lint`
- Tests
  - Unit + Integration: `pnpm --filter web test:unit` and `test:integration`
  - E2E Smoke: `pnpm --filter web test:e2e -- --grep @smoke`
  - A11y: `pnpm --filter web test:a11y` (no critical violations)
  - Visual: `pnpm --filter web test:visual` (review diffs)
- Performance: Lighthouse budgets from `.lighthouserc.json` (mobile): LCP < 2.5s, TTI < 3.5s, JS < 200KB, CLS < 0.1.
- Artifacts: publish Playwright report and LHCI results.

## 5) Security

- Cookies: `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, scoped paths.
- CSRF: token generated and validated on unsafe methods; exempt safe methods only.
- Headers: CSP, HSTS, X‑Content‑Type‑Options, X‑Frame‑Options, Referrer‑Policy.
- Webhooks: Stripe signature verified; replay protection; 2xx only after DB commit.
- CORS: verify origins and methods on API routes.
- Supabase: confirm RLS enabled on all public tables; service key only server‑side.

## 6) Observability

- Sentry
  - DSNs configured for server/client as needed.
  - Release version set (e.g., git SHA); source maps upload only on prod CI builds.
  - Ignore noisy errors; keep PII out of events.
- Logging/Tracing
  - Minimal server logs; redact secrets.

## 7) Asset & Dep Hygiene

- Server‑only deps: ensure `sharp` is not bundled client‑side (imports only in `+server.ts`/server libs).
- Remove tracked artifacts: `dist/`, `.svelte-kit/`, `.turbo/`, `.vercel/`, `playwright-report/`, `test-results/`.
- Confirm Tailwind/PostCSS configs consistent across apps.

## 8) Deployment

- Adapter strategy consistent (e.g., Vercel). Remove `adapter-auto` if using `adapter-vercel`.
- Projects configured per app with correct env vars and regions.
- Run `pnpm build` and verify output size; confirm serverless/function limits respected.

## 9) Pre‑Flight Smoke (Prod‑like)

- Home page renders; no console errors.
- Auth: signup → email verification flow (test mode) → login → logout.
- Listing CRUD: create listing with images → appears on home/category → delete.
- Checkout: add to cart → mocked pay → shows in dashboard.
- Favorites and messages basic flows.
- Admin pages reachable (if applicable).

## 10) Rollout & Monitoring

- Gradual rollout (if supported) or deploy in off‑peak window.
- Monitor Sentry for new errors; track LCP/TTI; watch DB error rates.
- Error budget: define threshold to trigger rollback.

## 11) Rollback

- Code rollback: redeploy previous successful build.
- Data rollback: apply down migration or restore snapshot.
- Post‑mortem: capture root cause; update checklist/tests to prevent recurrence.

---

Use this checklist in every release PR. Link to PRs addressing items in `codex_refactor.md` and attach CI artifacts for test/perf gates.

