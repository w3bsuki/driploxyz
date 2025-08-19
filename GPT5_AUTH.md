# GPT5_AUTH.md

## Executive Summary
Auth is failing intermittently due to: duplicated Supabase client creation patterns, inconsistent session sourcing (hooks vs per-endpoint ad‑hoc clients), mixed redirect logic scattered across hooks/+layout/+page.server/+server endpoints, preview/prod env origin mismatch, and temporary workaround pages masking root causes. Superforms v2 itself is not the blocker; the integration & redirect lifecycle is. Migration to Lucia/Clerk would not auto-fix current architectural issues (they would reappear as race conditions / double handling) but could add maintenance overhead. Fix order matters.

## Root Cause Categories
1. Environment & Origin Inconsistency
- Reliance on PUBLIC_SITE_URL sometimes, raw url.origin other times, and custom getSiteURL util elsewhere.
- auth callback email redirect uses `${redirectOrigin}/auth/callback?next=/onboarding` (signup) but other flows may use different heuristics; risk of mixing preview/prod.
- Missing centralized helper actually used everywhere (getSiteURL exists but not used in signup/login/resend).

2. Duplicated Supabase Client Instantiation
- hooks.server.ts attaches event.locals.supabase + safeGetSession.
- Additional server clients created ad-hoc in: `api/auth/login`, `api/auth/signup`, `lib/server/auth.ts`, `lib/supabase/server.ts`, `lib/server/supabase.server.ts`, Stripe webhook, etc.
- Risk: multiple sets of auth cookies / inconsistent cookie serialization order or missing global fetch leading to Vercel edge vs node divergence.

3. Overlapping Auth Logic Layers
- hooks.server.ts sets session & guards protected routes.
- +layout.server.ts re-fetches profile and may redirect to /onboarding.
- (auth) +layout.server.ts also redirects authenticated users away from auth pages.
- auth callback (+server) also creates profile logic & onboarding redirect.
- Result: Multiple places can redirect; increases chance of race / double redirect or losing message state from Superforms (since message() expects no redirect in action handler but UI performs manual client redirect after delay).

4. Mixed Post-Auth UX Patterns
- login action returns message(form,{...}) and relies on client-side onUpdated to navigate after timeout instead of server redirect (303). This deviates from signup pattern (also message) and standard SvelteKit action semantics (redirect from action keeps history clean & avoids stale form states).
- temp login page uses traditional throw redirect pattern immediately.

5. Superforms Integration Issues
- Using message() with delayed client redirect means user relies on JS. If JS/hydration fails (common on preview when env mismatch) user stays on page with cookies set but layout not refreshed -> perceived “stuck login”.
- signup/login actions do not invalidate `supabase:auth` dependency manually after success; rely on navigation reload via window.location.

6. Profile Creation Duplication
- Signup action inserts profile; auth callback also may insert; API endpoints also insert; risk of 23505 duplicates handled inconsistently.
- Divergent logic between password and magic/OAuth flows.

7. Multiple Code Paths For Same Operation
- Password login: (auth)/login action OR /api/auth/login.
- Signup: (auth)/signup action OR /api/auth/signup.
- Each returns different JSON / form semantics.
- Harder to test; devs fix one path while production uses another.

8. Missing Central Error Mapping
- Each action maps Supabase errors separately; inconsistent user messaging.

9. CSRF Temporarily Disabled
- Commented-out CSRF layer in hooks. Reliant solely on Superforms built-in protection for forms; API endpoints (JSON) currently unprotected.

10. Potential Cookie Serialization Issues
- createServerClient in hooks passes cookies.set with path: '/', then spreads options. Other helper files set options then path (order differences). Need single canonical pattern.

11. Unscoped Public vs Protected Route Rules
- authGuard only protects routes under /(protected). Other sensitive routes (dashboard, profile editing) rely on manual checks or none.

12. Lack of Integration Tests For Critical Paths
- No Playwright tests hitting login/signup with assertions on cookie presence, redirect chain, onboarding gating.

## Symptoms You Likely Observed
- Login sometimes “works” (session cookie set) but UI not reflecting until manual refresh.
- Preview deploy email links redirect to prod or vice versa.
- Occasional 500 on auth pages when env vars missing in preview.
- Duplicate profile rows attempted (constraint errors in logs).
- Inconsistent redirect after signup vs login vs OAuth callback.

## Superforms v2 Suitability
Superforms v2 is fine for form validation + progressive enhancement. It is not an auth provider. Problems stem from:
- Not using server redirects in actions for success.
- Mixing JSON APIs & form actions without a shared service.
- Not invalidating data dependencies (`depends('supabase:auth')`).
Lucia/Clerk would still require consistent redirect & session propagation. Switch only if you need advanced features (WebAuthn, multi-region session revocation, built-in orgs) AND after stabilizing architecture.

