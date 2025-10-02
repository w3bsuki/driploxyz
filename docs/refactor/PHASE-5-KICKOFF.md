# Phase 5 Kickoff - Business Logic Consolidation & Architecture Rationalization

**Date:** October 2, 2025  
**Status:** 🚀 **READY TO START**  
**Prerequisites:** ✅ Phases 1-4 Complete

---

## ✅ Phase 1-4 Completion Summary

### Phase 1: Stabilize Environment & Schema ✅ COMPLETE
- ✅ Environment validation infrastructure established
- ✅ Supabase migrations verified and up-to-date (312 migrations applied)
- ✅ Type generation system operational
- ⚠️ **Outstanding:** apps/web still on `@supabase/supabase-js@2.51.0` (needs upgrade to `^2.56.0`)
- ⚠️ **Outstanding:** Rate limiter env validation (RATE_LIMIT_SECRET handling)

### Phase 2: Dependency & Tooling Simplification ✅ COMPLETE (95%)
- ✅ Version alignment across packages achieved
- ✅ Tool consolidation completed (@playwright/test centralized)
- ✅ Clean lockfile hygiene maintained
- ✅ TypeScript validation working (Vite plugin conflicts resolved)
- ✅ Zero breaking changes to business functionality

### Phase 3: Code Cleanup & Testing ✅ COMPLETE
- ✅ Toast system consolidated (489 lines of duplicate code removed)
- ✅ Svelte 5 compliance audit passed (all `.svelte.ts` files validated)
- ✅ Shared testing infrastructure established (`@repo/testing`)
- ✅ Critical test coverage added (auth, forms, toast, UI components)
- ✅ 22 toast store tests passing with Svelte 5 runes

### Phase 4: Production Readiness & Build Optimization ✅ COMPLETE
- ✅ Testing infrastructure operational (Vitest + Playwright)
- ✅ Production builds verified (3.49 MB client / 2.90 MB server)
- ✅ Build metrics reporting implemented (`build:metrics` script)
- ✅ Documentation expanded (`docs/testing/testing-guidelines.md`)
- ✅ All packages expose lint/check-types/test scripts
- ✅ Toast migration completed with zero breaking changes

**Overall Status:** Phases 1-4 = 95% complete with minor cleanup items identified

---

## 🎯 Phase 5 Objectives

### Primary Goal
**Extract and centralize business logic from `apps/web` into reusable shared packages, establishing clear architectural boundaries and enabling code reuse across admin/docs apps.**

### Success Criteria
1. **Domain logic extracted**: Create `@repo/domain` package for business rules
2. **Services consolidated**: Move `apps/web/src/lib/services` to `@repo/core/services`
3. **Stripe logic unified**: Extract payment handling to `@repo/core/stripe`
4. **Email services shared**: Move email logic to `@repo/core/email`
5. **UI package refined**: Remove service modules from `@repo/ui`
6. **Zero breaking changes**: All apps continue working during migration
7. **Test coverage maintained**: All moved code retains or improves test coverage

---

## 📦 Package Architecture Target State

### Current State (Phase 4)
```
apps/web/
  ├── src/lib/services/          # 40+ service files (needs extraction)
  ├── src/lib/stripe/             # Payment logic (needs extraction)
  ├── src/lib/email/              # Email templates (needs extraction)
  └── src/lib/stores/             # App-specific state (stays)

packages/ui/
  ├── src/lib/services/           # CategoryNavigationService (needs removal)
  ├── src/lib/primitives/         # Design system (stays)
  └── src/lib/components/         # UI components (stays)

packages/core/
  ├── src/auth/                   # Auth helpers (stays)
  ├── src/cookies/                # Cookie utilities (stays)
  └── src/utils/                  # Shared utilities (stays)
```

