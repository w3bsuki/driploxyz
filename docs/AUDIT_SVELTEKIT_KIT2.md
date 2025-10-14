# Svelte 5 / SvelteKit 2 Audit (Task 1)

Scope: apps/web (SvelteKit app), packages/ui (Svelte components). Focus on SSR, auth wiring, env handling, security headers, and layout patterns per official docs.

## Best-practices digest (from SvelteKit + Supabase SSR docs)

- Use @supabase/ssr with per-request server client in hooks.server.ts
  - cookies: implement getAll and setAll and always set path: '/'
  - safeGetSession: validate JWT via supabase.auth.getUser() before reading session
  - pass through content-range and x-supabase-api-version headers
- Root layouts
  - +layout.server.ts: return validated session and cookies.getAll()
  - +layout.ts: create client with createBrowserClient on client and createServerClient on server using data.cookies; depends('supabase:auth'); getSession is safe here
  - +layout.svelte: listen to supabase.auth.onAuthStateChange and invalidate('supabase:auth') when session changes
- Avoid multiple Supabase clients and avoid trusting getSession() on the server
- Environment variables
  - Use $env/static/public for required PUBLIC_ keys (build-time validation)
  - Never hardcode keys or provide insecure fallbacks
- Security headers
  - Add X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
  - Prefer CSP without 'unsafe-eval' and minimize 'unsafe-inline' (nonce or hash-based)
- Svelte 5 runes enabled in compilerOptions
- Vite
  - @sveltejs/enhanced-img must be before sveltekit()
  - dedupe: ['svelte'] in monorepo

References: Supabase SSR SvelteKit guide, Creating a Supabase client for SSR, Advanced SSR guide; SvelteKit docs on hooks, load, env, and routing.

## What we found in your codebase

- hooks.server.ts (apps/web/src/hooks.server.ts)
  - Uses @supabase/ssr createServerClient with cookies.getAll/setAll and path:'/' — GOOD
  - safeGetSession first calls getUser() then getSession() — GOOD
  - filterSerializedResponseHeaders allows content-range, x-supabase-api-version — GOOD
  - Production security headers middleware — GOOD, but CSP could be tightened (see below)
- Root layout load (apps/web/src/routes/+layout.ts)
  - Implements createBrowserClient/createServerClient with depends('supabase:auth') and returns session — GOOD
  - Expects data.cookies from a server layout — but no +layout.server.ts found — ISSUE
- No +layout.svelte present — ISSUE
  - Without an auth-state listener calling invalidate('supabase:auth'), session updates may not propagate reliably client-side
- Duplicate SSR client util (apps/web/src/lib/supabase/server.ts) — ISSUE
  - Uses $env/dynamic/public and includes hardcoded default Supabase URL and anon key strings as fallbacks — CRITICAL SECURITY
  - Uses cookies.get/set/remove shape vs getAll/setAll (inconsistent with recommended SvelteKit SSR pattern)
  - Many endpoints import createServerSupabaseClient(event) instead of using event.locals.supabase — DUPLICATION/DRIFT RISK
- Browser client util (apps/web/src/lib/supabase/client.ts)
  - Provides a singleton createBrowserSupabaseClient with robust options (PKCE, autoRefresh, persistSession) — OK
  - Many components directly instantiate client instead of consuming data.supabase from layout — STYLE/CONSISTENCY
- Security headers (hooks.server.ts)
  - CSP includes 'unsafe-inline' and 'unsafe-eval' — RISK; remove 'unsafe-eval' and prefer nonce-based inline policy if possible
- Vite config (apps/web/vite.config.ts)
  - enhancedImages before sveltekit, tailwindcss plugin last, dedupe svelte, monorepo fs allow — GOOD
- Svelte config (apps/web/svelte.config.js and packages/ui/svelte.config.js)
  - vitePreprocess, runes: true, vercel adapter — GOOD
- app.d.ts (apps/web/src/app.d.ts)
  - Duplicated interface declarations and redundant module declarations — TECH DEBT; consolidate to a single declaration block
- Env usage
  - Mixed $env/static/public and $env/dynamic/public; for required PUBLIC_ keys prefer static to fail fast at build; use dynamic only when truly optional

## Gaps vs. best practices and recommended fixes

1) Missing +layout.server.ts (High)
- Impact: +layout.ts expects data.cookies to construct the server client. Without +layout.server.ts, data.cookies is undefined on server, leading to potential SSR auth issues and session desync.
- Fix: Create apps/web/src/routes/+layout.server.ts:
  - Export load that calls locals.safeGetSession() and returns { session, user, cookies: cookies.getAll() }

