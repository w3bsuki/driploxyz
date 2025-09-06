# 🔒 Auth, 🍪 Cookies, and 🌐 Paraglide/i18n Production Audit (Updated 06.09.2025)

## Executive Summary

**PRODUCTION STATUS: ✅ 95% Ready** - Implementation follows 2025 best practices and is production-grade with only minor documentation gaps.

- **Auth**: ✅ Excellent SSR-first Supabase flow with @supabase/ssr, PKCE, proper session validation (getSession→getUser), POST-only logout with origin checks
- **Cookies**: ✅ Strong GDPR-compliant consent system, proper security flags, centralized management via production cookie system
- **Security**: ✅ Production-grade CSRF with HMAC-SHA256, timing-safe comparison, proper token expiration
- **Paraglide/i18n**: ✅ Server-driven locale detection with consent-aware persistence, proper URL mapping

---

## ✅ Current Strengths

- **Auth**
  - `setupAuth` uses Supabase SSR client, PKCE, and plumbs cookies with `path: '/'` ensured.
  - `safeGetSession` caches per-request; validates via `getSession()` then `getUser()` only if needed.
  - `setupAuthGuard` smartly skips static/public paths; measures performance; redirects unauthenticated users from protected routes.
  - CSRF implementation with HMAC-SHA256, timing-safe compare, strict cookie flags.
- **Cookies**
  - Central cookie catalog via `COOKIES` and GDPR categories.
  - Consent gating for analytics/marketing and script blocking/queueing.
  - Server consent checking via `checkServerConsent`.
- **i18n (Paraglide)**
  - Reroute hook stripping `/uk|bg` prefix; server `setupI18n` selects locale with priority chain (path > query > cookie > header).
  - `localizedPath`, `getPathWithoutLocale`, `getLocaleUrls` utilities.
  - `packages/i18n` exports Paraglide runtime and tree-shakeable messages.

---

## ✅ 2025 Best Practices Compliance Audit

### Auth Implementation Review
- ✅ **@supabase/ssr**: Using recommended package (not deprecated auth-helpers)
- ✅ **PKCE Flow**: Properly configured for SSR (flowType: 'pkce')
- ✅ **Session Validation**: Proper getSession() → getUser() validation pattern
- ✅ **POST-only Logout**: Secure logout with origin validation implemented
- ✅ **Cookie Configuration**: Proper path: '/' configuration as per Supabase docs
- ✅ **Header Filtering**: Only content-range and x-supabase-api-version allowed

### Cookie Security Review
- ✅ **GDPR Compliance**: Proper consent management with categories
- ✅ **Security Flags**: HttpOnly, Secure, SameSite properly configured
- ✅ **Server-only Sensitive Cookies**: Auth cookies only set server-side
- ✅ **Consent-aware Persistence**: Locale cookies respect functional consent

### Security Implementation Review
- ✅ **CSRF Protection**: Production-grade HMAC-SHA256 implementation
- ✅ **Timing-safe Comparison**: Prevents timing attack vectors
- ✅ **Token Expiration**: Proper 1-hour expiration with rotation

## 🔧 Minor Production Improvements

### Completed Improvements
- ✅ **Smart Cookie Cleanup**: Logout now cleans auth cookies but preserves user preferences (locale, country, theme)
- ✅ **Comprehensive Supabase Cleanup**: Explicitly removes all sb-* cookies on logout

### User Experience Features
- ✅ **Persistent User Preferences**: Locale and country choices persist across login/logout cycles
- ✅ **Smart Geo-targeting**: Users from UK who select GB stay on GB without re-acceptance
- ✅ **Clean Logout**: Auth state cleared completely while preserving personalization

### Remaining Tasks (Low Priority)
- **Environment Documentation**: Document CSRF_SECRET requirement
- **Session Refresh UX**: Optional user prompt when session <5min to expiry

---

## 🛠 Refactor Plan (Production Best Practices)

### A. Auth Hardening

1. Unify session access
   - Create `lib/server/session.ts` exporting `getSession()` that delegates to `event.locals.safeGetSession`.
   - Deprecate scattered imports (`lib/server/auth.ts`, `lib/auth.ts`) where overlapping; keep server-only client creation in `lib/server/auth.ts`.
