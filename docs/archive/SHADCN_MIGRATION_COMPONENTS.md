# Shadcn-svelte Migration: Component Cleanup & Replacement Plan

This document comprehensively lists all 129 legacy components in `packages/ui/src/lib/` and categorizes them for the shadcn-svelte migration. The goal is to replace ALL legacy components with shadcn-svelte equivalents or rebuild them using shadcn primitives.

---

## Executive Summary

- **Current UI Package:** 129 legacy Svelte components
- **Existing Shadcn:** 11 components (button, card, dialog, tabs, select, accordion, tooltip, dropdown-menu, separator, sonner)
- **To Delete:** 62 components with direct shadcn replacements
- **To Rebuild:** 67 domain-specific components using shadcn primitives
- **New Shadcn Components to Install:** 40 additional components

---

## Phase 1: Install Missing Shadcn Components

These shadcn components need to be added via CLI:

```bash
# Run from packages/ui/
pnpm dlx shadcn-svelte@latest add \
  alert alert-dialog aspect-ratio avatar badge breadcrumb \
  calendar carousel chart checkbox collapsible combobox \
  command context-menu data-table date-picker drawer \
  form hover-card input input-otp label menubar \
  navigation-menu pagination popover progress radio-group \
  range-calendar resizable scroll-area sheet sidebar \
  skeleton slider switch table textarea toggle toggle-group
```

---

## Phase 2: DELETE - Components with Direct Shadcn Replacements (62 components)

These legacy components should be **completely deleted** and replaced with shadcn equivalents:

### Core UI Components (Direct Replacements)
- ❌ `Accordion.svelte` → ✅ shadcn `accordion`
- ❌ `Avatar.svelte` → ✅ shadcn `avatar`
- ❌ `Badge.svelte` → ✅ shadcn `badge`
- ❌ `Banner.svelte` → ✅ shadcn `alert`
- ❌ `Breadcrumb.svelte` → ✅ shadcn `breadcrumb`
- ❌ `Input.svelte` → ✅ shadcn `input`
- ❌ `Modal.svelte` → ✅ shadcn `dialog`
- ❌ `Select.svelte` → ✅ shadcn `select`
- ❌ `TabGroup.svelte` → ✅ shadcn `tabs`

### Loading & Progress Components
- ❌ `LoadingSpinner.svelte` → ✅ shadcn `skeleton`
- ❌ `StepIndicator.svelte` → ✅ shadcn `progress`
- ❌ `TopProgress.svelte` → ✅ shadcn `progress`

### Navigation Components (Replace with Navigation Menu)
- ❌ `MegaMenu.svelte` → ✅ shadcn `navigation-menu`
- ❌ `CategoryMegaMenu.svelte` → ✅ shadcn `navigation-menu`
- ❌ `CategorySidebar.svelte` → ✅ shadcn `sidebar`

### Dropdown/Menu Components
- ❌ `CategoryDropdown.svelte` → ✅ shadcn `dropdown-menu`
- ❌ `HeaderUserMenu.svelte` → ✅ shadcn `dropdown-menu`
- ❌ `TrendingDropdown.svelte` → ✅ shadcn `dropdown-menu`

### Simple Form Components
- ❌ `TagInput.svelte` → ✅ shadcn `input` + `badge` combo
- ❌ `PriceInput.svelte` → ✅ shadcn `input` with number formatting
- ❌ `SearchBar.svelte` → ✅ shadcn `input` + `command`

### Card/Sheet Components
- ❌ `ProductSheet.svelte` → ✅ shadcn `sheet`
- ❌ `CategoryBottomSheet.svelte` → ✅ shadcn `sheet`
- ❌ `PricingCard.svelte` → ✅ shadcn `card`

### Simple Display Components
- ❌ `ErrorBoundary.svelte` → ✅ shadcn `alert`
- ❌ `CountryDetectionBanner.svelte` → ✅ shadcn `alert`
- ❌ `LocaleDetectionBanner.svelte` → ✅ shadcn `alert`
- ❌ `SEOMetaTags.svelte` → ✅ Custom meta component (no shadcn equivalent needed)

### Toast & Notification (Legacy)
- ❌ `ToastContainer.svelte` → ✅ shadcn `sonner`
- ❌ `TutorialToast.svelte` → ✅ shadcn `sonner`
- ❌ `MessageNotificationToast.svelte` → ✅ shadcn `sonner`
- ❌ `FollowNotificationToast.svelte` → ✅ shadcn `sonner`
- ❌ `OrderNotificationToast.svelte` → ✅ shadcn `sonner`
- ❌ `SoldNotificationToast.svelte` → ✅ shadcn `sonner`

