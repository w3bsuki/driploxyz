+# Supabase Production Refactor
+
+> References: [Supabase Docs](https://supabase.com/docs) — updated August 2025
+
+## Official Best Practices
+
+- Use `@supabase/ssr` `createServerClient` with cookies for SSR; use `createBrowserClient` in the browser.
+- Never expose the service role key to the client; keep it in server‑only modules.
+- Enforce Row Level Security (RLS) with explicit policies for every table.
+- Generate TypeScript types from the database and import them in clients.
+- Validate JWTs and refresh sessions server‑side; avoid trusting client claims.
+- Use Supabase storage policies for uploads and restrict public buckets.
+- Version database schema with `supabase db diff`/`db push` and check migrations into git.
+
+## Repository Audit
+
+- `apps/web/src/lib/supabase/server.ts` wraps `createServerClient` but duplicates cookie logic in `hooks.server.ts`.
+- Service role usage not shown in repo; verify that any service client lives only in `.server.ts` files.
+- `SUPABASE_POLICIES.sql` exists but policies may not cover all tables (needs review).
+- No script found to auto‑generate types from Supabase schema or run migrations.
+- Storage helper exists but upload rules and bucket policies are not documented.
+
+## Refactor Actions
+
+- Export a single `createServerSupabaseClient` helper and import it in `hooks.server.ts` and endpoints to avoid duplication.
+- Add npm scripts to run `supabase gen types typescript --linked` and commit generated types in `packages/database`.
+- Add scripts for `supabase db diff` and `supabase db push` to version control migrations.
+- Review `SUPABASE_POLICIES.sql` against current schema; ensure RLS enabled and tests cover unauthorized access.
+- Document storage buckets, allowed MIME types and size limits; enforce via policies and validation.
+- For auth flows, handle redirect errors with `isRedirect` and bubble other errors.
+
+## Definition of Done
+
+- Generated `packages/database/src/generated.ts` in sync with database.
+- No Supabase keys or service logic exposed to browser bundle.
+- All tables have RLS policies and migrations checked into version control.
+- Upload endpoints validate file type/size before hitting Supabase.
