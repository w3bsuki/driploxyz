# Debloat Plan (Keep/Delete + Update Map)

Scope: Remove duplicated UI, unused utilities, and over-engineered layers. Update imports once per group. Execute one group per PR.

Principles
- Prefer one composable component with variants over many near-duplicates
- Remove wrapper “service” layers with no real logic; call Supabase directly
- Delete background jobs and premature optimizations

Group A — Images (KEEP: ImageOptimized) ✅ COMPLETED
- Keep: packages/ui/src/lib/ImageOptimized.svelte
- Delete: packages/ui/src/lib/OptimizedImage.svelte ✅, packages/ui/src/lib/LazyImage.svelte ✅
- Update exports: packages/ui/src/lib/index.ts should only export ImageOptimized ✅
- Repo updates:
  - Replace imports of OptimizedImage and LazyImage with ImageOptimized ✅
  - Updated BundleBuilder.svelte to use ImageOptimized ✅

Group B — Search (KEEP: SearchBar, HeroSearchDropdown, SmartStickySearch) ✅ COMPLETED
- Keep: packages/ui/src/lib/SearchBar.svelte, HeroSearchDropdown.svelte (used in homepage), SmartStickySearch.svelte (used in homepage), TrendingDropdown.svelte (used by HeroSearchDropdown)
- Delete: SearchDropdown.svelte ✅, SearchDebounced.svelte ✅, CompactStickySearch.svelte ✅, CompactFilterBar.svelte ✅
- Update exports: Removed unused exports ✅
- Repo updates:
  - No import updates needed - unused components have no imports ✅

Group C — Toasts (KEEP: ToastContainer + toasts store)
- Keep: packages/ui/src/lib/ToastContainer.svelte, packages/ui/src/lib/toast-store.ts
- Delete: MessageNotificationToast.svelte, FollowNotificationToast.svelte, SoldNotificationToast.svelte, TutorialToast.svelte
- Update exports: export ToastContainer and toasts only
- Repo updates:
  - Replace direct component toasts with store-driven messages

Group D — Badges (KEEP: Badge)
- Keep: packages/ui/src/lib/Badge.svelte
- Delete: BrandBadge.svelte, PremiumBadge.svelte, UserBadge.svelte, NewSellerBadge.svelte, ConditionBadge.svelte, AdminBadge.svelte
- Repo updates:
  - Map specialized props to Badge variants

Group E — Services (DELETE wrappers)
- Delete: apps/web/src/lib/services/categories.ts, favorites.ts, profiles.ts (and similar thin wrappers)
- Keep: direct Supabase usage in server load and dedicated server utilities
- Replace usage: inline Supabase calls in +page.server.ts or lib/server/* where appropriate

Group F — Premature Optimizations (DELETE)
- Delete: packages/ui/src/lib/utils/performance.ts, packages/ui/src/lib/utils/web-vitals.ts
- Delete: apps/web/src/lib/jobs/slug-processor.ts
- Rationale: These add bundle weight and complexity without clear ROI

Group G — Stripe backups and duplicates (DELETE)
- Delete: apps/web/src/lib/services/stripe.ts.backup, stripe.ts.bak
- Keep: apps/web/src/lib/services/stripe.ts (the single working version)

Import Update Strategy
1) For each group, update packages/ui/src/lib/index.ts exports first
2) rg-based codemods:
   - rg -n "OptimizedImage|LazyImage" | tee refactor-images.txt
   - Update to `import { ImageOptimized } from '@repo/ui'`
3) Build per-package, then app: pnpm -C packages/ui build && pnpm -C apps/web build

PR Template
- Summary: What was kept, deleted, and why
- Bundle impact: Before/After sizes
- Search results: Files updated (attach refactor-*.txt)
- Screenshots: key pages on 375px viewport

References
- OVER_ENGINEERING_AUDIT.md (source list)
- REFACTOR_GUIDE.md (Svelte 5/Kit 2 patterns)
- REFACTOR_EXECUTION_PLAN.md (budgets and success gates)

---

Codex Review Notes (2025-08-28)
- Group A completed: Verified deletions and export updates. Run `rg -n "OptimizedImage|LazyImage"` to clear any lingering imports.
- Group B in progress: Accept keeping `HeroSearchDropdown` and `SmartStickySearch` for now; plan merge into `SearchBar` variants. Attach import lists to scope work.
- Group F pending: `packages/ui/src/lib/utils/performance.ts` and `web-vitals.ts` still exported; remove after usages are eliminated to reduce bundle size.
