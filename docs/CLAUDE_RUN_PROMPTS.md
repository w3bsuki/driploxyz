# Claude-code — Ready-to-Run Prompts

Use these copy-paste prompts in Single-Task Mode. Read `CLAUDE.md` first.

## 1) Phase 2 Verification
Read `docs/plans/PHASE2_VERIFICATION.md` and execute every step. Use Node 20. Summarize findings and add follow-ups to CODEX_TASKLIST. Keep PRs ≤ 400 LOC and single-purpose.

## 2) Infra Alignment
Read and execute `docs/plans/INFRA_ALIGNMENT_PLAN.md`. Align Node 20, i18n typings, and Stripe versions (prefer a single @stripe/stripe-js ^7.x, peerDep in @repo/ui). Validate types and build. Summarize in CODEX_TASKLIST.

## 3) Duplicate Cleanup
Follow `docs/plans/DUPLICATE_CLEANUP_EXECUTION.md`. Inventory top shared duplicates in apps/web/src/lib/components, promote or replace with @repo/ui, validate, and delete duplicates. Log each promotion in CODEX_TASKLIST.

## 4) PDP Mobile-First Execution
Use `docs/plans/PDP_MOBILE_FIRST_EXECUTION.md` with `docs/pdp-mobile-first-revamp.md` and `docs/pdp-ux-refactor-plan.md`. Refactor PDP using @repo/ui components, keep orchestrators in app, meet LCP/a11y budgets, and add/extend tests. Summarize changes.

## 5) V1 Finalization
Execute `docs/plans/V1_FINALIZATION_PLAN.md`. Ensure all gates pass (types/lint/tests/build, a11y AA, Lighthouse mobile p75 ≥ 90, LCP ≤ 1.5s). Prepare a concise release handoff.

---

Short prompts
- “Run Phase 2 Verification plan; report results and open follow-ups.”
- “Apply Infra Alignment plan: Node 20, i18n d.ts, Stripe ^7.x; validate types/build.”
- “Promote top 5 shared components to @repo/ui per Duplicate Cleanup plan; one PR each.”
- “Refactor PDP per PDP Mobile-First plan; verify LCP and a11y budgets; update tests.”
- “Execute V1 Finalization plan and prepare release summary.”