2) Missing +layout.svelte auth invalidation (Medium)
- Impact: Session changes may not trigger invalidate('supabase:auth'), so the layout load might not re-run when tokens refresh or sign-in/out occurs.
- Fix: Add apps/web/src/routes/+layout.svelte with onMount listener supabase.auth.onAuthStateChange that calls invalidate('supabase:auth') when expires_at changes.

3) Insecure fallbacks and duplicate server client util (Critical)
- File: apps/web/src/lib/supabase/server.ts
- Issues:
  - Hardcoded default PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY values — must be removed.
  - Interface diverges from getAll/setAll cookie pattern.
  - Duplicates the per-request client already available in event.locals.supabase.
- Fix options (choose one):
  - Recommended: Delete this util and migrate all users to event.locals.supabase and event.locals.safeGetSession.
  - Or refactor: Remove hardcoded fallbacks, switch to $env/static/public, and use cookies.getAll/setAll; Still prefer locals.supabase for consistency.

4) Excess Supabase client creation in components (Low/Medium)
- Multiple components call createBrowserSupabaseClient directly instead of using data.supabase from layout. While your util is a singleton, the documented pattern is to consume layout-provided client to avoid accidental divergence and ensure invalidate wiring is centralized.
- Fix: Prefer data.supabase in components; reserve createBrowserSupabaseClient for isolated scenarios (e.g., outside of routed UI) and tests.

5) CSP hardening (Medium)
- Current CSP: allows 'unsafe-eval' and wide 'unsafe-inline'.
- Fix: Remove 'unsafe-eval'; use nonce or hash for inline scripts/styles where feasible; tighten connect-src to known domains; consider frame-ancestors 'none' (or only your domains). Add HSTS via platform config (Vercel) if not already.

6) app.d.ts duplication (Low)
- Consolidate to a single declaration of App.Locals and PageData; remove duplicate imports/exports and redundant env module declarations that are already generated by SvelteKit.

7) Env usage normalization (Low)
- For required PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY, import from $env/static/public in server and client code. Use $env/dynamic/public only for optional, environment-dependent keys.

## Concrete changes to implement (prioritized)

- P0 Critical
  - Remove hardcoded fallbacks in apps/web/src/lib/supabase/server.ts and migrate endpoints to use event.locals.supabase and locals.safeGetSession exclusively.
- P1 High
  - Add apps/web/src/routes/+layout.server.ts to pass validated session and cookies to the layout.
  - Add apps/web/src/routes/+layout.svelte to listen for auth state changes and invalidate('supabase:auth').
- P2 Medium
  - Harden CSP: eliminate 'unsafe-eval', minimize 'unsafe-inline', consider nonce-based approach; add Strict-Transport-Security via vercel.json or headers.
  - Standardize component usage to prefer data.supabase from layout; keep createBrowserSupabaseClient only where needed.
- P3 Low
  - Clean up apps/web/src/app.d.ts duplicates and align with actual locals used (session, user, country/locale as applicable).
  - Normalize env imports to $env/static/public for mandatory PUBLIC_ keys.

## Acceptance criteria

- SSR auth functions with JWT validation via getUser() are used everywhere server-side; no direct use of getSession() for trust decisions.
- Root layout server load returns session and cookies; layout load properly re-runs on auth changes.
- No hardcoded Supabase URLs/keys anywhere. Builds fail early if required PUBLIC_ vars are missing.
- CSP is production-safe without 'unsafe-eval'; other security headers present.
- Type definitions (app.d.ts) are single-sourced and match actual locals/page data.

## Notes and references

- Supabase docs: Creating a Supabase client for SSR; SvelteKit SSR guide; Advanced SSR guide
- SvelteKit docs: hooks, load functions, env modules, routing
- Observed files:
  - apps/web/src/hooks.server.ts
  - apps/web/src/routes/+layout.ts
  - apps/web/src/lib/supabase/client.ts
  - apps/web/src/lib/supabase/server.ts (requires refactor/removal)
  - apps/web/vite.config.ts; apps/web/svelte.config.js; packages/ui/svelte.config.js

---

If you want, I can implement P0/P1 immediately by adding +layout.server.ts and +layout.svelte and drafting a migration for endpoints to use locals.supabase — just say “apply P0/P1 now.”
