# Vercel Mobile 500 Error Deep-Dive

This document enumerates likely root causes for "works locally, 500 in production (only / mainly on mobile)" with this SvelteKit + Supabase + Stripe + i18n project, plus concrete diagnostic steps and fixes. Prioritize sections in order.

---
## 0. Reproduce & Capture
1. Use real mobile device + desktop DevTools device emulation.
2. Open Network tab, disable cache, record all requests, reload.
3. Identify WHICH request returns 500 (HTML document? a load function fetch? API route? Supabase REST query?).
4. In Vercel dashboard → Deployment → Functions logs: correlate timestamp.
5. Enable `SENTRY_DSN` (if desired) or temporarily add console logging around suspected code paths.

Without the failing endpoint path & stack we must blanket-cover likely issues below.

---
## 1. Adapter / SSR Environment Mismatch
Currently `apps/web/svelte.config.js` uses `@sveltejs/adapter-auto`. On Vercel you should explicitly use `@sveltejs/adapter-vercel` for predictable edge vs server selection.

Potential issue: `adapter-auto` may deploy some endpoints to edge runtime (limited APIs, no Node polyfills) while code assumes full Node (Stripe library, etc.). Stripe's server webhook code MUST run in Node (NOT edge). A mobile-only error can be due to conditional code causing an extra server load that hits an edge function lacking required polyfills.

Fix:
- Switch to `@sveltejs/adapter-vercel` and (optionally) configure `runtime: 'nodejs18.x'` for server routes needing Node.
- If you want some edge endpoints, isolate them deliberately.

---
## 2. Private vs Public Env Variables Usage
`hooks.server.ts` imports `env` from `$env/dynamic/public`. That only exposes variables prefixed `PUBLIC_`. Any server-side need for `SUPABASE_SERVICE_ROLE_KEY` or other secrets must use `$env/dynamic/private` or `$env/static/private`.

Risk: Other server modules (e.g. `lib/supabase/server.ts`) mix `$env/dynamic/private` and `$env/static/public`. If on Vercel a required `PUBLIC_SUPABASE_*` is absent (not added to project or preview environment) you silently set `supabase` to null and later code expecting `locals.supabase` breaks.

Diagnostics:
- Confirm in Vercel dashboard all env vars are present in Production scope.
- Add temporary logging in `hooks.server.ts` when env missing.

Fix:
- Fail fast: throw explicit error if missing instead of continuing with null.
- Prefer `$env/static/public` for build-time injected public vars unless you expect them to change at runtime (rare on Vercel). Mixing dynamic may disable some optimizations and cause edge/runtime differences.

---
## 3. Cookie Handling & Auth Race Conditions
Mobile Safari / some mobile browsers have stricter cookie policies (ITP). If Supabase auth cookies (e.g. `sb-access-token`) are not set with proper attributes you can get server 500 when assuming session exists.

Current code sets cookies with `path: '/'` but does not explicitly set `sameSite` or `secure`. On production under HTTPS you want `SameSite=Lax` or `Strict` and `Secure`.

If a load function further down expects `event.locals.safeGetSession` but earlier middleware failed to create it due to missing cookies, subsequent logic might attempt queries with undefined user (usually safe) but could pass `null` into a supabase query chain producing unexpected errors.

Diagnostics:
- Inspect response Set-Cookie headers on first request (mobile vs desktop).
- Compare cookie presence on subsequent navigation.

Fix:
- In `hooks.server.ts` when calling `event.cookies.set`, set `{ ...options, path: '/', sameSite: 'lax', secure: true, httpOnly: true }` for auth cookies (Supabase normally sets appropriate flags; ensure you are preserving them).
- Ensure no client code overwrites Supabase cookies inadvertently.

---
## 4. Redirect Loops Causing 500 (Onboarding / Auth Guards)
Sequence:
1. Root layout server load redirects to `/onboarding` if `!onboarding_completed`.
2. `/onboarding` page load itself fetches profile again via client supabase (not server) & might redirect to `/dashboard` if completed.
3. Protected layout requires auth; if session missing while cookies unstable on mobile, redirect to `/login`, root may then redirect again.
Some hosts convert excessive internal redirects into a 500 or the browser surfaces a generic failure.

Diagnostics:
- Open Network tab; see if multiple 303/307 chain loops precede 500.
- Temporarily log in `+layout.server.ts` the tuple `(pathname, session ? 'session' : 'no-session', profile?.onboarding_completed)`.

Fix:
- Add guard to avoid redirect loop logic running client vs server twice.
- Consolidate onboarding redirect logic inside a single server-side check.

---
## 5. Locale Detection External Fetch (ipapi.co) Failing in Edge
`detectCountryFromIP()` fetches `https://ipapi.co/json/` from client (onMount). Some mobile networks block or slow that request; if it times out and you don't catch errors properly (you do catch & log), that's fine, but not a 500. However: If somewhere you attempt locale detection server-side (not currently) on an edge runtime, outbound fetch may be blocked or rate-limited, potentially cascading into failures.

