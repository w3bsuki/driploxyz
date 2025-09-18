# Driplo Production Cleanup Playbook

Comprehensive audit of the monorepo to remove technical debt, dead assets, and duplication prior to launch. This is the canonical checklist for Codex / Claude-code to execute whenever we prepare a release freeze.

---

## 1. Repository Scope
- **Monorepo packages**: `apps/*`, `packages/*`, `supabase/`, utility scripts.
- **Infrastructure**: Supabase migrations, CI workflows, Turborepo pipelines.
- **Documentation assets**: `.md`, audit reports, design notes.

Deliverable: a lean repo with no unused code paths, consistent naming, deterministic builds, and clear handoff docs.

---

## 2. Status Snapshot
| Area | Current Status | Action |
| --- | --- | --- |
| UI bundle / components | 50% reduction already landed (see phases below) | Keep monitoring new components. |
| Service layer naming | Normalised in previous pass | Enforce camelCase for future additions. |
| Documentation bloat | Partial removal complete | Final sweep required (see §6). |
| Duplicate assets (images, mocks) | Pending audit | Run `pnpm dedupe-assets` script. |
| Dependency graph | Needs review | Execute §4 tasks. |
| Supabase assets | Staged but not final | Execute §5 tasks. |

---

## Cleanup Execution Blocks
| Block | Status | Scope | Expected Outputs |
| --- | --- | --- | --- |
| Block A - Dependency & Build Hygiene | pending | Run Section 4 tasks (pnpm validation, turbo pipeline trim, bundle analysis, ESLint/Prettier sweep) | `.logs/cleanup-blockA.txt`, updated `turbo.json`, new bundle report |
| Block B - Supabase & Server Hardening | pending | Execute Section 5 (migrations merge, `supabase db lint`, regenerate types, env audit) | `.logs/cleanup-blockB.txt`, refreshed `packages/database/src/generated.ts`, env notes |
| Block C - Documentation & Assets | pending | Complete Section 6 doc pruning + asset optimisation | `.logs/cleanup-blockC.txt`, updated `/docs`, optimised assets |
| Block D - Codebase Consistency | pending | Section 7 lint fixes, import ordering, TODO cleanup, rune compliance spot-checks | `.logs/cleanup-blockD.txt`, lint report |
| Block E - Testing & Observability | pending | Section 8 automated tests + telemetry audit | `.logs/cleanup-blockE.txt`, test summaries |
| Block F - CI & Automation | pending | Section 9 workflow review, pipeline gating, secrets documentation | `.logs/cleanup-blockF.txt`, updated workflows |
| Block G - Remaining Targets Sweep | pending | Work Section 10 table items (configs, scripts, routes, fixtures, backups) | `.logs/cleanup-blockG.txt`, table annotations |
| Block H - Final Verification | pending | Run Section 11 checklist commands and record outcomes | `.logs/cleanup-blockH.txt`, updated checklist |
## 3. Component & UI Cleanup (Completed)
- Removed shadcn/ui payload (>1 MB).
- Consolidated mobile navigation variations into a single component.
- Pruned inactive dropdown and experimental components.
- Standardised exports in `packages/ui/src/lib/index.ts`.

Impact: ~200 components removed, leaner UI bundle, simpler imports.

---

## 4. Dependency & Build Hygiene (TO RUN WEEKLY)
1. **pnpm validation**
   ```powershell
   pnpm install --lockfile-only
   pnpm -w audit
   pnpm dlx depcheck
   ```
   - Remove unused dependencies from each package.json.
   - Lock versions (no `^` for critical runtime deps).

2. **Turborepo pipelines**
   - Review `turbo.json` to ensure only active pipelines run on CI.
   - Delete obsolete tasks (`storybook`, `legacy-build`, etc.).

3. **Bundle analysis**
   - Run `pnpm --filter web build -- --analyze` and store report in `performance-test-results/`.
   - Flag bundles >200 KB and refactor lazy-loading.

4. **ESLint / Prettier configuration**
   - Flatten overrides: keep a single `@repo/eslint-config` entry point.
   - Remove unused .prettierrc/.npmrc duplicates in sub-packages.

---