### Unused/Experimental Components
- ❌ `LiveActivity.svelte` → ✅ DELETE (marked as unused)
- ❌ `CountrySwitcher.svelte` → ✅ DELETE (marked as unused)
- ❌ `ImageOptimized.svelte` → ✅ DELETE (marked as unused)
- ❌ `ProductQuickView.svelte` → ✅ DELETE (marked as unused)
- ❌ `HighlightQuickView.svelte` → ✅ DELETE (marked as unused)
- ❌ `FilterExample.svelte` → ✅ DELETE (example/demo only)

### Simple Utility Components
- ❌ `ThemeToggle.svelte` → ✅ shadcn `switch` or `button`
- ❌ `LanguageSwitcher.svelte` → ✅ shadcn `select`
- ❌ `UnifiedCookieConsent.svelte` → ✅ shadcn `alert-dialog`

### Selector Components (Basic)
- ❌ `AccountTypeSelector.svelte` → ✅ shadcn `radio-group`
- ❌ `AvatarSelector.svelte` → ✅ shadcn `radio-group` + `avatar`
- ❌ `PayoutMethodSelector.svelte` → ✅ shadcn `radio-group`
- ❌ `ConditionSelector.svelte` → ✅ shadcn `select` or `radio-group`
- ❌ `BrandSelector.svelte` → ✅ shadcn `combobox`
- ❌ `CategorySelector.svelte` → ✅ shadcn `combobox`
- ❌ `CollapsibleCategorySelector.svelte` → ✅ shadcn `collapsible` + `combobox`

### Badge Components (Simple)
- ❌ `BrandBadge.svelte` → ✅ shadcn `badge`
- ❌ `UserBadge.svelte` → ✅ shadcn `badge`
- ❌ `ConditionBadge.svelte` → ✅ shadcn `badge`
- ❌ `NewSellerBadge.svelte` → ✅ shadcn `badge`
- ❌ `PremiumBadge.svelte` → ✅ shadcn `badge`
- ❌ `AdminBadge.svelte` → ✅ shadcn `badge`

### Modal Components (Basic)
- ❌ `WelcomeModal.svelte` → ✅ shadcn `dialog`
- ❌ `OnboardingSuccessModal.svelte` → ✅ shadcn `dialog`
- ❌ `AuthPopup.svelte` → ✅ shadcn `dialog`

### Indicator/Status Components
- ❌ `TypingIndicator.svelte` → ✅ shadcn `skeleton` + animation
- ❌ `OrderStatus.svelte` → ✅ shadcn `badge` + `progress`
- ❌ `SoldOverlay.svelte` → ✅ shadcn `badge` overlay

---

## Phase 3: REBUILD - Domain-Specific Components (67 components)

These components contain complex business logic and should be **rebuilt using shadcn primitives**:

### Product Components (21 components)
**Keep but rebuild with shadcn:**
- ✏️ `ProductCard.svelte` → Rebuild with shadcn `card` + `badge` + `button`
- ✏️ `ProductPage.svelte` → Rebuild with shadcn layout components
- ✏️ `ProductGallery.svelte` → Rebuild with shadcn `carousel` + `aspect-ratio`
- ✏️ `ProductImageGallery.svelte` → Rebuild with shadcn `carousel`
- ✏️ `ProductHero.svelte` → Rebuild with shadcn components
- ✏️ `ProductActionBar.svelte` → Rebuild with shadcn `button` + `sheet`
- ✏️ `ProductDetails.svelte` → Rebuild with shadcn `card` + `tabs`
- ✏️ `ProductPageLayout.svelte` → Rebuild with shadcn layout
- ✏️ `ProductRecommendations.svelte` → Rebuild with shadcn `card` grid
- ✏️ `ProductBreadcrumb.svelte` → Rebuild with shadcn `breadcrumb`
- ✏️ `ProductImage.svelte` → Rebuild with shadcn `aspect-ratio`
- ✏️ `ProductMeta.svelte` → Rebuild with shadcn `badge` + text
- ✏️ `ProductPrice.svelte` → Rebuild with shadcn styling
- ✏️ `ProductHighlight.svelte` → Rebuild with shadcn `card`
- ✏️ `ProductSoldManager.svelte` → Rebuild with shadcn state management
- ✏️ `BuyBox.svelte` → Rebuild with shadcn `card` + `button` + `select`
- ✏️ `FavoriteButton.svelte` → Rebuild with shadcn `button`
- ✏️ `ConditionReport.svelte` → Rebuild with shadcn `card` + `progress`
- ✏️ `SizeSelector.svelte` → Rebuild with shadcn `radio-group`
- ✏️ `ShippingEstimator.svelte` → Rebuild with shadcn `card` + `select`
- ✏️ `TrustBadges.svelte` → Rebuild with shadcn `badge` group