## Recommended Fix Order (P0 -> P2)
P0 (Stabilize):
1. Single Server Client Source: Use hooks.server.ts only. Remove / refactor api/auth/* endpoints to wrap the same internal functions or delete if unused.
2. Canonical Origin Helper: Use getSiteURL() everywhere (signup, resend-verification, OAuth) & ensure PUBLIC_SITE_URL set in prod + preview. Remove ad-hoc PUBLIC_SITE_URL || url.origin logic.
3. Server Redirect On Success: In login/signup actions, after successful auth (data.session present) throw redirect(303, target) instead of message()+client-side timeout. For email verification signup keep success message but still redirect to /verify-email page that shows message.
4. Profile Creation Centralized: Only in signup (password/email) and in callback for OAuth/magic link if missing. Extract createProfileIfMissing(user) utility; ensure idempotent (insert ignoring duplicate, or upsert).
5. Remove login-temp once stabilized.
6. Add /api/debug/auth use only in dev; guard behind dev check or feature flag.
7. Re-enable CSRF: reinstate csrfProtection handle for non-form JSON POST (/api/**) with origin check & token.

P1 (Consolidate & Simplify):
1. Deduplicate helper files (lib/server/auth.ts, lib/supabase/server.ts, lib/server/supabase.server.ts) into one `lib/server/supabase.ts`.
2. Unify error mapping in a shared `mapAuthError(error)` utility.
3. Collapse actions & API endpoints: prefer form actions for browser flows; keep API only for XHR/mobile clients—point both to shared service functions.
4. Extract onboarding redirect logic solely to +layout.server (post-auth). Remove duplicate checks from callback.
5. Replace manual message success with flash (cookie) or query flag (?signup=success) displayed by page; avoids holding form state.

P2 (Hardening):
1. Add Playwright tests: signup -> verification link simulation (bypass via service role to mark confirmed), login -> dashboard, unauthorized access to protected route.
2. Add rate limiting (authLimiter) back after syntax fix.
3. Implement structured logging toggle (debug vs prod minimal) for auth flows.
4. Implement refresh token rotation monitoring (log when session.expires_at < now + 5m and a refresh occurs).
5. Expand CSRF to include double-submit cookie + custom header for JSON APIs.

## Concrete Code Changes (High Level)
- hooks.server.ts: Export createServerClient logic only; add csrfProtection & rateLimiter back once tested. Provide event.locals.auth = { getSession: safeGetSession, require() }.
- (auth)/login +page.server.ts: Replace message() usage with redirect(303,'/'); On invalid -> fail(400,{form}).
- (auth)/signup +page.server.ts: After signUp success -> redirect to /verify-email?email=... Keep email redirect path construction via getAuthRedirectURL('/auth/callback?next=/onboarding').
- auth/callback: Remove profile creation duplication; call createProfileIfMissing(); centralize logic.
- Remove server creation duplicates & export a shared function from lib/server/supabase.ts; delete unused files.

## Example Refactor Snippets (Pseudo)
// login action success
if (data.session) {
  throw redirect(303, '/');
}

// signup redirect
if (data.user && !error) {
  throw redirect(303, `/verify-email?email=${encodeURIComponent(email)}`);
}

// createProfileIfMissing
export async function createProfileIfMissing(supabase, user) {
  const { data, error } = await supabase.from('profiles').select('id').eq('id', user.id).single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) {
    await supabase.from('profiles').insert({ id: user.id, username: `user_${user.id.slice(0,8)}`, onboarding_completed: false });
  }
}

## Keep Or Switch? (Lucia / Clerk)
Stay on Supabase now because:
- You already use Supabase DB, storage, RLS, profiles table.
- Migration cost high (rewrite hooks, session mgmt, RLS integration via JWT claims). Lucia offers flexibility but you must own email flows & security. Clerk adds monthly cost and vendor lock.
Switch only if you explicitly need: enterprise SSO, built-in MFA, polished org management, or want to decouple auth infra fully.

## Fast Triage Checklist (Do This Today)
[ ] Set PUBLIC_SUPABASE_URL & PUBLIC_SUPABASE_ANON_KEY in all Vercel envs (Preview, Production) + PUBLIC_SITE_URL
[ ] Hit /api/health & /api/debug/auth on preview & prod; confirm cookies, session present
[ ] Refactor login/signup to redirect on success
[ ] Remove login-temp and test /login fresh session
[ ] Verify auth/callback sets session and redirects appropriately (test with manual code param)
[ ] Confirm profile fetch only in root +layout.server
[ ] Re-enable CSRF with origin check (after above stable)

## Observability Additions
- Structured log prefix [AUTH] with context: flow=login/signup, step=call/exchange/profile.
- Add /api/debug/auth output field for cookie domain, path, SameSite.
- Optionally capture Supabase network errors (fetch wrapper logging).

## Testing Strategy Outline
1. Unit: mapAuthError, createProfileIfMissing.
2. Integration (Playwright): password signup (shows verify page), simulate verification (direct DB update), login -> sees dashboard, unauthorized protected route -> redirect to /login.
3. Edge: preview deployment domain mismatch detection (compare location.origin vs getSiteURL()).

## Final Answer To "WTF is going on"
Not Supabase itself; layering & duplication caused inconsistent session visibility and redirect timing. By collapsing to one client, using canonical origin, performing server redirects, and centralizing profile logic, auth stabilizes. Superforms remains suitable once you stop using client-delayed redirects.

---
Ping me when ready and I can generate exact diff patches for P0.
