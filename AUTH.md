**Overview**
- **Goal:** Make Supabase auth stable with SvelteKit 2 + Svelte 5 SSR, fix signup/login/onboarding, and remove brittle patterns causing flakiness.
- **Scope:** Server hooks, route guards, cookie handling, auth pages, email verification callback, onboarding redirects, and minimal observability.

**Executive Summary**
- **Incorrect redirect handling:** Multiple try/catch blocks check `err instanceof redirect` which is never true at runtime, swallowing redirects and breaking flows.
- **Cookie adapter misuse:** `hooks.server.ts` forces `httpOnly: false` when setting Supabase cookies. This weakens security and destabilizes SSR sessions, especially across navigations and on mobile.
- **Duplicate client creation patterns:** A custom cookie adapter in `+layout.ts` is unnecessary and can conflict; stick to the standard SSR pattern.
- **Auth callback is OK but fragile:** Not resilient to missing `emailRedirectTo` and error cases; no resend endpoint for verification emails.
- **Onboarding redirect logic scattered:** Some logic is in `+layout.server.ts`, some in route groups. It works in principle but the swallow-on-redirect bug breaks it intermittently.
- **Logout only via POST:** Fine if wired to a `<form>`, but nothing references it yet.

**Key Files Audited**
- `apps/web/src/hooks.server.ts` — builds server Supabase client, installs auth guard, and Sentry handlers.
- `apps/web/src/routes/+layout.server.ts` and `+layout.ts` — loads session/profile, creates browser Supabase client.
- Route groups: `apps/web/src/routes/(auth)/*`, `(protected)/+layout.server.ts`.
- Auth flows: `(auth)/login`, `(auth)/signup`, `auth/callback/+server.ts`, `logout/+server.ts`, `(auth)/forgot-password`.
- Supabase client helpers: `apps/web/src/lib/supabase/{server.ts,client.ts}`.

**Root Causes**
- **Redirect swallow:** Using `if (err instanceof redirect) throw err` inside catch blocks breaks intended redirects. The `redirect` export is a function, not a class/constructor; this check never passes.
- **Cookie flags:** Overriding `httpOnly` to `false` on SSR cookies prevents secure, server-only session cookies and can lead to the browser owning auth state unexpectedly. It also increases XSS risk.
- **Over-customization in browser client:** Hand-rolling cookie get/set is unnecessary; `@supabase/ssr` + browser client works without custom cookie adapters.
- **Missing hardening on flows:** No protection against broken `emailRedirectTo`; no resend verification handler; onboarding and guarding logic compete in multiple places.

**Refactor Plan**

1) Fix SSR Cookie Handling (hooks.server.ts)
- Replace `cookies: { getAll/setAll }` with the standard `get/set/remove` adapter or keep `setAll` but do not override security flags.
- Remove `httpOnly: false`. Preserve Supabase-provided options (httpOnly, secure, sameSite, maxAge) and enforce `path: '/'`.
- Ensure cookies work on mobile by using `sameSite: 'lax'` (Supabase already defaults appropriately). Do not force `domain` unless required.

Snippet (preferred minimal change using setAll, keeping flags):

  cookies: {
    getAll: () => event.cookies.getAll(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        event.cookies.set(name, value, { path: '/', ...options });
      });
    }
  }

Or, switch to get/set/remove (official pattern):

  cookies: {
    get: (key) => event.cookies.get(key),
    set: (key, value, options) => event.cookies.set(key, value, { path: '/', ...options }),
    remove: (key, options) => event.cookies.delete(key, { path: '/', ...options })
  }

2) Stop Swallowing Redirects
- Remove try/catch around redirecting logic where not needed.
- If keeping try/catch, always rethrow unknowns; do not attempt `instanceof redirect` checks.

Good pattern:

  try {
    // logic that may throw redirect()
  } catch (e) {
    // Allow redirects/errors to propagate
    throw e;
  }

3) Simplify Browser Client Creation
- In `apps/web/src/routes/+layout.ts`, remove the custom `cookies` adapter. Use:

  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { global: { fetch } });

- Continue to expose `session` and `user` via the server load; rely on the server authoritative session.

4) Unify Supabase Client Helpers
- Use `$lib/supabase/server.ts` inside `hooks.server.ts` to create the server client, or consolidate hooks code into the helper to avoid drift.
- Keep service-role client confined to `.server` modules only (you already do this).

5) Route Guarding Strategy
- Keep the current `(protected)` group for clarity and retain the simple guard in `hooks.server.ts`.
- In the hook, read `event.route.id` and redirect unauthenticated requests targeting `(protected)` to `/login`.
- Do not catch/ignore the redirect in the hook.

