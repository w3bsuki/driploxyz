# Cleanup Progress Tracker

## Status: 🔄 In Progress

---

## ✅ Completed Tasks

*(Nothing yet)*

---

## 📋 Pending Tasks

### Phase 1: Root Cleanup
- [ ] Delete 25+ unnecessary MD files from root
- [ ] Delete obsolete scripts (fix-*.sh, *.mjs one-offs)
- [ ] Clean up `/notes` folder
- [ ] Clean up `/scripts/legacy` folder

### Phase 2: Web App Cleanup
- [ ] Delete ~25 unused Svelte components
- [ ] Delete ~70+ unused lib files (identified by knip)
- [ ] Remove unused dependencies (web-vitals, sharp)

### Phase 3: Mobile App Cleanup
- [ ] Delete unused mobile components
- [ ] Remove unused dependencies (expo-image-picker, expo-camera)

### Phase 4: Docs Consolidation
- [ ] Merge essential docs into `/docs`
- [ ] Delete redundant doc files

---

## 📊 Cleanup Stats

| Category | Before | After | Removed |
|----------|--------|-------|---------|
| Root MD files | ~30 | - | - |
| Web components | ~25 unused | - | - |
| Web lib files | ~70 unused | - | - |
| Total files | - | - | - |

---

## 🔗 Reference

- See `CLEANUP_PLAN.md` for detailed knip analysis
- Project must build after each phase: `pnpm build`
