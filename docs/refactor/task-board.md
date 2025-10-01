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

## Ticket Progress (Phase 4 Follow-ups)
- ✅ **Ticket 2 – Service-Role Hardening**: Centralised server-only helpers for Supabase service-role usage, optionalised the key in env validation, and added regression tests.
- ✅ **Ticket 3 – UI Package Cleanup**: Removed legacy toast store/demo artifacts and aligned `@repo/ui` exports with the consolidated Melt implementation.
- ✅ **Ticket 4 – Testing Infrastructure**: Added Vitest coverage for the new service-role helpers and kept toast suites intact.
- ✅ **Ticket 5 – Environment Validation**: Relaxed service-role requirements in validation schemas and updated `.env` templates/documentation.
- ✅ **Ticket 6 – Svelte 5 Compliance Audit**: Toast system now relies exclusively on the rune-based store; legacy bridge removed.

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
