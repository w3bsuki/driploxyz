# Codex Refactor Audit Log

Author: Codex CLI
Status: Ongoing — iterative de‑bloat and production hardening.

## Principles

- Delete first; no new features.
- One source of truth per concern (auth, rate limiting, env, Supabase client).
- Standardize toolchain; limit deps to where they’re used.
- Keep SSR/edge boundaries explicit; never leak server‑only deps client‑side.

## Phase 1 — Concrete Bloat Findings (Round 1)

Each item lists evidence, action, and acceptance criteria. Assign and track via PR links in “Progress.”

1) Duplicate Admin Surfaces
- Evidence: `apps/admin` and `apps/web/src/routes/(admin)` both exist.
- Action: Pick one surface (recommend: keep `apps/web/(admin)`); delete the other; update navigation/links.
- Acceptance: Only one admin app remains; `pnpm build` succeeds; admin pages reachable.
- Progress: TODO

2) Committed Env Files Risk
- Evidence: `.env.local` present at root and in apps: `/.env.local`, `apps/web/.env.local`, `apps/admin/.env.local`.
- Action: Remove all tracked `.env.local`; keep `.env.example` updated with all required vars per app.
- Acceptance: No secrets tracked; local dev works using developer’s local env.
- Progress: TODO

3) Rate Limiter Duplication
- Evidence: `apps/web/src/lib/security/rate-limiter.ts` and `apps/web/src/lib/server/rate-limiter.ts`.
- Action: Keep server version in `lib/server/rate-limiter.ts`; delete `lib/security/rate-limiter.ts`; migrate imports.
- Acceptance: No imports from `lib/security/rate-limiter`; lint/typecheck pass.
- Progress: TODO

4) Service Worker in .ts and .js
- Evidence: `apps/web/src/service-worker.ts` and `apps/web/src/service-worker.js` both present.
- Action: Keep `.ts` source; remove `.js` from source control.
- Acceptance: Single SW built by Vite; no source `.js` committed.
- Progress: TODO

5) Root and Package Build Artifacts
- Evidence: Root `dist/`; app/package build folders and caches (`.svelte-kit/`, `.turbo/`, `.vercel/`, `playwright-report/`, `test-results/`) exist in workspace.
- Action: Ensure these are gitignored and remove if tracked. Keep build outputs out of VCS.
- Acceptance: Clean repo; artifacts generated locally/CI only.
- Progress: TODO

6) `packages/ui` Clutter and Source Layout
- Evidence: `packages/ui/src` contains many `.d.ts` files, a stray `nul`, and `typescript-errors.txt`; `index.ts` at package root is empty.
- Action: Prune unused artifacts (`typescript-errors.txt`, `nul`, any unused declarations). Decide: a) keep a minimal used surface with proper source + `svelte-package` build, or b) inline only the used components into `apps/web` and remove the package.
- Acceptance: `apps/web` builds; imports resolve; unused exports removed; package size reduced or package deleted.
- Progress: TODO

7) Supabase Typegen/Exports Hygiene
- Evidence: `packages/database/src/generated.ts` exists but is empty; `src/index.ts` re‑exports from `./generated.js` while sources are `.ts`; root `postinstall` runs `supabase gen` and can break installs.
- Action: Remove root `postinstall` typegen; run `pnpm db:types` explicitly in CI. Fix exports to match built output (or keep everything in `src` and do not point to `.js` that doesn’t exist prebuild).
- Acceptance: `pnpm i` works offline; `pnpm build`, `pnpm check-types` pass without `postinstall`; consumers import generated types successfully.
- Progress: TODO

8) Toolchain Version Drift
- Evidence: Tailwind v4 in root; Tailwind v3 in `apps/admin`. Mixed `svelte/@sveltejs/kit/vite` versions among apps.
- Action: Standardize on a single set (recommended: Svelte 5.x, SvelteKit 2.36.x, Vite 7.x; Tailwind v4 or v3 — pick one). Align Vitest/Playwright versions.
- Acceptance: All apps build/tests pass with unified majors; redundant root deps removed.
- Progress: TODO

9) Root‑Level CSS/Plugin Deps
- Evidence: Root `package.json` depends on `@tailwindcss/*`, `postcss`, `autoprefixer` while apps also manage styling.
- Action: Keep styling deps only in apps that use them; remove from root unless truly shared for builds.
- Acceptance: No redundant root CSS deps; app builds unaffected.
- Progress: TODO

