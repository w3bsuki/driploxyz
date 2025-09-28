# Refactor Roadmap Phases

Execute the programme sequentially. Do not advance to the next phase until Codex reviews the PR and approves the validation results documented in the reports.

## Phase 0 – Critical Baseline
- Audit repository artefacts and align the tree with `ProjectStructure.md`.
- Capture dependency snapshot and identify urgent upgrades or conflicts.
- Restore build parity for the flagship web app (`pnpm --filter web lint`, `check-types`, `build`).
- Deliverables: updated cleanup/dependency reports, task board status, and milestone note in `MAIN.md`.

## Phase 1 – Structure Remediation
- Apply the structure plan from `structure-roadmap.md`.
- Reorganise packages/apps without functional changes.
- Validate Turbo pipeline (`pnpm -w turbo run build`).

## Phase 2 – Dependency & Tooling Alignment
- Normalise package versions across workspaces per `dependency-audit.md`.
- Centralise config (ESLint, TS, Vite) and prune duplicates.
- Re-run Turbo lint/type/test/build suite.

## Phase 3 – Code Cleanup & Compliance
- Remove dead code, legacy stores, and duplicated logic following `cleanup-checklist.md`.
- Enforce Svelte 5 / SvelteKit 2 conventions (`Svelte5.md`, `SvelteKit2.md`).
- Backfill missing tests highlighted in Phase 0/2 reports.

## Phase 4 – Supabase Contract Realignment
- Use `supabase-bridge.md` and `supabase-schema-snapshot.md` to reconcile schema, types, and client helpers.
- Update shared API clients and regenerate types.
- Run integration and contract tests.

## Phase 5 – Final Validation & Release Prep
- Execute the validation matrix defined in `validation-plan.md`.
- Refresh documentation, migration notes, and release checklist.
- Prepare release PR with consolidated summary and outstanding risks.

Record progress for every phase in `docs/refactor/reports/` and the task board before requesting review.
