# 🔍 STRUCTURAL AUDIT REPORT
**Date**: 2025-10-13  
**Auditor**: GitHub Copilot (Svelte MCP · Context7 Turborepo · Supabase MCP)  
**Status**: ⛔ Requires structural overhaul before execution

---

## 0. Methodology
- Repository scan across `apps/`, `packages/`, `supabase/`, and `docs/`, cross-referenced with `docs/ARCHITECTURE.md` and `docs/PROJECT_SITEMAP.md`.
- Svelte guidance from MCP sections `kit/project-structure`, `kit/$lib`, `kit/server-only-modules`, `kit/hooks`, `kit/packaging`, `kit/state-management`, `kit/performance`, `kit/integrations`, and `kit/observability`.
- Turborepo guidance from Context7 `/vercel/turborepo` best-practice snippets covering task graphs, package exports, boundaries, caching, and CI.
- Supabase guidance from docs on Edge Function development environment, development tips, and the maturity model.
- Severity levels: **Critical** (blocks production), **High** (major tech debt), **Medium** (maintainability risk), **Low** (quality-of-life).

---

## 1. Executive summary

| Severity | Count | Themes |
| --- | --- | --- |
| Critical | 8 | Fragmented `$lib`, generated artifacts in VCS, missing Turborepo boundaries, Supabase structure gaps, uncontrolled documentation |
| High | 11 | Package coupling, route hierarchy drift, inconsistent naming, environment governance gaps |
| Medium | 16 | Docs/scripts bloat, redundant utilities, missing automation |

Key conclusions:
- Current layout violates SvelteKit guidance that `src/lib` remain cohesive and server-only utilities live under `$lib/server`.
- Turborepo packages lack tags/boundaries, preventing dependency enforcement and cache-aware pipelines.
- Supabase Edge Functions are under-provisioned (no `_shared`, no fat-function layout) contrary to Supabase recommendations.
- Documentation and generated artifacts (`apps/admin/.svelte-kit`, 6k+ line `docs/PROJECT_SITEMAP.md`) overwhelm the repo and hide signal.
- Without a staged restructure the execution roadmap will continue to accumulate duplicated logic and fragile imports.

---

## 2. Structural red flags (ordered by impact)

1. **`apps/web/src/lib` fragmentation (Critical)**  
   - 30+ top-level modules including both `auth/` and `auth.ts`, violating SvelteKit `$lib` guidance to avoid duplicate entry points.  
   - Security/auth utilities intermingle with UI components; server-only code (middleware, env) sits outside `$lib/server`.  
   - Required fix: collapse into cohesive domains (auth, features, server, utils) with barrel governance, aligning with Svelte "Project structure" and "Server-only modules" docs.

2. **Unhandled build artifacts in apps (Critical)**  
   - `apps/admin/.svelte-kit` and `apps/admin/output` are committed, conflicting with Turborepo best practice to keep generated directories out of source control.  
   - `apps/web/.svelte-kit` and `apps/docs/.svelte-kit` show up in git status during local builds; these directories fail the SvelteKit "server-only modules" guidance because cached manifests can leak secrets when committed.  
   - Add `.gitignore` coverage, reset the tree, and configure `turbo.json` outputs.

3. **Missing Turborepo boundaries & package governance (Critical)**  
   - No `boundaries` config; packages import directly via `@repo/*` without public/internal tags.  
   - Violates Turborepo "structuring a repository" guidance that exports map should replace barrels and boundaries protect internals.

4. **Supabase Edge Functions minimal and flat (Critical)**  
   - Single `send-message` function without `_shared`, tests, or hyphenated naming, contrary to Supabase Edge guidance; `config.toml` lacks per-function overrides.  
   - Introduce `_shared`, separate tests, and enforce fat-function pattern.

5. **Documentation bloat & duplication (Critical)**  
   - `docs/PROJECT_SITEMAP.md` auto-dumped tree (>6k lines) plus overlapping plans (`MASTER_PLAN`, `MASTER_RESTRUCTURE`, etc.).  
   - Consolidate into decision records and runbooks; keep generated inventories out of VCS.

6. **Route hierarchy drift and stale data loading (High)**  
   - Mixed route groups `(admin)`, `(app)` plus duplicated `auth/` routes; `routes/components/` mixes UI with routing.  
   - `+page.ts` loaders in `(marketing)` bypass new `load` conventions (no `depends` keys, no streaming) which conflicts with `kit/performance` and `kit/state-management` guidance.
   - SvelteKit recommends co-locating route-only assets and keeping shared UI in `$lib/components` while leveraging shared stores for cross-route state.

