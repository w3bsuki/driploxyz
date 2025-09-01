# Claude‑code Config & Workflow

Optimized guidance for running Claude‑code effectively in this repo.

## Three Primary Sources (Start Here)

Load only these at the beginning of a task to avoid context overload:
- Standards: docs/STANDARDS_INDEX.md
- Product: docs/PRODUCT_INDEX.md
- Specs: docs/SPECS_INDEX.md

Then open only the specific linked spec or playbook needed for the current task.

## Mode of Work (Tight Loop)

1) Read primary sources → open the active spec in docs/SPECS_INDEX.md.
2) Plan: 2–4 lines; list steps; confirm assumptions.
3) Implement: small diffs, update existing files over adding new ones.
4) Validate: types, lint, tests, run/build affected app(s).
5) Document: update the spec/tasklist with a short summary.

## Context Management

- Prefer small, authoritative docs (indexes above), then JIT open only what’s referenced.
- Avoid loading the entire docs folder. Stick to ≤ 3–5 files at once.
- When code patterns are unclear, grep the repo and open only target files (UI lives in packages/ui; server in $lib/server).

## Implementation Rules (Short)

- Svelte 5 runes; Tailwind v4 tokens; shared UI in packages/ui only.
- Use existing Melt UI primitives via @repo/ui wrappers.
- Use Paraglide i18n for text; no hardcoded strings.
- Security & a11y first; performance budgets per STANDARDS.

## Commit/PR Hygiene

- ≤ 400 LOC per change; single responsibility.
- Conventional commits; remove dead code; explain deps.

## When Stuck

- Pause and write assumptions in the spec; propose smallest viable path; ask for clarification if needed.