## 5. Supabase & Server
1. **Migration hygiene**
   - Merge staged SQL files into numbered migrations, delete scratch scripts.
   - Run `supabase db lint` to detect divergence between local and remote schema.

2. **Policies & RLS**
   - Ensure every table has explicit RLS; no table should be `ENABLE ROW LEVEL SECURITY` without policy.
   - Review functions and triggers for obsolete logic (archives, nomination flows).

3. **Type generation**
   - Regenerate `packages/database/src/generated.ts` with `supabase gen types typescript`.
   - Ensure `@repo/database` exports only typed helpers (remove commented code).

4. **Environment variables**
   - Cross-check `.env.example` files with Supabase secrets; no unused keys.

---

## 6. Documentation, Markdown & Static Assets
1. **Production docs**
   - Retain: README, FINAL.md, PARAGLIDE.md, CLEANUP.md (this file), runbooks under `/docs`.
   - Remove outdated audit plans, personal notes, `llms-*.txt`, `kit-lllms.txt`, etc.
   - Combine overlapping guides into consolidated documents (Navigation UX, Supabase checklist).

2. **Public assets**
   - Delete unused marketing images, favicon variants, placeholder mockups.
   - Optimise remaining SVG/PNG through `svgo`/`imagemin`.

3. **Storybook / design tokens**
   - If Storybook not used, remove config entirely; otherwise ensure stories map to active components.

---

## 7. Codebase Consistency Pass
- Run `pnpm lint --fix` across all packages; ensure zero autofix warnings.
- Enforce import ordering (use lint rule `simple-import-sort`).
- Replace default exports with named exports where possible.
- Remove dead `console.log`/`TODO` comments; convert TODOs to tracked issues.
- Verify all Svelte components use Runes guidelines (see errors.md checklist).

---

## 8. Testing & Observability
1. **Vitest/Playwright coverage**
   - Ensure `pnpm --filter web test` and `pnpm --filter web test:e2e` run clean.
   - Remove skipped tests or convert them into actionable tickets.

2. **Telemetry**
   - Audit Sentry/LogRocket initialisation; remove duplicate providers.
   - Verify environment-based gating (disabled in dev, enabled in prod).

3. **Performance baselines**
   - Run `pnpm performance-audit` and store Lighthouse reports.
   - Compare metrics to previous runs; set budgets in CI.

---

## 9. CI / Automation
- Ensure GitHub Actions workflows reference the correct pnpm version.
- Remove deprecated workflows (legacy CI, dependabot auto-merge scripts).
- Add final `pnpm -w lint`, `pnpm -w test`, `pnpm --filter web check-types` gates before deploy job.
- Document required environment secrets per workflow.

---

## 10. Remaining Cleanup Targets
| Category | Task |
| --- | --- |
| Config | Delete unused `.npmrc`, `.prettierignore`, `.gitignore` entries; document required shortcuts. |
| Scripts | Clear out obsolete scripts under `scripts/` (e.g. `start-phase1.*`, debug utilities). |
| Apps/admin | Audit for unused routes / dead APIs; remove dormant analytics pages. |
| Apps/docs | Ensure only production docs remain; remove marketing prototypes. |
| Apps/web | Search for old feature flags (drip nominations, boost experiments) and delete scaffolding. |
| Packages/utils | Deduplicate helper functions with `packages/ui/src/lib/utils`. |
| Playwright fixtures | Remove unused fixtures/screenshots to keep git history lean. |
| Backup files | Delete `.bak`, `.backup`, and `.old` files across repo. |

---

## 11. Final Verification Checklist
1. `pnpm -w lint` ??
2. `pnpm -w test` ??
3. `pnpm --filter web check-types` ??
4. `pnpm --filter @repo/ui run build` ??
5. `pnpm --filter web build` (Lighthouse audit) ??
6. Supabase migrations applied & `db diff` clean ??
7. All dead docs/assets removed ??
8. Release notes prepared (FINAL.md updated) ??

Once every box is checked, tag the release branch and proceed to deployment.

---

*This playbook supersedes earlier cleanup reports. Keep it updated after each cleanup sprint to ensure Driplo stays launch-ready.*