7. **Packages `core` vs `domain` overlap (High)**  
   - Both expose business logic; `packages/domain/src/orders` mirrors `packages/core/src/services/orders`.  
   - Consolidate responsibilities: `core` as service/adapters, `domain` as pure aggregates with explicit exports.

8. **`packages/ui` packaging misalignment (High)**  
   - Components ship from `src/lib`, but `styles/` is global and `files` array omits source for declaration maps.  
   - Follow Svelte packaging guide: include `dist` + `src/lib`, ensure `tsup` outputs ESM/CJS + types, adopt export map per component.

9. **Environment configuration scattered (High)**  
   - `apps/web/src/lib/env/` duplicates server env logic; move to `$lib/server/env` to leverage `$env/static/private` safeguards.  
   - Root lacks documented env promotion path (dev/staging/prod).

10. **Automation gaps (High)**  
   - `packages/testing` unused; `turbo.json` lacks `check-types`, `lint`, `test` tasks with `$TURBO_DEFAULT$` inputs.  
   - CI cannot gate merges on repeatable checks.

11. **Scripts & analyses without ownership (Medium)**  
   - Legacy scripts under `scripts/analysis/legacy/` remain active; archive or annotate owners.

12. **Observability instrumentation & integrations missing (Medium)**  
   - No `src/instrumentation.server.ts` despite `kit/observability` guidance; `hooks.server.ts` omits tracing hooks.  
   - External integrations (Sentry, Feature Flags) are hard-coded per route instead of centralized under `$lib/server/integrations`, violating `kit/integrations` recommendations.

13. **Cache and SEO utilities duplicated (Medium)**  
   - `apps/web/src/lib/cache.ts` overlaps `packages/core/src/utils/cache`; unify under shared package exports.

14. **i18n duplication (Medium)**  
   - `apps/web/src/lib/locale/` overlaps `@repo/i18n`; ensure app consumes Paraglide bundle from package and make Svelte stores derived to match `kit/state-management` runes guidance.

15. **Docs/notes fragmentation (Medium)**  
   - Multiple note files (`notes/post-lint-refactor.md`, `error-inventory.md`) lack linkage to active ADRs or tickets.

16. **Supabase testing absent (Medium)**  
   - No automated Edge Function tests; Supabase docs recommend dedicated `tests/` per function. Integrate Deno tests into Turbo `//#test` pipeline for parity with Context7 task graph patterns.

---

## 3. Detailed audit notes

### 3.1 Root workspace
- `turbo.json` must define `boundaries`, `inputs`, `globalEnv`, and `//#root` orchestration per Context7 guidance. Add tags (`public`, `internal`, `infra`) and propagate via package `turbo.json` files.
- `pnpm-workspace.yaml` should include `supabase/functions/*` to ensure CLI dependencies resolve correctly.
- Split `scripts/` into `scripts/automation/` (maintained) and `scripts/archive/` (frozen). Document entry points in `README.md`.

### 3.2 `apps/web`
- Rebuild `$lib` to a 12-folder ceiling: `auth`, `business`, `client`, `components`, `features`, `forms`, `i18n`, `server`, `stores`, `types`, `utils`, `validation`, `__tests__`.
- Move all server-only logic (`middleware`, `env`, secure clients) beneath `$lib/server`, exploiting Svelte's server-only enforcement.
- Merge `analytics/` + `monitoring/` into `features/observability/`, and surface instrumentation via `src/instrumentation.server.ts`.
- Remove `lib/index.ts` mega-barrel; rely on granular exports to restore tree-shaking.
- Normalize routes: `(marketing)`, `(app)`, `(account)`, `api/`, `auth/`, with shared UI relocated to `$lib/components`.
- Apply `kit/state-management` runes for global stores and treat form actions with progressive enhancement to satisfy `kit/performance` best practices.

### 3.3 `apps/admin`
- Purge `.svelte-kit/` and `output/` from Git; extend `.gitignore` and add Turbo `outputs` entry for caching.
- Introduce `src/instrumentation.server.ts` and align admin hooks with shared integrations bundle.
- Mirror `$lib` taxonomy from web to reduce cognitive overhead.
- Confirm admin imports rely on `@repo/ui` rather than deep relative paths.

### 3.4 `apps/docs`
- Adopt content pipeline: `src/content/` for markdown, `src/routes/(marketing)/` for public pages.
- Replace bespoke `+page.ts` fetchers with shared loaders in `$lib/server/content` to leverage `kit/performance` streaming guidance.
- Ensure `vite.config.ts` and `tsconfig.json` share alias definitions with other apps via `@repo/typescript-config`.

