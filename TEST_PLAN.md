# Test Plan — Driplo Monorepo

Owner: Engineering • Applies to: `apps/web`, `apps/admin` (if kept), `apps/docs`, `packages/*`

## Goals

- Catch regressions on critical flows (auth, listing CRUD, checkout, dashboard) with minimal flake.
- Enforce performance and accessibility budgets on key pages.
- Validate security boundaries: cookies, CSRF, RLS, webhook signatures.
- Keep tests fast locally; run an extended matrix in CI.

## Non‑Goals

- Full end‑to‑end payment against live Stripe.
- Broad UI snapshot coverage beyond key routes/components.

## Test Matrix

- Unit (Vitest)
  - Scope: pure functions, stores, helpers (`apps/web/src/lib/**`, `packages/*`).
  - Examples: cookie parse/serialize, fee calculations, locale detection, query builders.
  - Target: 70%+ statements in touched areas; sub‑second per file.

- Integration (Vitest/Playwright hybrid)
  - Scope: SvelteKit load/actions with mocked external services (Supabase, Stripe, Resend).
  - Examples: signup/login actions, listing create/update/delete with fake storage, favorites toggle, message composer validation.
  - Target: exercise success + common failure paths; run headless.

- Contract Tests
  - Supabase: verify RLS with a test anon key; CRUD happy paths for `profiles`, `products`, `favorites`; forbidden paths for unauthorized roles.
  - Stripe: webhook signature verification and event mapping using recorded fixtures; no network.
  - Resend: email payload schema validated against a stub transport.

- E2E (Playwright)
  - Smoke set: home → login → dashboard visit; listing create → appears on home; checkout happy path up to mocked payment confirmation.
  - Full set: include favorites, messages, onboarding, admin table views (if admin kept).
  - Flake control: `retries: 2`, `fullyParallel: true` for non‑stateful specs.

- Accessibility (Playwright + axe)
  - Pages: home, product detail, checkout page, dashboard home, admin index.
  - Criteria: no critical violations; document whitelisted known issues.

- Visual Regression (Playwright snapshots)
  - Targets: header/navbar, product card, product detail hero, checkout summary, key modals (login, quick view).
  - Baseline: store minimal snapshots; review diffs in PRs.

- Performance (Lighthouse CI)
  - Pages: home (`/`), product detail (`/product/[id]`), checkout (`/checkout/[productId]`), dashboard (`/dashboard`).
  - Budgets (mobile): LCP < 2.5s, TTI < 3.5s, total JS < 200KB, CLS < 0.1.

- Security Checks (Static + Dynamic)
  - Static: ensure CSRF middleware present on unsafe methods; cookie flags (`HttpOnly`, `Secure`, `SameSite`); CSP/HSTS headers configured.
  - Dynamic: exercise CSRF token rotation; reject missing/invalid Stripe webhooks; verify CORS for API routes.

## Tooling & Configuration

- Unit/Integration: Vitest 3.x, environment `jsdom` for component/store tests; `node` for server utilities.
- E2E/Accessibility/Visual: Playwright 1.55.x; `@axe-core/playwright` for a11y.
- Performance: Lighthouse CI with `.lighthouserc.json` budgets.
- Monorepo: run via Turborepo pipelines or `pnpm --filter` per app.

## How To Run (Local)

- All tests: `pnpm test`
- Web app unit: `pnpm --filter web test:unit`
- Web app integration (Playwright): `pnpm --filter web test:integration`
- E2E smoke only: `pnpm --filter web test:e2e -- --grep @smoke`
- A11y: `pnpm --filter web test:a11y`
- Visual: `pnpm --filter web test:visual`
- Coverage: `pnpm --filter web test:coverage`

Tagging guideline: mark critical specs with `@smoke`; larger journeys without tag.

## How To Run (CI)

Stages (suggested):

1) Setup
- `pnpm install --frozen-lockfile`
- Generate Supabase types if needed: `pnpm db:types` (CI only)

2) Static Analysis
- `pnpm check-types`
- `pnpm lint`

3) Unit + Integration
- `pnpm --filter web test:unit`
- `pnpm --filter web test:integration`
- Optional: run `packages/*` unit tests if present

4) E2E Smoke
- `pnpm --filter web test:e2e -- --grep @smoke`
- Upload Playwright report as artifact

5) Accessibility + Visual (optional on main)
- `pnpm --filter web test:a11y`
- `pnpm --filter web test:visual`

6) Performance Budgets
- `pnpm analyze` or dedicated LHCI step using `.lighthouserc.json`

Artifacts: `playwright-report/`, `test-results/`, coverage reports, Lighthouse results.

## Test Data & Environments

- Supabase: use a test project or local instance; seed via `migrations/`.
- Storage: use a test bucket; avoid public writes; mock in unit/integration.
- Stripe: use test keys; intercept network in Playwright; webhook tests use static fixtures.
- Resend: use a no‑op/stub transport in non‑prod.

## Coverage Targets

- Unit + Integration: ≥70% statements for changed areas; do not gate the whole repo initially.
- E2E: cover at least one happy path per critical flow.

## Flake & Stability

- Retries: 2 for E2E only.
- Timeouts: increase for image upload routes.
- CI parallelism: shard Playwright by file.

## Exit Criteria For “Production‑Ready”

- All smoke tests pass on every PR and on main.
- Budgets met on tracked pages; no critical a11y violations.
- Security checks in place; webhook signatures verified; RLS contract tests pass.

---

Update this plan as features/deletions land. Keep tests minimal, focused on high‑value flows.

