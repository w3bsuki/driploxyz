# Current Tasks & Priorities

**Active sprint:** Documentation cleanup → TypeScript fixes → V1 launch

## 🔥 High Priority (This Week)

- [ ] **TypeScript Error Hunt**: Drive from 71 errors → 0 errors
  - [ ] Fix import paths (`@repo/ui` vs relative imports)
  - [ ] Replace `any` types with proper type guards
  - [ ] Add proper Svelte 5 component prop types
  - [ ] Fix server vs client import violations

- [ ] **Svelte 5 Migration Audit**: Remove all legacy syntax
  - [ ] Replace `export let` → `$props()`
  - [ ] Replace `$:` → `$derived()`
  - [ ] Replace `on:click` → `onclick`
  - [ ] Replace `onMount` → `$effect()`

- [ ] **UI Component Consolidation**: Eliminate duplicates
  - [ ] Promote 2+ usage components to `@repo/ui`
  - [ ] Delete app-level duplicates
  - [ ] Update all imports to use `@repo/ui`

## 📋 Medium Priority (Next Week)

- [ ] **i18n Cleanup**: Fix inconsistent routing
  - [ ] Unify server/client reroute logic
  - [ ] Ensure `/uk` → `en` alias works properly
  - [ ] Add missing translations

- [ ] **Performance Polish**: Hit target metrics
  - [ ] LCP < 1.5s on mobile
  - [ ] Fix Core Web Vitals issues
  - [ ] Optimize images and assets

- [ ] **Testing Coverage**: Add missing tests
  - [ ] Playwright E2E for core flows
  - [ ] Accessibility tests
  - [ ] Component unit tests

## 🎯 Backlog (When Time Permits)

- [ ] **Reviews System**: Implement user reviews
- [ ] **Payout Management**: Complete seller flows
- [ ] **Admin Moderation**: Content moderation tools
- [ ] **SEO Enhancement**: Canonical URLs, hreflang
- [ ] **PWA Features**: Offline support, push notifications

## ✅ Recently Completed

- [x] **Documentation Consolidation**: 72 → 5 core files (93% reduction)
- [x] **CLAUDE.md Optimization**: 200+ → 49 lines
- [x] **Core Docs Structure**: DEVELOPER.md, TECHNICAL.md, PRODUCT.md
- [x] **Workflow Commands**: .claude/commands/ setup

## 🚫 Blocked/Waiting

- Nothing currently blocked

## 📝 Quick Notes

- Always test at 375px mobile viewport
- Run `pnpm -w turbo run check-types` before committing
- Keep PRs small (≤400 lines)
- Use Svelte 5 runes only, no legacy syntax

---

**Last updated:** 2025-01-13
**Next review:** When current sprint tasks complete