# /debloat-ui — Consolidate UI Components

Goal: Reduce duplicates in packages/ui and update consumers in apps/web.

Steps
1) Update exports
   - Edit packages/ui/src/lib/index.ts to export only: ImageOptimized, SearchBar, Badge, ToastContainer, toasts

2) Map imports
   - rg -n "OptimizedImage|LazyImage" packages apps | tee refactor-images.txt
   - Replace with ImageOptimized
   - rg -n "SearchDropdown|SearchDebounced|TrendingDropdown|HeroSearchDropdown|SmartStickySearch|CompactStickySearch|CompactFilterBar" | tee refactor-search.txt
   - Replace with SearchBar (add variant props as needed)
   - rg -n "MessageNotificationToast|FollowNotificationToast|SoldNotificationToast|TutorialToast" | tee refactor-toasts.txt
   - Replace with ToastContainer + toasts store
   - rg -n "BrandBadge|PremiumBadge|UserBadge|NewSellerBadge|ConditionBadge|AdminBadge" | tee refactor-badges.txt
   - Replace with Badge variant props

3) Build & Typecheck
   - pnpm -C packages/ui build
   - pnpm -C apps/web build

4) Delete duplicates (separate commit)
   - Follow SAFE_DELETE.md for the exact list

Output
- Attach refactor-*.txt files and before/after bundle sizes
- Summarize changed imports count