Check that no SSR path executes `detectUserLocale()` (currently only in `LocaleDetector.svelte` onMount — safe). Probably not root cause.

---
## 6. Mixing Browser-Only APIs in SSR (Sporadic on Mobile)
Look for unguarded uses of `window`, `document`, `localStorage`, `navigator` outside of `browser` checks or `onMount`. Most files use guards, but verify new components (CookieConsent, etc.). A 500 on initial SSR occurs if code references `window` server-side.

Diagnostics:
- Grep for `window.` / `localStorage` outside guarded blocks (already partially done). Ensure every occurrence is inside `if (browser)` or `onMount`.

Fix:
- Wrap any stray usage.

---
## 7. Supabase Client Double Creation / Null Passing
`+layout.server.ts` returns `supabase: null`, then `+layout.ts` builds a browser client. Some child loads (like `(protected)/+layout.ts`) create another client and update stores again. Race conditions could show up differently on slower mobile devices, exposing an interim state where `data.supabase` is null while a page's load expects it.

Diagnostics:
- Confirm failing 500 originates from a page whose load accesses `data.supabase`. Search for `data.supabase` unguarded.

Fix:
- Provide server supabase client in root layout data for immediate use, or ensure children always null-check.

---
## 8. Stripe Server Code on Edge Runtime
If a route like `/api/webhooks/stripe` is accidentally deployed to edge (due to adapter-auto heuristics), using the Stripe library (which relies on certain Node APIs) can cause runtime errors. Desktop testing might hit warm Node function while mobile (different path or concurrency) triggers edge fallback — rare but possible.

Fix:
- Explicitly mark the route to use Node: export const config = { runtime: 'nodejs18.x' } (Vercel) in the server file OR rely on adapter-vercel which chooses Node for such usage automatically. (In latest SvelteKit + adapter-vercel, set `edge: false` in route options if needed.)

---
## 9. Missing / Incorrect CORS & Supabase Domain Config
If production custom domain not whitelisted in Supabase Auth settings, the PKCE / cookie flow may silently fail on mobile first-party vs desktop due to different storage partition quirks.

Diagnostics:
- In Supabase Dashboard → Authentication → URL Configuration: ensure site URL & redirect URLs include your production domain (with and without `www`).

Fix:
- Add domain and redeploy.

---
## 10. RLS Policies & Service Role Misuse
Using service role key on the client (NEVER do this) would fail; seems you only use service role in server contexts (webhooks). Verify service role key is NOT accidentally exposed via `$env/static/public`. (Currently imported via `env.SUPABASE_SERVICE_ROLE_KEY!` in webhook route — correct). If webhook fails it should not break page loads unless awaiting it; not root cause for browse pages.

---
## 11. Node / ESM Version Drift
Locally you may be on Node 20; Vercel default runtime Node 18 or 20 (depending). Some dependencies (e.g. `@supabase/ssr`, `stripe`) expect specific features; usually OK. Still ensure "Engines" mismatch isn't failing only on prod.

Diagnostics:
- Check Vercel build logs for warnings about unsupported Node features.

Fix:
- Add `"engines": { "node": "20.x" }` in root `package.json` or configure Vercel project to Node 20.

---
## 12. Monorepo / Workspace Path Resolution
Shared packages `@repo/ui` & `@repo/i18n` must be built before deployment. Locally `pnpm dev` builds implicitly via TS / Svelte plugin; on Vercel, if `pnpm build` for the root does not build packages in correct order, runtime may import missing compiled files causing 500.

Diagnostics:
- Inspect built output in `.vercel/output/functions` (download) to confirm compiled shared components exist.
- Ensure `turbo.json` pipeline defines build dependencies: `ui -> web`.

Fix:
- Add build script in root: `turbo run build --filter=...` and set Vercel build command to `pnpm turbo run build --filter=web...` or simply `pnpm build` if pipeline correct.

---
## 13. Svelte 5 Runes & Serialization Differences
Using `$state`, `$derived`, `$effect` etc. Verify you are on consistent Svelte 5 version locally vs deployed. A partial upgrade mismatch (e.g. lockfile not respected) could produce hydration errors that surface as 500 if server throws during render.

Diagnostics:
- Confirm Vercel uses the same lockfile (pnpm). Ensure `pnpm-lock.yaml` is committed (it is).

Fix:
- Force clean install locally `pnpm install --frozen-lockfile` then redeploy.

---
## 14. Large Payload / Headers (Cookies Bloat) on Mobile
If you store large serialized objects in cookies (not currently visible) mobile browsers may truncate, causing Supabase session parse failure server-side leading to 500.

Diagnostics:
- Inspect cookie sizes (<4KB each; total <~8KB advisable).

Fix:
- Keep only session cookies; move others to localStorage.

