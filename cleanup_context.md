# Cleanup Progress Tracker

## Status: 🔄 In Progress

---

## ✅ Completed Tasks

- ✅ Deleted 25 unnecessary .md files from root folder
- ✅ Deleted 8 obsolete scripts from root (fix-*.sh, *.mjs, *.ps1)
- ✅ Deleted `/notes` folder (4 obsolete files)
- ✅ Deleted `/scripts/legacy` folder (5 files)
- ✅ Deleted `/scripts/migration` folder (2 files)
- ✅ Deleted 20 unused Svelte components from apps/web/src/lib/components
- ✅ Deleted 50+ unused TypeScript files from apps/web/src/lib
- ✅ Fixed broken imports after cleanup

---

## 📋 Pending Tasks

### Phase 1: Root Cleanup
- [x] Delete 25+ unnecessary MD files from root
- [x] Delete obsolete scripts (fix-*.sh, *.mjs one-offs)
- [x] Clean up `/notes` folder
- [x] Clean up `/scripts/legacy` folder

### Phase 2: Web App Cleanup
- [x] Delete ~25 unused Svelte components
- [x] Delete ~70+ unused lib files (identified by knip)
- [x] Remove unused dependencies (web-vitals, sharp)

### Phase 3: Mobile App Cleanup
- [x] Delete unused mobile components (hello-wave.tsx)
- [x] Remove unused dependencies (expo-image-picker, expo-camera)
- [x] Delete unused contexts and hooks

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
