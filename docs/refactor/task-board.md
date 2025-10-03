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

---

# Phase 7 Cleanup & Automation Snapshot

## Objective Status
- ✅ **Objective 1 – Cleanup automation**
  - Added `@repo/domain` package with `generateCleanupReport` service.
  - `pnpm cleanup:audit` writes `docs/refactor/reports/phase-7-cleanup-audit.json` in all environments.
- ✅ **Objective 2 – Design token normalization**
  - Canonical CSS entrypoint now lives at `packages/ui/src/lib/styles/design-tokens.css`.
  - UI package exports updated to surface the new path.
- ✅ **Objective 3 – Legacy module retirements**
  - Removed unused notification service, trending service, and `FormErrorBoundary` wrapper.
- ✅ **Objective 4 – Documentation parity**
  - SPEC, PRD, audit JSON, and validation log authored for Phase 7 sign-off.

## Key Command Summary (Phase 7)
- `pnpm cleanup:audit`
- `pnpm cleanup:audit --dry-run --print`

---

# Phase 8 – Release & Observability Hardening

## Objective Status
- ✅ **Objective 1 – CI enforcement**
  - `pnpm release:observability` now succeeds end-to-end, reseeds public Supabase env fallbacks for metrics, and is documented in the runbook.
- ✅ **Objective 2 – Observability wiring**
  - `createObservabilityHandle` is live in the server hook chain with unit tests covering success/failure paths.
- ✅ **Objective 3 – Tech debt reduction**
  - Removed legacy notification/trending services and FormErrorBoundary component; audit confirms deletions.
- ✅ **Objective 4 – Documentation & ADR updates**
  - ADR-0003, runbook, validation logs, and SPEC/PRD now reflect Phase 8 release readiness requirements.

## Key Command Summary (Phase 8)
- `pnpm release:observability`
- `pnpm --filter web test`
- `pnpm --filter @repo/domain test`
- `pnpm --filter web build:metrics`
- `pnpm cleanup:audit`

## Ticket Progress (Phase 8)
- ✅ **Ticket A – Observability Handle & Tests**
- ✅ **Ticket B – Cleanup Audit Integration**
- ✅ **Ticket C – Phase 8 Validation Docs**
