# Driplo Development Roadmap
**Last Updated:** 2025-09-29

> Simple priority-ordered task tracking. Move items between sections as work progresses. Update weekly.

---

## 🔥 Critical (Do Now)
**Must be fixed before any other work. These block production.**

### Database & Type Safety
- [ ] Regenerate Supabase types - schema drift causing 14 type errors
- [ ] Fix missing `order_items` table definition or remove references
- [ ] Fix `transactions.payment_status` vs `payout_status` mismatch
- [ ] Add `category_slug` to products or fix join logic
- [ ] Fix rate limiter - add `RATE_LIMIT_SECRET` to env or make optional

### Build Failures
- [ ] Resolve web app `check-types` command failures
- [ ] Fix docs app Tailwind CSS import issue (or archive if unused)
- [ ] Resolve Vite plugin type conflicts

### Code Quality Blockers
- [ ] Fix 18 remaining lint errors (mostly unused variables)
- [ ] Remove 1 `any` type in auth/hooks.ts

**Target:** All items complete within 2 days

---

## ⚡ High Priority (This Week)
**Important architectural and testing work. Do after critical items.**

### Testing Infrastructure
- [ ] Remove `--passWithNoTests` flags from all package.json files
- [ ] Set minimum coverage thresholds (core: 70%, domain: 80%, ui: 50%, web: 40%)
- [ ] Write tests for services/stripe.ts (payment intent, webhooks)
- [ ] Write tests for services/orders.ts (order creation, status updates)
- [ ] Add E2E test: user registration flow
- [ ] Add E2E test: product purchase flow
- [ ] Create TESTING.md documentation

### Documentation Consolidation
- [ ] Audit 23 root markdown files
- [ ] Create README.md (project overview)
- [ ] Create ARCHITECTURE.md (merge AGENTS.md, ProjectStructure.md)
- [ ] Create DEVELOPMENT.md (merge Turbo.md, workflow)
- [ ] Create FRAMEWORKS.md (merge SvelteKit2, Svelte5, Tailwind, Paraglide)
- [ ] Simplify SUPABASE.md (remove verbose checklists)
- [ ] Archive 12+ obsolete markdown files to docs/archive/
- [ ] Delete MAIN.md (failed phase system)

### Architecture Rationalization (Start)
- [ ] Create `@repo/domain` package (business logic, validation)
- [ ] Move apps/web/src/lib/services to @repo/core/services
- [ ] Move apps/web/src/lib/stripe to @repo/core/stripe
- [ ] Move apps/web/src/lib/email to @repo/core/email

**Target:** Complete by end of week

---

## 📋 Backlog (Later)
**Nice-to-haves and non-blocking improvements. Do when bandwidth allows.**

### Architecture Rationalization (Complete)
- [ ] Expand @repo/core package (analytics, monitoring, security)
- [ ] Reorganize @repo/ui into logical sub-packages
- [ ] Remove duplicate components from apps/web
- [ ] Clean apps/web/src/lib to app-specific code only

### Technical Debt
- [ ] Address 53 TODO/FIXME markers in web app
- [ ] Enable TypeScript strict mode incrementally
- [ ] Improve error handling and logging
- [ ] Add input validation to public API endpoints

### Performance
- [ ] Audit bundle sizes and implement code splitting
- [ ] Optimize image loading (sharp, CDN)
- [ ] Database query optimization (reduce N+1 queries)
- [ ] Review and optimize realtime subscriptions

### Accessibility & UX
- [ ] Run @axe-core/playwright on critical flows
- [ ] Audit keyboard navigation
- [ ] Add proper ARIA labels
- [ ] Test with screen readers

### Security
- [ ] Review all RLS policies
- [ ] Audit environment variable exposure
- [ ] Rate limiting on public endpoints
- [ ] Input sanitization for user content

### Production Readiness
- [ ] Performance audit (Lighthouse >90)
- [ ] Security scan
- [ ] Staging environment testing
- [ ] Monitoring dashboards setup
- [ ] Runbook for common issues

---

## ✅ Completed
**Track wins to maintain momentum.**

### 2025-09-29
- ✅ Created REFACTOR_MASTER_PLAN.md
- ✅ Created ROADMAP.md (this file)
- ✅ Identified 14 TypeScript errors causing type-check failure
- ✅ Identified 18 lint errors remaining
- ✅ Documented architecture problems (monorepo theater)

### Previous Sessions
- ✅ Phase 3: Svelte 5 and SvelteKit 2 migration complete
- ✅ Phase 2: Dependency version alignment (90% complete)
- ✅ Phase 1: Tooling readiness (Node 22.12.x, Turborepo configured)
- ✅ Lint reduction: 966 → 18 errors (98% improvement)
- ✅ TypeScript errors: 79 → 14 (but builds passing)

---

## Notes

### How to Use This Roadmap
1. **Work top to bottom** - Critical → High Priority → Backlog
2. **Update daily** - Move items as work progresses
3. **Mark done immediately** - Celebrate wins
4. **Keep it current** - Archive completed items weekly
5. **Stay focused** - Resist adding to Critical unless truly blocking

### Escalation Criteria
Move item to **🔥 Critical** if:
- Production is broken
- Deployments are blocked
- Security vulnerability discovered
- Data loss risk identified

### Definition of Done
- All tests pass
- Code reviewed
- Documentation updated if needed
- No new lint/type errors introduced
- Deployed to staging and validated

---

**Remember:** Progress over perfection. Ship small, iterate fast.