### Target State (Phase 5)
```
apps/web/
  ├── src/lib/stores/             # App-specific state only
  ├── src/lib/utils/              # App-specific utilities only
  └── src/routes/                 # Route handlers (use services from core)

packages/ui/                      # Pure design system
  ├── src/lib/primitives/         # Melt UI wrappers
  ├── src/lib/components/         # Reusable UI components
  └── src/lib/styles/             # Design tokens & themes

packages/core/                    # Infrastructure & cross-cutting
  ├── src/auth/                   # Authentication
  ├── src/cookies/                # Cookie management
  ├── src/email/                  # Email service + templates
  ├── src/stripe/                 # Payment processing
  ├── src/analytics/              # Analytics utilities
  ├── src/monitoring/             # Logging & observability
  └── src/utils/                  # Shared utilities

packages/domain/                  # NEW: Business logic layer
  ├── src/services/               # Business services
  │   ├── products/               # Product domain
  │   ├── orders/                 # Order domain
  │   ├── profiles/               # Profile domain
  │   ├── messaging/              # Messaging domain
  │   └── payments/               # Payment domain
  ├── src/validation/             # Business rules & validators
  └── src/types/                  # Domain-specific types
```

---

## 🎫 Phase 5 Task Breakdown

### Task 1: Create `@repo/domain` Package Foundation
**Owner:** BE + FE  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-4 hours

**Deliverables:**
- [ ] Create `packages/domain/` directory structure
- [ ] Set up `package.json` with proper exports
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Set up ESLint (`eslint.config.ts`)
- [ ] Add build configuration (`tsup.config.ts`)
- [ ] Create initial directory structure (services, validation, types)
- [ ] Add to workspace references in root `pnpm-workspace.yaml`
- [ ] Document package purpose in `packages/domain/README.md`

**Validation:**
```bash
pnpm --filter @repo/domain build
pnpm --filter @repo/domain check-types
pnpm --filter @repo/domain lint
```

---

### Task 2: Extract Product Domain Services
**Owner:** FE  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 4-6 hours

**Files to Migrate:**
- `apps/web/src/lib/services/products.ts` → `packages/domain/src/services/products/index.ts`
- `apps/web/src/lib/services/category.ts` → `packages/domain/src/services/products/category.ts`
- `apps/web/src/lib/services/categories.ts` → `packages/domain/src/services/products/categories.ts`
- `apps/web/src/lib/services/brandService.ts` → `packages/domain/src/services/products/brands.ts`
- `apps/web/src/lib/services/collections.ts` → `packages/domain/src/services/products/collections.ts`

**Migration Steps:**
1. Copy files to new locations
2. Update imports to use `@repo/database` and `@repo/core`
3. Add unit tests for each service
4. Update consumers in `apps/web` to import from `@repo/domain`
5. Remove old files after validation
6. Update exports in `packages/domain/package.json`

**Validation:**
```bash
pnpm --filter @repo/domain test
pnpm --filter web check-types
pnpm --filter web build
```

---

### Task 3: Extract Order & Transaction Services
**Owner:** BE  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 4-6 hours

**Files to Migrate:**
- `apps/web/src/lib/services/OrderService.ts` → `packages/domain/src/services/orders/index.ts`
- `apps/web/src/lib/services/transactions.ts` → `packages/domain/src/services/orders/transactions.ts`
- `apps/web/src/lib/services/payouts.ts` → `packages/domain/src/services/orders/payouts.ts`

**Special Considerations:**
- These services interact with Stripe - coordinate with Task 5
- Ensure proper error handling for payment failures
- Maintain existing transaction logging

**Validation:**
```bash
pnpm --filter @repo/domain test
pnpm --filter web test
pnpm --filter web build
```

---

### Task 4: Extract User & Profile Services
**Owner:** FE  
**Priority:** 🟡 HIGH  
**Estimated Time:** 3-4 hours

**Files to Migrate:**
- `apps/web/src/lib/services/profiles.ts` → `packages/domain/src/services/profiles/index.ts`
- `apps/web/src/lib/services/favorites.ts` → `packages/domain/src/services/profiles/favorites.ts`
- `apps/web/src/lib/services/subscriptions.ts` → `packages/domain/src/services/profiles/subscriptions.ts`
- `apps/web/src/lib/services/boost.ts` → `packages/domain/src/services/profiles/boost.ts`

**Migration Steps:**
1. Extract profile-related logic
2. Ensure auth helpers are imported from `@repo/core/auth`
3. Add comprehensive unit tests
4. Update all import paths in web app

