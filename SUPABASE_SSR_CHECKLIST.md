# Supabase SSR Checklist (SvelteKit + @supabase/ssr)

Goal: Ensure secure, stable auth + data fetching with clean separation of server/browser clients.

Server Setup
- hooks.server.ts: export { handle, handleError } from $lib/server/hooks (already present)
- $lib/server/supabase-hooks.ts: uses createServerClient with cookie path '/' and safeGetSession()
- +layout.server.ts: returns only serializable data (session, user, profile, locale)
- RLS: Enabled on private tables; rely on RLS, not manual user_id filters

Browser Setup
- $lib/supabase/client.ts: createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
- +layout.ts: do not pass the client via load; components create their own when needed
- +layout.svelte: single auth listener with cleanup; invalidate('supabase:auth') on state change

Do/Don’t
- Do: depends('supabase:auth') where auth affects data
- Do: use server load for private data access
- Don’t: serialize clients in load
- Don’t: set short cookie expiry; let Supabase manage tokens

Verification Steps
- pnpm -C apps/web dev: login/logout; verify session survives reload
- Open devtools: ensure no duplicate auth listeners
- Confirm cookies set with path '/'; domain matches environment
- Attempt protected route when logged out: redirected to /login or safe empty state

References
- REFACTOR_GUIDE.md (Supabase SSR best practices)
- apps/web/src/lib/server/supabase.server.ts (service client)
- apps/web/src/lib/supabase/client.ts (browser client)
- apps/web/src/routes/+layout.server.ts and +layout.ts

Codex Review (2025-08-28)
- For browser setup, prefer a single Supabase client created in `+layout.svelte` (or a module-level singleton) and share it via Svelte context; avoid per-component client creation to prevent duplicate listeners.
