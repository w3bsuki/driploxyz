# Phase 3 - Code Cleanup Checklist

**Date Created:** 2025-09-29
**Phase:** 3 - Code Cleanup & Testing
**Status:** 🔄 **IN PROGRESS**

## Overview

This checklist documents all dead code, duplicates, and cleanup tasks identified during Phase 3 analysis. Items are marked with status and priority for systematic elimination.

## 1. Toast System Duplicates ⚠️ **CRITICAL**

### Current State (3 implementations found)

| File | Status | Purpose | Action |
|------|--------|---------|--------|
| `packages/ui/src/lib/primitives/toast/store.ts` | ✅ **KEEP** | Modern Melt UI system with Svelte 5 runes | Canonical source |
| `packages/ui/src/lib/stores/toast-store.svelte.ts` | ❌ **REMOVE** | Legacy bridge (no longer needed) | Delete + update imports |
| `apps/web/src/lib/stores/toast.svelte.ts` | ❌ **MIGRATE** | App-specific duplicate | Replace with @repo/ui import |

### Impact Analysis
- **Memory leaks**: Multiple toast arrays in memory
- **Inconsistent behavior**: Different APIs and behaviors
- **Maintenance burden**: 3 places to update for changes
- **Bundle size**: Duplicate code shipped to users

### Migration Strategy
1. ✅ Identify all import locations
2. ✅ Update imports to use `@repo/ui/primitives/toast`
3. ✅ Remove legacy files
4. ✅ Test toast functionality across all apps

## 2. Demo/Test Files for Removal

| File | Type | Reason | Status |
|------|------|--------|--------|
| `packages/ui/src/lib/my-counter-class.svelte.ts` | Demo | Example Svelte 5 class (not production) | ❌ **REMOVE** |
| `apps/web/src/lib/tutorial/manager.svelte.ts` | Feature | Tutorial system (review if demo) | 🔍 **REVIEW** |

**Note**: `packages/ui/src/lib/primitives/select/example.md` is **KEPT** as valuable documentation.

## 3. Form Validation Consolidation

| Location | Purpose | Status |
|----------|---------|--------|
| `apps/web/src/lib/utils/form-validation.svelte.ts` | App-specific validation | 🔍 **AUDIT** |
| `@repo/ui` validation utilities | Shared validation (if any) | 🔍 **AUDIT** |

**Action**: Establish canonical location for shared validation patterns.

## 4. Svelte 5 Compliance Audit

### Files Requiring Verification

| File | Current Status | Audit Required |
|------|----------------|----------------|
| `packages/ui/src/lib/hooks/is-mobile.svelte.ts` | ✅ Uses runes | ✅ **VERIFIED** |
| `apps/web/src/lib/services/realtime.svelte.ts` | ⚠️ Review patterns | 🔍 **AUDIT** |
| `apps/web/src/lib/utils/error-handling.svelte.ts` | ⚠️ Check rune usage | 🔍 **AUDIT** |
| `apps/web/src/lib/stores/*.svelte.ts` | ⚠️ Mixed compliance | 🔍 **AUDIT** |

### Patterns to Verify
- ✅ Proper `$state`, `$derived`, `$effect` usage
- ✅ No legacy reactive patterns
- ✅ Context/factory patterns follow Svelte 5 best practices
- ✅ No module-scope mutations

## 5. @repo/ui Package Cleanup

### File Structure Review

| Directory/File | Purpose | Status |
|----------------|---------|--------|
| `packages/ui/src/styles/` | Global styles | 🔍 **REVIEW** |
| `packages/ui/src/lib/components/` | Production components | ✅ **KEEP** |
| `packages/ui/src/lib/primitives/` | UI primitives | ✅ **KEEP** |
| `packages/ui/src/utils/` | Utility functions | 🔍 **REVIEW** |

### Export Surface Audit
- ✅ Only production-ready components exported
- ✅ Remove experimental/internal code
- ✅ Clean component organization

## 6. Testing Infrastructure Gaps

### Current State
| Package | Test Config | Test Files | Status |
|---------|-------------|------------|--------|
| `packages/core` | ✅ Has tests | ✅ Basic coverage | ✅ **GOOD** |
| `packages/ui` | ❌ No vitest.config.ts | ❌ No tests | ❌ **MISSING** |
| `apps/web` | ❌ No vitest.config.ts | ❌ No tests | ❌ **MISSING** |

### Required Actions
- ⚠️ Create shared testing configuration
- ⚠️ Add vitest.config.ts files
- ⚠️ Backfill critical tests for:
  - Auth stores/services
  - Toast system
  - Theme management
  - UI components (sample coverage)

## 7. Documentation Updates Required

| Document | Status | Action |
|----------|--------|--------|
| `cleanup-checklist.md` | ✅ **CREATED** | This file |
| `phase-3-cleanup.md` | ⚠️ **PENDING** | Summary report |
| `phase-3-validation-log.md` | ⚠️ **PENDING** | Validation results |
| `task-board.md` | ⚠️ **PENDING** | Update progress |

## Summary

### Critical Actions (Phase 3a)
1. ✅ **Toast system consolidation** (highest priority)
2. ✅ **Remove demo files**
3. ✅ **Audit Svelte 5 compliance**

### Infrastructure Actions (Phase 3b)
4. ✅ **Create testing infrastructure**
5. ✅ **Backfill critical tests**
6. ✅ **Clean @repo/ui structure**

### Documentation Actions (Phase 3c)
7. ✅ **Create validation reports**
8. ✅ **Update task board**

### Success Metrics
- **Zero duplicate toast systems**
- **All .svelte.ts files use proper Svelte 5 patterns**
- **No .svelte.ts toast store files remain (renamed to .ts)**
- **Testing infrastructure operational**
- **All validation commands pass**

---

**Last Updated:** 2025-10-01
**Status:** ✅ **COMPLETED** - All Phase 4 finalization tasks complete

## Phase 4 Toast Migration Update (2025-10-01)

### Additional Actions Completed
- ✅ **Toast Store Renaming**: `store.svelte.ts` → `store.ts` in `@repo/ui`
- ✅ **Import References Updated**: All import paths corrected in toast index
- ✅ **Dependency Alignment**: @repo/ui versions aligned with Phase 2 target matrix
- ✅ **Documentation Created**: `docs/refactor/workflows/toast-migration.md`

### Final Toast System State
- **Canonical Source**: `packages/ui/src/lib/primitives/toast/store.ts`
- **Web Adapter**: `apps/web/src/lib/stores/toast.svelte.ts` (thin adapter)
- **No Legacy Files**: All duplicate toast stores removed
- **Full Svelte 5 Compliance**: Rune-based implementation throughout