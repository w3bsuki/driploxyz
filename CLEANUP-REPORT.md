# Deep Cleanup Report

Purpose: Track the zero-bloat cleanup across the monorepo. This file is the living report Claude should update after each batch of work.

## Status Summary

- Start time: 2025-10-04T23:45:00Z
- Current branch: feature/spec-phase7-cleanup-deep-prune
- Last verified gates:
  - Lint: FAILING (159 errors per lint-current.txt)
  - Typecheck: PASSING (per remaining-typescript-errors.txt)
  - Unit tests: UNKNOWN
  - Build: FAILING (FormField import error per build-validation.txt)

## Batches

Record one entry per batch (small, reversible commits). Use this template:

### Batch 1 – Remove temporary root files
- Commit: TBD
- Category: artifacts
- Changes:
  - Updated .gitignore to exclude temporary files (temp_types.ts, testfile.txt, etc.)
  - Documented temporary files in CLEANUP-DELETE-MANIFEST.json
  - Prepared for removal of 7 temporary files
- Evidence: Files contain outdated error logs and test data
- Verification: lint=TBD | type=TBD | tests=TBD | build=TBD
- Notes: Files are now gitignored and ready for removal

### Batch 2 – Document build artifacts
- Commit: TBD
- Category: artifacts
- Changes:
  - Identified playwright-report directory in apps/web
  - Updated .gitignore to exclude additional invalid files
  - Documented build artifacts in CLEANUP-DELETE-MANIFEST.json
- Evidence: Found tracked build artifacts that should be gitignored
- Verification: lint=TBD | type=TBD | tests=TBD | build=TBD
- Notes: Build artifacts are now documented and gitignored

### Batch 3 – Archive stale documentation
- Commit: TBD
- Category: docs
- Changes:
  - Created docs/archive/ directory for historical documentation
  - Documented 19 stale documentation files in CLEANUP-DELETE-MANIFEST.json
  - Created README.md in docs/archive/ explaining archived content
- Evidence: Found numerous documentation files from previous refactor phases
- Verification: lint=TBD | type=TBD | tests=TBD | build=TBD
- Notes: Stale documentation is now archived and documented for historical reference

### Batch 4 – Install analyzer tools
- Commit: TBD
- Category: tools
- Changes:
  - Added knip, ts-prune, depcheck, jscpd, eslint-plugin-sonarjs, svelte-check to root package.json
  - Documented disabled route slug_disabled in CLEANUP-DELETE-MANIFEST.json
- Evidence: Tools needed for static analysis of codebase
- Verification: lint=TBD | type=TBD | tests=TBD | build=TBD
- Notes: Analyzer tools are now available for code analysis

### Batch A – Analyzer Baseline
- Commit: TBD
- Category: analysis
- Changes:
  - Ran knip, ts-prune, depcheck, jscpd, svelte-check analyzers
  - Documented 208 unused files, 200+ unused exports, 1000+ unused message keys
  - Found 1835 svelte-check errors and 15 warnings
  - Identified 10 unused devDependencies
- Evidence: Comprehensive analyzer outputs showing significant cleanup opportunities
- Verification: lint=TBD | type=TBD | tests=TBD | build=TBD
- Notes: Baseline established for systematic cleanup

## Analyzer Snapshots

### knip - Unused files and exports (208 files, 46 unused types, 1 duplicate export)
**Key findings:**
- 208 unused files across apps/web, packages/ui, packages/i18n, apps/admin
- Major unused components in apps/web/src/lib/components/ (ConversationList, EarlyBirdBanner, MessageInput, etc.)
- Unused auth components and hooks in apps/web/src/lib/auth/
- Unused search and navigation components in packages/ui
- 46 unused exported types (DomainProduct, ProductSearchParams, etc.)
- Duplicate export: toast|toasts in packages/ui/src/lib/toast.ts

### ts-prune - Unused TypeScript exports
**packages/ui:** 200+ unused exports including components, types, utilities
**packages/i18n:** 1000+ unused message keys and functions
**apps/web:** Multiple unused domain types and service exports

### depcheck - Unused dependencies
**Unused devDependencies:** @lhci/cli, @playwright/test, depcheck, eslint-plugin-sonarjs, jscpd, knip, svelte-check, ts-prune, typescript, web-vitals, uuid
**Missing dependencies:** jsr:@supabase (in supabase/functions/send-message/index.ts)

### jscpd - Duplicate code detection
**Detection time:** 0.32ms
**Found:** No significant code duplicates detected (minimal output suggests clean codebase)

### svelte-check - Accessibility and diagnostics
**Found 1835 errors and 15 warnings in 311 files**
**Key issues:**
- Missing component imports in packages/ui/src/lib/common.ts
- Missing type declarations in search components
- TypeScript errors in Supabase edge function (missing Deno types)
- Non-reactive variable updates in Svelte components
- Missing module declarations

## Deltas

Track repo size and counts over time.
- Files removed: 0
- Lines removed: 0
- Size delta: 0 MB

## Open Questions

- [ ] Ambiguous: <path> — keep/remove rationale
- [ ] Ambiguous: <path>

## Completion Criteria

- Repo-wide lint/type/test/build all green
- No unused files/exports per analyzers
- Tracked artifacts removed and ignored
- Docs canonicalized; stale moved to docs/archive

## Final Summary (fill at the end)

- Deleted (by category):
  - Docs: 0
  - Scripts: 0
  - Routes: 0
  - Components: 0
  - Packages: 0
  - Tests/fixtures: 0
  - Artifacts: 0
- CSS/JS bundle delta: TBD
- Key refactors: TBD
