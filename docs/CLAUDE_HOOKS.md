# Claude‑code Hooks & Execution Protocol

Use these rules to run with confidence and consistency. If a hook cannot be automated in your environment, simulate it by following the checklist for that hook.

## Lifecycle Hooks

1) Start (on prompt begin)
- Read `CLAUDE.md` (implicit) and `docs/RUNBOOK.md` → Current Task.
- If Current Task is empty, open `README.md` → Execution Workflow and pick the next task.
- Write a 2–4 line plan under “Current In‑Progress” in `docs/CODEX_TASKLIST.md` naming the files you’ll touch.

2) Plan (pre‑implementation)
- Open the source doc for the task (playbook or UI migration doc) and list the exact steps you’ll execute.
- Confirm scope is ≤ 400 LOC of diffs. If larger, split into sub‑steps and PRs.

3) Apply (implementation)
- Edit only files listed in the plan; keep changes minimal and focused.
- Prefer refactors in place; don’t introduce new abstractions unless the playbook instructs it.
- For UI: edit only according to `docs/MELT_UI_MIGRATION.md` (single source of truth).

4) Validate (post‑changes)
- Run locally:
  - Types: `pnpm -w turbo run check-types`
  - Lint: `pnpm -w turbo run lint`
  - Tests: `pnpm -w turbo run test` (or narrower if configured)
  - Build: `pnpm --filter web build`
- Visual checks (when relevant): Header menu, Payout Dialog, Select behavior, and any new Tabs/Tooltip/Toast usage.
- If any gate fails, iterate up to 2 times. If still failing, stop and document blockers.

5) Document (wrap‑up)
- Tick the task’s checkboxes in the source playbook/migration doc.
- Update `docs/CODEX_TASKLIST.md` (In‑Progress → Done) with a 1–2 line summary.
- Append a short entry to `docs/CONTEXT.md` (what changed, where, validation run, follow‑ups).
- Update `docs/RUNBOOK.md`: set Current Task to the next item or “None”.

## Guardrails

- Single‑task mode: never interleave tasks. Finish one; document; then move on.
- No bloat: do not add dependencies without a clear rationale and removal plan.
- Minimal diffs: avoid wide formatting churn and drive‑by edits.
- Server safety: no secrets in client bundles; use `$env/dynamic/*` and server‑only files.
- UI: never import server code in the client; keep visuals in `@repo/ui`, behavior via Melt wrappers.

## File Selection Policy

- Prefer editing existing files referenced in playbooks/migration docs.
- For shared UI: modify `packages/ui/src/lib/**` and re‑export via `@repo/ui`.
- For app pages: prefer `+page.server.ts` loads and actions for mutations; avoid client‑side fetch when server can load.

## Failure Policy

- If a gate fails, revert only the problematic hunk; keep the rest.
- Log blockers in `docs/CODEX_TASKLIST.md` under the phase with a short note.
- Ask for clarification if the playbook conflicts with code reality (cite file paths).

## MCP & Tools (optional)

- If MCP servers are available (e.g., Svelte docs, Supabase), use them for API references instead of guessing.
- Prefer ripgrep for code search; keep command outputs scoped.

## Handoff Template (paste into docs/CONTEXT.md)

- Task: <name>
- Summary: <2–4 lines>
- Files: <list>
- Validation: types/lint/tests/build (✓/✗) + quick visual notes
- Follow‑ups: <bullets or none>

## Phase Gates (0 and 0.1)

Use this checklist to verify we’re ready to start Task 1 (Header Avatar Dropdown fix) and that Windows dev is stable.

- [ ] Vite dev runs on Windows (PowerShell) without minimatch/GLOBSTAR errors
- [ ] Sentry is disabled in dev by default, enabled for production builds
- [ ] Svelte Language Server is responsive (large folders excluded via jsconfig)
- [ ] tsconfig “extends” entries are valid (no arrays)
- [ ] App header renders; menus open; no fatal SSR errors

If any box is unchecked, stop and file a note in `docs/CODEX_TASKLIST.md` with a short repro and the smallest proposed fix.

## Task 1 — Header Avatar Dropdown Fix

