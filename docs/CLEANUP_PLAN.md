# Cleanup & Refactor Plan — Path to V1

Purpose: consolidate docs, reduce UI/app duplication, and remove bloat with safety. Execute in two passes: pre‑audit (now) and final sweep (pre‑release).

## Canonical Docs (keep)
- CLAUDE.md — operating rules
- docs/END_GOAL.md — outcome, NFRs, KPIs
- docs/V1_driplo.md — features DoD + tasks per area
- docs/CODEX_TASKLIST.md — master board (non‑UI), playbooks checklist
- docs/RUNBOOK.md — single active task
- docs/MELT_UI_MIGRATION.md — single source for UI migration
- docs/playbooks/* — per‑tech execution guides
- docs/CLAUDE_HOOKS.md — hooks & protocol

## Root Docs — Consolidate/Archive
Move the following to `docs/archive/` and link from canonical docs where noted. Keep content for reference; do not lose history.

- ADMIN_SECURITY_AUDIT.md → link in docs/40-OPERATIONS.md (Security)
- RLS_SECURITY_AUDIT.md → link in docs/playbooks/supabase.md (RLS section)
- STRIPE_WEBHOOK_CONFIG.md, stripe.md → merge into `docs/reference/payments.md` (or link from V1 plan)
- PERFORMANCE_OPTIMIZATION_PLAN.md → integrate into docs/20-UI-UX.md + docs/40-OPERATIONS.md; archive original
- PRODUCTION_DEPLOYMENT_SUMMARY.md, PRODUCTION_IMPROVEMENTS.md, PRODUCTION_PUSH.md, production.md → merge into docs/40-OPERATIONS.md + docs/V1_driplo.md; archive originals
- VISION.md → keep as historical; docs/END_GOAL.md is canonical
- DEV_TROUBLESHOOTING.md, DEV_TURBOREPO_GUIDE.md → move to docs/reference/dev/
- WORK.md → superseded by docs/CONTEXT.md; archive
- styling.md → fold tips into docs/20-UI-UX.md; archive
- messages*.md → combine into docs/reference/messages.md or archive as a set
- auth.md, codebase_audit.md, i18n-routing-plan.md, onboarding+management.md, socials.md → review, then either integrate into canonical docs or archive

Execution
- Create `docs/archive/` and move files preserving git history (use `git mv`).
- Add a “Further Reading (Archive)” section to canonical docs with links.

## UI/App Duplication — Remove
- Replace app‑level components that forward to `@repo/ui` and delete local wrappers once build is green.
- Promote any app component used 2+ times into `@repo/ui`; refactor imports; delete app duplicate.
- Remove experimental/unreferenced components in `packages/ui/src/lib/` after usage audit.

Usage audit (choose one)
- ripgrep: `rg -n "ComponentName" apps/web packages/ui`
- git grep: `git grep -n "ComponentName"`
- VS Code global search

Guardrail
- ESLint no‑restricted‑imports in `apps/web/eslint.config.js` to block `$lib/components/*` for shared UI.

## Service Workers & Backups — Remove
- Keep TypeScript `service-worker.ts` only; delete any `service-worker.js` duplicates.
- Delete any `*.bak` files under `apps/web/src/**` and `packages/ui/**` after confirming they’re unused.

## Packages & Config — Tidy
- Confirm barrels export extensionless TS paths (ui + primitives).
- Load `semantic.css` globally via UI barrel or in app.css once.
- Ensure `package.json` scripts are minimal and used; remove dead scripts.

## Two‑Pass Timeline
- Pass 1 (now):
  - Move/archive root docs as listed; add archive links to canonical docs.
  - Remove obvious app wrappers (e.g., LazySearchResults) after replacing imports.
  - Fix barrels + CSS + invalid utilities (see Melt Fix Pack).
- Pass 2 (pre‑release):
  - Remove any unreferenced components in `packages/ui` and dead endpoints in apps.
  - Repo‑wide purge of TODO/console.*; format; ensure 0 TS errors.

## Safety Checklist
- Always `git mv` for docs to preserve history.
- Before deletions, verify 0 references via grep.
- Keep changes ≤ 400 LOC per PR; roll forward with small, safe steps.

## Will this get us to V1?
Yes — combined with the playbooks and V1 plan:
- Canonical docs reduce confusion and speed onboarding.
- UI migration fixes + token discipline stabilize UX and performance.
- Playbooks ensure consistent refactors across TS/Svelte/SvelteKit/i18n/auth.
- The final sweep plus QA gates (in docs/V1_driplo.md) push us to production readiness.

---

## Claude Code — Finalization Prompt (Copy/Paste)

You are Claude Code. Execute the Finalization Sweep to close Tasks 0–8 without over‑engineering. Work in a separate terminal. Do NOT edit `docs/RUNBOOK.md`. Track plan/progress in `docs/CODEX_TASKLIST.md` (Next — Finalization) and summarize in `docs/CONTEXT.md`. Keep total diffs ≤ 300 LOC, Windows‑friendly.

Objectives
- Defensive i18n fallback (bg)
- Token sweep for menu/high‑contrast CSS only
- Ensure single semantic.css load
- ESLint guardrail to prevent app‑level UI duplication
- Dead files/backups cleanup
- Validate and run existing smokes

Scope (files only)
- `apps/web/src/routes/+layout.server.ts`
- `packages/ui/src/styles/semantic.css`
- `apps/web/eslint.config.js`
- `apps/web/src` (dead `service-worker.js`, any `*.bak` only)

Steps
1) i18n fallback defense
   - In `+layout.server.ts`, set: `const language = locals.locale || 'bg'`
2) Token sweep (menus/high‑contrast only)
   - In `semantic.css`, replace `var(--fg)/var(--bg)` with `var(--text-primary)/var(--surface-base)` where used for menu and high‑contrast sections; keep borders on `--border-*`.
   - Do not touch unrelated CSS/tokens/Tailwind config.
3) Ensure single semantic.css load
   - Verify UI barrel imports it (already present). If app.css duplicates exist, remove them.
4) ESLint guardrail
   - In `apps/web/eslint.config.js`, add a `no-restricted-imports` rule to block imports from `$lib/components/*` when an equivalent exists in `@repo/ui`.
5) Dead files/backups
   - Remove `apps/web/src/service-worker.js` (keep `.ts`).
   - Remove any `*.bak` under `apps/web/src/**`.
6) Validate (Windows)
   - `pnpm -w turbo run check-types`
   - `pnpm -w turbo run lint`
   - `pnpm --filter web build`
   - `pnpm --filter web test` (run Playwright smokes if configured)
   - Manual: header menu, one dialog, and select work on mobile/desktop
7) Docs
   - Update `docs/CODEX_TASKLIST.md` (tick Finalization items) and add a 2–4 line entry to `docs/CONTEXT.md` (files changed, validation results).

Constraints
- No new dependencies. Do not modify Vite, Sentry, Tailwind config, or i18n adapter.
- If scope risks exceeding limits or collides with in‑flight work, skip, add a 3‑line note in `docs/CODEX_TASKLIST.md`, and proceed to the next item.
