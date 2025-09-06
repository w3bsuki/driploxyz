# Driplo Production Plan: Auth, Cookies, Paraglide (i18n)

## Executive Summary
- Goal: Make authentication, cookie management (GDPR), and Paraglide-based i18n fully production-ready across `apps/web` and `apps/admin`.
- Scope: Standardize Supabase auth, harden CSRF + session flows, finalize consent-driven cookies, and consolidate Paraglide/i18n usage.
- Outcome: Consistent hooks, safer defaults, audited cookies, predictable locale behavior, and clear tests, docs, and monitoring.

## Guiding Principles
- Security-first defaults (least privilege, secure cookies, strict CSRF, CSP).
- Single sources of truth (shared packages for auth, cookies, i18n types).
- SSR correctness and client parity (no locale/cookie flicker, no hydration mismatch).
- Observability and operability (structured logs, metrics, SLOs, runbooks).

## Current Snapshot (from repo)
- Auth: Supabase SSR client used in `apps/web` via `lib/server/supabase-hooks.ts` with `flowType: 'pkce'`; admin app uses stricter `hooks.server.ts` with IP + role checks.
- Cookies: Centralized manager in `apps/web/src/lib/cookies/production-cookie-system.ts` with GDPR categories and consent gating; locale cookie `PARAGLIDE_LOCALE` used.
- CSRF: HMAC-SHA256 scheme in `lib/server/csrf.ts` with secure cookie options and timing-safe compare.
- Paraglide: `packages/i18n` exposes Paraglide runtime and `generated-messages.js`; locales are `en` and `bg`; `apps/web/lib/server/i18n.ts` integrates cookie + path detection and sets `<html lang>`.

---

## Auth: Refactors & Hardening

### Objectives
- Unify Supabase session handling across apps, minimize duplicate logic, and enforce consistent cookie options.
- Ensure CSRF coverage for all state-changing endpoints and forms.
- Provide clear, typed `locals` and shared helpers to reduce drift.

### Refactors
- Shared package: create `packages/core-auth` (or `@repo/auth`).
  - Expose: `createSupabaseServerClient(cookies, fetch)`, `safeGetSession(event)`, `authGuard({ routes, timeouts })`.
  - Provide types for `App.Locals` additions (session, user, safeGetSession).
- Consolidate hooks ordering (web): keep sequence `localeRedirect -> supabase -> i18n -> authGuard` and export from shared helper.
- Align admin and web cookie handling in Supabase clients: always set `path: '/'`, `secure: !dev`, `sameSite: 'lax'`.
- Session caching: keep single-request cache for `safeGetSession` (already present in web); port to admin.
- Auth guard policies:
  - Route patterns `(protected)` and `(admin)` enforced consistently.
  - Public routes use short timeout `Promise.race` pattern to avoid TTFB impact.
- Role and email checks (admin):
  - Keep triple-check (DB role + email whitelist + session valid).
  - Extract to shared helper `assertAdmin(event)` with structured error.
- Token refresh and logout:
  - Verify refresh rotation behavior with Supabase SSR client.
  - Centralize logout that clears non-essential cookies and session state.
- Rate limiting:
  - Add rate limiter for auth endpoints (login, password reset, OTP) using existing `lib/server/rate-limiter.ts` patterns.

### Security
- CSRF: mandate `CSRFProtection.check` for all POST/PUT/PATCH/DELETE actions and form handlers; add lightweight SvelteKit action wrapper to auto-check token.
- Headers: set `Cache-Control: no-store` on auth pages and callbacks; set `Permissions-Policy` (disable interest-cohort, etc.).
- Secrets: ensure `PUBLIC_` vs private env split; no secrets in client bundle.

### Acceptance Criteria
- All server routes mutate state only if `CSRFProtection.check` passes.
- `event.locals` has consistent types and properties in web and admin.
- Admin access rejects missing role or whitelist with 403 and logs redacted.
- Page TTFB for public routes unaffected by auth lookup (>95th < 300ms).

### Tasks
- Create `packages/core-auth` with shared helpers and types.
- Migrate web and admin hooks to use shared helpers.
- Add CSRF action wrapper and apply in forms/APIs.
- Add rate limit config for auth endpoints.
- Write docs and code examples in `docs/playbooks/auth.md`.

---

## Cookies: GDPR, Safety, Consistency

### Objectives
- Enforce consent-gated non-essential cookies; standardize cookie names/options; remove risky monkey patches.
- Provide SSR-safe helpers and tests for consent states.

### Refactors
- Shared package: create `packages/core-cookies` (or `@repo/cookies`).
  - Export `COOKIES`, `COOKIE_CATEGORIES`, `checkServerConsent`, and typed helpers.
  - Provide `setCookieSafe`, `deleteCookieEverywhere` SSR/client shims.
- Replace DOM monkey-patching in cookie manager:
  - Remove overriding `Element.prototype.appendChild`.
  - Prefer CSP with nonces + consent-controlled script loaders.
  - Provide `loadAnalyticsWithConsent()` and `loadMarketingWithConsent()` that check consent and inject scripts with a server-provided nonce.
- Cookie options policy:
  - Essential: `httpOnly: true` (where applicable), `secure: !dev`, `sameSite: 'lax'`, `path: '/'`, explicit `domain` for multi-subdomain.
  - Non-essential: `httpOnly: false`, `secure: !dev`, `sameSite: 'lax'`, `path: '/'`.
  - Size budget: keep under 4KB per cookie; avoid bloated JSON in consent cookie.
- Cleanup legacy cookies: keep list in one place; delete on boot in server hook.
- Admin session cookie `admin_last_activity`:
  - Keep `httpOnly: true`, `secure: !dev`, `sameSite: 'strict'`, `path: '/'`.

