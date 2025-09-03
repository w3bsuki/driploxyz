# Duplicate Cleanup — Execution Plan

Purpose: Eliminate app-level UI duplicates and keep shared UI in `@repo/ui`.

Single-Task Mode: Promote one component (or small cluster) per PR. ≤ 400 LOC.

## 0) Read
- `docs/UI_LIBRARY.md`, `docs/COMPONENT_MIGRATION_PLAN.md`
- ESLint guardrail: `apps/web/eslint.config.js`

## 1) Inventory
- List `apps/web/src/lib/components/**` components used in 2+ places
- Cross-check against `packages/ui/src/lib/index.ts`
- Prioritize top 5 by reuse or page criticality

## 2) Promote or Replace
- If equivalent exists in `@repo/ui`: replace imports across app; delete local duplicate
- If missing but reusable: move component to `packages/ui/src/lib/`, export via barrel, update imports, delete original
- Keep app orchestrators local; extract presentational subparts into `@repo/ui`

## 3) Validate
- `pnpm -w turbo run check-types && pnpm -C apps/web run build`
- Quick visual check on affected routes

## 4) Log
- Add a short entry to `docs/CODEX_TASKLIST.md` with component name and outcome

## Acceptance Criteria
- No shared UI components remain duplicated in `apps/web/src/lib/components`
- All shared imports go through `@repo/ui` (or allowed deep imports)
- Types/lint/build pass after each promotion PR

