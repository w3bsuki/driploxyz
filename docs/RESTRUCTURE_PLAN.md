# Driplo Restructure Plan

_Last updated: 2025-10-12_

## Objectives

- Align every app and package with SvelteKit 2 / Svelte 5 official structure and packaging guidance.
- Normalize dev tooling around a single Turborepo + pnpm workflow that caches correctly and runs identically on CI and local.
- Remove legacy context files, redundant configs, and dead code while keeping a concise knowledge base.
- Deliver a deployment posture that matches Vercel recommendations (clear env management, minimal `vercel.json`, edge-ready adapters).
- Leave the repo in a state where a fresh contributor can run `pnpm install && pnpm dev --filter web` and succeed within minutes.

## Guiding Principles

1. **Source-of-truth structure**: Each SvelteKit app keeps the canonical `src/routes`, `src/lib`, and `src/lib/server` hierarchy, with shared primitives exported from packages instead of local aliases.
2. **Package boundaries**: Shared code lives in `packages/` and exports built artifacts (not raw source) using `exports` maps that include `types`, `svelte`, and `default` conditions as needed.
3. **Turbo discipline**: Tasks must declare minimal `inputs`, rely on `^task` topological dependencies, and use package-level overrides instead of root special cases.
4. **One configuration per concern**: TypeScript, ESLint, Vitest, and Playwright all inherit from central configs; app-level files are thin wrappers.
5. **Documentation over prompts**: Replace ad-hoc phase markdowns with curated docs that stay short, current, and reference this plan.

## Current Pain Points

- Redundant configuration files per app (Vite, ESLint, TS) and bespoke aliases that bypass package exports.
- `turbo.json` references individual packages and bloats `env` configuration, reducing cache hits and increasing maintenance.
- Shared ESLint config sets `no-restricted-imports` incorrectly, causing repo-wide lint failure.
- `packages/ui` exports Svelte source directly, tracks build artifacts in git, and duplicates styles without a clear token strategy.
- Historical prompt/audit files clutter the root and `docs/`, obscuring active documentation.
- `vercel.json` encodes multi-host headers that should live in middleware or app-specific adapters.

## Phase Roadmap

### Phase 1 – Repository Hygiene & Governance (Week 1)

**Goals**: Remove context bloat, document active surfaces, adopt cross-platform clean commands.

- Archive obsolete planning files into `docs/archive/` and introduce a short `docs/README.md` cataloguing living documents.
- Add `pnpm clean` script that removes `.svelte-kit`, `.turbo`, `dist`, coverage artifacts using Node-friendly tooling.
- Ensure `.gitignore` and `.vercelignore` cover all generated folders (`dist/`, `.svelte-kit/`, `.turbo/`, `playwright-report/`).
- Publish CODEOWNERS + contribution checklist aligned with new plan.

**Deliverables**: Updated documentation tree, clean script, ignore files, CODEOWNERS.

### Phase 2 – Toolchain Alignment (Weeks 1–2)

**Goals**: Standardize lint, typecheck, build, and test flows across the monorepo.

- Bump root `package.json` to `pnpm@9` (or current LTS) and enforce Node 22 range.
- Rebuild `turbo.json` to use `dependsOn: ["^build"]`/`"^lint"` style dependencies, lean `inputs`, and per-package overrides for special outputs.
- Fix `@repo/eslint-config` by scoping package boundary rules with `files` selectors and exporting a default config array.
- Centralize TS configs: ensure workspace packages extend `@repo/typescript-config/base.json`, apps extend `.svelte-kit/tsconfig.json` via the base.
- Introduce shared Vitest/Playwright configs in `@repo/testing` consumed by apps/packages.

**Deliverables**: Normalized toolchain configs, passing `pnpm lint`, `pnpm check-types`, and `pnpm test` (allowing existing code issues to surface for later phases).

### Phase 3 – Application Consolidation (Weeks 2–3)

**Goals**: Make `apps/web`, `apps/admin`, and `apps/docs` first-class SvelteKit apps with minimal duplication.

- Replace manual aliasing (`'@repo/ui': '../../packages/ui/src/lib/index.ts'`) with package exports; adjust Vite SSR settings accordingly.
- Factor shared Vite plugin setup (Tailwind, Paraglide, enhanced image) into a reusable helper imported by each app.
- Move app-specific utilities into `src/lib` while pushing reusable logic into packages.
- Normalize environment handling: single template `.env.example` per app that references root `scripts/setup-env.mjs` (if needed).