---
## 15. Missing Polyfills (ReadableStream, etc.)
Edge runtime differences can manifest more on mobile user agents sending different Accept headers causing code path differences (e.g. image negotiation). If any library tries to access Node-specific modules on edge => 500.

Fix: Force Node runtime for all server code first; revisit if you need edge.

---
## 16. Race in Auth Listener Invalidation
In `+layout.svelte` you call `invalidate('supabase:auth')` inside auth listener. If during initial mobile load the listener fires before stores fully initialized, repeated invalidations can cascade into multiple overlapping server load calls, raising resource usage and potential 500 if any throw unhandled errors.

Diagnostics:
- Temporarily debounce the invalidate call and observe if 500 disappears.

Fix:
- Add guard: only invalidate if expires_at actually changed and not during initial hydration flag.

---
## 17. Onboarding Page Using Client Supabase Without Null Guard
`onboarding/+page.ts` uses `supabase` from parent data (client created). If for any reason it is undefined (initial SSR on slow device), calling `.from(...)` on undefined would throw (likely 500). Locally race less visible.

Fix:
- Add `if (!supabase) return { user };` early guard OR move profile completion check fully server-side (preferred).

---
## 18. Content Security Policy / Mixed Content
If mobile via HTTPS tries to fetch `http://` asset (not present here) might block and cascade; unlikely.

---
## 19. Internationalization State & Early Access of `document.documentElement`
In root `+layout.svelte` you set `document.documentElement.lang = ...` inside top-level `if (browser)` (runs during module evaluation in client bundle). During SSR hydration differences minimal; still safe. Not cause.

---
## 20. Hidden 500: 404 Fallback Missing -> 500
If dynamic params route throws due to unexpected null from Supabase (e.g., product missing) and you don't catch error, user might see 500. Mobile may request different prefetch path (e.g., predictive nav). Provide graceful 404.

---
## Highest Probability Combined Scenario
A. Using `adapter-auto` led to some server code (webhooks / auth hooks) deployed to edge where Node-only libs or dynamic private env access fails under specific conditions.
B. Auth redirect loop triggered by incomplete onboarding & missing session cookies on mobile Safari => 500 after exceeding internal redirects.
C. Missing environment variable in Vercel (e.g. PUBLIC_SUPABASE_ANON_KEY mismatch) causing `supabase` null and downstream code not defensively coded.

---
## Concrete Action Plan (Sequenced)
1. Switch to `@sveltejs/adapter-vercel` in `svelte.config.js` for `apps/web`.
2. Add explicit runtime config for Stripe webhook route if needed.
3. Add fast-fail in `hooks.server.ts` when required env vars absent.
4. Strengthen cookie set options & log cookie presence.
5. Consolidate onboarding redirect logic server-side (single check; remove client duplication) and guard against loops.
6. Add null guard in `onboarding/+page.ts` for `supabase`.
7. Debounce auth invalidate.
8. Verify Vercel env variables & Supabase Auth site URL configuration.
9. Redeploy & gather logs for any remaining 500.

---
## Code Change Suggestions (Summary)
(Implement after confirming root cause via logs)
- svelte.config.js: use adapter-vercel.
- hooks.server.ts: `if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing Supabase env');`
- onboarding/+page.ts: guard null supabase.
- layout auth listener: guard & debounce invalidate.
- Add route config in `api/webhooks/stripe/+server.ts`.

---
## Enhanced Logging Snippets
Insert temporarily:
```ts
// In hooks.server.ts
console.log('[HOOK]', event.url.pathname, { hasCookies: event.cookies.getAll().length, hasAnon: !!env.PUBLIC_SUPABASE_ANON_KEY });
```
```ts
// In +layout.server.ts
console.log('[LAYOUT_LOAD]', { path: url.pathname, hasSession: !!session, onboarding: profile?.onboarding_completed });
```
Remove after diagnosis.

---
## Tips for Automated Assistants (Claude etc.)
- Ask user for exact failing URL + copy of Vercel function log lines.
- Request Network HAR from mobile session.
- Suggest isolating suspected redirect loop first (fast to confirm).
- Avoid generic "works on my machine" responses; enumerate environment diffs.
- Validate env var presence with a small server test route returning mask of vars.

---
## Quick Checklist
[ ] Adapter set to vercel
[ ] Env vars present (public + private)
[ ] Supabase site URL configured
[ ] No redirect loops (confirm with HAR)
[ ] Cookies set & persisted on mobile
[ ] Node runtime for Stripe webhook
[ ] Null guards around `supabase` usage
[ ] Debounced auth invalidation
[ ] Logging added & reviewed

Implement in order; each step reduces surface area.

---
## If Still Failing
Collect:
- Exact 500 response body (may be generic) + x-vercel-id header.
- Corresponding function log stack trace.
- HAR file.
Share to further narrow.

---
Good luck – prioritize adapter/env/redirect loop first; they are the usual culprits.
