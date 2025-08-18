**Executive Summary**
- **Monorepo**: `apps/web` (main app), `apps/docs` (docs), `packages/ui` (component library), `packages/i18n` (Paraglide), `packages/database` (Supabase types), shared ESLint/TS configs.
- **Frameworks**: Svelte 5 + SvelteKit 2, Vite 7, TypeScript 5.8. Good alignment overall.
- **Key Issues**: Tailwind version mismatch (root v4 vs app v3), duplicated Supabase client/types and mixed versions, a leaked Supabase anon key in `test-auth.mjs`, stray/unused files, test/demo routes shipping in app, overly permissive CSRF.
- **Refactor Priority**: Unify Tailwind and Supabase versions, centralize DB types, remove secrets and dead code, tighten security, and streamline adapters/configs.

**Tech Stack & Versions**
- **Svelte**: `svelte@^5.36.12` with rune syntax in components. Good.
- **SvelteKit**: `@sveltejs/kit@^2.25.1`. Good and current.
- **Vite**: `^7.0.0`. Good.
- **TypeScript**: `5.8.2` (root configs author `moduleResolution: NodeNext`). Good.
- **ESLint**: v9 flat config with `eslint-plugin-svelte` v2 and `typescript-eslint` v8. Good.
- **TailwindCSS**:
  - Root: `tailwindcss@^4.1.11` (+ plugins and postcss/autoprefixer at root).
  - `apps/web`: `tailwindcss@^3.4.0` with classic `tailwind.config.js` and `postcss.config.js`.
  - Mismatch between root v4 and app v3; app is effectively using v3.
- **Supabase**:
  - `apps/web`: `@supabase/supabase-js@^2.55.0`, `@supabase/ssr@^0.6.1` (good for Kit 2).
  - `packages/database`: `@supabase/supabase-js@^2.46.2` (mismatch with web); provides generated DB types.

**SvelteKit & App Architecture**
- **Adapter**: `apps/web/svelte.config.js` uses `@sveltejs/adapter-vercel` with `{ runtime: 'nodejs20.x', split: false, isr: { expiration: 60 }}`. That’s sensible for Vercel Node runtimes and ISR.
- **CSRF**: `csrf.checkOrigin: false` is globally disabled. This is risky; recommend scoping or enabling with an allowlist of origins.
- **Hooks**: `src/hooks.server.ts` correctly creates a Supabase SSR server client, defines `safeGetSession`, sequences an auth guard, and filters headers. Pattern is solid.
- **Svelte 5 usage**: Components use runes (`$props`, `$derived`, `$state`, `$effect`). Looks good and consistent.

**TypeScript Usage**
- **Code**: App and packages are TypeScript-first; no `.js` in `apps/web/src`.
- **Configs**: JS for configs (`svelte.config.js`, `postcss.config.js`, `tailwind.config.js`) is fine. TS configs extend a shared `@repo/typescript-config/svelte.json` with strict options. Good.
- **Duplication**: `apps/web/src/lib/types/database.types.ts` duplicates DB types that also exist (and should be sourced) from `packages/database`. Centralize on the package to avoid drift.

**Tailwind & Styling**
- `apps/web` uses Tailwind v3 with a classic `tailwind.config.js` and PostCSS pipeline. `content` includes `../../packages/ui/src` and `../../packages/ui/dist` so app classes get picked up from the UI package. Good for v3.
- Root declares Tailwind v4 and plugins — but `apps/web` still depends on v3. This dual-version state is confusing and error-prone. Choose one:
  - Stay on v3 across the monorepo (simplest now), or
  - Upgrade `apps/web` to v4 (remove `tailwind.config.js` or convert to v4 syntax, switch to `@tailwindcss/postcss` in Vite config, drop manual `content` scanning in favor of v4 discovery, and align plugin usage).
- `apps/web/src/app.css` defines Tailwind layers and a small utility. Looks fine.

