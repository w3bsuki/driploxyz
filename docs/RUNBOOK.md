# RUNBOOK — Single Task Runner

Use this file to coordinate focused execution. Only one task is active at a time.

## Current Task

- Task 1 — TypeScript Audit
  - Source: `docs/playbooks/typescript.md`
  - Goal: Unify barrels to extensionless TS paths, ensure app.d.ts has precise types, replace implicit any handlers with typed signatures, add satisfies to server loads.

## Rules

- Single‑task mode: do not start any other task until “Current Task” is complete and documented.
- On start: read `CLAUDE.md` and the task’s source doc.
- On completion: update this RUNBOOK (set Current Task to “None” or next), then update `docs/CODEX_TASKLIST.md` (In‑Progress → Done) and add a brief summary to `docs/CONTEXT.md`.

## Next Tasks Queue

- Task 1 — TypeScript Audit (`docs/playbooks/typescript.md`)
- Task 2 — Svelte 5 Audit (`docs/playbooks/svelte5.md`)
- Task 3 — SvelteKit 2 Audit (`docs/playbooks/sveltekit2.md`)
- Task 4 — Paraglide (i18n) (`docs/playbooks/paraglide.md`)
- Task 5 — Tailwind v4 Tokens (`docs/playbooks/tailwindcss-v4.md`)
- Task 6 — Melt UI Adoption (`docs/playbooks/melt-ui.md`)
- Task 7 — Supabase Auth & Data (`docs/playbooks/supabase.md`)
- Task 8 — Playwright Smokes (`docs/playbooks/playwright.md`)

## Handoff Format (after each task)

- Summary (2–4 lines): what changed, where
- Validation: commands run and visual checks
- Follow‑ups: bullets for any deferrals
