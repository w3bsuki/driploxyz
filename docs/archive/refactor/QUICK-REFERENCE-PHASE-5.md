<!-- DEPRECATED: This documentation has been archived and is no longer maintained. -->
<!-- For current documentation, see: https://github.com/w3bsuki/driploxyz/blob/main/docs/refactor/phase-7/ -->
<!-- Archived on: 2025-10-05 -->

# Phase 5 Quick Reference Card

**🚀 Start Here → Use this for quick lookups during Phase 5 execution**

---

## 📋 Phase Status

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Environment & Schema | ✅ Complete | 95% |
| Phase 2: Dependencies & Tooling | ✅ Complete | 95% |
| Phase 3: Code Cleanup & Testing | ✅ Complete | 100% |
| Phase 4: Production Readiness | ✅ Complete | 100% |
| **Phase 5: Business Logic Consolidation** | 🚀 **STARTING** | 0% |

---

## 🎯 Phase 5 Quick Facts

- **Duration:** 3 weeks (Oct 2-23, 2025)
- **Primary Goal:** Extract 40+ services from apps/web → shared packages
- **New Package:** `@repo/domain` (business logic)
- **Zero Breaking Changes:** Non-negotiable requirement
- **Test Coverage Target:** 70%+ for domain package

---

## 📦 Package Migration Map

| Current Location | New Location | Task # |
|-----------------|--------------|--------|
| `apps/web/src/lib/services/products.ts` | `@repo/domain/services/products/` | Task 2 |
| `apps/web/src/lib/services/orders*.ts` | `@repo/domain/services/orders/` | Task 3 |
| `apps/web/src/lib/services/profiles.ts` | `@repo/domain/services/profiles/` | Task 4 |
| `apps/web/src/lib/stripe/` | `@repo/core/stripe/` | Task 5 |
| `apps/web/src/lib/email/` | `@repo/core/email/` | Task 6 |
| `apps/web/src/lib/services/messaging*.ts` | `@repo/domain/services/messaging/` | Task 7 |
| `apps/web/src/lib/services/*Review*.ts` | `@repo/domain/services/products/` | Task 8 |
| `packages/ui/src/lib/services/` | `@repo/domain/services/products/` | Task 9 |

---

## ✅ Task Checklist

### Week 1: Foundation
- [ ] **Task 11** - Phase 1 Cleanup (Supabase SDK, rate limiter) - 2-3h
- [ ] **Task 1** - Create @repo/domain package - 2-4h
- [ ] **Task 2** - Extract product services - 4-6h
- [ ] **Task 3** - Extract order services - 4-6h
- [ ] **Task 5** - Extract Stripe services (START) - 5-8h

### Week 2: Services
- [ ] **Task 5** - Stripe services (FINISH) - 5-8h
- [ ] **Task 6** - Extract email services - 4-6h
- [ ] **Task 4** - Extract profile services - 3-4h
- [ ] **Task 7** - Extract messaging services - 4-5h

### Week 3: Cleanup & Hardening
- [ ] **Task 8** - Extract review/trending - 2-3h
- [ ] **Task 9** - Clean up UI package - 2-3h
- [ ] **Task 10** - Service-role hardening - 3-4h
- [ ] **Final** - E2E testing, docs, validation - 8-10h

---

## 🔧 Essential Commands

### Validation (Run After Each Task)
```bash
# Package-level
pnpm --filter @repo/domain build
pnpm --filter @repo/domain test
pnpm --filter @repo/domain check-types
pnpm --filter @repo/domain lint

# Web app validation
pnpm --filter web check-types
pnpm --filter web test
pnpm --filter web build

# Full workspace (at milestones)
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run test
pnpm -w turbo run build
```

### Development
```bash
# Install after package.json changes
pnpm install

# Generate types after Supabase changes
pnpm --filter @repo/database generate-types

# Run dev server
pnpm --filter web dev

# Run specific tests
pnpm --filter web test --run path/to/test.ts
```

### Debugging
```bash
# Find import usage
grep -r "from '@repo/domain'" apps/
grep -r "from '@repo/core/stripe'" apps/

# Check service-role usage
grep -r "getServiceRoleClient" apps/ packages/

# Find specific service imports
grep -r "ProductService" apps/web/src/
```

---

## 📖 Documentation Quick Links

### Primary Documents
- **[Phase 5 Kickoff](./PHASE-5-KICKOFF.md)** - Comprehensive guide (read first!)
- **[Phase 5 Prompts](./PHASE-5-PROMPT.md)** - AI assistant prompts
- **[Task Board](./task-board.md)** - Track progress here
- **[Phases 1-4 Summary](./PHASES-1-4-SUMMARY.md)** - What we've accomplished

