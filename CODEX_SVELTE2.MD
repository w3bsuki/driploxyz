+# SvelteKit 2 Production Refactor
+
+> References: [SvelteKit 2 Docs](https://kit.svelte.dev/docs) — updated August 2025
+
+## Official Best Practices
+
+- Use `+page.server.ts` for sensitive data fetching and mutations; keep `+page.ts` for browser‑only transforms.
+- Validate environment variables in `hooks.server.ts` and expose only typed `locals`.
+- Use `depends()`/`invalidate()` for auth‑driven caching and revalidation.
+- Prefer form actions (`+page.server.ts` with `actions`) over custom POST endpoints whenever progressive enhancement is desired.
+- Handle redirects with `isRedirect` or `Redirect` from `@sveltejs/kit`.
+- Keep CSRF protection (`checkOrigin`) enabled unless there is a strong reason to disable it.
+- Place secrets and heavy logic inside `.server.ts` modules or the `server` directory to keep them out of the client bundle.
+
+## Repository Audit
+
+- Routes follow +page/+layout conventions and use `depends()` correctly.
+- Redirect handling checks `instanceof redirect` in some error blocks, which never triggers.
+- `apps/web/svelte.config.js` currently enables `csrf: { checkOrigin: true }`, but earlier revisions disabled it.
+- Many mutations still use bare endpoints instead of form actions.
+- `apps/web/src/hooks.server.ts` is 426 lines and combines env validation, Supabase client creation, i18n and logging.
+
+## Refactor Actions
+
+- Replace `instanceof redirect` checks with `isRedirect(err)` or `err instanceof Redirect`.
+- Ensure `csrf: { checkOrigin: true }` remains enabled and remove now‑unused comments suggesting otherwise.
+- Convert simple POST endpoints (e.g., login, profile update) to form actions for progressive enhancement.
+- Move environment validation, Supabase client creation and i18n handling into discrete modules imported by `hooks.server.ts`.
+- Review route groups `(auth)` and `(protected)` to ensure only required code runs for each request.
+- Use `.server.ts` helpers for secrets (e.g., Supabase service clients) and add integration tests for the `handle` sequence.
+
+## Definition of Done
+
+- Redirect errors bubble correctly and are tested.
+- CSRF protection enabled by default.
+- Majority of mutations use form actions with progressive enhancement.
+- Hooks are modular and under ~200 lines.
+- Secrets live only in server modules and do not leak to the client bundle.