### 3.5 Shared packages
- **`packages/core`**: focus on service/adapters, rehome aggregates to `packages/domain`, expose APIs via `exports` map (`"./auth": "./src/services/auth.ts"`, etc.), and add package-level `turbo.json` with `tags: ["internal"]`.
- **`packages/domain`**: no IO; publish types, policies, and invariants only. Add Vitest coverage for aggregates.
- **`packages/ui`**: structure `src/lib` by domain (`base`, `form`, `layout`, `marketing`, `theme`). Update `package.json` with `files: ["dist", "src/lib"]`, add `exports` map for each component, and `scripts.build = "tsup src/lib/index.ts --format cjs,esm --dts --sourcemap"`.
- **`packages/testing`**: centralize fixtures/mocks; integrate into Turbo pipeline for unit tests across apps and expose helpers compatible with Playwright and Vitest contexts.
- Tag packages (`public` vs `internal`) and configure boundaries to prevent backwards imports.

### 3.6 Supabase
- Restructure per official guidance:
  - `supabase/functions/_shared/{supabaseAdmin.ts,supabaseClient.ts,cors.ts}`
  - Rename `send-message` → `messaging-send` (hyphenated).
  - Add `supabase/functions/tests/messaging-send-test.ts` using Deno.
  - Configure `supabase/config.toml` with per-function `verify_jwt` and `import_map` entries.
- Integrate Supabase CLI tasks into Turbo (`supabase:functions:serve`, `supabase:functions:test`, `supabase:db:migrate`) and register them under root `//#supabase:*` tasks to benefit from caching and filter syntax.
- Adopt maturity-model workflow: migrations only, multi-environment promotion, no dashboard schema edits.

### 3.7 Documentation & knowledge base
- Refactor `docs/` into:
  - `docs/adr/` — decision records.
  - `docs/runbooks/` — operational procedures.
  - `docs/plans/` — active initiatives (single source).
  - Archive legacy plans under `docs/archive/`.
- Remove generated inventories (`docs/PROJECT_SITEMAP.md`) from VCS; replace with script-driven, `.gitignore`d outputs.
- Update `README.md` with canonical structure and links to ADR index.

---

## 4. Target operating structure (ultimate blueprint)

```
driplo-turbo/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── auth/
│   │   │   │   ├── business/
│   │   │   │   ├── client/
│   │   │   │   ├── components/
│   │   │   │   ├── features/
│   │   │   │   ├── i18n/
│   │   │   │   ├── server/
│   │   │   │   ├── stores/
│   │   │   │   ├── types/
│   │   │   │   ├── utils/
│   │   │   │   └── validation/
│   │   │   ├── routes/(marketing)/(app)/(account)/api/
│   │   │   ├── instrumentation.server.ts
│   │   │   └── hooks.server.ts
│   │   └── tests/
│   ├── admin/
│   │   ├── src/lib/{auth,components,server,stores}
│   │   └── src/routes/(admin)/
│   └── docs/
│       ├── src/routes/(marketing)/
│       └── content/
├── packages/
│   ├── core/
│   │   └── src/{services,adapters,server,utils}
│   ├── domain/
│   │   └── src/{aggregates,value-objects,policies}
│   ├── ui/
│   │   └── src/lib/{base,form,layout,marketing,theme}
│   ├── i18n/
│   ├── database/
│   ├── testing/
│   └── eslint-config/
├── infra/
│   ├── supabase/
│   │   ├── functions/_shared/
│   │   ├── functions/<feature>/
│   │   ├── functions/tests/
│   │   └── migrations/
│   ├── scripts/{automation,archive}/
│   └── ci/
├── docs/
│   ├── adr/
│   ├── runbooks/
│   ├── plans/
│   └── roadmap.md
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Principles:
- Each package ships its own `turbo.json` extending the root and declares `tags` for boundaries.
- `$lib/server` contains all server-only utilities (env, middleware, secure clients).
- Supabase functions follow `_shared` + hyphenated names with dedicated tests.
- Documentation trimmed to actionable categories; generated assets excluded from source control. Generated inventories move to `docs/.generated/` (gitignored) per `kit/performance` note on avoiding bundle bloat from markdown imports.

---

## 5. Refactor roadmap

**Phase 0 – Hygiene (Week 1)**
- Remove committed build artifacts (`.svelte-kit`, `output`, `.turbo/cache`) and expand `.gitignore`.
- Introduce Turbo pipelines: `check-types`, `lint`, `test`, `build`, `e2e`, each with precise `inputs` leveraging `$TURBO_DEFAULT$`.
- Add boundaries configuration and package tags; create package-level `turbo.json` files.
- Introduce root `//#lint:root`, `//#test`, and `//#supabase` tasks to align with Context7 orchestration guidance.

