# Full Repo Cleanup Plan (Post shadcn-svelte Migration)

This plan turns the monorepo into a lean, production-first codebase after migrating UI to shadcn-svelte.
Follow the phases in order; each phase has concrete checks and commands.

---

## Phase 0 — Preconditions
- Node: >= 20.19 (22.x recommended)
- PNPM: 9.x (repo sets `packageManager: pnpm@9.x`)
- Svelte: 5.x (runes mode)
- Vite: 7.x

Commands:
```
node -v
pnpm -v
pnpm -w i
```

---

## Repo-Specific Findings (Actionable)

- Versions drift across apps: unify SvelteKit, Vite, Tailwind plugin.
  - web: `@sveltejs/kit ^2.36.2`, admin: `^2.22.0`, docs: `^2.25.1`.
  - Tailwind plugin: web/admin `^4.1.12` vs docs `^4.0.23`.
  - Action: add root `pnpm.overrides` and align each `package.json`.

- Runtime mismatch in adapters: web uses `nodejs22.x`, admin `nodejs20.x`.
  - Action: standardize to `nodejs22.x` (or 20.x) across apps.

- Duplicate Lighthouse configs: both `.lighthouserc.json` and `.lighthouserc.yml` exist.
  - Action: keep one (prefer YAML), remove the other, and update `package.json` script targets accordingly.

- Empty/placeholder packages: `packages/core` and `packages/stripe` have only `node_modules/`.
  - Action: either scaffold proper packages (with `package.json` + src) or remove from workspace.

- `packages/ui` contains app-specific components under `src/components/*` alongside shadcn under `src/lib/components/ui/*`.
  - Action: move app-specific widgets (e.g., `PricingCard`, `ImageUploader`) into app repos (e.g., `apps/web/src/lib/components/...`) or into a `@repo/features` package; keep `@repo/ui` focused on generic UI.

- Root Prettier script misses Svelte and common formats.
  - Current: `prettier --write "**/*.{ts,tsx,md}"`
  - Action: include `svelte,json,yaml,yml,css,scss,mdx` and align Prettier plugins. Example: `prettier --write "**/*.{js,ts,tsx,svelte,css,scss,md,mdx,json,yaml,yml}"`.

- Type config duplication: apps `tsconfig.json` contain repeated options and extend `./.svelte-kit/tsconfig.json` directly.
  - Action: expose a base in `@repo/typescript-config` (e.g., `base.json` and `svelte.json`) and have apps extend it to reduce drift.

- Lint config is centralized, but tasks/scripts vary.
  - Action: standardize `scripts` across apps/packages: `lint`, `check`, `build`, `test` for Turbo consistency; avoid `check-types` vs `check` drift (root currently runs `turbo run check-types`).

- No CI workflows in `.github/workflows/`.
  - Action: add CI covering install, build, `svelte-check`, lint, and optional knip/depcheck. Include Lighthouse/Bundlesize on a nightly job.

- Dev server port overlap: `admin` runs on `5174`; `docs` hardcodes `server.port: 5174`.
  - Action: pick unique ports or let Vite choose automatically to allow concurrent dev.

- Performance tooling sprawl: `performance-tests`, `performance-test-results`, and two LHCI configs.
  - Action: consolidate into `performance/` with a single config and output folder; gate heavy tests to CI nightly to reduce local noise.

---

## Phase 1 — UI Direction Lock
- Single UI library: shadcn-svelte (via `packages/ui`).
- Bits UI: confined to shadcn components only (do not import in apps directly).
- Melt UI: zero usages in repo.

Checks:
```
# No direct Bits in apps
grep -RIn "from 'bits-ui'\|from \"bits-ui\"" apps || true
# No melt-ui anywhere
grep -RIn "@melt-ui\|melt-ui" . || true
```

---

## Phase 2 — Vite/Svelte Alignment
- Dedupe `svelte` in Vite resolve across apps.
- Alias `@repo/ui` to source during dev.
- SSR `noExternal`: `@repo/ui`, `bits-ui`, `svelte-sonner`, `svelte-toolbelt`.
- OptimizeDeps `exclude`: same as above.
- Compiler runes: `compilerOptions.runes = true` in all Svelte configs.

Quick verify:
```
# spot-check vite configs
sed -n '1,120p' apps/web/vite.config.ts
sed -n '1,120p' apps/admin/vite.config.ts
sed -n '1,120p' apps/docs/vite.config.ts
```

---

## Phase 3 — Tailwind v4 Unification
- Use `@tailwindcss/vite` plugin everywhere.
- Remove legacy Tailwind v3 configs/postcss artifacts.
- Import UI CSS once in app entry (tokens, semantic, globals).

Checks:
- apps/web imports: `@repo/ui/styles/*` in layout/entry.
- No old `content` globs (v4 ignores).

---

## Phase 4 — shadcn Components Installed
- Components added via CLI under `packages/ui/src/lib/components/ui/*`.
- Adapters in `packages/ui/src/lib/adapters/shadcn/*` mapping old → new APIs.

Checks:
```
ls -R packages/ui/src/lib/components/ui | sed -n '1,200p'
```