### Security
- CSP: add strict CSP with nonces for inline scripts; bind nonces into consent loaders.
- SameSite: keep `strict` where cross-site not needed; otherwise `lax`.
- Audit cookies in dev tool and CI: add script that asserts allowed cookie names/options in HTML responses.

### Acceptance Criteria
- No non-essential cookies set without consent; toggling consent deletes corresponding cookies.
- No DOM monkey-patching; scripts load via consent-aware loaders and CSP nonces.
- All cookies conform to policy; automated check passes in CI.

### Tasks
- Create `packages/core-cookies`; move constants and helpers from `apps/web` there.
- Implement consent-aware script loader API and remove prototype patching.
- Add server-rendered CSP with per-request nonce and utilities to attach to head.
- Add cookie policy tests (Playwright + server assertions).

---

## Paraglide (i18n): Consolidation & SSR

### Objectives
- Single source for locale detection/setting; no duplicate logic between web and packages.
- Ensure SSR and client use the same locale to avoid hydration mismatches.

### Refactors
- Shared i18n entry remains in `packages/i18n`; add server helpers:
  - `detectLocale({ path, query, cookie, header })` with ordered precedence.
  - `applyLocale(event, locale)` to set `event.locals.locale`, cookie (respecting consent), and HTML lang.
- Path mapping: current `/uk` → `en` mapping should live in a dedicated map. Expose `LOCALE_ALIASES = { uk: 'en' }` and use centrally.
- Cookie name: keep `PARAGLIDE_LOCALE`; ensure only set when functional consent is true.
- Generated files: ensure all Paraglide generated outputs are gitignored except public APIs; document regeneration commands.
- Link building: provide helper for locale-prefixed routes to avoid manual string ops.

### SSR & Client Parity
- In `hooks`: detect locale first by path, then query, then cookie, then `Accept-Language`; default to `bg` (as today).
- On client init: read cookie or use server-provided `event.locals.locale`; avoid extra flash by setting `<html lang>` on server and keeping it.

### Acceptance Criteria
- No mismatch of locale during hydration (verify via Playwright test that `<html lang>` is consistent server→client).
- Only `en` and `bg` locales used; aliases handled centrally.
- No duplicated i18n detection code across apps.

### Tasks
- Add `detectLocale` and `applyLocale` utilities to `packages/i18n`.
- Update `apps/web/lib/server/i18n.ts` to consume shared helpers and simplify.
- Add tests for precedence order and alias mapping.

---

## Cross-Cutting: Types, Env, Observability

### Types
- Define `App.Locals` in a shared `@repo/types` or `@repo/core-auth` with:
  - `supabase`, `safeGetSession(): Promise<{session; user}>`, `session`, `user`, `locale`, optional `ipAddress`, `isAdmin`, `adminUser`.
- Use module augmentation in both apps to apply these types.

### Environment
- Validate required envs at boot; error clearly if missing.
- Ensure no private secrets leak into client (`PUBLIC_` prefix policy).

### Observability
- Structured logs for auth events (login, signout, admin access) with minimal PII.
- Sentry scrubbing: redact access tokens, emails unless necessary; tag `locale`, `consent_state` (bool flags) for debugging.
- Metrics: counters for CSRF failures, admin denials, consent changes; histogram for auth duration.

---

## Test Plan

### Unit
- CSRF: token generation/validation, expiration, timing-safe compare.
- Locale detection: precedence and alias mapping.
- Cookie helpers: server/client setters, option policies, cleanup behavior.

### Integration (SvelteKit)
- Auth guard: redirects for `(protected)` and `(admin)` routes; public route TTFB unaffected by auth timeout.
- Consent: toggling categories creates/deletes corresponding cookies; analytics/marketing not loaded without consent.
- SSR parity: `<html lang>` stable across navigation and reloads.

### E2E (Playwright)
- Login/logout flows with Supabase; session refresh behavior.
- Admin access: blocked when role missing; allowed when role set and email whitelisted.
- Consent banner interactions and persistence across tabs.

---

## Rollout Plan
- Phase 1 (Shared libs): extract `@repo/auth` and `@repo/cookies`, add types, wire web → shared.
- Phase 2 (Admin): migrate admin hooks to shared helpers; align cookie/session/CSRF handling.
- Phase 3 (Paraglide): move detection/apply helpers to `packages/i18n`; update web hooks.
- Phase 4 (Security): enable CSP with nonces; remove DOM monkey-patch; add automated cookie assertions in CI.
- Phase 5 (Tests & Docs): add tests; write runbooks; enable dashboards/alerts.

---

## Actionable Backlog (Refactor Tickets)
- Create `packages/core-auth` with `safeGetSession`, `createSupabaseServerClient`, `authGuard`, `assertAdmin`.
- Create `packages/core-cookies` with `COOKIES`, `COOKIE_CATEGORIES`, `checkServerConsent`, `setCookieSafe`, `deleteCookieEverywhere`.
- Add CSRF form/action wrapper and enforce across mutating routes.
- Replace script monkey-patching with consent-aware loaders + CSP nonces.
- Add `detectLocale`/`applyLocale` in `packages/i18n`; consume in web hooks.
- Standardize cookie options; enforce via utility; update admin `admin_last_activity` options.
- Add rate limiting to auth endpoints.
- Add CI step to assert no disallowed cookies are set in HTML responses.
- Add Playwright tests for auth, consent, and SSR i18n parity.

---

## Done Definition
- Security: CSRF enforced, secure cookies, CSP nonces, rate limits.
- Consistency: shared helpers in place; no duplicated auth/i18n/cookie logic.
- Compliance: consent gating works; analytics/marketing blocked without consent.
- Stability: SSR/client locale parity; no hydration warnings.
- Observability: Sentry scrubbing, auth/consent metrics and logs available.

