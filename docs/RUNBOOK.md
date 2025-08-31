# RUNBOOK — Single Task Runner

Use this file to coordinate focused execution. Only one task is active at a time.

## Current Task

- None (Hotfix completed)
  - ✅ Phase 0 dev noise and A11y surgical fixes completed successfully
  - All major technical audits complete (Tasks 1-7: TypeScript, Svelte5, SvelteKit2, i18n, TailwindV4, MeltUI, Supabase)
  - Production build validated and working
  - Application ready for production deployment

## Rules

- Single‑task mode: do not start any other task until “Current Task” is complete and documented.
- On start: read `CLAUDE.md` and the task’s source doc.
- On completion: update this RUNBOOK (set Current Task to “None” or next), then update `docs/CODEX_TASKLIST.md` (In‑Progress → Done) and add a brief summary to `docs/CONTEXT.md`.

## Completed Tasks Queue

- [x] Task 1 — TypeScript Audit (`docs/playbooks/typescript.md`) 
- [x] Task 2 — Svelte 5 Audit (`docs/playbooks/svelte5.md`)
- [x] Task 3 — SvelteKit 2 Audit (`docs/playbooks/sveltekit2.md`)
- [x] Task 4 — Paraglide (i18n) (`docs/playbooks/paraglide.md`)
- [x] Task 5 — Tailwind v4 Tokens (`docs/playbooks/tailwindcss-v4.md`)
- [x] Task 6 — Melt UI Adoption (`docs/playbooks/melt-ui.md`)
- [x] Task 7 — Supabase Auth & Data (`docs/playbooks/supabase.md`)
- [~] Task 8 — Playwright Smokes (`docs/playbooks/playwright.md`) — marked complete in upstream docs, may need validation

## Next Focus Areas

- UI/UX polish tasks from `docs/CODEX_TASKLIST.md`
- V1 feature completions per `docs/V1_driplo.md`
- Performance and accessibility optimizations

## Handoff Format (after each task)

- Summary (2–4 lines): what changed, where
- Validation: commands run and visual checks
- Follow‑ups: bullets for any deferrals
