# Driplo Product Roadmap

_Last updated: 2025-10-10_

## 1. Vision

Deliver a trusted, fast, and localized marketplace for luxury fashion where buyers and sellers can transact safely with real-time support.

## 2. Guiding Principles

- **User trust first:** secure auth, transparent policies, and proactive fraud detection.
- **Performance everywhere:** fast server-rendered experiences with instant client hydration.
- **Localization by design:** seamless language switching powered by Paraglide.
- **Composable architecture:** shared services in `packages/core` and reusable UI in `packages/ui`.
- **Agent-aware workflows:** Svelte MCP and Supabase MCP stay wired into every refactor with read-only, project-scoped tokens and documented tool calls.

## 3. Architecture Blueprint

- **Project layout:** follow the canonical SvelteKit structure (`src/routes`, `src/lib`, environment-specific helpers in `$lib/server`) with shared primitives delivered through Turborepo packages (`packages/core`, `packages/ui`, `packages/database`).
- **Runes-first UI:** all components use `$props`, `$state`, `$derived`, and snippets for composition; component state never mutates incoming props and snapshots are required before handing data to third-party integrations.
- **Data loading:** keep auth, Supabase, and other secure reads inside `+page.server.ts` / `+layout.server.ts`; universal loads only return serializable data and defer expensive work with streamed promises when possible.
- **Forms, actions & remote functions:** every mutation flows through SvelteKit form actions or remote functions, progressively enhanced via `use:enhance`, validated with Standard Schema-compatible libraries, and refreshed through single-flight `query` updates.
- **SvelteKit 2 semantics:** adopt built-in `error()`/`redirect()` handling (no manual throws), set explicit cookie paths, prefer `Promise.all` in loads, and enable `kit.experimental.remoteFunctions` once server-only helpers are hardened.
- **Hooks & middleware:** `hooks.server.ts` owns auth/session enrichment using `getRequestEvent()` helpers from `packages/core`, while `handleFetch` rewrites Supabase requests for edge-friendly routing.
- **Performance guardrails:** adopt module preloading defaults, lazy-load heavy UI with dynamic `import()`, and document image/font strategy in `packages/ui`.
- **Packaging:** `packages/ui` ships framework-agnostic components with generated types via `svelte-package`; `packages/core` exposes server utilities only through `$lib/server` entry points to avoid client bundling.

## 4. Phased Delivery Plan

| Phase | Focus | Primary Deliverables | Target Exit Criteria |
| --- | --- | --- | --- |
| 1 | Stabilize baseline | Clean docs, verify builds, catalogue tech debt, confirm `.env` coverage, codify MCP operating guide | Green `pnpm build`, prioritized backlog, documented Supabase smoke tests, MCP prompts embedded in CLAUDE/AGENTS docs |
| 2 | Rebuild core services | Supabase auth/session layer, product & search services, type-safe API surface, remote function scaffolding | Unit coverage for core services, end-to-end happy path, remote function queries powering at least one user flow |
| 3 | Rebuild customer web app | Rune-based UI, localized routing, checkout & messaging flows managed via remote functions | Demoable buyer/seller journey, lighthouse > 85, form actions emit single-flight updates |
| 4 | Admin & observability | Admin dashboards, monitoring, on-call runbooks, server tracing | All critical alerts routed, admin workflows tested, remote functions instrumented |
| 5 | Launch readiness | Playbooks, accessibility, security, release planning | SOC-style checklist cleared, launch sign-off, MCP security checklist signed |

## 5. Immediate Focus

1. Stand up accurate documentation workflow (this folder) with MCP prompts and tool etiquette.
2. Inventory critical gaps in core services and UI, including Supabase migrations, remote functions coverage, and `packages/core` helpers.
3. Establish refactor branches with automated checks, run `pnpm dev --filter apps/web` to validate the restored Supabase configuration, and record MCP tool calls in `02_LOG.md` for sensitive operations.

## 6. Decision Log Hooks

Record every major decision (tech, product, process) in `02_LOG.md` with a date stamp and owner so this roadmap stays authoritative.
