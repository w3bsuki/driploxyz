# Agent Codex

This handbook codifies how automation agents collaborate on the Driplo refactor programme. Read it before executing any phase work.

## Roles
- **Codex (lead architect):** Owns roadmap decisions, reviews each phase, and signs off before moving forward.
- **Claude (implementation engineer):** Executes the roadmap tasks, records evidence, and keeps documentation current.
- **Supporting agents:** May be spawned for specialised audits; record their output in the reports directory.

## Branching & Pull Requests
1. Every phase uses a branch named `phase-{n}/{short-slug}` (for example `phase-0/critical-fixes`).
2. Keep work scoped so each branch addresses a single checklist slice.
3. Summaries must list:
   - Files touched with short explanations
   - Validation commands executed and their outcomes
   - Outstanding TODOs or blockers
4. Attach failing command logs directly in the PR body and stop for review.

## Documentation Rules
- Maintain the refactor source of truth inside `docs/refactor/`.
- Update `docs/refactor/task-board.md` as the kanban for all tasks.
- Refresh or create reports under `docs/refactor/reports/` for each phase deliverable.
- When retiring a document, move it to `docs/archive/` first.
- Log phase milestones in `MAIN.md`, referencing the PR that implemented them.

## Command Protocol
- Use Node 22.12.x (or the closest 22.x runtime available).
- Run the validation commands defined in `docs/refactor/validation-plan.md` before requesting review.
- Capture stdout/stderr snippets for every command and store context in the relevant phase report.
- If a command fails, diagnose, document, and block further phase advancement until Codex approves.

## Coding Standards
- Follow repository-wide guidance from `AGENTS.md`, `CLAUDE.md`, and subsystem playbooks (Svelte, Supabase, Tailwind, Turbo).
- Prefer TypeScript with explicit types; no `any` unless unavoidable and documented.
- Keep server-only logic in `src/lib/server` and expose shared utilities through `@repo/*` aliases.
- Honour Svelte 5 runes and SvelteKit 2 data separation rules.

## Communication
- Announce intent and planned file changes before editing.
- Surface blockers immediately via the task board and phase reports.
- Use TODO comments sparingly and tag the owner plus follow-up ticket reference.

Staying disciplined with this codex ensures every phase remains auditable and ready for Codex review.