### Reference Documents
- **[Architecture](../../ARCHITECTURE.md)** - System architecture
- **[Development](../../DEVELOPMENT.md)** - Development workflow
- **[Testing Guide](../testing/testing-guidelines.md)** - Testing standards
- **[Roadmap](../../ROADMAP.md)** - Overall project roadmap

### Create During Phase 5
- **`reports/phase-5-validation-log.md`** - Log validation outputs
- **`reports/phase-5-completion-report.md`** - Final summary

---

## ⚠️ Critical Reminders

### Non-Negotiables
1. **Zero breaking changes** - All apps must continue working
2. **Test coverage** - Write tests before moving code
3. **Type safety** - No `any` types, full TypeScript
4. **Validation** - Run validation after every change
5. **Documentation** - Update docs as you go

### High-Risk Tasks
- **Task 5 (Stripe)** - Payment processing, test thoroughly!
- **Task 3 (Orders)** - Critical business logic
- **Task 10 (Service-role)** - Security implications
- **Task 11 (Supabase upgrade)** - Auth/session handling

### When in Doubt
1. Check TypeScript errors first
2. Run full validation suite
3. Review kickoff document for details
4. Ask for help (don't guess on critical paths)
5. Document any deviations

---

## 🎯 Success Indicators

### Per-Task
- ✅ All tests passing (green)
- ✅ TypeScript compilation successful
- ✅ Lint checks passing
- ✅ Build successful
- ✅ No runtime errors in dev mode

### Phase-Level
- ✅ 40+ service files migrated
- ✅ @repo/domain package created and tested
- ✅ Stripe + email extracted to @repo/core
- ✅ UI package cleaned (no services)
- ✅ Service-role hardening complete
- ✅ Phase 1 items completed
- ✅ Full workspace validation passing

---

## 🚨 Troubleshooting

### Common Issues

**Import Errors After Migration:**
```bash
# Find all imports of moved file
grep -r "from.*oldFileName" apps/ packages/

# Update imports in VSCode (after moving file)
# Use Find & Replace with regex:
# Find: from ['"](.*/)?oldPath['"]
# Replace: from '@repo/domain/services/...'
```

**Test Failures:**
```bash
# Run single test file
pnpm --filter web test --run path/to/test.ts

# Run with verbose output
pnpm --filter web test --run --reporter=verbose

# Check test coverage
pnpm --filter @repo/domain test --coverage
```

**Build Errors:**
```bash
# Clean build cache
rm -rf apps/web/.svelte-kit
rm -rf packages/*/dist

# Rebuild from scratch
pnpm install
pnpm --filter @repo/domain build
pnpm --filter web build
```

**Type Errors:**
```bash
# Regenerate Supabase types
pnpm --filter @repo/database generate-types

# Check specific package types
pnpm --filter @repo/domain check-types

# Verbose TypeScript output
pnpm --filter web check-types --verbose
```

---

## 📞 Getting Help

### Documentation Order
1. Check this Quick Reference first
2. Review [Phase 5 Kickoff](./PHASE-5-KICKOFF.md) for detailed task info
3. Check [Phase 5 Prompts](./PHASE-5-PROMPT.md) for AI assistant help
4. Review validation logs for similar issues

### Escalation Path
- **Architecture questions** → PLAT team
- **Business logic questions** → Domain experts
- **Payment/Stripe issues** → BE team lead
- **Breaking changes** → Stop and reassess with team

### Update Progress
- Log issues in `reports/phase-5-validation-log.md`
- Update task status in `task-board.md`
- Commit after each successful task
- Document deviations/learnings

---

## 🎯 Current Focus (Week 1)

**Right Now:** Task 11 + Task 1

1. **Task 11 (2-3 hours):**
   - Upgrade Supabase SDK in apps/web (2.51.0 → ^2.56.0)
   - Fix rate limiter env validation
   - Regenerate types
   - Full validation

2. **Task 1 (2-4 hours):**
   - Create packages/domain/ structure
   - Set up build/lint/test configs
   - Add to workspace
   - Validate builds

**Next:** Task 2 (Product Services) → Task 3 (Orders)

---

## 💡 Pro Tips

1. **Work incrementally** - One file at a time, validate often
2. **Use TypeScript** - Let compiler guide migration
3. **Git commits** - Commit after each successful migration
4. **Test locally** - Full validation before pushing
5. **Document blockers** - Don't waste time stuck, escalate
6. **Keep focus** - One task at a time, no shortcuts

---

**Status:** 🚀 Ready to start Phase 5!  
**Next Action:** Review [Phase 5 Kickoff](./PHASE-5-KICKOFF.md) → Start Task 11  
**Keep This Open:** Reference while executing tasks