---

## Phase 5 — Replace Legacy Components
- Migrate usages in `apps/*` to import from `@repo/ui` (adapters or shadcn direct) instead of old components.
- Delete `packages/ui/src/lib/*` legacy files once unused.

Find usages:
```
grep -RIn "from '@repo/ui'" apps | sed -n '1,200p'
# For each legacy component name, search usages then replace/remove
```

---

## Phase 6 — Purge Duplicates, Demos, Artifacts
- Remove example/demo files, experimental components, and unused folders.
- Remove `apps/docs` if not required in prod (or archive it).
- Delete generated `.svelte-kit`, build caches, old `dist` in apps (keep `@repo/ui/dist`).

Candidates:
- `apps/docs/` (if not part of prod)
- `performance-tests/` and `performance-test-results/` (if not required)
- `playwright` e2e (keep only if essential)
- `packages/ui/src/lib/components/*` duplicates vs `components/ui/*`
- `packages/ui/src/lib/skeleton/*` (remove if unused)
- `packages/ui/src/lib/*` experimental or “unused” (commented as such)
- `packages/core/` and `packages/stripe/` empty packages (remove or scaffold)

Commands:
```
# Identify empty/unused dirs quickly
find packages -type d -empty

# Remove build artifacts at root
pnpm -w dlx rimraf .turbo node_modules .pnpm-store
pnpm -w i
```

---

## Phase 7 — Dependency Hygiene
- Remove unused deps (Flowbite, etc.) once verified unused.
- Keep `bits-ui` only in `@repo/ui` (needed by shadcn-svelte).
- Unify versions of shared deps across packages.

Tools:
```
# Unused files/exports (supports Svelte reasonably well)
pnpm -w dlx knip --production

# Unused dependencies (per package)
pnpm -w dlx depcheck apps/web
pnpm -w dlx depcheck apps/admin
pnpm -w dlx depcheck packages/ui

# Prune pnpm store
pnpm store prune
```

Alignment:
- Add root `pnpm.overrides` to pin shared versions (SvelteKit, Vite, Tailwind, Vitest).
- Prefer peerDependencies in `@repo/ui` for app-owned libs; keep `bits-ui` only in `@repo/ui`.
- Remove duplicate Lighthouse configs; keep one and update scripts.

---

## Phase 8 — Type Safety & Linting
- Run `svelte-check` on apps and `@repo/ui`.
- Consolidate ESLint config; remove duplicates.
- Ensure TS configs extend from `@repo/typescript-config` where possible.

Commands:
```
pnpm -F @repo/ui check
pnpm -F web check
pnpm -F @repo/admin check
```

Standardization:
- Replace root `check-types` with `check` across the repo or add a `check` wrapper at root to call `turbo run check`.
- Expose and consume `@repo/typescript-config/{base,svelte}.json` in all apps/packages.
- Ensure root Prettier script covers Svelte and common formats.

---

## Phase 9 — Build & Bundle Size
- Build per app; ensure no `.svelte` import errors.
- Analyze bundles; remove heavy/unused modules.

Commands:
```
pnpm -F @repo/ui build
pnpm -F web build
pnpm -F @repo/admin build

# Existing analysis
pnpm run bundle-analysis
```

Budgets:
- Define bundle budgets per route (homepage, search, category) and track drift.
- Ensure i18n chunks are split as configured; flag unexpected large chunks.

---

## Phase 10 — Production Flags & Observability
- Sentry plugin only in prod builds (already gated in web).
- Remove dev-only logging and flags.
- Verify env vars used and documented; remove dead envs.
- Align Vercel adapter runtime across apps (pick Node 22 or 20 consistently).
- Add error boundary/reporting patterns for UI lib where applicable (e.g., toasts).

---

## Phase 11 — CI, Releases, and Docs
- CI: build, check, lint pipelines; fail on unused exports (optional knip CI).
- README: minimal setup/run docs; link to playbooks.
- Consider Changesets for versioning `@repo/*` packages.
- Add CI matrix for Node 20 and 22 to verify runtime compatibility.
- Nightly job: Lighthouse CI + bundle analysis; store artifacts.
- Pre-commit hooks: Husky + lint-staged for `eslint --fix` and `prettier`.

---

## Phase 12 — Final Verification
- Cold clone, fresh install, build, and dev run pass on Node >= 20.19.
- Smoke test critical user flows.
- Tag commit as “post-migration cleanup baseline”.

Checklist:
- [ ] No `@melt-ui/*` imports
- [ ] No direct Bits in apps
- [ ] Tailwind v4 everywhere
- [ ] Runes mode everywhere
- [ ] Apps build and preview OK
- [ ] Bundle size acceptable
- [ ] Tests pass (kept set only)
- [ ] Readme + envs updated
- [ ] Single Lighthouse config in place
- [ ] Unique dev ports across apps
- [ ] CI green on Node 20 and 22

Notes
- shadcn-svelte depends on Bits UI primitives; removing Bits entirely is not viable unless you reimplement primitives. Keep Bits as a dependency of `@repo/ui` only.