**Deliverables**: Clean app configs, reduced aliasing, consistent env scaffolding.

### Phase 4 – Package Hardening (Weeks 3–4)

**Goals**: Turn shared packages into publishable, well-typed modules.

- `@repo/ui`: generate dist via `svelte-package`, point exports to `dist`, include declaration maps, move shared styles into `src/lib/styles`, add smoke tests via Vitest + Testing Library.
- `@repo/core` & `@repo/domain`: align on `tsup` or project references, ensure `exports` cover documented APIs, remove shell-only scripts (`rm -rf`).
- `@repo/database`: replace direct Supabase client usage with typed helpers exposing only needed functions; confirm `files` excludes raw migrations (kept in `supabase/`).
- `@repo/i18n`: provide a `build` script that emits stable module paths and re-export Paraglide runtime from package root.

**Deliverables**: Consistent package builds, updated exports, minimal tracked artifacts.

### Phase 5 – Quality Automation (Weeks 4–5)

**Goals**: Achieve reliable CI/CD feedback.

- Adopt Turborepo GitHub Actions template with `.turbo` caching and env secrets for remote cache (optional).
- Define per-package/unit test targets in Turbo (`test:unit`, `test:integration`), ensuring caches respect `inputs` (e.g., `src/**/*.{test,spec}.{ts,js}`).
- Add baseline Playwright journeys for storefront checkout and admin login; gate longer suites behind filters or workflow dispatch.
- Enforce lint/type/test in pre-push via `pnpm dlx lefthook` or similar if desired.

**Deliverables**: Green CI pipeline, documented test commands, initial coverage targets.

### Phase 6 – Deployment Realignment (Week 5)

**Goals**: Simplify production configuration to match Vercel guidance.

- Trim `vercel.json` to security headers shared by all apps; move locale/host-specific logic into SvelteKit middleware or adapter config per app.
- Validate adapter settings (likely `adapter-vercel` defaults) and consider edge routing on a per-route basis for high-traffic endpoints.
- Document environment variable sourcing (Vercel project dashboard, secrets) and add `docs/deployment.md` summarizing deploy steps.

**Deliverables**: Minimal `vercel.json`, per-app deployment instructions, optional middleware for locale headers.

### Phase 7 – Documentation & DX (Week 6)

**Goals**: Ensure knowledge stays fresh and concise.

- Rewrite `README.md` metrics to reflect reality; link to `docs/RESTRUCTURE_PLAN.md`, `docs/ARCHITECTURE.md`, and `docs/DEVELOPMENT.md` only.
- Update `ARCHITECTURE.md` once structural changes land; include diagrams of apps ↔ packages ↔ Supabase.
- Create `docs/refactor-log.md` to track future structural changes in changelog form.
- Provide onboarding checklist (clone → install → run) validated against fresh environment.

**Deliverables**: Concise documentation set, onboarding checklist, architecture updates.

## Cross-Cutting Tracks

- **Type Safety**: Continue fixing TypeScript errors as packages are hardened; target zero errors by end of Phase 5.
- **Internationalization**: Ensure Paraglide build fits within new package boundaries and translations remain single-source.
- **Performance**: Profile builds after Phase 2 and Phase 4, using Turborepo stats and optional Rollup visualizer snapshots.

## Success Metrics & Quality Gates

| Metric | Target | Verification |
| --- | --- | --- |
| `pnpm lint` | Pass with zero errors | CI pipeline & local run |
| `pnpm check-types` | Zero TS errors across repo | CI pipeline |
| `pnpm test` | All suites pass, coverage ≥40% in apps/web, 50% in packages/ui/domain/core | Coverage reports |
| `pnpm build` | Complete without overrides; Turbo cache hit rate ≥70% on CI | Turbo logs |
| Onboarding | New dev setup < 15 minutes | Documented dry run |

## Risks & Mitigations

- **Scope creep**: Freeze new feature work during Phase 2–4; open follow-up tickets for out-of-scope findings.
- **Cache invalidation regressions**: Pilot Turbo changes on a feature branch with repeated CI runs before merging.
- **Package API breaks**: Introduce changes with semantic version bumps (even if internal) and changelog entries.
- **Team throughput**: Parallelize by assigning packages/apps per owner; run weekly checkpoint reviews.

## Next Actions

1. Approve this plan and publish it as the authoritative restructuring reference.
2. Spin up tracking issues or GitHub Projects board per phase.
3. Begin Phase 1 tasks (documentation cleanup, clean script, ignore updates).
4. Schedule a checkpoint after Phase 2 to reassess timelines.
