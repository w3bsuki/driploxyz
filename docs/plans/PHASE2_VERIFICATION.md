# Phase 2 — Verification Plan

Purpose: Independently verify the Phase 2 claims (i18n optimization, a11y fixes, code-splitting, error boundaries) and prepare follow-ups.

Single-Task Mode: Use RUNBOOK and update CODEX_TASKLIST as you go. Keep diffs ≤ 400 LOC per PR.

## Preconditions
- Use Node 20+ locally and in CI (`node -v` shows 20.x).
- Install deps: `pnpm i` at workspace root.

## Steps
1) i18n bundle optimization
- Inspect generated bundles: `ls -la packages/i18n/lib/locales && du -sh packages/i18n/lib/locales`
- Expect ~180KB total (bg.js ~78KB, en.js ~54KB)
- Confirm dynamic loading exists: `grep -n "loadMessages(" -n packages/i18n/lib/runtime.js`

2) TypeScript status
- Run: `pnpm -w turbo run check-types`
- If errors reference i18n runtime or vite-plugin types, add module declarations (d.ts) within `@repo/i18n` per INFRA_ALIGNMENT_PLAN.md

3) Code-splitting in Sell flow
- Check dynamic imports: `git grep -n "await import(\'./components/Step" apps/web/src/routes/(protected)/sell/+page.svelte`
- Build and inspect chunks (Node 20+): `pnpm -C apps/web run build`
- Optional: add rollup visualizer (dev only) to confirm per-step chunks

4) Accessibility verification
- Run existing Playwright tests: `pnpm -C apps/web run test:e2e`
- Validate `accessibility.spec.ts` passes with 0 critical violations

5) Error boundaries
- Verify wrapper usage in layout and sell steps:
  - `git grep -n "ErrorBoundary" apps/web/src/routes`
- Ensure boundaries wrap the sell steps and top-level layout

## Acceptance Criteria
- Types: `turbo run check-types` passes across workspace
- Build: `apps/web` builds on Node 20 (no `styleText` import error)
- i18n: locales total ~180KB; runtime loads messages dynamically
- Code-splitting: sell steps loaded via dynamic imports; bundle ≤50KB target per step
- A11y: e2e a11y spec passes with 0 critical issues
- Error boundaries present in layout and sell steps

## Handoff
- Update `docs/CODEX_TASKLIST.md` with verification summary and any follow-up tasks
- If issues found, create targeted PR(s) with minimal diffs and link back here

