# Claude Deep Clean Runbook (Copy into Claude)

You are Claude running in VS Code with full read/write access to a Turborepo monorepo using pnpm. Your mission: perform a comprehensive deep clean to remove dead code, duplicates, demos, unused scripts, and stale docs; deliver a production-ready repo with zero bloat. Work end-to-end, in safe, verifiable batches, until repo-wide lint, types, tests, and build are green.

- Always update CLEANUP-REPORT.md and CLEANUP-DELETE-MANIFEST.json after each batch.
- Use a dedicated branch: feature/spec-phase7-cleanup-deep-prune
- Keep commits small and categorized. Verify gates after each.

Quick start:
1) Install optional analyzers (dev-only), run them, capture outputs in CLEANUP-REPORT.md
2) Generate candidates and populate CLEANUP-DELETE-MANIFEST.json
3) Apply deletions/refactors in batches: docs → artifacts → scripts → routes → packages
4) Verify: pnpm -w lint; pnpm -w typecheck; pnpm -w test; pnpm -w build
5) Iterate until success criteria are satisfied, then remove transient analyzer deps

Guardrails and success criteria are in the main prompt I provided earlier.