10) Heavy Dep: `sharp`
- Evidence: `apps/web/package.json` lists `sharp` (server‑side image processing).
- Action: Verify all `sharp` imports are server‑only (`+server.ts`/server libs). If adapter‑only, consider `devDependencies` and ensure no client bundling.
- Acceptance: Client bundles do not include `sharp`; SSR paths work.
- Progress: TODO

11) Sentry Sourcemaps Upload Scope
- Evidence: `apps/web/vite.config.ts` includes `@sentry/vite-plugin` behind `NODE_ENV==='production'` check.
- Action: Ensure this runs only in CI production builds with `SENTRY_*` envs set; no uploads on local dev.
- Acceptance: Prod releases upload maps; local builds/dev unaffected.
- Progress: TODO

12) `apps/docs` Go‑Live Decision
- Evidence: Separate SvelteKit app under `apps/docs` with its own test stack.
- Action: If docs aren’t part of MVP, remove the app or fold docs into `apps/web` routes.
- Acceptance: One fewer app to maintain; links updated.
- Progress: TODO

## Phase 2 — Dependency & Config Alignment (Targets)

- Svelte 5.x, SvelteKit 2.36.x, Vite 7.x
- Testing: Vitest 3.x, Playwright 1.55.x, axe
- Styling: Tailwind v4 (+ `@tailwindcss/vite`) OR Tailwind v3; pick one and standardize
- Observability: Sentry only in `apps/web` (unless justified elsewhere)
- Payments/Emails: `stripe`, `@stripe/stripe-js`, `resend` only where used

## Phase 3 — Tracking Tasks (PR‑Oriented)

- TASK‑01: Consolidate Admin (delete redundant)
  - Paths: `apps/admin`, `apps/web/src/routes/(admin)`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑02: Remove Committed Secrets
  - Paths: `/.env.local`, `apps/*/.env.local`; update `.env.example`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑03: Rate Limiter Unification
  - Paths: `apps/web/src/lib/security/rate-limiter.ts`, `apps/web/src/lib/server/rate-limiter.ts`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑04: Service Worker Source Cleanup
  - Paths: `apps/web/src/service-worker.js` (delete), keep `.ts`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑05: Artifact Cleanup & .gitignore Audit
  - Paths: root `dist/`; `.svelte-kit/`, `.turbo/`, `.vercel/`, `playwright-report/`, `test-results/`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑06: Prune `packages/ui` or Inline
  - Paths: `packages/ui/*` (remove `typescript-errors.txt`, `nul`, unused `.d.ts`)
  - Owner: TBD • Status: TODO • PR: —

- TASK‑07: Supabase Typegen & Exports Fix
  - Paths: root `package.json` postinstall; `packages/database/src/*`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑08: Version Standardization
  - Paths: `apps/*/package.json`, root `package.json`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑09: Scope Stripe/Resend/Sentry
  - Paths: root and app `package.json`
  - Owner: TBD • Status: TODO • PR: —

- TASK‑10: SSR‑Only `sharp`
  - Paths: `apps/web` imports, bundling config
  - Owner: TBD • Status: TODO • PR: —

- TASK‑11: Docs App Decision
  - Paths: `apps/docs` or new `apps/web/src/routes/docs`
  - Owner: TBD • Status: TODO • PR: —

## Evidence Notes (Pointers)

- Env files observed: `/.env.local`, `apps/web/.env.local`, `apps/admin/.env.local`.
- Duplicate rate limiter modules: `apps/web/src/lib/security/rate-limiter.ts` vs `apps/web/src/lib/server/rate-limiter.ts`.
- Service worker duplication: `apps/web/src/service-worker.ts` and `.js` side‑by‑side.
- Root `dist/` folder present; verify not tracked.
- `packages/ui` unusual files: `packages/ui/nul`, `packages/ui/typescript-errors.txt`; many `.d.ts` under `packages/ui/src`.
- `packages/database/src/generated.ts` empty; `src/index.ts` re‑exports `./generated.js` but sources are TS.

## Open Questions

1) Which admin surface do we keep? (`apps/admin` vs `web/(admin)`)
2) Is `packages/ui` intended to be a published library or only internal? If internal, consider inlining to reduce surface area.
3) Are docs part of go‑live? If not, remove or fold into `web`.

---

Use this log as the source of truth for refactor tasks. Please update each TASK with PR links, concise change summaries, and before/after notes (dep counts or bundle size) upon completion.

