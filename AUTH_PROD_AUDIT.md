# Auth Audit: Local Works “Kinda”, Vercel Buttons Do Nothing

This audit reviews the current SvelteKit 2 + Svelte 5 + Supabase SSR auth implementation, differences between local and Vercel, and a focused refactor plan using Superforms v2.

Repository focus: `apps/web` (SvelteKit app)

## Summary

- Auth is wired with Supabase SSR in `hooks.server.ts`, and auth pages exist in `(auth)` group using Superforms v2.
- Locally, flows “kinda” work; on Vercel, clicking form buttons appears to do nothing. Root causes are almost certainly environment/config and a small but important bug around signup redirect URLs.

## Key Findings

- Supabase SSR setup:
  - `apps/web/src/hooks.server.ts` creates `event.locals.supabase` via `@supabase/ssr` and exposes `safeGetSession()`. Cookies are set with `path: '/'` and `global.fetch` is passed (good for Vercel).
  - Hard fail if `PUBLIC_SUPABASE_URL` or `PUBLIC_SUPABASE_ANON_KEY` are missing. In prod this manifests as 500s and broken hydration.

- Routes/layouts:
  - Public layout: `apps/web/src/routes/+layout.server.ts` reads session from hooks and fetches `profiles` (conditionally redirects to `/onboarding`).
  - Client layout: `apps/web/src/routes/+layout.ts` creates browser/server Supabase client correctly and returns `session`, `user`, `profile` for SSR sync into stores.
  - Auth group: `apps/web/src/routes/(auth)` contains `login` and `signup` with Superforms v2:
    - `login/+page.server.ts` action `signin`
    - `login/+page.svelte` `<form method="POST" action="?/signin" use:enhance>`
    - `signup/+page.server.ts` action `signup`
    - `signup/+page.svelte` `<form method="POST" action="?/signup" use:enhance>`
  - Protected group: `(protected)` layout redirects to `/login` when unauthenticated.

- Superforms v2 usage:
  - Both pages use `superValidate` on the server and `superForm` on the client with `use:enhance`. Zod schemas live in `apps/web/src/lib/validation/auth.ts`.

- Vercel adapter/config:
  - `apps/web/svelte.config.js` uses `@sveltejs/adapter-vercel`, `edge: false` (correct for actions). CSRF `checkOrigin` is set to `false` for debugging (should be turned back on).
  - `apps/web/vercel.json` defines functions and a catch-all route to `/` (typical for SvelteKit on Vercel).

## Concrete Issues Found

- Signup redirect URL bug:
  - In `apps/web/src/routes/(auth)/signup/+page.server.ts`, `emailRedirectTo` is built from `request.url.origin`, but `request.url` is a string, so `request.url.origin` is `undefined` in Node.
  - Result: invalid email verification link in production (e.g. `undefined/auth/callback?...`), breaking signup confirmations.
  - Fix: use `new URL(event.url).origin` or a configured `PUBLIC_SITE_URL`.

- Missing/incorrect env on Vercel (likely):
  - If `PUBLIC_SUPABASE_URL` or `PUBLIC_SUPABASE_ANON_KEY` are unset or incorrect, `hooks.server.ts` throws a 500: “Server configuration error”. That breaks SSR and can make buttons appear unresponsive if the page fails to hydrate and actions 500 silently.
  - `apps/web/vercel-env.md` already calls out the required vars; ensure they are set for both Production and Preview.

- Preview domain/callback mismatch (common):
  - Supabase Auth URL config must include both prod domain and all Vercel preview domains. If not, email/password and OAuth callbacks fail in preview (looks like “nothing happens”).

- CSRF currently disabled in config:
  - `csrf.checkOrigin: false` is fine for debugging but should be restored once verified. Superforms v2 includes CSRF protection for forms; keep SvelteKit CSRF enabled for non-form endpoints.

## Why Buttons “Do Nothing” On Vercel

- If hydration fails (due to 500 from missing envs or an early exception), `use:enhance` won’t attach and UI may feel inert. A regular form POST should still fire, but if the page already errored or the server function throws (e.g., missing Supabase env), you might get an error page/navigation bounce that users experience as “nothing”.
- If envs are missing, every auth call will fail at the server, leading to silent failures if error displays are suppressed.
- Signup specifically can “succeed” but never deliver a working email link due to the `request.url.origin` bug, leaving users stuck.