### Filter Components (9 components)
**Keep but rebuild with shadcn:**
- ✏️ `FilterModal.svelte` → Rebuild with shadcn `dialog` + `checkbox` + `slider`
- ✏️ `StickyFilterModal.svelte` → Rebuild with shadcn `dialog` sticky
- ✏️ `FilterPillGroup.svelte` → Rebuild with shadcn `badge` + `button`
- ✏️ `CategoryFilterDropdown.svelte` → Rebuild with shadcn `dropdown-menu`
- ✏️ `AppliedFilters.svelte` → Rebuild with shadcn `badge` group
- ✏️ `AppliedFilterPills.svelte` → Rebuild with shadcn `badge`
- ✏️ `FilterResultsAnnouncer.svelte` → Rebuild with shadcn `alert`
- ✏️ `VirtualProductGrid.svelte` → Rebuild with shadcn `scroll-area` + virtualization
- ✏️ `LazySearchResults.svelte` → Rebuild with shadcn components + lazy loading

### Notification Components (4 components)
**Keep but rebuild with shadcn:**
- ✏️ `NotificationPanel.svelte` → Rebuild with shadcn `sheet` + `card`
- ✏️ `NotificationBell.svelte` → Rebuild with shadcn `button` + `popover`
- ✏️ `SoldNotificationPanel.svelte` → Rebuild with shadcn `alert` + `card`

### Onboarding Components (4 components)
**Keep but rebuild with shadcn:**
- ✏️ `OnboardingStep.svelte` → Rebuild with shadcn `card` + `progress`
- ✏️ `WelcomeTutorialFlow.svelte` → Rebuild with shadcn `dialog` + `progress`
- ✏️ `SocialLinksEditor.svelte` → Rebuild with shadcn `form` + `input`

### Order & Review Components (8 components)
**Keep but rebuild with shadcn:**
- ✏️ `OrderActions.svelte` → Rebuild with shadcn `dropdown-menu` + `button`
- ✏️ `OrderTimeline.svelte` → Rebuild with shadcn `card` + `progress`
- ✏️ `ReviewModal.svelte` → Rebuild with shadcn `dialog` + `form` + `textarea`
- ✏️ `ReviewDisplay.svelte` → Rebuild with shadcn `card` + rating display
- ✏️ `RatingSummary.svelte` → Rebuild with shadcn `card` + `progress`
- ✏️ `ReviewPrompt.svelte` → Rebuild with shadcn `card` + `button`
- ✏️ `RatingModal.svelte` → Rebuild with shadcn `dialog` + rating input
- ✏️ `CheckoutSummary.svelte` → Rebuild with shadcn `card` + `separator`

### Payment Components (2 components)
**Keep but rebuild with shadcn:**
- ✏️ `PaymentForm.svelte` → Rebuild with shadcn `form` + `input` + `card`
- ✏️ `BrandPaymentModal.svelte` → Rebuild with shadcn `dialog` + payment form

### Search Components (4 components)
**Keep but rebuild with shadcn:**
- ✏️ `HeroSearchDropdown.svelte` → Rebuild with shadcn `combobox` + `popover`
- ✏️ `SmartStickySearch.svelte` → Rebuild with shadcn `input` + sticky behavior
- ✏️ `HeaderSearch.svelte` → Rebuild with shadcn `combobox`
- ✏️ `TrendingSection.svelte` → Rebuild with shadcn `card` + grid

### Seller Components (4 components)
**Keep but rebuild with shadcn:**
- ✏️ `SellerCard.svelte` → Rebuild with shadcn `card` + `avatar` + `badge`
- ✏️ `SellerProfile.svelte` → Rebuild with shadcn `card` + `tabs`
- ✏️ `SellerQuickView.svelte` → Rebuild with shadcn `hover-card`

### Header/Navigation Components (6 components)
**Keep but rebuild with shadcn:**
- ✏️ `HeaderLogo.svelte` → Rebuild with shadcn styling
- ✏️ `HeaderNav.svelte` → Rebuild with shadcn `navigation-menu`
- ✏️ `BottomNav.svelte` → Rebuild with shadcn `navigation-menu`
- ✏️ `MobileNavigation.svelte` → Rebuild with shadcn `sheet` + `navigation-menu`
- ✏️ `Footer.svelte` → Rebuild with shadcn layout
- ✏️ `CategoryGrid.svelte` → Rebuild with shadcn `card` grid

### Feature Components (5 components)
**Keep but rebuild with shadcn:**
- ✏️ `FeaturedProducts.svelte` → Rebuild with shadcn `carousel` + `card`
- ✏️ `PromotedHighlights.svelte` → Rebuild with shadcn `card` + `badge`
- ✏️ `PartnerShowcase.svelte` → Rebuild with shadcn `carousel`
- ✏️ `PartnerBanner.svelte` → Rebuild with shadcn `card` + `button`
- ✏️ `QuickActions.svelte` → Rebuild with shadcn `button` group

