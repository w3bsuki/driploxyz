# Refactor Pre-Flight Checklist

## 🛡️ Safety Measures (DO NOT SKIP)

### Backup Preparation
- [ ] **Commit all current changes**
  ```bash
  git add .
  git commit -m "Before refactor - working state"
  ```

- [ ] **Create backup tag**
  ```bash
  git tag refactor-backup-$(date +%Y%m%d-%H%M%S)
  ```

- [ ] **Backup environment variables**
  ```bash
  cp apps/web/.env apps/web/.env.backup
  ```

- [ ] **Note current package count**
  ```bash
  pnpm list --depth=0 | grep -c "├──" > package-count-before.txt
  ```

### Health Checks
- [ ] **Verify current build works**
  ```bash
  pnpm build
  ```

- [ ] **Verify lint passes**
  ```bash
  pnpm lint
  ```

- [ ] **Verify type check passes**
  ```bash
  pnpm check-types
  ```

- [ ] **Verify tests pass**
  ```bash
  pnpm test
  ```

### Environment Setup
- [ ] **Ensure correct Node version**
  ```bash
  node --version  # Should be 22.12.x
  ```

- [ ] **Ensure pnpm version**
  ```bash
  pnpm --version  # Should be 8.15.6+
  ```

- [ ] **Clear any existing build artifacts**
  ```bash
  pnpm clean  # if available
  rm -rf node_modules/.cache
  ```

## 📋 Phase Readiness Checks

### Phase 1: Dependency Cleanup
- [ ] **Identify all packages to remove**
  - [ ] Heavy dev tools (knip, jscpd, @lhci/cli, c8)
  - [ ] Testing bloat (@testing-library/*, chai, jsdom)
  - [ ] UI bloat (@melt-ui/*, tailwind-variants, tailwind-merge)
  - [ ] Database bloat (kysely, pg-*)
  - [ ] Image processing bloat (vite-imagetools, imagetools-core)
  - [ ] Monitoring bloat (@sentry/*)

- [ ] **Prepare replacement packages**
  - [ ] clsx (replacing tailwind-merge)
  - [ ] happy-dom (replacing jsdom)

### Phase 2: Code Structure Cleanup
- [ ] **Review CLEANUP-DELETE-MANIFEST.json**
- [ ] **Identify duplicate components**
- [ ] **Map services to move to @repo/core**
- [ ] **Plan directory structure changes**

### Phase 3: Svelte 5 Optimization
- [ ] **Create script to find $effect usage**
- [ ] **Review Svelte 5 patterns documentation**
- [ ] **Identify components needing updates**

### Phase 4: Architecture Rationalization
- [ ] **Map current package dependencies**
- [ ] **Plan new package exports**
- [ ] **Prepare ESLint rules for boundaries**

### Phase 5: Testing & Documentation
- [ ] **Identify essential tests to keep**
- [ ] **Plan documentation structure**
- [ ] **Prepare new test thresholds**

### Phase 6: Performance Optimization
- [ ] **Analyze current bundle size**
- [ ] **Identify slow database queries**
- [ ] **Plan error boundaries**

### Phase 7: CLI Agent Handoff
- [ ] **Prepare task list for CLI agent**
- [ ] **Document current state**
- [ ] **Plan verification script**

## 🚨 Risk Assessment

### High Risk Areas
- [ ] **Database schema changes** - Ensure migrations are reversible
- [ ] **Authentication flow** - Test thoroughly after changes
- [ ] **Payment processing** - Verify Stripe integration still works
- [ ] **File uploads** - Test Supabase Storage functionality

### Medium Risk Areas
- [ ] **UI component changes** - Check visual regression
- [ ] **Routing changes** - Test all page loads
- [ ] **API endpoints** - Verify functionality

### Low Risk Areas
- [ ] **Documentation updates** - No functional impact
- [ ] **Test file removal** - Verify coverage remains
- [ ] **Style optimizations** - Visual checks only

## 📊 Success Metrics Baseline

### Current State (Record Before Starting)
- [ ] **Package count**: `_____` (run `pnpm list --depth=0 | grep -c "├──"`)
- [ ] **Build time**: `_____` seconds
- [ ] **Bundle size**: `_____` KB
- [ ] **Type errors**: `_____` (should be 0 after you fix them)
- [ ] **Lint errors**: `_____` (should be 0 after you fix them)
- [ ] **Test coverage**: `_____`%

### Target State (After Refactor)
- [ ] **Package count**: ~200 (74% reduction)
- [ ] **Build time**: 50% faster
- [ ] **Bundle size**: 40% smaller
- [ ] **Type errors**: 0
- [ ] **Lint errors**: 0
- [ ] **Test coverage**: 60%+

## 🔄 Rollback Plan

### If Phase 1 Fails
```bash
git reset --hard HEAD~1
pnpm install
```

### If Later Phase Fails
```bash
# Reset to last known good state
git reset --hard refactor-backup-YYYYMMDD-HHMMSS
pnpm install
```

### Partial Rollback
```bash
# Restore specific files
git checkout HEAD~1 -- package.json
pnpm install
```

## ⏱️ Time Planning

### Estimated Time per Phase
- **Phase 1**: 2-3 hours (dependency removal + testing)
- **Phase 2**: 3-4 hours (file cleanup + reorganization)
- **Phase 3**: 2-3 hours (Svelte pattern fixes)
- **Phase 4**: 3-4 hours (architecture changes)
- **Phase 5**: 2-3 hours (testing/docs cleanup)
- **Phase 6**: 2-3 hours (performance optimization)
- **Phase 7**: 1-2 hours (final polish + handoff)

**Total estimated time**: 15-22 hours

### Suggested Schedule
- **Day 1**: Phases 1-2 (5-7 hours)
- **Day 2**: Phases 3-4 (5-7 hours)
- **Day 3**: Phases 5-7 (5-8 hours)

## 📞 Emergency Contacts

### If something critical breaks:
1. **Stop immediately** - Don't continue with more changes
2. **Assess impact** - Is it build failure or runtime error?
3. **Rollback** if needed using commands above
4. **Document** what went wrong for learning

## ✅ Final Go/No-Go Checklist

### Ready to Start?
- [ ] All current changes committed
- [ ] Backup tag created
- [ ] Environment variables backed up
- [ ] Build/lint/type-check/tests currently pass
- [ ] Have adequate time block (minimum 3 hours)
- [ ] Have all necessary documentation open
- [ ] Emergency rollback commands understood
- [ ] Success metrics baseline recorded

### If any item above is NO:
❌ **DO NOT START REFACTOR**
- Fix the issue first
- Reschedule when ready
- Starting unprepared risks data loss

---

## 🚀 Ready to Begin!

Once all checkboxes above are checked, you're ready to start with Phase 1.
Keep this checklist open and refer to it before starting each phase.

Good luck! 🎉