**Phase 1 – `$lib` consolidation (Weeks 2–3)**
- Merge `auth.ts` into `auth/helpers.ts`, reorganize utilities, and migrate server-only logic under `$lib/server`.
- Rewrite imports to new domain structure; remove `lib/index.ts` barrel.
- Normalize route groups and move shared UI to `$lib/components`.

**Phase 2 – Package realignment (Weeks 4–6)**
- Split responsibilities between `@repo/core` and `@repo/domain`, updating exports and consumers.
- Harden `@repo/ui` packaging (directory taxonomy, build scripts, exports, declaration maps).
- Publish `@repo/testing` and integrate across apps for unit tests.

**Phase 3 – Supabase & infrastructure (Weeks 7–8)**
- Build `_shared` helpers, rename functions, add Deno tests, configure `config.toml` overrides.
- Wire Supabase CLI flows into Turbo/CI, enforce migrations-first workflow per maturity model.

**Phase 4 – Documentation & enablement (Weeks 9+)**
- Convert existing plans into ADRs/runbooks, archive redundant documents.
- Add automation to regenerate sitemap outside the repo and link from README.

Each phase must exit with green `sv check`, ESLint, `tsc`, Vitest, Supabase tests, and Playwright smoke tests.

---

## 6. Automation & quality gates

| Gate | Tooling | Target |
| --- | --- | --- |
| Static analysis | `sv check`, ESLint (`@repo/eslint-config`), `tsc --noEmit` | Run on every PR via Turbo tasks |
| Unit tests | Vitest (packages/apps), Svelte component tests | >80% coverage for core/domain |
| Browser tests | Playwright (web/docs) | Smoke flow on CI with caching |
| Supabase | `supabase db diff`, `supabase functions test` | Required pre-merge |
| Packaging | `pnpm build --filter @repo/ui`, `changeset pre` | Validate exports & types |
| Observability | `instrumentation.server.ts` + Sentry hook | Verified in staging |

CI should leverage Turborepo caching (optional remote cache) and enforce branch protection with required checks.

---

## 7. References

- **SvelteKit** — MCP sections `kit/project-structure`, `kit/$lib`, `kit/server-only-modules`, `kit/hooks`, `kit/packaging`, `kit/auth`.
- **Turborepo** — Context7 `/vercel/turborepo` guidance on exports, boundaries, task inputs, caching, and CI workflows.
- **Supabase** — Docs on Edge Function development environment, development tips, and the maturity model (fat functions, `_shared` helpers, migrations-first).

These sources supply the binding requirements for the target structure and automation strategy.

---

## 8. Marked for deletion / archival

| Path | Rationale | Disposition |
| --- | --- | --- |
| `apps/admin/.svelte-kit/` | Generated SvelteKit output; violates Svelte guidance to keep build artifacts out of VCS | Delete immediately and add to `.gitignore` |
| `apps/admin/output/` | Build artifact committed alongside static exports | Delete; rely on Turbo `build` outputs |
| `apps/web/.svelte-kit/` | Occasionally committed when local builds run; leaks server manifest | Delete if present, ensure `.gitignore` rule |
| `apps/docs/.svelte-kit/` | Same as above for docs app | Delete if present, ensure `.gitignore` rule |
| `docs/PROJECT_SITEMAP.md` | Auto-generated inventory (>6k lines) obscures signal and bloats repo per `kit/performance` guidance | Replace with gitignored generated report |
| `scripts/analysis/legacy/` | Legacy scripts with no owners; flagged in audit section 3.1 | Archive under `scripts/archive/` or delete |
| `MASTER_PLAN_ENHANCEMENTS.md`, `MASTER_RESTRUCTURE_PLAN.md` | Duplicative planning docs; superseded by ADR/runbook structure | Move to `docs/archive/` |
| `notes/dependency-baseline-restore.md`, `notes/post-lint-refactor.md` | Informal notes with no ADR linkage | Fold into ADRs or delete after extraction |
| `supabase/functions/send-message` | Rename to `messaging-send`; remove legacy folder after migration | Delete post-migration |

---

## 9. Next actions checklist

- [ ] Approve hygiene cleanup PR (artifact removal, `.gitignore`, boundaries scaffold).
- [ ] Form architecture working group to drive Phase 1–2 scope and track ADRs.
- [ ] Schedule Supabase infrastructure session to design `_shared` module and test harness.
- [ ] Collapse duplicate plans into ADR/runbook structure and retire legacy documents.

Once these items are closed, the codebase will align with MCP-backed best practices and be ready for execution of the refactor roadmap.
