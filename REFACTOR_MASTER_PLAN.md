# Driplo Refactor Master Plan
**Status:** DRAFT
**Date:** 2025-09-29
**Purpose:** Systematic technical debt reduction and architecture simplification

---

## Executive Summary

### Current State (Honest Assessment)
- **23 root markdown files** - excessive documentation overhead
- **18 lint errors, 14 TypeScript errors** - type safety compromised
- **11 test files** for 20,614+ source files (**0.05% coverage**)
- **53 TODO/FIXME markers** in web app alone
- **Database schema drift** - generated types missing tables (`order_items`)
- **Build system broken** - docs app fails, web type-check fails
- **Architecture inversion** - apps/web (2.9M) contains business logic that should be in packages/core (50K)

### Root Problems
1. **Monorepo Theater** - pnpm workspaces exist but code is duplicated across apps/web and packages
2. **Documentation Addiction** - creating playbooks and plans instead of fixing code
3. **Testing Denial** - `--passWithNoTests` flags hiding zero coverage
4. **Database Drift** - Supabase schema and generated types out of sync
5. **Over-Engineering** - complex phase system and agent orchestration before basic stability

### Success Criteria
- ✅ Zero TypeScript compilation errors
- ✅ Zero lint errors
- ✅ All builds pass (web, admin, docs, packages)
- ✅ Database types match actual schema
- ✅ Critical paths have test coverage (>60%)
- ✅ Single source of truth documentation (<10 essential docs)
- ✅ Clear package boundaries with no duplication

---

## Phase 0: Stop the Bleeding (1-2 days)
**Goal:** Fix critical blockers preventing clean builds and type safety

### 0.1 Database Schema Synchronization
- [ ] Audit Supabase migrations vs actual database state
- [ ] Add missing table definitions (`order_items`, etc.) to schema or remove references
- [ ] Regenerate database types: `pnpm --filter @repo/database db:types`
- [ ] Fix schema mismatches:
  - `transactions.payment_status` vs `payout_status`
  - `products.category_slug` - add column or use join
  - Transaction return type - add missing `transaction` field

**Validation:**
```bash
pnpm --filter @repo/database build  # Must pass
pnpm --filter web check-types        # Must show <5 errors
```

### 0.2 Fix Critical Type Errors (14 → 0)
Priority order:
1. **stripe.ts** - Fix `order_items` insert, remove unused `getOrCreateCustomer`
2. **transactions.ts** - Fix `payment_status` → `payout_status`
3. **seo-urls.ts** - Add `category_slug` handling with proper type guards
4. **payments/checkout routes** - Add `transaction` property to order creation result
5. **i18n/runtime.ts** - Fix Paraglide string indexing with proper type assertion
6. **rate-limiter.ts** - Add `RATE_LIMIT_SECRET` to env or make optional

**Validation:**
```bash
pnpm --filter web check-types  # Must pass with 0 errors
```

### 0.3 Clean Remaining Lint Errors (18 → 0)
- [ ] Fix 1 `any` type in `auth/hooks.ts`
- [ ] Remove 17 unused variables (use underscore prefix `_var` or delete)

**Validation:**
```bash
pnpm --filter web lint --max-warnings=0  # Must pass
```

---

## Phase 1: Documentation Consolidation (1 day)
**Goal:** Reduce cognitive load and establish single source of truth

### 1.1 Root Documentation Audit
**Current:** 23 markdown files at root
**Target:** 5-7 essential documents

**Keep & Consolidate:**
- `README.md` - Project overview, quick start (create if missing)
- `ARCHITECTURE.md` - Merge AGENTS.md + ProjectStructure.md + package structure
- `DEVELOPMENT.md` - Merge Turbo.md + development workflow
- `FRAMEWORKS.md` - Merge SvelteKit2.md + Svelte5.md + TailwindCSS.md + Paraglide.md
- `SUPABASE.md` - Keep but simplify (remove verbose checklists)
- `CONTRIBUTING.md` - Simplified workflow (merge CLAUDE.md intent)

