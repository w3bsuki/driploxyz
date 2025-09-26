# Driplo Refactor Roadmap

> **Claude execution primer**
> ```
> You are coordinating the Driplo production-readiness refactor. Always begin by reading `docs/production-refactor-playbook.md` and the phase-specific playbook linked below. Execute the active phase exactly as written, paste command output into the designated evidence blocks, and stop for Codex review before advancing. Never mark checkboxes yourself.
> ```

## Phase checklist at a glance
| Phase | Goal | Primary playbooks | Exit criteria |
| ----- | ---- | ----------------- | ------------- |
| Phase 0 – Baseline | Capture the truth about failing gates and stale status docs. | `docs/production-refactor-playbook.md` | `build-validation.txt`, `types-validation.txt`, and `lint-output.txt` reflect fresh command output; MAIN.md status boxes updated to match reality. |
| Phase 1 – TypeScript & lint debt | Eliminate compiler and ESLint failures. | `TypeScript.md` | `pnpm --filter web check-types` and `pnpm --filter web lint -- --max-warnings=0` succeed; `remaining-typescript-errors.txt` is empty. |
| Phase 2 – Svelte 5 & Kit 2 | Finish rune migration and data contract alignment. | `Svelte5.md`, `SVELTEKIT2_FIX_PLAN.md` | `pnpm --filter web check` passes with no load/action violations; `notes/svelte5-inventory.md` lists zero outstanding legacy patterns. |
| Phase 3 – Supabase alignment | Sync schema, auth flows, and generated types. | `supabase.md` | Regenerated database types compile, RPC audits are complete, and `docs/supabase-handoff.md` documents any required manual migrations. |
| Phase 4 – Tailwind & UI polish | Resolve accessibility warnings and token drift. | `tailwindcssv4-refactor.md`, `TailwindCSSv4.md`, `UI-UX.md` | `pnpm --filter web build` exits cleanly; shared UI components use tokens and pass axe smoke tests. |
| Phase 5 – QA & observability hardening | Add production monitoring, smoke tests, and launch evidence. | This document (section below), `MAIN.md`, forthcoming `docs/qa-hardening.md`, `docs/observability-plan.md` | Turbo pipeline, Playwright smokes, Lighthouse/perf audits, and monitoring setup evidence captured in `docs/qa/`. |

## Phase 0 – Baseline reset
1. Check out the latest `work` branch (`git checkout work && git pull origin work`) and install dependencies (`pnpm install`).
2. Run the baseline commands from the master playbook and overwrite `types-validation.txt`, `lint-output.txt`, and `build-validation.txt` with the new results.
3. Update `remaining-typescript-errors.txt`, `remaining_errors.txt`, and the progress sections in `MAIN.md` to reflect the failing gates.
4. Open issues or notes for any missing assets (e.g., absent Supabase credentials) so blockers are documented before coding begins.

## Phase 1 – TypeScript & lint debt
- Follow `TypeScript.md` step by step: normalise Supabase service mappers, Stripe webhook guards, realtime subscription typings, and the messaging/favourites loaders.
- After every milestone, rerun `pnpm --filter web check-types` and append the output to the playbook log blocks.
- Remove legacy `any` casts, tighten DTO types, and add targeted tests where data transformation logic changes.
- Exit when TypeScript and lint commands are green and documentation reflects the clean state.

## Phase 2 – Svelte 5 & Kit 2 completion
- Use `Svelte5.md` to migrate remaining components to runes, Melt primitives, and factory-based stores.
- Apply `SVELTEKIT2_FIX_PLAN.md` to refactor loaders/actions so they satisfy `satisfies PageServerLoad`/`Actions` and return serialisable DTOs.
- Replace `alert`/`onMount` usage, move Supabase clients behind shared helpers, and ensure SSR data flow stays deterministic.
- Update `notes/svelte5-inventory.md` and `notes/sveltekit-audit.md` as components are cleared.

## Phase 3 – Supabase alignment
- Execute the workflow in `supabase.md`: verify project connectivity, regenerate types, align auth/session helpers, audit RPCs, and review realtime/storage usage.
- Log any SQL changes or required migrations in `docs/supabase-handoff.md` using the provided template.
- Confirm TypeScript still passes after type regeneration and update tests covering login, messaging, and order flows.

## Phase 4 – Tailwind & UI polish
- Run through `tailwindcssv4-refactor.md` alongside the design system guides (`TailwindCSSv4.md`, `UI-UX.md`).
- Fix accessibility warnings flagged during `pnpm --filter web build`, ensure components consume `tokens.css` variables, and add axe coverage for new Melt dialogs/toasts.
- Remove dead CSS utilities and consolidate duplicated UI into `packages/ui`.

## Phase 5 – QA & observability hardening
- Create `docs/qa-hardening.md` and `docs/observability-plan.md` if they do not exist; outline Playwright smoke coverage, Lighthouse targets, logging, metrics, and alerting.
- Instrument the app with the agreed monitoring stack, capture screenshots and reports in `docs/qa/`, and document roll-forward/rollback procedures.
- Finish by running the full pipeline:
  ```bash
  pnpm -w turbo run lint check-types build test
  pnpm --filter web test:e2e
  pnpm performance-audit
  ```
- Once green, update `MAIN.md` with final production readiness status and link evidence artifacts.

## Artifact ownership
| File / Directory | Purpose | Owner notes |
| ---------------- | ------- | ----------- |
| `docs/production-refactor-playbook.md` | Source of truth for workstreams and cadence. | Keep owners/status updated weekly. |
| `TypeScript.md`, `Svelte5.md`, `SVELTEKIT2_FIX_PLAN.md`, `supabase.md`, `tailwindcssv4-refactor.md` | Phase-specific execution guides. | Claude-Code should work directly from these docs. |
| `docs/supabase-handoff.md` | Template for migrations, secrets, or backend tasks requiring manual execution. | Fill out whenever Claude encounters missing access. |
| `docs/qa/` | Evidence locker for screenshots, Lighthouse, monitoring, and Playwright output. | Organise by date + feature. |
| `notes/` | Running logs for inventories, audits, and post-mortems. | Create additional files as needed; avoid mixing domains. |

Keep this roadmap open as you work—every playbook links back here for sequencing, and this file records any new documents or owners added during the push to production.