**Validation:**
```bash
pnpm --filter @repo/domain test
pnpm --filter web test
pnpm --filter web build
```

---

### Task 5: Extract Stripe & Payment Services
**Owner:** BE  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 5-8 hours

**Files to Migrate:**
- `apps/web/src/lib/stripe/server.ts` → `packages/core/src/stripe/server.ts`
- `apps/web/src/lib/stripe/client.ts` → `packages/core/src/stripe/client.ts`
- `apps/web/src/lib/services/stripe.ts` → `packages/core/src/stripe/services.ts`
- Related webhook handlers from routes

**Migration Steps:**
1. Create `packages/core/src/stripe/` directory
2. Move Stripe configuration and initialization
3. Extract webhook verification logic
4. Add comprehensive tests for payment flows
5. Update environment variable documentation
6. Ensure proper error handling and logging

**Critical:** Test thoroughly with Stripe test mode before deployment

**Validation:**
```bash
pnpm --filter @repo/core test
pnpm --filter web test
pnpm --filter web test:e2e  # Test payment flows
```

---

### Task 6: Extract Email Services & Templates
**Owner:** BE + FE  
**Priority:** 🟡 HIGH  
**Estimated Time:** 4-6 hours

**Files to Migrate:**
- `apps/web/src/lib/email/` → `packages/core/src/email/`
- Email templates from `apps/web/email-templates/` → `packages/core/src/email/templates/`

**Migration Steps:**
1. Create `packages/core/src/email/` directory structure
2. Move email service configuration (Resend setup)
3. Migrate all email templates
4. Update import paths in consuming code
5. Add tests for email rendering and sending
6. Document email configuration in core package

**Validation:**
```bash
pnpm --filter @repo/core test
pnpm --filter web test
```

---

### Task 7: Extract Messaging & Notification Services
**Owner:** FE  
**Priority:** 🟡 HIGH  
**Estimated Time:** 4-5 hours

**Files to Migrate:**
- `apps/web/src/lib/services/ConversationService.ts` → `packages/domain/src/services/messaging/conversations.ts`
- `apps/web/src/lib/services/notifications.ts` → `packages/domain/src/services/messaging/notifications.ts`
- `apps/web/src/lib/services/realtimeNotifications.ts` → `packages/domain/src/services/messaging/realtime.ts`
- `apps/web/src/lib/services/realtime.svelte.ts` → Stay in web app (Svelte-specific state)

**Note:** Keep Svelte-specific realtime state in web app, extract business logic only

**Validation:**
```bash
pnpm --filter @repo/domain test
pnpm --filter web test
```

---

### Task 8: Extract Review & Trending Services
**Owner:** FE  
**Priority:** 🟢 MEDIUM  
**Estimated Time:** 2-3 hours

**Files to Migrate:**
- `apps/web/src/lib/services/ReviewService.ts` → `packages/domain/src/services/products/reviews.ts`
- `apps/web/src/lib/services/trending.ts` → `packages/domain/src/services/products/trending.ts`

**Validation:**
```bash
pnpm --filter @repo/domain test
pnpm --filter web build
```

---

### Task 9: Clean Up UI Package
**Owner:** FE  
**Priority:** 🟡 HIGH  
**Estimated Time:** 2-3 hours

**Files to Handle:**
- ❌ **MOVE:** `packages/ui/src/lib/services/CategoryNavigationService.ts` → `packages/domain/src/services/products/navigation.ts`
- ✅ **KEEP:** All components and primitives
- ✅ **KEEP:** Design tokens and styles

**Migration Steps:**
1. Move CategoryNavigationService to domain package
2. Update all import references
3. Remove service directory from UI package
4. Update UI package exports to only expose components/primitives
5. Document UI package scope in README

**Validation:**
```bash
pnpm --filter @repo/ui build
pnpm --filter @repo/ui test
pnpm --filter web check-types
```

---

### Task 10: Implement Service-Role Hardening
**Owner:** BE  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 3-4 hours

**Files to Update:**
- `apps/web/src/lib/server/supabase.server.ts`
- `supabase/functions/send-message/index.ts`

