# Docs Maintainers Guide

How to keep the Claude-code docs crisp and effective.

## Pillars (Single Sources of Truth)

- Standards: `docs/STANDARDS_INDEX.md`
- Product: `docs/PRODUCT_INDEX.md`
- Specs: `docs/SPECS_INDEX.md`

Only these three should be “entry points”. Everything else is linked from them.

## File Hygiene

- Keep indexes short (1 screen). Link out for details.
- Prefer updating an existing doc over adding a new one.
- If creating a new spec, add a single bullet link under `SPECS_INDEX.md` with a short, action-oriented title.
- Use clear, stable filenames; avoid dates in names unless migrations.

## Naming

- Indexes: `*_INDEX.md`
- Plans/specs: `*_PLAN.md`, `*_SPEC.md`, or `*_TASKS.md`
- Playbooks: `docs/playbooks/*.md` for technology/process guides

## Change Workflow

1) Update the relevant spec under SPECS.
2) If it impacts standards, add/adjust bullets in STANDARDS_INDEX and link to the detailed doc.
3) If it impacts product decisions/roadmap, add a bullet in PRODUCT_INDEX.
4) Keep CLAUDE_CODE_CONFIG.md aligned with any process changes.

## Quality Bar

- Each doc starts with 1–2 lines explaining its purpose.
- Bullets over prose. Code references should use repo‑relative paths.
- Avoid duplicating content between docs—link instead.

