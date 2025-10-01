# Phase 4 Task Board

## Objective Status
- ✅ **Objective 1 – Testing infrastructure**
  - Toast provider deduplication fix in `@repo/ui`.
  - Playwright config runs the web app through `pnpm --filter web dev`.
  - Commands: `pnpm --filter @repo/ui test`, `pnpm --filter web test`,
    `pnpm --filter web test:e2e`.
- ✅ **Objective 2 – Performance & build optimization**
  - Production build verified via `pnpm --filter web build`.
  - Added `build:metrics` script + `scripts/build-report.mjs` for bundle stats.
  - Command: `pnpm --filter web build:metrics`.
- ✅ **Objective 3 – Documentation & developer experience**
  - Authored `docs/testing/testing-guidelines.md` and expanded
    `apps/web/README.md` with QA steps.
  - Planning/validation reports updated with command outputs.
- ✅ **Objective 4 – Production readiness**
  - Workspace packages expose lint/check/test scripts.
  - Turbo runs noted with environment caveats; manual fallbacks documented.
  - Legal/offline routes updated to `prerender = false` for runtime env access.

## Key Command Summary
- `pnpm --filter @repo/i18n build`
- `pnpm --filter @repo/ui test`
- `pnpm --filter web test`
- `pnpm --filter web test:e2e`
- `pnpm --filter web build`
- `pnpm --filter web build:metrics`
- `pnpm -w turbo run lint` (⚠️ network-limited; see validation log)
- `pnpm -w turbo run check-types` (⚠️ network-limited; see validation log)
- `pnpm -w turbo run build` (⚠️ network-limited; see validation log)

## Ticket Progress (Phase 4)
- ✅ **Ticket 1 – Toast Consolidation**
- ✅ **Ticket 2 – Service-Role Hardening**
- ✅ **Ticket 3 – UI Package Cleanup**
- ✅ **Ticket 4 – Testing Infrastructure**
- ✅ **Ticket 5 – Environment Validation**
- ✅ **Ticket 6 – Svelte 5 Compliance Audit**