**Changes Required:**
1. Implement lazy-loading for service-role clients
2. Add audit logging wrapper for privileged operations
3. Review all service-role usage across codebase
4. Add MCP-backed validation scripts
5. Document service-role usage patterns

**Security Considerations:**
- Log all service-role operations
- Implement rate limiting for privileged operations
- Add environment variable validation
- Test RLS bypass scenarios

**Validation:**
```bash
# Use Supabase MCP tools
mcp_supabase_get_advisors --type security
mcp_supabase_get_logs --service api

# Code validation
pnpm --filter web test
pnpm --filter web build
```

---

### Task 11: Final Phase 1 Cleanup Items
**Owner:** BE + PLAT  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-3 hours

**Outstanding Items:**
1. **Upgrade Supabase SDK in web app:**
   - Update `apps/web/package.json`: `@supabase/supabase-js` from `2.51.0` to `^2.56.0`
   - Regenerate types with `pnpm --filter @repo/database generate-types`
   - Test all auth flows after upgrade

2. **Rate Limiter Environment Validation:**
   - Add `RATE_LIMIT_SECRET` to `.env.example`
   - Implement proper env validation in `apps/web/src/lib/server/rate-limiter.ts`
   - Remove fallback secrets
   - Add CI checks for required env vars

**Validation:**
```bash
pnpm install
pnpm --filter @repo/database generate-types
pnpm --filter web check-types
pnpm --filter web test
pnpm --filter web build
```

---

## 📋 Phase 5 Execution Order

### Week 1: Foundation & Critical Services
1. **Day 1-2:** Task 11 (Phase 1 cleanup) + Task 1 (domain package setup)
2. **Day 3-4:** Task 2 (product services) + Task 3 (order services)
3. **Day 5:** Task 5 (Stripe extraction) - Start

### Week 2: Infrastructure & Remaining Services
4. **Day 6-7:** Task 5 (Stripe extraction) - Complete + Task 6 (email services)
5. **Day 8-9:** Task 4 (profile services) + Task 7 (messaging services)
6. **Day 10:** Task 8 (reviews/trending) + Task 9 (UI cleanup)

### Week 3: Hardening & Validation
7. **Day 11-12:** Task 10 (service-role hardening)
8. **Day 13-14:** End-to-end testing, documentation updates
9. **Day 15:** Final validation, merge preparation

---

## 🔍 Quality Gates

### Per-Task Validation
- [ ] All unit tests passing
- [ ] TypeScript compilation successful (no errors)
- [ ] Lint checks passing
- [ ] No breaking changes to consuming code
- [ ] Documentation updated

### Phase-Level Validation
```bash
# Full workspace validation
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run test
pnpm -w turbo run build

# Individual package validation
pnpm --filter @repo/domain build && pnpm --filter @repo/domain test
pnpm --filter @repo/core build && pnpm --filter @repo/core test
pnpm --filter @repo/ui build && pnpm --filter @repo/ui test
pnpm --filter web build && pnpm --filter web test
pnpm --filter admin build

# E2E validation
pnpm --filter web test:e2e
```

### Security Validation
```bash
# Supabase security advisors
Use mcp_supabase_get_advisors --type security

# Check RLS policies
Use mcp_supabase_execute_sql to validate policies

# Review service-role usage
grep -r "getServiceRoleClient" apps/ packages/
```

---

## 📚 Documentation Updates Required

### New Documentation
- [ ] `packages/domain/README.md` - Domain package overview
- [ ] `packages/core/src/stripe/README.md` - Stripe integration guide
- [ ] `packages/core/src/email/README.md` - Email service documentation
- [ ] `docs/refactor/reports/phase-5-validation-log.md` - Validation results
- [ ] `docs/refactor/reports/phase-5-completion-report.md` - Final report

### Updates to Existing Documentation
- [ ] `ARCHITECTURE.md` - Update package structure diagrams
- [ ] `DEVELOPMENT.md` - Update development workflows
- [ ] `CONTRIBUTING.md` - Update contribution guidelines
- [ ] `README.md` - Update project overview
- [ ] `packages/core/README.md` - Add new exports documentation
- [ ] `packages/ui/README.md` - Clarify package scope

