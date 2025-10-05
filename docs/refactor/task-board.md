# Refactor Task Board

## Phase 4 - COMPLETED ✅ (October 1, 2025)

### Objective Status
- ✅ **Objective 1 – Testing infrastructure**
  - Toast provider deduplication fix in `@repo/ui`.
  - Playwright config runs the web app through `pnpm --filter web dev`.
  - Commands: `pnpm --filter @repo/ui test`, `pnpm --filter web test`,
    `pnpm --filter web test:e2e`.
- ✅ **Objective 2 – Performance & build optimization**
  - Production build verified via `pnpm --filter web build`.
  - Added `build:metrics` script + `scripts/build-report.mjs` for bundle stats.
  - Command: `pnpm --filter web build:metrics`.
- ✅ **Objective 3 – Documentation & developer experience**
  - Authored `docs/testing/testing-guidelines.md` and expanded
    `apps/web/README.md` with QA steps.
  - Planning/validation reports updated with command outputs.
- ✅ **Objective 4 – Production readiness**
  - Workspace packages expose lint/check/test scripts.
  - Turbo runs noted with environment caveats; manual fallbacks documented.
  - Legal/offline routes updated to `prerender = false` for runtime env access.

## Key Command Summary
- `pnpm --filter @repo/i18n build`
- `pnpm --filter @repo/ui test`
- `pnpm --filter web test`
- `pnpm --filter web test:e2e`
- `pnpm --filter web build`
- `pnpm --filter web build:metrics`
- `pnpm -w turbo run lint` (⚠️ network-limited; see validation log)
- `pnpm -w turbo run check-types` (⚠️ network-limited; see validation log)
- `pnpm -w turbo run build` (⚠️ network-limited; see validation log)

## Phase 4 Toast Migration (2025-10-01)

### Completed Actions
- **Toast Store Renamed**: `packages/ui/src/lib/primitives/toast/store.svelte.ts` → `store.ts`
- **Import References Updated**: All import paths corrected in toast index
- **Dependency Alignment**: @repo/ui versions aligned with Phase 2 target matrix
- **Documentation Created**: `docs/refactor/workflows/toast-migration.md`

### Technical Impact
- **No Breaking Changes**: All consumers continue working through re-exports
- **Svelte 5 Compliance**: Full rune-based implementation maintained
- **Canonical Structure**: Single source of truth for toast functionality
- **Bundle Optimization**: Improved import structure

## Ticket Progress (Phase 4)
- ✅ **Ticket 1 – Toast Consolidation**
- ✅ **Ticket 2 – Service-Role Hardening**
- ✅ **Ticket 3 – UI Package Cleanup**
- ✅ **Ticket 4 – Testing Infrastructure**
- ✅ **Ticket 5 – Environment Validation**
- ✅ **Ticket 6 – Svelte 5 Compliance Audit**
- ✅ **Ticket 7 – Final Production Readiness** (Added 2025-10-01)
- ✅ **Ticket 8 – Toast Store Migration Phase 4** (Completed 2025-10-01)

---

## Phase 5 - Business Logic Consolidation (Starting October 2, 2025)

### Objectives
1. **Domain Package Creation** - Establish `@repo/domain` for business logic
2. **Service Extraction** - Move 40+ services from apps/web to shared packages
3. **Stripe Consolidation** - Extract payment logic to `@repo/core/stripe`
4. **Email Services** - Move email templates to `@repo/core/email`
5. **UI Package Cleanup** - Remove non-UI code from `@repo/ui`
6. **Service-Role Hardening** - Security improvements for privileged operations
7. **Phase 1 Completion** - Supabase SDK upgrade + rate limiter fixes

### Documentation
- 📄 **Kickoff Document**: `docs/refactor/PHASE-5-KICKOFF.md`
- 📄 **Execution Guide**: `docs/refactor/PHASE-5-PROMPT.md`
- 📄 **Validation Log**: `docs/refactor/reports/phase-5-validation-log.md` (to be created)
- 📄 **Completion Report**: `docs/refactor/reports/phase-5-completion-report.md` (to be created)

### Task Status
- ✅ **Task 11** - Phase 1 Cleanup (COMPLETED October 2, 2025)
  - ✅ Supabase SDK upgraded (2.51.0 → ^2.56.0)
  - ✅ Rate limiter hardened for production
  - ✅ Tests passing (3/3)
  - ✅ TypeScript compilation fixed (7 errors resolved)
  - ✅ Duplicate ToastMessage export resolved
  - ✅ Auth import extensions normalized
  - ✅ Auth redirect loops fixed
  - ✅ Debug endpoint bypass guards added
  - ✅ RLS policies verified with Supabase MCP
  - ✅ Build validation successful
  - **Status:** COMPLETED - Ready for Task 1
  - **Report:** `docs/refactor/reports/phase-5-task-11-verification.md`
- [ ] **Task 1** - Create `@repo/domain` package foundation (READY TO START)
- [ ] **Task 2** - Extract product domain services
- [ ] **Task 3** - Extract order & transaction services
- [ ] **Task 4** - Extract user & profile services
- [ ] **Task 5** - Extract Stripe & payment services
- [ ] **Task 6** - Extract email services & templates
- [ ] **Task 7** - Extract messaging & notification services
- [ ] **Task 8** - Extract review & trending services
- [ ] **Task 9** - Clean up UI package (remove services)
- [ ] **Task 10** - Implement service-role hardening

### Success Metrics
- [ ] 40+ service files migrated to shared packages
- [ ] Zero breaking changes to production functionality
- [ ] Test coverage maintained/improved (target: 70%+ for domain)
- [ ] Bundle size maintained (<3.6 MB client)
- [ ] All packages pass: lint, check-types, test, build

### Key Commands for Phase 5
```bash
# Domain package validation
pnpm --filter @repo/domain build
pnpm --filter @repo/domain test
pnpm --filter @repo/domain check-types

# Web app validation  
pnpm --filter web check-types
pnpm --filter web test
pnpm --filter web test:e2e
pnpm --filter web build

# Full workspace validation
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run test
pnpm -w turbo run build

# Supabase MCP validation
# Use mcp_supabase_get_advisors for security checks
# Use mcp_supabase_get_logs for debugging
```

### Timeline
- **Start Date**: October 2, 2025
- **Target Completion**: October 23, 2025 (3 weeks)
- **Current Status**: 🚀 READY TO START
