# Refactor Plan — Minimal, Safe, No Over‑Engineering

Purpose: apply targeted, mechanical refactors that reduce bloat and improve reliability without changing behavior. Keep diffs small and validated.

Principles
- Small scope: ≤ 300–400 LOC per PR; group by feature.
- No new abstractions unless repeated 2+ times (“Rule of 2”).
- No new dependencies. Prefer existing utilities and patterns.
- Touch only the files you refactor; don’t chase unrelated errors.
- Validate: types, lint, build, and a quick UI check on the affected surface.

Targets (Post‑Finalization)
- UI de‑duplication: promote shared components to `@repo/ui`, delete app duplicates.
- CSS tokens: use semantic tokens; remove raw color literals in shared UI.
- Barrel hygiene: keep extensionless exports; centralize style side‑effects.
- Server files: prefer helpers; remove dead endpoints and TODOs.
- Types: replace any lingering implicit anys when touching a file.

## Claude Code — Refactor Prompt (Copy/Paste)

You are Claude Code. Execute a minimal refactor for de‑duplication and token cleanup after Finalization. Do NOT edit `docs/RUNBOOK.md`. Track plan/progress in `docs/CODEX_TASKLIST.md` and summarize in `docs/CONTEXT.md`. Keep total diffs ≤ 300 LOC, Windows‑friendly.

Objectives
- Replace app‑level duplicates with `@repo/ui` components where available; delete duplicates after green build.
- Sweep touched components for token usage (no raw colors); keep borders on `--border-*`.
- Ensure barrels are extensionless and style side‑effects are centralized.

Scope (example batch)
- `apps/web/src/lib/components/*` (choose 1–2 duplicates to migrate)
- `packages/ui/src/lib/*` (token cleanup in the migrated components only)
- `packages/ui/src/lib/index.ts` (exports only if needed)

Steps
1) Pick 1–2 duplicated components used across pages; replace imports with `@repo/ui` equivalents.
2) If the shared component needs token cleanup, adjust styles to use semantic tokens.
3) Remove the app‑level duplicates once types/build are green.
4) Validate (Windows):
   - `pnpm -w turbo run check-types && pnpm -w turbo run lint && pnpm --filter web build`
   - Manual: open the view(s) using the migrated components; verify visuals and interactivity.
5) Docs: update `docs/CODEX_TASKLIST.md` (tick items) and `docs/CONTEXT.md` (2–4 line summary).

Constraints
- No Vite/Sentry/i18n/Tailwind config changes in refactor PRs.
- If a migration risks wide changes, split into smaller batches and note follow‑ups.