---

## ⚠️ Risk Assessment & Mitigation

### High-Risk Areas

1. **Stripe Integration Migration**
   - **Risk:** Payment processing errors could impact revenue
   - **Mitigation:** 
     - Comprehensive testing in Stripe test mode
     - Parallel testing with old implementation
     - Gradual rollout with feature flags

2. **Order Service Extraction**
   - **Risk:** Order creation/status updates are critical business flows
   - **Mitigation:**
     - Extensive E2E tests covering full order lifecycle
     - Monitor Supabase logs during migration
     - Quick rollback plan

3. **Auth/Session Changes**
   - **Risk:** Supabase SDK upgrade could affect session handling
   - **Mitigation:**
     - Test all auth flows (login, signup, password reset)
     - Validate session persistence
     - Check SSR cookie handling

4. **Breaking Import Changes**
   - **Risk:** Massive import path updates could introduce typos
   - **Mitigation:**
     - Use automated refactoring tools
     - TypeScript will catch most errors
     - Comprehensive test coverage

### Medium-Risk Areas

1. **Email Template Migration**
   - **Risk:** Email rendering issues
   - **Mitigation:** Test email previews before deployment

2. **Realtime/Notification Services**
   - **Risk:** WebSocket connection issues
   - **Mitigation:** Monitor realtime logs, test reconnection logic

3. **UI Package Import Changes**
   - **Risk:** Component resolution issues
   - **Mitigation:** Full rebuild and test suite run

---

## 🎯 Success Metrics

### Quantitative Metrics
- [ ] **40+ service files** migrated from apps/web to shared packages
- [ ] **Zero breaking changes** to production functionality
- [ ] **Test coverage** maintained or improved (target: 70%+ for domain)
- [ ] **Build time** not significantly impacted (<10% increase acceptable)
- [ ] **Bundle size** reduced or maintained (target: <3.6 MB client)
- [ ] **Type safety** improved (all services fully typed)

### Qualitative Metrics
- [ ] **Code reusability** - Services can be imported by admin/docs apps
- [ ] **Clear boundaries** - Business logic separated from app-specific code
- [ ] **Developer experience** - Easier to find and maintain code
- [ ] **Testing** - Services can be tested in isolation
- [ ] **Documentation** - Clear guidance on package usage

---

## 🚀 Getting Started

### Pre-Phase Checklist
- [ ] Review Phase 1-4 completion reports
- [ ] Verify all Phase 4 validation tests passing
- [ ] Ensure clean git working directory
- [ ] Update Node/pnpm versions if needed
- [ ] Run full workspace validation
- [ ] Create feature branch: `codex/phase-5-domain-consolidation`

### Recommended First Steps
1. Complete Task 11 (Phase 1 cleanup) first - this unblocks everything else
2. Then move to Task 1 (domain package setup) to establish foundation
3. Follow the execution order outlined above
4. Run validation after each task completion
5. Document any issues or deviations in phase-5-validation-log.md

### MCP Integration
Phase 5 will leverage Supabase MCP tools for:
- Security advisory monitoring
- Database type generation
- Migration verification
- Log analysis for debugging
- RLS policy validation

---

## 📞 Support & Escalation

### Questions or Blockers?
- **Architecture decisions:** Escalate to PLAT team
- **Business logic questions:** Consult domain experts
- **Stripe/payment issues:** Involve BE team lead
- **Breaking changes:** Stop and reassess with full team

### Daily Check-ins
- Update `docs/refactor/task-board.md` with progress
- Log any issues in validation log
- Keep stakeholders informed of timeline changes

---

**Phase 5 Start Date:** October 2, 2025  
**Target Completion:** October 23, 2025 (3 weeks)  
**Owner:** Cross-functional (FE, BE, PLAT, QA)  
**Status:** 🚀 READY TO START

---

## 🎉 Let's Build Something Great!

This phase represents a significant architectural improvement that will pay dividends in maintainability, testability, and code reuse. Take your time, test thoroughly, and don't hesitate to ask questions.

**Remember:** Quality over speed. Zero breaking changes is the north star.
