# Structure Remediation Roadmap

## Goals
- Align repository tree with `ProjectStructure.md` expectations.
- Ensure each workspace exposes a README and clear ownership metadata.
- Collapse stray scripts/log directories or move them under `docs/archive/`.

## Current Observations (2025-09-24)
- Top level folders present: `apps/`, `packages/`, `supabase/`, `notes/`, documentation files, and generated reports (e.g. `lint-*.txt`).
- Legacy artefacts (`finalv4.md`, `tailwindcssv4-refactor.md`, etc.) exist but contain historical plans; keep until superseded.
- No `scripts/` directory is present; automation remnants appear to have been removed previously.

## Action Plan
1. Confirm every workspace contains a README describing scope and commands.
2. Tag owners in README or add `owners` blocks where missing.
3. Relocate ad-hoc notes into `docs/archive/` once referenced by new reports.
4. Ensure aliases between apps and packages remain consistent after directory moves.

Track progress on the task board and document artefact moves in the Phase 0 report.