**Archive to `/docs/archive/`:**
- BINDABLE_OPTIMIZATION_PLAN.md
- BINDABLE_OPTIMIZATION_COMPLETION_REPORT.md
- SVELTEKIT2_FIX_PLAN.md
- SVELTE5_COMPLIANCE_FIX_PLAN.md
- MIGRATION_APPLIED.md
- TailwindCSSv4.md (duplicate)
- tailwindcss-v4-guide.md (duplicate)
- tailwindcssv4-*.md (3 redundant files)
- finalv4.md
- driplo-security-audit-report.md
- ux-enhancements-backlog.md
- NAVIGATION_UX_STRATEGY.md
- UI-UX.md
- TypeScript.md (merge into DEVELOPMENT.md)

**Delete:**
- MAIN.md (phase system failed - replace with focused ROADMAP.md)
- Multiple phase validation logs in docs/refactor/

**Create:**
- `ROADMAP.md` - Simple priority-ordered task list (replaces complex phase system)
- `TESTING.md` - Testing strategy and coverage requirements

### 1.2 Playbook Simplification
Reduce verbose checklists, focus on "what" and "why" not "how" (devs know how to code).

**Validation:**
- Root markdown count: 23 → <10
- Documentation is navigable and non-redundant
- No orphaned references to archived docs

---

## Phase 2: Architecture Rationalization (3-5 days)
**Goal:** Fix package boundaries and eliminate code duplication

### 2.1 Audit Code Distribution

**Current State:**
```
apps/web/src         2.9M (includes business logic, services, utils)
packages/ui/src      2.1M (168 components - dumping ground)
packages/core/src    50K  (severely underutilized)
```

**Target State:**
```
apps/web/src         ~1.5M (routes, app-specific layouts, page compositions)
packages/ui/src      ~1.5M (pure UI components, organized by domain)
packages/core/src    ~400K (auth, services, utilities, business logic)
packages/domain/src  ~500K (NEW: business entities, validation, types)
```

### 2.2 Create `@repo/domain` Package
New package for shared business logic:
- Product models and validation
- Order/transaction types and helpers
- User/profile types
- Category and search types
- Shared Zod schemas
- Business rules and constants

**Why:** Separate data contracts from UI and service implementation.

### 2.3 Expand `@repo/core` Package
Move from apps/web/src/lib to @repo/core:
- `/lib/services/*` → `@repo/core/services`
- `/lib/client/*` → `@repo/core/client`
- `/lib/supabase/*` → `@repo/core/supabase` (keep client creation here)
- `/lib/stripe/*` → `@repo/core/stripe`
- `/lib/email/*` → `@repo/core/email`
- `/lib/analytics/*` → `@repo/core/analytics`
- `/lib/monitoring/*` → `@repo/core/monitoring`
- `/lib/security/*` → `@repo/core/security`
- `/lib/validation/*` → `@repo/core/validation` (or @repo/domain)

### 2.4 Reorganize `@repo/ui` Package
Currently 168 components in flat structure with 17 category folders.

**Action:** Create logical sub-packages or keep flat but enforce naming convention:
```
@repo/ui/auth/*        - AuthProvider, LoginForm, SignupForm
@repo/ui/product/*     - ProductCard, ProductGrid, ProductDetail
@repo/ui/messaging/*   - MessageThread, MessageInput, ConversationList
@repo/ui/forms/*       - Form primitives (keep separate from domain forms)
@repo/ui/layout/*      - Header, Footer, PageLayout
@repo/ui/primitives/*  - Low-level Melt UI wrappers (existing)
```

**Remove from apps/web/src/lib/components:**
- Duplicate form components → use @repo/ui
- Generic components (Toast, ErrorBoundary, PageLoader) → @repo/ui/utilities

### 2.5 Clean apps/web/src/lib
After moving shared code, apps/web should only contain:
- `/routes/*` - SvelteKit routes (keep)
- `/lib/components/*` - App-specific compositions only
- `/lib/stores/*` - App-specific state only (auth popup, tutorial, UI state)
- `/lib/hooks/*` - SvelteKit hooks only
- `/lib/env/*` - Environment configuration only
- `/lib/server/*` - Server-only route utilities

