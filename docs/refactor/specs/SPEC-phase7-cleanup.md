# Phase 7 Cleanup & Audit Automation SPEC

## Overview
Phase 7 focuses on turning the manual cleanup checklist into an automated audit that can be executed both locally and in CI. The phase addresses the lingering code removals from earlier refactors, finalizes documentation gaps, and standardizes design token exports for downstream consumers.

## Objectives
1. Ship a deterministic cleanup audit script that runs in any environment (dev or CI) and writes a structured report to `docs/refactor/reports/phase-7-cleanup-audit.json`.
2. Ensure the script uses the new `@repo/domain` package so that future phases can reuse shared business rules.
3. Normalize design token entry points beneath `packages/ui/src/lib/styles` per the design system requirement.
4. Retire unused services/components identified during Phase 4-6 analysis to shrink bundle size and reduce maintenance overhead.
5. Backfill specs, PRD, and validation docs so sign-off reviewers can confirm scope quickly.

## Scope
- Add `packages/domain` with a cleanup service that inspects repository state (file existence, documentation, design tokens).
- Introduce `apps/web/scripts/cleanup/report.ts` with a production-safe CLI guard and dry-run mode that still executes the domain service.
- Remove dead modules: legacy admin notification service, trending search service, and unused `FormErrorBoundary` UI shell.
- Provide a canonical design tokens CSS entrypoint at `packages/ui/src/lib/styles/design-tokens.css` and export it from the UI package.
- Author supporting documentation (SPEC, PRD, audit log, validation log).

## Non-Goals
- No runtime database schema changes.
- No modifications to Supabase RLS policies.
- No client-side Sentry enablement; all observability hooks remain server-side.

## Deliverables
- `@repo/domain` workspace package with Vitest coverage for the cleanup service.
- Updated root scripts: `pnpm cleanup:audit` and downstream release verification command.
- Generated audit JSON & validation logs stored under `docs/refactor/reports`.
- Updated documentation in `docs/refactor/task-board.md` and `docs/ops/runbook.md`.

## Acceptance Criteria
- `pnpm cleanup:audit` produces `docs/refactor/reports/phase-7-cleanup-audit.json` outside of dev-only guards.
- Dry-run mode prints the computed report but skips file write while still invoking domain logic.
- Design tokens CSS lives at the new `packages/ui/src/lib/styles/design-tokens.css` path.
- Removed modules are absent from the tree and accounted for in the audit output.
- SPEC/PRD/Validation docs exist and reference actual command output.
