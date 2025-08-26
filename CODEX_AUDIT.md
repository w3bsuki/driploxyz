diff --git a//dev/null b/FULL_PROJECT_REFACTOR_PLAN.md
index 0000000000000000000000000000000000000000..23bbfce7ee56a99468bef73e2840f61f9549b6e7 100644
--- a//dev/null
+++ b/FULL_PROJECT_REFACTOR_PLAN.md
@@ -0,0 +1,99 @@
+# Full Refactor Plan for Production Readiness
+
+This document audits the entire repository and proposes a refactor strategy to deliver a lean, production‑ready codebase using **Svelte 5**, **SvelteKit 2**, **Supabase**, **TypeScript**, and **Tailwind CSS v4**.  The goal is to reduce technical debt, remove bloat, and adopt best practices while preserving current functionality and UI.
+
+## 1. Root Monorepo
+- **Dependency hygiene**
+  - Upgrade to Node 20+ and align `engines` fields across packages.
+  - Remove obsolete lockfiles, build caches, and generated folders (`v8-compile-cache`, `.svelte-kit`, `dist`, etc.). Ensure `.gitignore` covers all artifacts.
+  - Consolidate repeated `.npmrc`, `.prettierrc`, and `.prettierignore` files; expose a single shared config.
+- **Package scripts**
+  - Use `turbo` pipelines for `lint`, `test`, `build`, and `check` across all apps and packages.
+  - Replace ad‑hoc scripts with `pnpm` workspaces and ensure every package declares its own build/test scripts.
+- **Documentation**
+  - Archive or delete outdated docs (`CODEX_REFACTOR.MD`, `RELEASE_CHECKLIST.md`, etc.) and keep one canonical guide (this file plus high‑level README).
+  - Use `changeset` or similar for versioning to reduce manual release notes.
+
+## 2. Apps
+### 2.1 `apps/web` – main user interface
+- **SvelteKit upgrade**
+  - Migrate to SvelteKit 2 + Svelte 5 runes; replace legacy `$app/stores` or `onMount` patterns with runes‑based stores.
+  - Adopt `+page.ts`/`+layout.ts` for typed server load functions and page data.
+  - Convert `hooks.client.ts`/`hooks.server.ts` to modern event handlers with proper typing.
+- **Supabase integration**
+  - Use `@supabase/auth-helpers-sveltekit` and per‑request server clients to enforce SSR and session cookies.
+  - Move all database queries to server routes or `+server.ts` endpoints; only expose typed data to the client.
+  - Centralize Supabase helpers under `src/lib/supabase` with clear separation of auth, database, and storage.
+- **Component cleanup**
+  - Audit `src/lib/components` and remove unused or duplicate components; co-locate styles with components using `<style lang="postcss">` or unstyled CSS modules.
+  - Introduce barrel files (`index.ts`) for component groups to simplify imports.
+  - Delete tutorial/demo components (`lib/tutorial`) and legacy utilities (`lib/email`, `lib/country`, etc.) unless used in production.
+- **Tailwind CSS v4**
+  - Replace `postcss.config.js` with zero‑config Tailwind v4 setup; use `tailwind.config.ts` with `@tailwindcss/forms` and `@tailwindcss/typography` plugins.
+  - Remove global `app.css`; use semantic layers with `@apply` and component‑scoped styles.
+- **TypeScript & testing**
+  - Enable `strict`, `noImplicitAny`, and path aliases in `tsconfig.json`.
+  - Add Vitest component tests and Playwright E2E tests under `src/test`.
+  - Ensure `email-templates` are generated or sourced from a separate package rather than checked in.
+
+### 2.2 `apps/admin` – admin dashboard
+- Delete the committed `.svelte-kit` directory and add it to `.gitignore`.
+- Migrate to SvelteKit 2 & Svelte 5 with the same patterns as `apps/web`.
+- Replace bespoke auth logic with the shared Supabase helpers.
+- Trim unused routes/components; verify that `tailwind.config.js` uses workspace presets.
+
+### 2.3 `apps/docs` – documentation site
+- Convert to SvelteKit 2 using [mdsvex](https://mdsvex.com) or [SvelteKit Content](https://kit.svelte.dev/docs/load#content) for Markdown.
+- Remove duplicate `.prettierrc` and `.npmrc`; inherit from root configs.
+- Generate static site during CI and deploy via Vercel/Netlify with cache headers.
+
+## 3. Packages
+### 3.1 `packages/ui`
+- Remove generated `dist/` and `.svelte-kit/` directories from git.
+- Rewrite components using Svelte 5 runes and typed props; provide a single entry point (`src/index.ts`) with named exports.
+- Use `tailwindcss` via `svelte-preprocess` or unstyled components that rely on consumer styles.
+- Configure Vitest for unit tests and Storybook/Chromatic for visual regression.
+
+### 3.2 `packages/database`
+- Ensure `supabase gen types` regenerates `src/generated.ts` on prebuild; exclude it from version control if possible.
+- Wrap Supabase queries in typed repository functions (`src/index.ts`), ensuring no client code hits the database directly.
+- Provide Zod schemas or Drizzle models for additional type safety.
+
+### 3.3 `packages/i18n`
+- Merge `lib` and `src` into a single `src` directory.
+- Use `inlang` or `typesafe-i18n` with dynamic imports for locale chunks.
+- Remove checked-in translation artifacts; generate them during build.
+
+### 3.4 `packages/eslint-config` & `packages/typescript-config`
+- Export a single `eslint.config.js` using `@typescript-eslint` and `eslint-plugin-svelte`.
+- Provide `tsconfig.base.json` with strict defaults; each package extends from it.
+
+## 4. Supabase & Database
+- Consolidate SQL migrations under `supabase/migrations/`; remove duplicate root `migrations` folder.
+- Use [Supabase CLI](https://supabase.com/docs/guides/cli) with `config.toml` for environments (dev/staging/prod).
+- Implement Row Level Security in SQL files; audit policies for least privilege.
+- Create seed scripts for local dev (`supabase seed`) and ensure migration tests run in CI.
+
+## 5. Scripts & Tooling
+- Move `scripts/analyze-bundle.js` and `advanced-bundle-analysis.js` to a `tools/` directory or convert into reusable pnpm scripts.
+- Remove unused or experimental scripts.
+- Introduce Husky or lefthook for pre‑commit linting and formatting.
+
+## 6. Testing & CI
+- Set up GitHub Actions or Vercel Deploy Hooks to run `pnpm lint`, `pnpm check`, `pnpm test`, and `pnpm build` on every PR.
+- Use [Test Containers](https://testcontainers.com) or Supabase's Docker image for integration tests.
+- Enforce code coverage thresholds and run E2E tests for critical flows (auth, payments, dashboard actions).
+
+## 7. Production Hardening
+- Implement content security policy headers and HTTP security headers in `hooks.server.ts`.
+- Use `@sveltejs/adapter-node` or `adapter-vercel` with edge functions depending on deployment target.
+- Configure Supabase auth cookie rotation and refresh logic on the server.
+- Set up error logging and monitoring (Sentry or Supabase logs) for both server and client.
+
+## 8. Documentation & Developer Experience
+- Create a concise `CONTRIBUTING.md` explaining workspace commands, environment setup, and code style.
+- Maintain an up‑to‑date `API.md` generated from database types and server endpoints.
+- Provide a `PLAYBOOK.md` describing deployment, backups, and incident response.
+
+---
+By executing this plan, the repository will shed unused assets, follow current best practices for SvelteKit 2 + Svelte 5, leverage Supabase effectively, and ship a maintainable, production‑ready application.
