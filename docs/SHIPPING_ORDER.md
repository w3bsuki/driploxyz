# Shipping Order — What To Focus On

Use this file to align which doc drives what. Keep execution single‑threaded per `docs/RUNBOOK.md`.

## Authority & Scope
- Product scope & DoD: `docs/V1_driplo.md` (what we must ship)
- Execution plan (how): `docs/FINAL_PRODUCTION_PLAN.md`
- UI behavior fixes: `docs/MELT_UI_FIX_PLAN.md`
- Tailwind v4 styling: `docs/TAILWIND_V4_FIX_PLAN.md`
- Task tracking: `docs/CODEX_TASKLIST.md`
- Single‑task runtime: `docs/RUNBOOK.md`
- Hooks & guardrails: `docs/CLAUDE_HOOKS.md`

## Recommended Order
1) Phase 1 of FINAL_PRODUCTION_PLAN: API helper + CSRF/rate limits on top endpoints
2) Melt UI Fix Pack (header dropdown) from MELT_UI_FIX_PLAN
3) Tailwind v4 sweep (remove hardcoding, normalize surfaces)
4) Finalize core flows per V1_driplo (sell/buy/orders/reviews/messaging)
5) SEO JSON‑LD/breadcrumbs + budgets to mobile in Lighthouse
6) CI gates + secrets/env audit
7) Staging smokes → production cutover

## How To Work Day‑to‑Day
- Set current task in `docs/RUNBOOK.md`.
- Execute only from the relevant plan doc.
- Update `docs/CODEX_TASKLIST.md` and `docs/CONTEXT.md` after each step.

Owner: Platform (you + Claude‑code)
