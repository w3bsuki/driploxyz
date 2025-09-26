# Driplo Production Refactor Master Plan

> **Pull the latest plan first**
> ```bash
> git checkout work
> git pull origin work
> pnpm install
> ```
> Run these commands before assigning work so Claude-Code and local contributors operate from the same playbooks and dependency graph.

> **How to use this document**  
> 1. Assign an owner to each workstream in the table below.  
> 2. For the active workstream, share the linked playbook with Claude-Code and instruct it to follow the embedded prompt guide.  
> 3. After each milestone, ensure Claude pastes command output into the relevant playbook logs and pauses for Codex review.  
> 4. Do not mark checkboxes yourself—Codex will confirm completion during review sessions.

## Workstream overview
| Workstream | Owner | Status | Playbook | Notes |
| ---------- | ----- | ------ | -------- | ----- |
| TypeScript debt & lint cleanup |  | 🔴 Not started | [TypeScript.md](../TypeScript.md) | Clear compiler blockers and remove `any` usage. |
| Svelte 5 rune migration |  | 🔴 Not started | [Svelte5.md](../Svelte5.md) | Replace legacy state patterns with runes and Melt primitives. |
| SvelteKit 2 data contracts |  | 🔴 Not started | [SVELTEKIT2_FIX_PLAN.md](../SVELTEKIT2_FIX_PLAN.md) | Align loads/actions with serialisable DTOs. |
| Supabase schema & auth alignment |  | 🔴 Not started | [supabase.md](../supabase.md) | Regenerate types, validate RPCs, document migrations. |
| Tailwind CSS v4 compliance |  | 🔴 Not started | [tailwindcssv4-refactor.md](../tailwindcssv4-refactor.md) | Fix accessibility warnings and token drift. |
| QA & observability hardening |  | 🔴 Not started | [docs/refactor-roadmap.md](./refactor-roadmap.md#phase-5-qa--observability-hardening) | Add E2E coverage, monitoring, and performance baselines. |

> **Where are the detailed plans?**
> - TypeScript, Svelte 5, SvelteKit 2, Supabase, and Tailwind playbooks live at the repository root so Claude-Code can open them without extra path adjustments.
> - A consolidated timeline with sequencing guidance lives in `docs/refactor-roadmap.md`.
> - Supabase migrations or other backend-only actions that Claude cannot run must be logged in `docs/supabase-handoff.md` before handing off to a human operator.

## Execution cadence
1. **Kick-off** – Run the baseline commands listed below and capture output in `build-validation.txt`, `types-validation.txt`, and `lint-output.txt`.
   ```bash
   pnpm --filter web check
   pnpm --filter web check-types
   pnpm --filter web lint -- --max-warnings=0
   pnpm --filter web build
   ```
2. **Select a workstream** – Choose the highest-priority failing gate and open the linked playbook. Claude should follow the embedded prompt to execute step-by-step; each playbook now contains milestone-specific command checklists, evidence tables, and stop-points for Codex review.
3. **Review cycles** – After each playbook phase, Codex reviews diffs, command logs, and progress journal entries. If changes touch Supabase, document pending migrations in `supabase/migrations/pending/README.md` with owner + due date.
4. **Integration** – Once all workstreams report green checklists, run the Turbo pipeline and QA suites before tagging a release candidate.
   ```bash
   pnpm -w turbo run lint check-types build test
   pnpm --filter web test:e2e
   pnpm performance-audit
   ```

## Reporting checklist
- Update `remaining-typescript-errors.txt` and `remaining_errors.txt` after each successful command run.  
- Log new decisions, constraints, or open questions in `notes/` (create sub-files per domain if needed).  
- Capture screenshots, Lighthouse reports, and monitoring setup evidence in `docs/qa/` for final sign-off (create the directory if it does not exist).

## Outstanding documents to create
| Document | Purpose | Suggested owner |
| -------- | ------- | ---------------- |
| docs/qa-hardening.md | Outline Playwright, Axe, and monitoring tasks for production readiness |  |
| docs/observability-plan.md | Document logging, metrics, and alerting requirements |  |

## Definition of done
- All playbook checklists checked off by Codex.  
- Turbo pipeline (`pnpm -w turbo run lint check-types build test`) succeeds on CI.  
- Playwright regression + Axe accessibility suites pass.  
- Supabase migrations are applied and recorded with rollback notes in `docs/supabase-handoff.md`.  
- MAIN.md updated with accurate status reflecting the completed refactor.

