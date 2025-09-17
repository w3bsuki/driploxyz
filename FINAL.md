# Production Hardening & Debt Eradication Plan
**Scope**: Entire `driplo-turbo` monorepo (apps/web, apps/admin, apps/docs, packages/*, supabase, scripts)
**Objective**: Eliminate tech debt, dead code, and over-engineering while guaranteeing production-grade stability. This plan assumes the `Targeted Type System Refactor Plan` in `errors.md` is executed first.

---

## Phase 0 - Coordination & Baseline (Day 0)
1. Create tracking issue/epic and feature branch family (`git checkout -b final-hardening/phase-0`).
2. Capture current health:
   - `pnpm -w turbo run lint check-types test`
   - `pnpm --filter web build`, `pnpm --filter admin build`, `pnpm --filter docs build`
   - `pnpm --filter @repo/ui check`
   - `pnpm performance-audit`
3. Snapshot bundle sizes (`node performance-tests/bundle-analysis.js > .logs/bundle-baseline.json`).
4. Generate dependency graph (`pnpm ls --depth 3 > .logs/pnpm-graph.txt`).
5. Export Supabase schema (`supabase db dump --local --file supabase/schema-baseline.sql`).
6. Communicate freeze rules: no feature work until plan merged; require green lint+type+test gates on every PR.

**Exit Criteria**: Baseline logs captured in `.logs/`, branch protection updated, stakeholders notified.

---

## Phase 1 - Integrate Type System Cleanup (Day 1-2)
1. Merge branch from `errors.md` plan; resolve conflicts in `packages/ui` and `apps/web` before proceeding.
2. Enforce Supabase-first typing:
   - Ensure `packages/ui/src/lib/types/index.ts` re-exports `Tables<'...'>` aliases.
   - Confirm `Product = ProductRow & ProductUIFields` pattern shipped.
3. Run `pnpm --filter @repo/ui check` and fix residual DOM typing warnings flagged in the errors plan.
4. Gate future changes with `pnpm -w turbo run check-types` on CI.

**Exit Criteria**: Type errors reduced below 150, UI product helpers documented, DOM typing warnings resolved.

---

## Phase 2 - Data & API Integrity (Day 2-3)
1. Supabase schema audit:
   - Diff `supabase/migrations` vs generated types; regenerate via `pnpm --filter @repo/database generate`.
   - Remove unused functions/triggers under `supabase/functions`.
2. Server module cleanup:
   - `apps/web/src/lib/server` and `apps/admin/src/lib/server`: delete unused helpers, ensure each exports explicit return types.
   - Enforce Zod-based validation for all `+page.server.ts` actions.
3. API alignment:
   - Audit `apps/web/src/routes/(lang)/*/+page.server.ts` for duplicate fetch logic; centralize in `src/lib/server/services`.
   - Replace REST fetches with Supabase client where possible; document remaining external calls in `docs/api-map.md`.
4. Data access tests:
   - Add Vitest suites for repositories/services mocking Supabase responses.

**Exit Criteria**: All server loads/actions typed, redundant server helpers removed, Supabase schema and generated types in sync.

---

## Phase 3 - UI Library Rationalisation (Day 3-5)
1. Remove `shadcn/ui` bloat per `cleanup.md` Phase 1:
   - Replace Badge and Sheet usage with native components.
   - Delete `packages/ui/src/lib/components/ui/*` once replacements land.
2. Consolidate mobile navigation (cleanup Phase 2):
   - Enhance `MobileNavigation.svelte` to support variants.
  - Delete `MobileNavigationDialog.svelte`, `MobileNavigationDrawer.svelte`, `CategoryNavigationSheet.svelte` after consumer updates.
3. Audit `packages/ui/src/lib/components` for duplicates:
   - Use `rg "@deprecated"` and `ts-prune` to identify unused exports.
   - Remove dead layout primitives (`Flex`, `Stack`) if unused.
4. Align design tokens:
   - Store source of truth in `packages/ui/src/lib/tokens` (create if missing) using the `DesignTokens` type.
   - Ensure `apps/web` consumes tokens via `@repo/ui/tokens` rather than duplicating Tailwind config.
5. Storybook/docs (if applicable):
   - If a Storybook directory exists under `packages/ui`, update stories to match new exports or remove stubs.

**Exit Criteria**: UI package exports reduced to active set, bundle size decreases, design tokens consolidated, no `components/ui/` remnants.

---

## Phase 4 - Application Feature Simplification (Day 5-8)
### apps/web
1. Route audit under `src/routes/(lang)`:
   - Remove stale routes (for example legacy `/drops`, `/beta` placeholders) after confirming no nav links.
   - Ensure each `+page.svelte` uses Svelte 5 runes (`$state`, `$derived`) and avoids mutable module scope state.
2. Component hygiene:
   - Move shared feature logic into `src/lib/features/*` (listings, search, checkout).
   - Delete duplicated components found in `src/lib/components/legacy` (if present).
   - Replace manual fetch wrappers with `@repo/utils` helpers.
3. Accessibility sprint:
   - Fix `AdminModal.svelte` style warnings across components.
   - Run `pnpm --filter web test:a11y` and resolve issues.
4. State management:
   - Remove leftover `stores/legacy*.ts`; replace with `$state` or context factories.

### apps/admin
1. Harden auth guard in `src/hooks.server.ts`; remove unused roles.
2. Collapse redundant dashboards under `src/routes/analytics` and `src/routes/listings` (single layout + load per area).
3. Delete unused assets in `src/lib/assets` or move essential assets to CDN storage.
4. Align admin UI imports with `@repo/ui` after cleanup.

### apps/docs
1. Remove duplicate markdown/MDX files not linked in navigation.
2. Ensure docs use `@repo/ui` theme tokens; drop custom CSS duplicates.
3. Run static build and fix broken links (`pnpm --filter docs build && pnpm --filter docs lint:links` or add script).

**Exit Criteria**: No orphan routes/components, Svelte runes compliance verified, docs/admin share consistent UI primitives.

---

## Phase 5 - Styling, Assets, and Bundle Hygiene (Day 8-9)
1. Purge CSS:
   - Run Tailwind purge (configure if missing) to identify unused classes.
   - Delete unused `.scss` or `.css` files under `apps/web/src/lib/styles`.
2. Asset cleanup:
   - Remove unused media in `apps/web/static` and `packages/ui/src/lib/assets`.
   - Compress remaining assets via `pnpm image-optim` (add script using `sharp` or `squoosh-cli`).
3. Code splitting review:
   - Ensure heavy sections stay lazy-loaded (for example `LazyRecommendationsSection`).
   - Verify bundle manifests after `pnpm --filter web build -- --analyze`.
4. Remove dead scripts:
   - Delete redundant files under `scripts/` (for example merge `advanced-bundle-analysis.js` with `bundle-analysis.js`).

**Exit Criteria**: Bundle diff shows meaningful reduction, CSS coverage at least 90 percent (Chrome coverage), no unused assets remain.

---

## Phase 6 - Testing and Quality Gates (Day 9-10)
1. Update Vitest config to fail on `console.warn` and `console.error`.
2. Expand unit tests for `@repo/utils` and `@repo/core-*` packages.
3. Playwright suites:
   - Refresh fixtures in `apps/web/tests/fixtures` to match new data models.
   - Ensure `test-results/` is ignored by git.
4. Add contract tests for Supabase functions using `supabase-js` in test mode.
5. Configure coverage thresholds (minimum 80 percent statements) and publish to `coverage/` per workspace.

**Exit Criteria**: `pnpm -w turbo run test test:e2e` green, coverage reports stored, CI updated to run all suites.

---

## Phase 7 - Tooling and Developer Experience (Day 10-11)
1. ESLint:
   - Ensure `@repo/eslint-config` covers Svelte 5 and TypeScript rules.
   - Remove duplicate `.eslintrc` files; prefer flat config entry per workspace.
2. Prettier:
   - Align `.prettierrc` across apps to monorepo default; delete redundant `.prettierignore` entries.
3. Turbo/NPM scripts:
   - Review `turbo.json`; ensure pipelines include `lint`, `check-types`, `test`, `build` for each workspace.
   - Remove unused scripts from each `package.json`.
4. Git hooks and CI:
   - Configure Husky or `turbo run precommit` if desired.
   - Ensure GitHub Actions workflows mirror local gates.
5. Developer docs:
   - Update `README.md`, `TECHNICAL.md`, and `PRODUCTION.md` with the new workflow and commands.

**Exit Criteria**: Consistent lint and format config, lean script surface, docs updated, CI mirrors local pipelines.

---

## Phase 8 - Observability, Security, and Compliance (Day 11-12)
1. Logging and monitoring:
   - Standardize server logging via `@repo/utils/logger` (create if missing) with structured output.
   - Integrate Sentry (or chosen vendor) in `apps/web` and `apps/admin` for both server and client contexts.
2. Security review:
   - Run `pnpm audit --production` and triage vulnerabilities.
   - Verify Supabase RLS policies align with application expectations; document in `docs/security/rls.md`.
3. Privacy and data retention:
   - Audit cookie usage via `@repo/core-cookies`; ensure consent logic documented.
   - Confirm PII handling flows (profile images, addresses) satisfy compliance guidelines.
4. Operational playbooks:
   - Update `PRODUCTION.md` with incident response, rollback steps, and monitoring dashboards.

**Exit Criteria**: Logging consistent, error monitoring wired, security issues triaged, operational docs complete.

---

## Phase 9 - Release Readiness (Day 13)
1. Final regression run: `pnpm -w turbo run lint check-types test build performance-audit`.
2. Execute Lighthouse suite: `pnpm lighthouse:local` and ensure PWA metrics meet budget.
3. Perform accessibility spot check with screen reader on key flows.
4. Review change log and create release notes summarizing major refactors.
5. Merge `final-hardening` branch via PR with:
   - Evidence of before/after error counts
   - Bundle diff
   - Lighthouse and Playwright artifacts
6. Tag release (`git tag v1.0.0-final-hardened`) and deploy to staging for burn-in.

**Exit Criteria**: All gates green, documentation complete, approval from engineering, product, and QA.

---

## Ongoing Governance After Release
- Enforce monthly dependency upgrades (Supabase, SvelteKit, pnpm).
- Schedule quarterly accessibility audits.
- Add `ts-prune` and `depcheck` to CI to catch regressions in dead code.
- Maintain `docs/architecture` diagram; refresh when major features land.

---

## Appendix - Tracking Checklist Template
For each phase create an issue checklist with:
- Task description (with path reference)
- Status (todo / in-progress / done)
- Evidence link (PR, log, screenshot)
- Validation command(s)
- Owner

Use this template in Linear, Jira, or Notion to keep execution transparent and auditable.
