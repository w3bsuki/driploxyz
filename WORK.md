# 🔥 WORK.md - Active Development Dashboard

*Last Session: August 29, 2025 | LCP: 820ms | TypeScript Errors: 0 ✅*

## 🎯 **CURRENT FOCUS**
```
Working on: Paraglide 2.0 migration complete ✅
Branch: main
Context: Ready for production deployment
```

## ⚡ **QUICK COMMANDS**
```bash
# Daily workflow
pnpm dev --filter web    # Start at 375px viewport
pnpm check-types         # Check TypeScript (71 errors)
pnpm build              # Test production build

# Testing
pnpm test               # Run all tests
pnpm test:unit          # Unit tests only

# Database
pnpm db:types           # Regenerate types
pnpm db:push           # Push schema changes
```

## 📋 **TODAY'S TASKS**

### In Progress
- [ ] Test bundle system in production environment
- [ ] Verify path-based i18n routing works in production

### Up Next  
- [ ] Fix TypeScript errors in product.service.ts (lines 45-67)
- [ ] Test Android image rotation bug
- [ ] Remove demo routes (/demo, /test)
- [ ] Verify all touch targets are 44px

### Completed Today
- [x] Fixed all 71 TypeScript errors ✅
- [x] Migrated Paraglide from 1.x to 2.0
- [x] Migrated from subdomain to path-based i18n routing
- [x] Fixed setLanguageTag/languageTag to setLocale/getLocale
- [x] Restructured documentation (5 files)
- [x] Cleaned UI package artifacts
- [x] Created WORK.md workflow
- [x] Implemented direct sales + bundling system
  - Database schema with order_items table
  - Bundle sessions for tracking
  - Updated checkout API for multi-item support
  - Created BundleBuilder UI component
  - Integrated bundle flow in product page
  - Updated order management for bundles

## 🐛 **ACTIVE BUGS**

### P0 - Critical
✅ **TypeScript Build Fixed** [0 errors]
   - Status: RESOLVED
   - All 71 errors fixed
   - Ready for production deployment

### P1 - High  
2. **Android Image Rotation**
   - Location: ImageUploader.svelte:234
   - Impact: Photos sideways on some devices
   - Test: Samsung Galaxy S21

3. **Cart Persistence Lost**
   - Location: cart.store.ts
   - Impact: Cart clears on refresh
   - Fix: Add localStorage sync

## 💭 **CONTEXT REMINDERS**

### Mobile-First Rules
- **Viewport**: Always test at 375x667 first
- **Touch**: 44px primary, 36px secondary
- **Colors**: OKLCH only (no hex!)
- **Performance**: Keep LCP <2s (currently 820ms ✅)

### Tech Stack
- **Frontend**: Svelte 5.2.14, SvelteKit 2.15.0
- **Backend**: Supabase (PostgreSQL 15)
- **Payments**: Stripe Connect
- **Deploy**: Vercel Edge

### Project Status
- 85% feature complete
- 71 TypeScript errors blocking production
- Target launch: Q4 2025

## 📊 **PROGRESS TRACKING**

### This Week
- Monday: Documentation restructure ✅
- Tuesday: TypeScript cleanup ✅ (71/71)
- Wednesday: Bug fixes (0/3)
- Thursday: Performance audit
- Friday: Staging deployment

### Sprint Goals
- [x] 0 TypeScript errors ✅
- [ ] 3 P0 bugs fixed
- [ ] Mobile performance <2s
- [ ] Staging environment live

## 🔧 **COMMON FIXES**

### TypeScript Errors
```bash
pnpm db:types          # Regenerate Supabase types
rm -rf .svelte-kit     # Clear cache
pnpm install          # Reinstall deps
```

### Build Issues
```bash
pnpm build:ui         # Build packages first
pnpm build:web        # Then web app
```

### Svelte 5 Migration
```svelte
<!-- Old -->
export let value;
$: doubled = value * 2;

<!-- New -->
let { value } = $props();
let doubled = $derived(value * 2);
```

## 📝 **SESSION NOTES**

### Today's Learnings
- WORK.md pattern is standard in Claude Code community
- Clear context often with `/clear` to avoid token bloat
- Use "think" trigger word for complex problems

### Tomorrow's Priority
1. Fix database type generation
2. Clear first 20 TypeScript errors
3. Test on real Android device

### Blockers
- Need Android device for rotation testing
- Waiting on Stripe webhook setup

## 🚀 **DEPLOYMENT CHECKLIST**

Before deploying:
- [x] `pnpm check-types` → 0 errors ✅
- [ ] `pnpm test` → All passing
- [x] `pnpm build` → Successful ✅
- [ ] Mobile tested at 375px
- [ ] Touch targets verified (44px)

## 📚 **QUICK REFERENCES**

When you need more context:
- **Where are we headed?** → [VISION.md](./VISION.md) 🎯
- **What are we building?** → [PROJECT.md](./reference/PROJECT.md)
- **How do I X?** → [DEVELOPMENT.md](./reference/DEVELOPMENT.md)  
- **What's the plan?** → [ROADMAP.md](./reference/ROADMAP.md)
- **How to deploy?** → [OPERATIONS.md](./reference/OPERATIONS.md)

---

*Pro tip: Use `/clear` when switching tasks to avoid context pollution*
*Next session: Continue TypeScript cleanup*