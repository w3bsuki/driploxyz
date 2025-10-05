# Cleanup Candidates

This file aggregates all potential cleanup candidates identified through static analysis and manual inspection.

## Categories

### 1. Temporary Files (Already Documented)
- temp_types.ts
- testfile.txt
- remaining_errors.txt
- remaining-typescript-errors.txt
- lint-current.txt
- lint-output.txt
- lint-validation.txt
- build-validation.txt
- types-validation.txt
- unused_vars_inventory.txt
- NUL
- apps/web/nul

### 2. Build Artifacts (Already Documented)
- apps/web/playwright-report/

### 3. Documentation (To Be Archived)
- docs/refactor/cleanup-checklist.md
- docs/refactor/CODEX-QUICK-START.md
- docs/refactor/CODEX-WEB-PROMPT.md
- docs/refactor/DOCUMENTATION-SUMMARY.md
- docs/refactor/EXPLANATION-FOR-HUMAN.md
- docs/refactor/PHASE-2-4-KICKOFF.md
- docs/refactor/PHASE-5-KICKOFF.md
- docs/refactor/PHASE-5-PROMPT.md
- docs/refactor/PHASES-1-4-SUMMARY.md
- docs/refactor/QUICK-REFERENCE-PHASE-5.md
- docs/refactor/QUICK-REFERENCE.md
- docs/refactor/TASK-11-FIXES.md
- docs/refactor/task-board.md
- docs/refactor/TOAST-SYSTEM-DOCUMENTATION.md
- docs/refactor/reports/phase-3-validation-log.md
- docs/refactor/reports/phase-4-planning.md
- docs/refactor/reports/runtime-breakage-investigation.md
- docs/refactor/reports/svelte5-compliance-audit.md
- docs/refactor/workflows/toast-migration.md

### 4. Potential Unused Components (To Be Analyzed)
- packages/ui/src/lib/components/forms/FormField.svelte (import errors in build)
- Any components with _disabled or _temp prefixes
- Demo components in apps/web

### 5. Potential Unused Routes (To Be Analyzed)
- apps/web/src/routes/category/slug_disabled/
- Any routes with _disabled or _temp prefixes
- Demo routes in apps/web

### 6. Potential Unused Scripts (To Be Analyzed)
- Any scripts in package.json files that are not referenced
- Duplicate or similar scripts that could be consolidated

### 7. Potential Unused Dependencies (To Be Analyzed)
- Dependencies that appear in package.json but are not imported
- Dependencies that are only used in tests but not properly marked as devDependencies

### 8. Potential Unused Exports (To Be Analyzed)
- Exports in packages that are not imported anywhere
- Type exports that are not used

### 9. Duplicate Code (To Be Analyzed)
- Similar utility functions across packages
- Duplicate component implementations
- Similar service implementations

## Next Steps

1. Run static analyzers (knip, ts-prune, depcheck, jscpd) to identify specific candidates
2. Manually review each candidate to determine if it can be safely removed
3. Remove candidates in batches, verifying after each batch
4. Update CLEANUP-DELETE-MANIFEST.json with each removal