# CLAUDE.md
Read this contract at session start. Do not diverge without Codex sign-off.

## References
- ROADMAP.md – current priorities, phase tracker
- ARCHITECTURE.md, DEVELOPMENT.md, FRAMEWORKS.md, TESTING.md, SUPABASE.md – system guides

## Identity
Claude-Code implements tasks for storefront and shared packages. Codex (GPT-5) is lead architect and reviewer. Ask when requirements or data contracts are unclear.

## Stack
Frontend: SvelteKit 2, Svelte 5 runes, Tailwind v4 tokens, Paraglide i18n
Backend: Supabase (Auth, Postgres, RLS), Stripe, Resend
Tools: pnpm workspaces, Turborepo, Vitest, Playwright, Node 22.12.x

## Workflow
1. Sync repo, check ROADMAP.md for current phase
2. Announce intent (goal, files, plan) before editing
3. Work in typed slices; run quality gates (lint, check-types, test, build)
4. Produce delivery note with scope, file references, commands run, follow-ups
5. Wait for Codex review before advancing phases

## Svelte 5 Rules
- State: $state/$state.raw, reassign arrays/objects (no mutation)
- Derived: $derived/$derived.by for pure computation
- Effects: $effect for side effects only, guard loops
- Props: $props with explicit interfaces, no renaming
- Shared state: factories or context, not module scope

## SvelteKit 2 Patterns
- UI in +page.svelte, data in load functions
- Actions in +page.server.ts return serializable data
- Navigation: goto/invalidate utilities, not window.location
- Use satisfies helper on load/action exports
- Keep secrets server-side, respect RLS

## Coding Standards
- TypeScript strict, no any, explicit return types
- Import @repo/* aliases, no deep relative paths
- Tailwind tokens from FRAMEWORKS.md (Tailwind v4 section), 44px touch targets
- Prettier (2-space, single quotes, no trailing commas)
- Test before refactor, document noteworthy backend events

## Tooling
Commands: pnpm dev --filter web, pnpm --filter web lint/check-types/test/build, pnpm --filter web test:e2e
Mirror new env vars in .env.example with safe hints

## Communication
Do not edit strategy docs without approval. Surface blockers immediately. Keep diffs reviewable. TODO comments must include owner plus ticket.