## Verification Checklist (Prod/Preview)

- Vercel env vars (Project Settings → Environment Variables):
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; not used in client)
  - `PUBLIC_SITE_URL` (match your prod domain; used to build callback URLs)
  - Optional: `SENTRY_DSN`, `PUBLIC_SENTRY_DSN`, `RESEND_API_KEY`

- Supabase Dashboard → Authentication → URL Configuration:
  - Add prod domain: `https://your-domain.com/**`
  - Add Vercel preview patterns: `https://*-<team>.vercel.app/**`
  - Add local dev: `http://localhost:5173/**`

- Confirm CSR/SSR:
  - Ensure `csr` is not disabled on auth pages.
  - Check browser console in Vercel for hydration errors.

- Health sanity checks:
  - Hit `/` and verify no 500 in server logs.
  - Hit `/login` and use devtools Network tab to observe the POST to `?/signin` and response status.

## Targeted Fixes

1) Fix signup redirect URL

Edit `apps/web/src/routes/(auth)/signup/+page.server.ts`:

```ts
import { PUBLIC_SITE_URL } from '$env/static/public';

// inside actions.signup
const origin = PUBLIC_SITE_URL || new URL(url).origin; // use event.url

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
    emailRedirectTo: `${origin}/auth/callback?next=/onboarding`
  }
});
```

Use the `url` argument from the event instead of `request` when you need origin, or wrap `new URL(request.url)`.

2) Restore CSRF once working

In `apps/web/svelte.config.js`, set `csrf.checkOrigin: true` after verifying forms work with Superforms’ CSRF.

3) Verify envs on Vercel

- Ensure all required env vars are present in Production and Preview.
- Trigger a new deployment after adding/updating them.

4) Supabase redirect URLs

- Ensure the Supabase project has redirect URLs for your prod domain and all preview URLs.

## Refactor Plan: Superforms v2 + Svelte 5/Kit 2 + Supabase SSR

Goal: Keep current structure, tighten correctness, and make prod behavior deterministic.

- Server hooks
  - Keep `createServerClient` in `hooks.server.ts` with `global.fetch` and cookie bridge.
  - Keep `safeGetSession` and attach `session`/`user` to `locals`.
  - Ensure no early throws except for clearly missing envs (already present).

- Auth pages (already Superforms v2)
  - `login/+page.server.ts`:
    - Use `superValidate(request, zod(LoginSchema))`.
    - On success, `redirect(303, '/')` or `/onboarding` depending on profile.
    - On failure, `return fail(400, { form: setError(...) })`.
  - `login/+page.svelte`:
    - Keep `<form method="POST" action="?/signin" use:enhance>`; render `$errors` inline.

  - `signup/+page.server.ts`:
    - FIX redirect origin as above.
    - Create profile record after signup (already implemented); ignore duplicate.
    - `return message(form, { type: 'success', text: ... })` to show “Check your email”.
  - `signup/+page.svelte`:
    - Keep `<form method="POST" action="?/signup" use:enhance>`; render `$message` success UI.

- SSR data flow
  - Continue syncing `session`, `user`, `profile` from `+layout.server.ts` to client stores in `+layout.svelte`.
  - Auth listener in `+layout.svelte` calls `invalidate('supabase:auth')` on auth events (already in place).

- Environment & deployment
  - Define `PUBLIC_SITE_URL` and consume it server-side when building absolute URLs (email redirects, OAuth).
  - Confirm adapter is not using edge runtime for actions (already `edge: false`).

- Security
  - Re-enable `csrf.checkOrigin` in SvelteKit config after verification.
  - Keep Sentry optional; do not initialize without DSN.

## Quick Test Matrix

- Local
  - `pnpm dev` → `/signup` → submit valid form → see success message and receive email link with a correct absolute URL.
  - `/login` → valid credentials → redirected to `/` or `/onboarding`.

- Vercel Preview
  - Set all envs in Preview.
  - Open `/signup` and `/login`; use Network tab to ensure POSTs to `?/signup`/`?/signin` return 303/400 appropriately.

- Vercel Production
  - Repeat preview steps; verify email link redirects back to prod domain and completes session.

## Notes

- The current structure is solid: SSR Supabase client in hooks, Superforms v2 for actions, and Svelte 5 stores syncing. The main blockers are environment consistency on Vercel and the signup redirect origin bug.