**Validation:**
```bash
pnpm -w turbo run build lint check-types  # All must pass
pnpm --filter web test                     # App still works
```

---

## Phase 3: Testing Infrastructure (2-3 days)
**Goal:** Establish testing culture and critical path coverage

### 3.1 Remove False Safety Signals
- [ ] Remove `--passWithNoTests` from all package.json scripts
- [ ] Add `failOnZeroCoverage: true` to vitest configs
- [ ] Set minimum coverage thresholds:
  - @repo/core: 70% (business logic is critical)
  - @repo/domain: 80% (pure functions, easy to test)
  - @repo/ui: 50% (UI is harder, focus on logic-heavy components)
  - apps/web: 40% (integration coverage via Playwright)

### 3.2 Write Critical Path Tests

**@repo/core (Priority 1):**
- [ ] services/stripe.ts - Payment intent creation, webhook handling
- [ ] services/products.ts - Product CRUD operations
- [ ] services/orders.ts - Order creation and status updates
- [ ] auth/* - Session management, cookie handling

**@repo/domain (Priority 2):**
- [ ] Product validation schemas
- [ ] Order state transitions
- [ ] Price calculations
- [ ] Search query parsing

**@repo/ui (Priority 3):**
- [ ] forms/* - Form validation and submission
- [ ] product/ProductCard - Rendering and interaction
- [ ] auth/LoginForm - Form submission

**apps/web E2E (Priority 1):**
- [ ] User registration flow
- [ ] Product listing and search
- [ ] Product purchase flow (mock Stripe)
- [ ] Message sending
- [ ] Profile editing

### 3.3 Testing Documentation
Create `TESTING.md` with:
- How to run tests (unit, integration, e2e)
- Coverage requirements per package
- Mocking strategies (Supabase, Stripe)
- CI integration

**Validation:**
```bash
pnpm -w turbo run test  # Must pass with actual tests running
pnpm test:coverage      # Must meet minimum thresholds
```

---

## Phase 4: Build System Stabilization (1-2 days)
**Goal:** All workspaces build cleanly with consistent tooling

### 4.1 Fix Broken Builds
- [ ] **docs app:** Resolve Tailwind CSS import issue
  - Check if needed or can be archived
  - If keeping: align with web app Tailwind v4 setup
- [ ] **web app:** Resolve Vite plugin type conflicts
  - May be fixed by Phase 0 type error resolution
  - Check `@sveltejs/vite-plugin-svelte` compatibility

### 4.2 Dependency Cleanup
Phase 2 completed version alignment but introduced issues.

**Actions:**
- [ ] Review Vite plugin versions compatibility matrix
- [ ] Ensure Tailwind v4 CSS imports are consistent
- [ ] Remove unused dependencies (audit with `depcheck`)
- [ ] Run `pnpm dedupe` after Phase 2 package moves

### 4.3 Turbo Pipeline Optimization
- [ ] Update `turbo.json` inputs/outputs for new package structure
- [ ] Remove obsolete tasks if any
- [ ] Verify caching works correctly after restructure

**Validation:**
```bash
pnpm -w turbo run build  # All workspaces must build
pnpm -w turbo run lint check-types test  # Full pipeline passes
```

---

## Phase 5: Incremental Quality Improvements (Ongoing)
**Goal:** Continuous improvement without blocking progress

### 5.1 Technical Debt Reduction
- [ ] Address 53 TODO/FIXME markers (prioritize, resolve, or convert to issues)
- [ ] Add missing TypeScript strict mode flags incrementally
- [ ] Improve error handling (reduce try/catch without proper logging)
- [ ] Add input validation to public API endpoints

### 5.2 Performance Optimization
- [ ] Audit bundle sizes (use `pnpm build:metrics`)
- [ ] Implement code splitting for large routes
- [ ] Optimize image loading (sharp, CDN integration)
- [ ] Database query optimization (reduce N+1 queries)

### 5.3 Accessibility & UX
- [ ] Run `@axe-core/playwright` on critical flows
- [ ] Ensure keyboard navigation works
- [ ] Add proper ARIA labels to interactive elements
- [ ] Test with screen readers

### 5.4 Security Hardening
- [ ] Review RLS policies (as per existing Supabase.md)
- [ ] Audit environment variable exposure
- [ ] Rate limiting on public endpoints (fix rate-limiter.ts first)
- [ ] Input sanitization for user-generated content

**Validation:**
- Continuous monitoring via CI
- Monthly review of metrics and coverage

---

## Phase 6: Production Readiness (2-3 days)
**Goal:** Deploy with confidence

### 6.1 Pre-Deployment Checklist
- [ ] All builds pass in CI
- [ ] Test coverage meets thresholds
- [ ] E2E tests pass on staging
- [ ] Performance audit (Lighthouse >90)
- [ ] Security scan (no high/critical vulnerabilities)
- [ ] Database migrations tested on staging
- [ ] Monitoring and alerting configured (Sentry)

### 6.2 Deployment Validation
- [ ] Smoke tests on production
- [ ] Monitor error rates and performance
- [ ] Verify payment flows work end-to-end
- [ ] Check realtime features (messaging, notifications)

### 6.3 Post-Launch Monitoring
- [ ] Set up dashboards (Vercel Analytics, Supabase Dashboard)
- [ ] Configure alerts for critical failures
- [ ] Plan for first bug fix cycle
- [ ] Document runbook for common issues

---

## Execution Strategy

### Principles
1. **Working software over comprehensive documentation** - Stop writing plans, start fixing code
2. **Testing gives confidence** - Write tests before refactoring
3. **Incremental progress** - Ship small, validated improvements
4. **Measure everything** - Use metrics to track progress, not vibes
5. **Ruthless prioritization** - Fix critical paths first, polish later

### Anti-Patterns to Avoid
- ❌ Creating new markdown documents instead of fixing code
- ❌ "Almost done" syndrome - ship or revert
- ❌ Perfectionism - 80% working code > 100% perfect plan
- ❌ Scope creep - finish current phase before starting next
- ❌ Hero commits - break work into reviewable chunks

### Progress Tracking
**Replace complex phase system with simple Kanban board:**

Create `ROADMAP.md` with three sections:
- **🔥 Critical (Do Now)** - Blockers and production issues
- **⚡ High Priority (This Week)** - Architecture and testing work
- **📋 Backlog (Later)** - Nice-to-haves and optimizations

Update weekly. Mark done. Move on.

---

## Success Metrics

### Quantitative
- **Type Safety:** 14 → 0 TypeScript errors ✅
- **Code Quality:** 18 → 0 lint errors ✅
- **Test Coverage:** 0.05% → >60% critical paths ✅
- **Build Health:** 2/4 apps building → 4/4 apps building ✅
- **Documentation:** 23 root docs → <10 docs ✅

### Qualitative
- Developers can onboard without reading 23 markdown files
- Changes can be made confidently with test coverage
- Monorepo structure actually reduces duplication
- CI/CD pipeline is reliable and fast
- Production deployments are boring (in a good way)

---

## Estimated Timeline

| Phase | Duration | Owner | Blocking? |
|-------|----------|-------|-----------|
| Phase 0: Stop Bleeding | 1-2 days | Claude | YES |
| Phase 1: Docs Consolidation | 1 day | Claude | NO |
| Phase 2: Architecture | 3-5 days | Claude | PARTIAL |
| Phase 3: Testing | 2-3 days | Claude | PARTIAL |
| Phase 4: Build Stability | 1-2 days | Claude | YES |
| Phase 5: Quality | Ongoing | Team | NO |
| Phase 6: Production | 2-3 days | Codex Review | YES |

**Total:** ~10-16 days for critical work, then ongoing improvements

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to proceed with Phase 0
3. **Create `ROADMAP.md`** to track execution
4. **Execute Phase 0** and report results before proceeding
5. **Iterate** - adjust plan based on reality

---

**Remember:** The goal is not perfect architecture, it's working software that can be maintained. Ship fast, iterate faster, and measure everything.