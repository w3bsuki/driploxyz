diff --git a//dev/null b/REFACTOR_OVERVIEW.md
index 0000000000000000000000000000000000000000..1549efac3a62f7d90e839e3e46fd1c73388011da 100644
--- a//dev/null
+++ b/REFACTOR_OVERVIEW.md
@@ -0,0 +1,33 @@
+# Driplo Production Refactor Overview
+
+This overview links to focused audits for each technology. All guidance is cross‑checked against the official documentation as of **August 2025**:
+
+- [Svelte 5](./svelte5.md)
+- [SvelteKit 2](./sveltekit2.md)
+- [TailwindCSS v4](./tailwindcssv4.md)
+- [Supabase](./supabase.md)
+- [TypeScript](./typescript.md)
+
+## High-Level Goals
+
+1. **Remove bloat**: delete unused components, routes and dead configuration; drop committed build artifacts like `packages/ui/dist`.
+2. **Modularize hooks**: split `hooks.server.ts` responsibilities (env checks, auth, i18n, logging) so each file stays under ~150 lines.
+3. **Strengthen security**: re‑enable CSRF checks, ensure RLS policies cover all tables and handle redirect errors correctly.
+4. **Consistency**: enforce Svelte 5 runes, strict TypeScript and a single Tailwind v4 version across the monorepo.
+5. **Automation**: add scripts for type generation, linting, testing and database migrations in CI.
+6. **Docs parity**: link every major decision back to upstream docs to prevent drift from the 2025 guidelines.
+
+## Phased Cleanup Steps
+
+1. **Inventory** `apps` and `packages`; archive or delete experimental modules. Remove the `!packages/ui/dist` exception from `.gitignore` and drop the compiled `dist` directory.
+2. **Dependencies**: dedupe `tailwindcss` to a single workspace version (`4.1.12` at time of writing) and ensure shared config packages are up to date.
+3. **Code quality**: run `pnpm -w lint`, `pnpm -w check-types`, `pnpm -w test` and resolve failures. Configure CI to run these on every push.
+4. **Supabase**: regenerate types (`supabase gen types typescript --linked`) and commit to `packages/database`.
+5. **CSS**: review global utilities and move component‑specific styles out of `app.css`; verify `@source` globs only include shipped code.
+6. **Docs**: update README and contributor guides to reference the Svelte 5/SvelteKit 2/Tailwind v4/Supabase/TypeScript docs from 2025.
+
+## Definition of Done
+
+- Repository passes lint, typecheck and tests with minimal warnings.
+- Only essential apps/packages remain and no built artifacts are committed.
+- All documentation and configs updated to Svelte 5/SvelteKit 2/TailwindCSS v4/Supabase/TypeScript best practices.
