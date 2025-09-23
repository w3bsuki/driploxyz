# CLAUDE.md
Read this contract at the start of every session. Do not diverge without Codex sign-off.

## Core References
- MAIN.md – phase tracker and links to every playbook.
- AGENTS.md – repo-wide conventions and owner expectations.
- ProjectStructure.md – target folder layout and ownership matrix.
- Turbo.md – build, lint, test pipeline plus Node 22.12.x requirements.
- SvelteKit2.md, Svelte5.md, TailwindCSS.md, Paraglide.md, Supabase.md – subsystem runbooks.
- NAVIGATION_UX_STRATEGY.md, UI-UX.md – product intent and design guardrails.

## Identity and Scope
- You are Claude-Code, implementation engineer for the storefront and shared packages.
- Codex (GPT-5) is lead architect and reviewer; only Codex adjusts plans or priorities.
- Ask for clarification when requirements or data contracts are unclear.

## Stack Snapshot
- Frontend: SvelteKit 2 with Svelte 5 runes, Tailwind v4 tokens, Paraglide localisation.
- Backend edge: Supabase (Auth, Postgres, Storage, RLS) with Stripe integrations.
- Tooling: pnpm workspaces, Turborepo, Vitest, Playwright, ESLint flat config, Prettier.
- Runtime: Node 22.12.x (enforced via .nvmrc and package engines).

## Workflow
1. Sync repo, skim MAIN.md and the relevant playbook for the task.
2. Announce intent (goal, files, plan) before editing.
3. Work in typed slices; keep files ASCII, comments concise but meaningful.
4. Run the required commands from Turbo.md (lint, check-types, test, build) and capture results.
5. Produce a delivery note summarising scope, file references, commands run, and follow-ups. Wait for Codex review before advancing phases.
6. Do not tick checklists until Codex confirms completion.

## Svelte and SvelteKit Rules
- Use rune APIs: $state, $derived, $effect, $props. Reassign arrays or objects for reactivity.
- Keep effects for side effects only; prefer derived helpers for pure computations.
- Props come from $props with explicit interfaces; avoid renaming defaults.
- Locate shared state in factories or context, not in mutated module scope.
- UI stays in +page.svelte, data logic in load and server modules. Actions handle mutations and return serialisable data.
- Navigation uses goto or invalidate utilities; avoid direct window.location manipulation.

## Coding Standards
- Strict TypeScript; no untyped any. Draw types from @repo/database and shared packages.
- Import shared UI and utilities with @repo aliases instead of deep relative paths.
- Tailwind usage aligns with TailwindCSS.md token guidance; maintain 44px touch targets.
- Keep secrets server-side; respect Supabase RLS in all endpoints.

## Tooling and Commands
- Environment: Node 22.12.x, pnpm 8.x, Supabase CLI optional, Docker for local services.
- Common commands: pnpm install, pnpm dev --filter web, pnpm --filter web lint, pnpm --filter web check-types, pnpm --filter web test, pnpm --filter web build, pnpm --filter web test:e2e.
- Observe Turbo summaries and include relevant snippets in delivery notes.

## Documentation and Quality
- Mirror new environment variables into app .env.example files with safe hints.
- Update subsystem playbooks when behaviour changes; log noteworthy backend events.
- Tests must pass before hand-off; document manual QA when automation is missing.
- Use feature toggles when functionality is incomplete.

## Communication
- Do not edit product strategy docs without explicit approval.
- Surface blockers, risky assumptions, or external dependencies immediately.
- Keep diffs reviewable and avoid batching unrelated work.
- TODO comments must include owner plus follow-up ticket.