### Image Upload Components (2 components)
**Keep but rebuild with shadcn:**
- ✏️ `ImageUploader.svelte` → Rebuild with shadcn `card` + `input` + drag/drop
- ✏️ `ImageUploaderSupabase.svelte` → Rebuild with shadcn + Supabase integration

### Bundle Components (1 component)
**Keep but rebuild with shadcn:**
- ✏️ `BundleBuilder.svelte` → Rebuild with shadcn `card` + `checkbox` + complex state

### Skeleton Components (Keep - Already Structured)
**These are well-structured and can stay:**
- ✅ `ProductCardSkeleton` → Already uses shadcn patterns
- ✅ `ProductDetailSkeleton` → Already uses shadcn patterns
- ✅ `SellerCardSkeleton` → Already uses shadcn patterns
- ✅ `CategoryCardSkeleton` → Already uses shadcn patterns
- ✅ `ListItemSkeleton` → Already uses shadcn patterns
- ✅ `TextSkeleton` → Already uses shadcn patterns
- ✅ `ImageSkeleton` → Already uses shadcn patterns

---

## Phase 4: Update Import Patterns

### Current Problematic Imports
Replace all instances of these patterns across the codebase:

```svelte
<!-- OLD PATTERNS TO REMOVE -->
import { Modal } from '@repo/ui';
import { Select } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Input } from '@repo/ui';
import { Accordion } from '@repo/ui';

<!-- NEW PATTERNS TO USE -->
import * as Dialog from '@repo/ui/Dialog';
import * as Select from '@repo/ui/Select';
import { Badge } from '@repo/ui/Badge';
import { Input } from '@repo/ui/Input';
import * as Accordion from '@repo/ui/Accordion';
```

### Files to Update Imports
- All files in `apps/web/src/routes/`
- All files in `apps/admin/src/routes/`
- All files in `apps/docs/src/routes/`
- Components in `apps/web/src/lib/components/`

---

## Phase 5: Dependencies Cleanup

### Remove from package.json files:
- `@melt-ui/*` (all packages)
- Direct `bits-ui` imports (keep as shadcn dependency only)
- Legacy UI library dependencies
- Unused Tailwind plugins

### Keep These Dependencies:
- `bits-ui` (as shadcn dependency)
- `svelte-sonner` (for toast functionality)
- `lucide-svelte` (for icons)
- `@tailwindcss/vite` (Tailwind v4)
- `tailwindcss` (v4)

---

## Phase 6: File Structure After Migration

```
packages/ui/src/lib/
├── components/
│   └── ui/           # All shadcn components (51 total)
├── components/       # Domain-specific rebuilt components (67 total)
├── adapters/         # Legacy API compatibility wrappers (if needed)
├── styles/
│   ├── globals.css   # Global styles
│   ├── tokens.css    # Design tokens
│   └── semantic.css  # Semantic utilities
├── types.ts          # Type definitions
├── utils.ts          # Utility functions
└── index.ts          # Barrel exports
```

---

## Phase 7: Migration Command Sequence

1. **Install Missing Shadcn Components:**
```bash
cd packages/ui
pnpm dlx shadcn-svelte@latest add alert alert-dialog aspect-ratio avatar badge breadcrumb calendar carousel chart checkbox collapsible combobox command context-menu data-table date-picker drawer form hover-card input input-otp label menubar navigation-menu pagination popover progress radio-group range-calendar resizable scroll-area sheet sidebar skeleton slider switch table textarea toggle toggle-group
```

2. **Update package.json exports for all new shadcn components in `packages/ui/src/lib/index.ts`**

3. **Delete all 62 legacy components listed in Phase 2**

4. **Rebuild all 67 components listed in Phase 3 using shadcn primitives**

5. **Update all imports across apps and remove duplicate components**

6. **Run type checks and builds:**
```bash
pnpm -w turbo run check-types
pnpm -w turbo run lint
pnpm -w turbo run build
```

---

## Success Criteria

✅ **Zero TypeScript errors**  
✅ **All apps build successfully**  
✅ **Zero legacy components remain**  
✅ **All UI uses shadcn-svelte + Tailwind v4 tokens**  
✅ **44px touch targets maintained**  
✅ **Accessibility preserved (outline-none, ARIA)**  
✅ **Mobile-first responsive design**  
✅ **LCP ≤ 1.5s maintained**

---

## Risk Mitigation

1. **Create feature branch for migration**
2. **Migrate components in small batches**
3. **Test each batch before proceeding**
4. **Keep original components until replacement is verified**
5. **Use adapters for API compatibility during transition**
6. **Comprehensive visual regression testing**

This migration will reduce the UI package from 129 legacy components to 51 shadcn components + 67 rebuilt domain-specific components, resulting in a cleaner, more maintainable, and more accessible UI system.