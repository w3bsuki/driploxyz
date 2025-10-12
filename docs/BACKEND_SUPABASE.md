# Supabase + SvelteKit alignment checklist

Purpose: a concise, actionable checklist that encodes our canonical SSR, security, types, and CI patterns for Supabase.

References (MCP): Before changes, fetch latest docs for @supabase/ssr SSR patterns, RLS, API keys, types generation, Edge Functions, and Realtime. Paste links in your PR.

1) SSR client with @supabase/ssr
- hooks.server.ts: createServerClient(url, publishable_key, { cookies: { getAll, setAll } }); set event.locals.supabase and safeGetSession.
- app.d.ts: types for App.Locals.supabase and App.Locals.safeGetSession; optionally PageData.session/user.
- +layout.server.ts: return validated session/user; +layout.ts: create browser client, depends('supabase:auth').
- routes/auth/confirm/+server.ts: verifyOtp token_hash/type; redirect.

2) Security model
- Never trust getSession on the server without getUser for critical checks.
- Do not expose service role; use publishable/secret key model; keep secrets server-only via $env/*.

3) RLS policies
- Enable RLS, write USING/WITH CHECK with auth.uid(); add supporting indexes; scope TO roles.

4) Types and @repo/database
- supabase gen types → packages/database/src/generated; re-export Database; type createClient<Database>().
- CI/nightly types sync job.

5) Migrations & envs
- Supabase CLI: init, link, db pull/diff/push; stage/prod pipelines; .env.example per app; Vercel envs in prod.

6) Edge Functions & webhooks
- Use Deno functions for webhooks/offload; pass Authorization for per-request RLS; follow WS auth patterns.

7) Realtime
- Use private channels; enforce RLS-compatible access; unsubscribe on navigation.

Acceptance
- [ ] SSR pattern in place (hooks, locals, types, root layout, confirm route)
- [ ] No service role in client; proper $env usage
- [ ] Representative RLS policies and at least one test
- [ ] @repo/database exports Database; typed client usage exists
- [ ] Types/migrations workflow documented and working in CI