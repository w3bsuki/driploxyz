# SAFE_DELETE Guide (High-Confidence Removals)

How to delete with confidence and keep builds green. Execute one section per PR; attach search results and bundle diffs.

Process
1) Confirm existence and usages with ripgrep
2) Remove exports before deleting files; update imports
3) Build packages/ui, then apps/web; fix types

Commands (examples)
- rg -n "OptimizedImage|LazyImage" packages apps | tee refactor-images.txt
- rg -n "SearchDropdown|SearchDebounced|TrendingDropdown|HeroSearchDropdown|SmartStickySearch|CompactStickySearch|CompactFilterBar" packages apps | tee refactor-search.txt
- rg -n "MessageNotificationToast|FollowNotificationToast|SoldNotificationToast|TutorialToast" packages apps | tee refactor-toasts.txt
- rg -n "BrandBadge|PremiumBadge|UserBadge|NewSellerBadge|ConditionBadge|AdminBadge" packages apps | tee refactor-badges.txt
- rg -n "slug-processor\.ts|performance\.ts|web-vitals\.ts" packages apps | tee refactor-perf.txt

UI Components
- Delete duplicates after mapping to single replacements:
  - Images: OptimizedImage.svelte, LazyImage.svelte → ImageOptimized.svelte
  - Search: SearchDropdown.svelte, SearchDebounced.svelte, TrendingDropdown.svelte, HeroSearchDropdown.svelte, SmartStickySearch.svelte, CompactStickySearch.svelte, CompactFilterBar.svelte → SearchBar.svelte (with variant props)
  - Toasts: MessageNotificationToast.svelte, FollowNotificationToast.svelte, SoldNotificationToast.svelte, TutorialToast.svelte → ToastContainer + toasts store
  - Badges: BrandBadge.svelte, PremiumBadge.svelte, UserBadge.svelte, NewSellerBadge.svelte, ConditionBadge.svelte, AdminBadge.svelte → Badge.svelte (variants)

Web App Services and Utils
- Delete thin service wrappers:
  - apps/web/src/lib/services/categories.ts, favorites.ts, profiles.ts (and similar thin wrappers)
  - Replace with direct Supabase calls in +page.server.ts or lib/server/*
- Delete premature optimizations:
  - packages/ui/src/lib/utils/performance.ts
  - packages/ui/src/lib/utils/web-vitals.ts
  - apps/web/src/lib/jobs/slug-processor.ts

Stripe Backups
- Delete: apps/web/src/lib/services/stripe.ts.backup, stripe.ts.bak
- Keep: apps/web/src/lib/services/stripe.ts (single source of truth)

Export Hygiene
- Update packages/ui/src/lib/index.ts to export only the kept components per DEBLOAT_PLAN.md
- Build: pnpm -C packages/ui build && pnpm -C apps/web build

Go/No-Go Checklist
- [ ] rg results attached (before/after)
- [ ] UI exports updated
- [ ] Builds pass (ui + web)
- [ ] Budget snapshot attached (JS/CSS sizes)
- [ ] E2E smokes pass (search/product/view)

References
- DEBLOAT_PLAN.md (keep/delete mapping)
- OVER_ENGINEERING_AUDIT.md (rationale)

