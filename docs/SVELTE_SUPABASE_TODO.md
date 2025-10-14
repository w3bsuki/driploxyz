# Svelte + Supabase Audit TODO

## ✅ Done
- Added `pnpm db:types` script and Supabase CLI dependency so database types can be regenerated locally (`package.json`).
- Patched `packages/database/src/generated/database.ts` to re-export the canonical generated definitions so legacy imports receive the real Supabase types.
- Verified root layout server/client auth wiring already satisfies the audit requirements (`apps/web/src/routes/+layout.server.ts`, `+layout.ts`, `+layout.svelte`).

## 🔄 In Progress / Pending

### Svelte SSR items
- [ ] Migrate remaining server endpoints to consume `event.locals.supabase` / `locals.safeGetSession` directly and delete `$lib/supabase/server.ts` once no longer referenced.
- [ ] Harden CSP by eliminating remaining `'unsafe-inline'` allowances via nonce/hash strategy in `apps/web/src/hooks.server.ts`.
- [ ] Sweep client components to prefer `data.supabase` instead of instantiating new browser clients.

### Supabase + TypeScript items
- [ ] Run `pnpm db:types` (requires logged-in Supabase CLI and either local stack via `supabase start` or `--project-id`) to regenerate `packages/database/src/generated.ts`.
- [ ] Schedule regular type generation (e.g., CI or nightly cron) once CLI access is configured.
- [ ] Execute Supabase Performance Advisor recommendations: drop 32 unused indexes (requires DBA review + migrations).
- [ ] Consolidate duplicate RLS policies per table/role as flagged in audit (coordinate via migrations, ensure tests cover policy logic).
- [ ] Apply Supabase dashboard security fixes: shorter OTP expiry (<1h), enable leaked password checks, upgrade Postgres minor version.
- [ ] Assess whether manual service layer can be simplified now that generated types are reliable.

## 📌 Notes
- Database structural changes (index drops, RLS consolidation, auth settings) require running SQL migrations against the Supabase project; coordinate with the data team before executing.
- Run `pnpm supabase login` and ensure Docker (or remote project ref) is available before invoking `pnpm db:types`.