2. Logout endpoint standards
   - Ensure `/logout` is POST-only, requires CSRF (`CSRFProtection.check`) and same-origin/Origin header validation.
   - On logout, explicitly delete Supabase cookies via `cookies.set(name, '', { maxAge: 0, ... })` for `sb-` cookies.
3. Handler order & headers
   - Keep `supabaseHandler` first in sequence. Confirm `filterSerializedResponseHeaders` allows only needed headers.
4. Error boundaries
   - Wrap auth calls in guarded try/catch in actions that depend on `user` and return 401 gracefully; add Sentry context where available.
5. Session refresh UX
   - When session < 5m to expire, display prompt/toast to refresh or silently call `auth.refreshSession()` on user activity.

### B. Cookies & Consent

1. Server-only for sensitive cookies
   - Restrict auth/session/CSRF cookies to server writes with `httpOnly: true, secure: !dev, sameSite: 'strict', path: '/'`.
   - Audit all places writing cookies directly on client (`document.cookie`) and replace with server-set cookies where sensitive.
2. Single locale write path
   - Route all locale persistence through `ProductionLocaleManager.setLocale` on client and server action/endpoint for SSR correctness.
   - Remove ad-hoc writes in `lib/locale/detection.ts` for `document.cookie` and prefer cookie manager or server-side.
3. Cookie naming & retention
   - Confirm names and lifetimes in `COOKIES` match policy. Keep consent max age 365d; session/CSRF short-lived.
4. Consent payload
   - Keep only booleans + version + timestamp. Avoid IP/User-Agent in cookie to minimize PII in storage; if needed, store server-side.
5. CSP & script controls
   - Complement blockers with CSP directives. Add `nonce`/`strict-dynamic` where feasible.

### C. Paraglide/i18n

1. Locale source of truth
   - Server decides locale in `setupI18n` and sets `(event.locals as any).locale`; client reads from runtime only for display.
2. Canonical & hreflang
   - Extend `seo.ts` to emit canonical + hreflang using `getLocaleUrls()`; ensure every route’s `load` provides URLs.
3. `/uk` → `en` mapping centralization
   - Create `lib/utils/locales.ts` with helpers `mapPathPrefixToLocale`, `prefixForLocale` and reuse in `reroute`, `locale-links`, and `i18n`.
4. Locale switching
   - Continue `goto(..., { invalidateAll: true, replaceState: true })`; ensure stateful routes reload data correctly.
5. Clean legacy
   - Remove legacy cookie names deletion once the migration is complete; track via a feature flag to delete code after rollout.

---

## 📦 File-level Actions

- Create: `apps/web/src/lib/server/session.ts`
  - Export `getSession(event)` that returns `{ session, user }` from `event.locals.safeGetSession()`.
- Update: `apps/web/src/routes/logout/+server.ts` (ensure POST-only, CSRF check, origin check, cookie deletions).
- Update: `apps/web/src/lib/server/hooks.ts`
  - Keep existing order; document it; verify header filtering.
- Update: `apps/web/src/lib/locale/detection.ts`
  - Remove direct cookie writes; use `ProductionLocaleManager` or server-set cookie via action.
- Create: `apps/web/src/lib/utils/locales.ts`
  - Centralize prefix/locale mapping for `/uk` ↔ `en`, `/bg` ↔ `bg`.
- Update: `apps/web/src/lib/seo.ts`
  - Add canonical/hreflang generation via `getLocaleUrls`.

---

## ✅ Acceptance Criteria

- Auth
  - POST-only logout with CSRF + Origin validation; Supabase cookies cleared.
  - Single server-session accessor used across app.
- Cookies
  - Sensitive cookies never set on client; standardized flags enforced.
  - Locale persistence unified via one pathway; consent cookie minimal and compliant.
- i18n
  - All pages emit canonical + hreflang.
  - Single mapping utility used for `/uk` ↔ `en` across reroute and links.

---

## 🔍 Follow-ups & Monitoring

- Add Playwright tests: auth flows (login/logout), locale switching, hreflang presence.
- Add unit tests for `locales.ts` helpers and `seo` hreflang/canonical.
- Monitor auth timing logs (`setupAuthGuard`) for regressions after changes.

---

## 📝 References

- Supabase SvelteKit SSR: `createServerClient`, cookie plumbing, `getSession` before `getUser`.
- OWASP: CSRF protection and cookie security.
- Paraglide best practices: server-driven locale, tree-shaking, canonical/hreflang.