6) Signup and Email Verification
- On signup, pass `emailRedirectTo: ${url.origin}/auth/callback?next=/onboarding` to ensure verification links land in your app and start a session via `exchangeCodeForSession`.
- Create `/api/auth/resend-verification` POST endpoint to support resending signup verification emails (used by `(auth)/verify-email`).
- In `auth/callback/+server.ts`, keep `exchangeCodeForSession(code)` and redirect to `next` (default `/`). If a profile doesn’t exist yet, create it here (best-effort) or rely on a DB trigger.

Resend endpoint (example):

  export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
    const { email } = await request.json().catch(() => ({}));
    if (!email) return json({ error: 'Email required' }, { status: 400 });
    const { error } = await supabase.auth.resend({ email, type: 'signup' });
    if (error) return json({ error: error.message }, { status: 400 });
    return json({ ok: true });
  };

7) Login and Logout
- Login flow in `(auth)/login/+page.server.ts` is fine; let Supabase set cookies server-side.
- Add an optional GET handler for `/logout` that renders a small form or handle both GET -> form and POST -> signOut to support link-based logout. Ensure UI calls POST form action.

8) Onboarding Redirects
- Keep onboarding check in `+layout.server.ts` (centralized, runs on every page). Remove try/catch or rethrow as above so redirects are not swallowed.
- Skip paths list looks good. Consider ensuring `/auth/*` and `/api/*` remain excluded.

9) Observability
- Keep Sentry but reduce noise: log errors in server hook only when not redirects.
- Add concise console logs behind a `dev` flag only for auth-critical steps during rollout, then remove.

10) Supabase Dashboard Settings
- Auth → URL config: set Site URL to your production URL and add `https://<domain>/auth/callback` (and your preview URLs) as Redirect URLs.
- Auth → Email templates: ensure “Confirm signup” links target your site URL (uses `emailRedirectTo`).
- Set “Enable PKCE” (default) and keep session storage in cookies (default).

**Concrete Change List (file by file)**

- `apps/web/src/hooks.server.ts`
  - Remove `httpOnly: false` from cookie `setAll`.
  - Optionally switch to `get/set/remove` adapter.
  - Remove try/catch inside `authGuard` (or rethrow).
  - Keep `event.locals.safeGetSession` as is.

- `apps/web/src/routes/+layout.ts`
  - Replace custom cookies adapter with `createBrowserClient(..., { global: { fetch } })` only.

- `apps/web/src/routes/+layout.server.ts`
  - Remove try/catch that swallows onboarding redirect; simply throw `redirect(303, '/onboarding')` when needed.

- `apps/web/src/routes/auth/callback/+server.ts`
  - Replace the `try/catch` with rethrow or narrow catches; never swallow redirects/errors.
  - Ensure `next` defaults to `/` and is normalized.

- `apps/web/src/routes/(auth)/signup/+page.server.ts`
  - Add `options: { emailRedirectTo: \
      new URL('/auth/callback?next=/onboarding', url.origin).toString() }` when calling `signUp`.
  - Keep best-effort profile creation; also handle when profile already exists.

- `apps/web/src/routes/(auth)/verify-email/+page.svelte`
  - Add API endpoint `/api/auth/resend-verification` and wire the fetch to it (see endpoint above).

- `apps/web/src/routes/logout/+server.ts`
  - Keep POST. Optionally add GET that returns a minimal page with a POST form if you want link-based logout.

**Migration/Deployment Steps**
- Dev: Apply code changes → reload dev server → test flows locally.
- Supabase: Update Site URL and Redirect URLs; verify email template link target.
- Vercel/Prod: Set `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` and server env. Redeploy.

**Verification Checklist**
- Signup
  - Submits form → Success message → Email arrives → Click link → Lands on `/auth/callback?code=...` → Session established → Redirects to `/onboarding`.
- Login
  - Valid credentials → Redirects to `/` unless onboarding incomplete → Then to `/onboarding`.
- Onboarding
  - Visiting any page while `onboarding_completed !== true` redirects to `/onboarding` (except skipped paths).
- Logout
  - POST `/logout` clears session cookies; visiting `(protected)` pages redirects to `/login`.
- Refresh/SSR
  - Refreshing on a protected route keeps the session. No spurious “Not authenticated” or flicker.
- Mobile
  - iOS Safari preserves session across app reloads.

**Quick Wins (can be applied immediately)**
- Remove `httpOnly: false` in `hooks.server.ts` cookie setter.
- Delete `try/catch` blocks that do `if (err instanceof redirect) throw err;` and either rethrow or remove the catch entirely.
- Simplify `+layout.ts` browser client creation to remove the custom cookie adapter.

If you want, I can apply the “Quick Wins” now and add the resend verification endpoint.

