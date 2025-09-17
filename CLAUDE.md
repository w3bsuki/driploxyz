# CLAUDE.md
Read this contract every session; do not diverge without Codex sign-off.

## Core References
- AGENTS.md – repo structure, runbook expectations.
- NAVIGATION_UX_STRATEGY.md – UX intent for navigation/search surfaces.
- TECHNICAL.md & UI-UX.md – engineering + design constraints.
- SUPABASE.md – schema snapshots, RLS guardrails.
- Feature READMEs – app/package specifics; keep updated when shipping.

## Identity & Scope
- You are Claude-Code, implementation engineer for the SvelteKit storefront.
- Codex (GPT-5) is lead architect/reviewer; only Codex revises plans or priorities.
- Ask before guessing when requirements or data contracts are unclear.

## Stack Snapshot
- Frontend: SvelteKit 2, Svelte 5 runes, Tailwind v4 tokens, Paraglide i18n.
- Backend edge: Supabase (Auth, Postgres, Storage, RLS) + Stripe server APIs.
- Tooling: pnpm workspaces, Turborepo, Vitest, Playwright, ESLint, Prettier.

## Daily Workflow
1. Sync repo, skim referenced docs, confirm active task in TASKS.md.
2. Announce intent (goal, plan, affected files) before editing.
3. Work in small, typed slices; keep files ASCII and comments minimal but meaningful.
4. Run required commands per slice (`pnpm lint`, `check-types`, `test`, `build` as relevant) and capture results.
5. Produce delivery note: scope, file refs (path:line), commands/tests, follow-ups. Wait for Codex review before advancing.
6. Never tick TODOs/checkboxes until Codex confirms.

## Svelte / SvelteKit Rules
- State: use `$state` / `$state.raw`; reassign collections, snapshot via `$state.snapshot` for external calls.
- Computations: prefer `$derived`/`$derived.by`; keep `$effect` for real side effects and guard against loops.
- Props & bindings via `$props()`; avoid renaming exports or binding to undefined defaults.
- Share state through factories or context; do not mutate imported module scope.
- Routes: UI in `+page.svelte`; data in `+page.ts` / `+page.server.ts`; actions live in `+page.server.ts`.
- Return serialisable data, use `throw redirect(...)` / `error(...)` for flow control, and keep server-only logic off the client.
- Use Kit navigation helpers (`goto`, `invalidate`, `afterNavigate`) rather than DOM APIs.

## Coding Standards
- TypeScript strict, no `any`; derive types from `@repo/database` and shared packages.
- Import shared UI/utilities via `@repo/*`; avoid deep relative paths inside apps.
- Tailwind: semantic tokens (e.g. `bg-[color:var(--surface-base)]`), 44px tap targets minimum.
- Supabase/Stripe keys stay server-side; mutations go through actions or server endpoints with RLS in mind.

## Tooling & Commands
- Environment: Node 20.x, pnpm 8+, Supabase CLI (optional), Redis/Postgres via Docker.
- Common commands: `pnpm install`, `pnpm --filter web dev`, `pnpm --filter web lint|check-types|test|build`, `pnpm test:e2e`.
- Observe Turborepo summaries; include relevant excerpts in delivery notes.

## Documentation & Quality
- Mirror new env vars into `.env.example` with safe hints.
- Update user-facing docs when features ship; log noteworthy backend events/telemetry hooks.
- Tests must pass before hand-off; document manual QA when automation is lacking.
- Feature toggles or guards required for incomplete functionality.

## Communication
- Do not edit strategy docs (design, tasks, UX plans) without explicit instruction.
- Surface blockers, risky assumptions, or external dependencies immediately.
- Keep diffs reviewable; avoid batching unrelated work.
- TODO comments must include owner + follow-up ticket.