**Supabase Integration**
- **SSR Client**: `hooks.server.ts` sets `event.locals.supabase` using `@supabase/ssr` with explicit cookie handling. Good.
- **Client Helpers**: `src/lib/supabase/server.ts` and `client.ts` expose `createClient` and a `createServiceClient` (service-role). This duplicates the hooks setup somewhat; acceptable if used for endpoints that need service role.
- **Version Drift**: `apps/web` uses supabase-js `2.55.x` while `packages/database` uses `2.46.x`. Align both to a single version (prefer the newer one) to prevent duplicate installs and typing incompatibilities.
- **DB Types**: `apps/web` uses a local placeholder DB types file. Prefer importing `Database` from `@repo/database` instead.

**UI Package (`packages/ui`)**
- Built with `@sveltejs/package` to `dist`, peer deps `svelte@^5` and `@sveltejs/kit@^2`. Many components, including toasts, uploaders, product UI, onboarding, etc.
- `src/index.ts` provides a comprehensive export surface. Good.
- Stray file: root `packages/ui/index.ts` exports `./components/MyCounterButton.svelte`, but that path doesn’t exist at the root and is inconsistent with `src`. Likely dead/leftover — remove it.
- Tailwind usage: components rely on Tailwind classes; app-side Tailwind scanning already includes `packages/ui` paths (v3). Works today.

**Routing & Pages (`apps/web`)**
- Rich route tree with `/(auth)`, `/(protected)`, `admin`, `category`, `product`, `messages`, `dashboard`, etc. Strong structure.
- Demo/test routes exist: `auth-test`, `i18n-test`, `test`, `bg`, `simple`, `auth/login` (duplicate to `(auth)/login`). These should be hidden behind dev-only conditions or removed for production.
- Layout uses UI toasts and cookie consent and a locale detector. Good cohesion with packages.

**Build & Tooling**
- **Turbo**: Tasks defined for build, lint, check-types, dev. Build passes through `.svelte-kit/**`, `.vercel/**`, `dist/**`, `build/**` as outputs. Env passthrough includes Stripe, Supabase, Resend, Sentry – good.
- **ESLint**: Shared flat config, ignoring `.svelte-kit`. Good.
- **Playwright/Vitest**: Config present; tests minimal (`index.test.ts`).

**Security & Secrets**
- `test-auth.mjs` contains a hardcoded Supabase project URL and anon key committed to the repo. This is a credential leak and should be removed or moved to a local-only script using environment variables.
- Global `csrf.checkOrigin: false` weakens CSRF protection. Prefer enabling and providing allowed origins or handling CSRF per-route where appropriate.

**Duplication, Debt & Over‑Engineering**
- **Tailwind dual-version**: Root v4 vs app v3. Resolve to one version. Impact: build confusion, plugin/version drift.
- **Supabase dual-version**: `2.55.x` vs `2.46.x`. Align versions.
- **DB types duplication**: Local `apps/web/.../database.types.ts` vs `packages/database`. Use the package source of truth.
- **Stray exports**: `packages/ui/index.ts` (root) doesn’t match structure; likely unused.
- **Adapters**: `apps/web` depends on both `@sveltejs/adapter-vercel` and `@sveltejs/adapter-auto`; only vercel is used. Remove `adapter-auto` from web to reduce noise.
- **Demo/test routes**: Keep out of production build or remove.
- **Stripe API version**: `apiVersion: '2024-12-18.acacia'` looks nonstandard; Stripe versions are date-only. Use an official date string or omit to default to the account’s pinned version.

**Concrete Refactor Plan**
1) Tailwind unify (choose v3 now or v4 later)
   - Short term: remove root `tailwindcss`, `postcss`, `autoprefixer`, and plugins; keep Tailwind v3 scoped to `apps/web` and ensure `content` includes `packages/ui` paths.
   - Or migrate `apps/web` to Tailwind v4: replace `postcss` usage with `@tailwindcss/postcss`, drop legacy `tailwind.config.js` or convert to v4 format, audit plugin compatibility, update Vite CSS config.
2) Supabase alignment
   - Bump `packages/database` to `@supabase/supabase-js@^2.55.x` to match web.
   - Replace `apps/web/src/lib/types/database.types.ts` imports with `import type { Database } from '@repo/database'`.
   - Ensure only one supabase-js version is hoisted by pnpm.
