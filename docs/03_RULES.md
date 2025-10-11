# Working Agreements & Workflow Rules

## Branching & Pull Requests

1. Create refactor branches off `main` using the pattern `refactor/<scope>-<short-desc>` (e.g. `refactor/web-auth-loads`).
2. Keep branches short-lived; merge only after green build/lint/test checks and documentation updates.
3. PR template must include:
	- Summary + linked roadmap/task IDs
	- Verification commands executed
	- Follow-up issues or TODOs

## MCP Usage & Safety

- Always kick off Svelte MCP sessions by calling `list-sections`, then fetch every relevant doc via `get-documentation`; run `svelte-autofixer` until no issues remain before sharing Svelte snippets.
- Configure Supabase MCP with project-scoped, read-only personal access tokens; store PAT references securely and log every tool invocation that touches Supabase data in `02_LOG.md`.
- Keep MCP activity in non-production environments, restrict feature groups to the minimum needed, and review prompt-injection guidance before approving agent-generated SQL or migrations.

## SvelteKit Implementation Standards

- Components are rune-first: use `$props`, `$state`, `$derived`, and snippets (`{#snippet}`/`{@render}`); never mutate incoming props and prefer `$state.snapshot` before handing objects to third-party libraries.
- Server data lives in `+page.server.ts` / `+layout.server.ts` and `$lib/server`. Universal loads must return serializable data and use streamed promises for slow fetches.
- Prefer `error()` and `redirect()` helper calls (no manual throws) and set explicit `path` options on cookies to satisfy SvelteKit 2 requirements.
- `hooks.server.ts` is the canonical place for auth/session enrichment using helpers from `packages/core`; `handleFetch` rewrites Supabase requests to internal endpoints when needed.
- Shared utilities in `packages/core` must remain framework-agnostic; client code may only import from `$lib` aliases to avoid bundling server modules.
- Enable `kit.experimental.remoteFunctions` only when guarded server modules, schema validation, and optimistic update patterns are ready; document each remote function's `query/form/command` contract.

## Supabase Guidelines

- Respect RLS and service-role boundaries; route calls through `$lib/server` helpers.
- Keep migrations in version control; use Supabase branches for experimentation.
- Harden the Data API by exposing only deliberate schemas (prefer a dedicated `api` schema) and enabling RLS before granting access; keep sensitive tables in private schemas.
- Mask secrets in logs and docs; mirror safe hints in `.env.example` when new variables appear.

## Documentation Workflow

- Every merged change updates `01_TASKS.md` (status + notes) and, once completed, adds a dated entry to `02_LOG.md`.
- The roadmap (`00_ROADMAP.md`) changes only when strategy shifts; include a `Last updated: YYYY-MM-DD` line.
- `README.md` must reference any new docs or playbooks added under `docs/`.

## Quality Gates

Run (and record in the PR) before requesting review:

1. `pnpm lint`
2. `pnpm check`
3. `pnpm test`
4. `pnpm build`

Include remote function smoke checks (form submission + query refresh) whenever those surfaces change, and note the executed MCP tool calls alongside command output.

Capture failures and remediation notes in the change description. If a command is intentionally skipped, explicitly state why and when it will run next.

## Decision Recording

- Capture architectural or process decisions in `02_LOG.md` with a brief rationale and owner.
- Link to supporting docs (Supabase dashboards, Svelte MCP references, GitHub issues) for future traceability.

## Review Expectations

- Reviews focus on incremental progress; large rewrites should be split into traceable commits.
- High-risk changes need at least one automated test, monitoring hook, or rollback plan to prove safety.
- Documentation updates are part of the diff; PRs missing docs should be flagged before approval.
