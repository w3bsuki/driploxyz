# Phase 0 – Artefact Audit (2025-09-24)

## Repository Layout Snapshot
- **Top-level directories:** `apps/`, `packages/`, `supabase/`, `notes/`, `node_modules/` (ignored), plus documentation files (`MAIN.md`, subsystem plans, historical checklists).
- **Apps:** `web`, `admin`, `docs` under `apps/`. Each contains package manifests and Svelte configs.
- **Packages:** `core`, `ui`, `database`, `i18n` directories exist with source code.
- **Supabase:** `supabase/migrations/` and `supabase/functions/` present; schema snapshot missing.
- **Legacy docs:** Multiple markdown plans (`tailwindcssv4-refactor.md`, `finalv4.md`, etc.) remain at root and require archival in later phases if superseded.

## Required Follow-ups
1. Verify each workspace README summarises purpose (some packages lack README files).
2. Capture Supabase schema snapshot to align `packages/database` types.
3. Decide fate of historical markdown plans; archive once replaced by reports.

No stray build artefacts or unexpected directories were detected during this audit.