Goal: Ensure the user avatar dropdown opens above the header/search bar, with correct background/foreground colors, consistent z-index, and mobile-friendly width.

Scope
- Fix only the header avatar menu. Don’t redesign other menus.
- Keep visuals in `@repo/ui` using tokens and Tailwind v4.

Likely Root Causes
- Color tokens: `packages/ui/src/styles/semantic.css` uses `var(--bg)`/`var(--fg)`, but our tokens define `--surface-*` and `--text-*`. This can cause transparent/incorrect colors.
- Positioning/stacking: The menu renders inside the header/search stacking context. Without portaling, it can be clipped or appear inside the search bar.

Files To Inspect
- `packages/ui/src/lib/HeaderUserMenu.svelte:1`
- `packages/ui/src/lib/primitives/menu/Menu.svelte:1`
- `packages/ui/src/styles/semantic.css:1`
- `apps/web/src/app.css:1` (ensures tokens are included)

Required Changes
- Colors:
  - Replace usages of `var(--bg)` with `var(--surface-base)` and `var(--fg)` with `var(--text-primary)` for menu surfaces/items.
  - Borders should use `var(--border-subtle)` or `var(--border-default)`.
- Positioning:
  - Portal the header menu to `body` so it’s not constrained by the search bar container. Use the existing `portal` prop in `Menu.svelte`.
  - Ensure adequate z-index (60+) for the dropdown surface.
- Width/spacing:
  - Mobile: allow full-width within safe margins; Desktop: natural width.

Out of Scope
- Global redesign of menu system.
- Changing Tailwind or token structure.

Acceptance Criteria
- Dropdown opens anchored to the avatar, not inside the search input container.
- Background and text colors match tokens (not transparent/white-on-white).
- Menu is readable in both light and dark (prefers-color-scheme) modes.
- z-index prevents overlap issues with sticky header/search.
- Mobile: full-width with side margins; Desktop: natural width, no overflow.

Manual QA
- Desktop: Open/close with mouse and keyboard; ensure focus ring, Escape closes, click outside closes.
- Mobile emulation: Tap targets are ≥ 44px; menu doesn’t overflow the viewport.

Claude Code — Prompt (paste into Claude)

You are Claude Code working in a SvelteKit monorepo. Implement the minimal, targeted fix for the header avatar dropdown. Follow these constraints exactly.

Objectives
- Fix header avatar dropdown overlay: correct colors, proper positioning, stacking, and width.

Constraints
- Only touch these files unless a strong reason is provided:
  - `packages/ui/src/lib/HeaderUserMenu.svelte`
  - `packages/ui/src/lib/primitives/menu/Menu.svelte`
  - `packages/ui/src/styles/semantic.css`
- Do NOT edit app-level layouts/pages except to wire an existing prop.
- Use tokens: `--surface-base`, `--text-primary`, `--border-subtle`, `--border-default`.
- Prefer adding `portal="body"` at the call site (HeaderUserMenu) over changing global defaults.
- No new dependencies.

Steps
1) Colors: In `semantic.css`, replace any `var(--bg)` with `var(--surface-base)` and `var(--fg)` with `var(--text-primary)` where used for menu and menu items. Keep borders to `--border-subtle`/`--border-default`.
2) Positioning: In `HeaderUserMenu.svelte`, pass `portal="body"` to the `Menu` component. Ensure `menuClass` includes a z-index ≥ 60.
3) Width: Keep mobile full-width with margins; Desktop natural width. Use existing responsive rules in `semantic.css` and avoid hardcoding `w-screen` in `menuClass`.
4) Validate: Run `pnpm -F web dev`, open the header, verify acceptance criteria above.
5) Summarize: List exact file changes and why. No unrelated edits.

Definition of Done
- All acceptance criteria met.
- No regressions in other menus.
- No changes outside the three files unless justified.

If you encounter blockers, stop and write a 3‑line note in CODEX_TASKLIST (what failed, where, proposed fix), then wait for confirmation.

— End Prompt —

Notes
- If Sentry causes Windows dev issues, keep it disabled in dev. It must remain enabled for prod builds. No Sentry changes are in-scope for this task.
