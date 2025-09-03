# V1 Finalization — Execution Plan

Purpose: Drive the repo to V1 production with clean UI boundaries, stable infra, and verifiable quality bars.

Single-Task Mode: Execute one task at a time. Keep diffs ≤ 400 LOC and update CODEX_TASKLIST as you go.

## 0) Read These Once
- `CLAUDE.md`, `docs/STANDARDS_INDEX.md`, `docs/UI_LIBRARY.md`, `docs/TAILWIND_V4_FIX_PLAN.md`
- Component promotion rules: `docs/COMPONENT_MIGRATION_PLAN.md`
- PDP specs: `docs/pdp-mobile-first-revamp.md`, `docs/pdp-ux-refactor-plan.md`

## 1) Infra Alignment (blocking)
- Node: enforce and use Node 20+ locally/CI
- i18n types: add module declarations for `@repo/i18n/vite-plugin` and `lib/runtime.js`
- Stripe: align `@stripe/stripe-js` to ^7.x across workspace; consider peerDep in `@repo/ui`
- Verify: `pnpm -w turbo run check-types && pnpm -C apps/web run build`

## 2) Duplicate Cleanup (UI boundaries)
- Inventory app-level components used ≥2 places
- If shared/presentational → move to `packages/ui/src/lib` and export via barrel
- Replace imports in apps; delete duplicates; validate build
- Log each promotion in CODEX_TASKLIST

## 3) PDP Mobile-First Revamp
- Follow `docs/plans/PDP_MOBILE_FIRST_EXECUTION.md`
- Prioritize LCP/SI, input latency, and AA a11y

## 4) A11y & Performance Gates
- Run Playwright a11y smokes for home, product, search, checkout, login
- Lighthouse (mobile) p75 ≥ 90 on key pages; LCP ≤ 1.5s

## 5) Release Checklist
- Types/lint/tests/build pass for affected packages
- No raw color literals; Tailwind v4 tokens + semantic utilities
- API boundaries validated (zod), POST + origin checks, rate-limits
- Handoff summary in CODEX_TASKLIST; update RUNBOOK current task

## Acceptance Criteria
- 0 TypeScript errors and successful build on Node 20
- No shared UI duplicates remain in `apps/web/src/lib/components`
- PDP meets UX and perf targets (see PDP execution plan)
- A11y AA across key flows; Playwright smokes pass
- Stripe versions aligned; no double-bundling