3) Remove secrets and dev-only artifacts
   - Delete or relocate `test-auth.mjs`; if needed, change to use `dotenv` and read `SUPABASE_URL`/`ANON_KEY`.
   - Remove/guard demo routes (`auth-test`, `i18n-test`, `test`, `simple`, `bg`) behind a dev flag or delete.
4) Security tightening
   - Re-enable CSRF origin checking and configure `csrf: { checkOrigin: true }` with a whitelist of allowed origins (env-driven for prod vs dev).
5) UI package hygiene
   - Delete `packages/ui/index.ts` (root) and rely on `src/index.ts` + `svelte-package` outputs to `dist`.
   - Optionally add a small usage README and an exports check test.
6) Adapter & deps cleanup
   - Remove `@sveltejs/adapter-auto` from `apps/web` devDependencies.
   - Ensure `apps/docs` mirrors only what it uses (no Tailwind unless necessary).
7) Stripe config
   - Use a valid `apiVersion` date string (e.g., `'2024-06-20'`) or omit to let Stripe manage via dashboard.

**Are We Using Best Practices?**
- **Svelte 5 + Kit 2**: Yes. Good rune adoption and SSR patterns.
- **TypeScript**: Yes. Strict options and TS-first code. Avoid local type duplication.
- **Supabase**: Generally good (SSR/client separation, cookie handling). Align versions and centralize types.
- **Tailwind**: Not yet — version split. Unify or migrate.
- **Configs**: Mostly solid; tighten CSRF and clean unused deps/adapters.

**Quick Wins (Low Risk)**
- Remove `apps/web` devDep `@sveltejs/adapter-auto`.
- Delete `packages/ui/index.ts` (root).
- Remove `test-auth.mjs` or refactor it to read env vars; do not commit secrets.
- Switch web to import DB types from `@repo/database`; delete local placeholder file.
- Change Stripe `apiVersion` to a valid date.

**Nice To Have (Medium Effort)**
- Consolidate Tailwind to a single version (v3 now or migrate to v4).
- Re-enable and configure CSRF origin checking.
- Audit and prune demo/test routes from production builds.
- Add a migration note for Tailwind v4 in repo docs and a checklist script.

**Tailwind v4 Migration Notes (if chosen)**
- Install `tailwindcss@^4` and `@tailwindcss/postcss` in `apps/web`; remove `postcss`/`autoprefixer` if not explicitly needed.
- Replace `tailwind.config.js` scanning with v4 discovery or convert config to v4 style. Verify `packages/ui` class usage is discovered (v4 can read dependencies automatically; if not, add `content.sources`).
- Update Vite config to use the new PostCSS plugin (`css.postcss` to `@tailwindcss/postcss`).
- Re-test UI package components rendering inside the app for class presence.

**Files/Configs Reviewed**
- `apps/web`: `package.json`, `svelte.config.js`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `src/hooks.server.ts`, `src/lib/supabase/*`, routes and components.
- `apps/docs`: simple Svelte app consuming `@repo/ui`.
- `packages/ui`: `package.json`, `svelte.config.js`, `tsconfig.json`, `src/index.ts` and components, build to `dist`.
- `packages/i18n`: `@inlang/paraglide-js` compile flow, exports from `lib/paraglide/*`.
- `packages/database`: exports `src/types.ts` and `generate` script; version drift noted.
- Root: `package.json` (Tailwind v4), `turbo.json`, `pnpm-workspace.yaml`.

**Proposed PR Checklist**
- Tailwind: decide v3 vs v4 and align dependencies/configs accordingly.
- Supabase: bump `packages/database` to `2.55.x`, switch `apps/web` to `@repo/database` types, remove local DB types.
- Security: remove/replace `test-auth.mjs`; add `.env.example` guidance; re-enable CSRF origin check with allowlist.
- Cleanup: remove `adapter-auto` from web; delete `packages/ui/index.ts`; remove demo/test routes or guard behind `dev`.
- Stripe: update `apiVersion` to official date.

If you want, I can implement the quick wins now and stage a follow-up PR for Tailwind/Supabase alignment.

