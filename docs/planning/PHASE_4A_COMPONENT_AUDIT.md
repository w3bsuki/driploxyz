# UI COMPONENT CATEGORIZATION - Phase 4A

## PRIMITIVES (Base atomic components) - Move to `lib/primitives/`

### From `components/ui/`:
- Button.svelte → primitives/button/Button.svelte
- Input.svelte (IN components/forms) → primitives/input/Input.svelte  
- Avatar.svelte → primitives/avatar/Avatar.svelte
- AvatarUploader.svelte → primitives/avatar/AvatarUploader.svelte
- Accordion.svelte → primitives/accordion/Accordion.svelte
- TabGroup.svelte → primitives/tabs/TabGroup.svelte
- TopProgress.svelte → primitives/progress/TopProgress.svelte
- ThemeToggle.svelte → primitives/toggle/ThemeToggle.svelte
- CategoryPill.svelte → primitives/pill/CategoryPill.svelte
- SoldOverlay.svelte → primitives/overlay/SoldOverlay.svelte
- TypingIndicator.svelte → primitives/indicator/TypingIndicator.svelte

### From `components/badges/`:
- Badge.svelte → primitives/badge/Badge.svelte
- AdminBadge.svelte → primitives/badge/AdminBadge.svelte
- BrandBadge.svelte → primitives/badge/BrandBadge.svelte
- ConditionBadge.svelte → primitives/badge/ConditionBadge.svelte
- NewSellerBadge.svelte → primitives/badge/NewSellerBadge.svelte
- PremiumBadge.svelte → primitives/badge/PremiumBadge.svelte
- ProBadge.svelte → primitives/badge/ProBadge.svelte
- UserBadge.svelte → primitives/badge/UserBadge.svelte

### From `components/skeleton/`:
- CategoryCardSkeleton.svelte → primitives/skeleton/CategoryCardSkeleton.svelte
- ImageSkeleton.svelte → primitives/skeleton/ImageSkeleton.svelte
- ListItemSkeleton.svelte → primitives/skeleton/ListItemSkeleton.svelte
- ProductCardSkeleton.svelte → primitives/skeleton/ProductCardSkeleton.svelte
- ProductDetailSkeleton.svelte → primitives/skeleton/ProductDetailSkeleton.svelte
- SellerCardSkeleton.svelte → primitives/skeleton/SellerCardSkeleton.svelte
- TextSkeleton.svelte → primitives/skeleton/TextSkeleton.svelte

### From `components/modals/`:
- Modal.svelte → primitives/modal/Modal.svelte (base modal component)

### Already in primitives/ (KEEP):
- primitives/dialog/Dialog.svelte
- primitives/menu/Menu.svelte
- primitives/select/Select.svelte
- primitives/tabs/Tabs.svelte
- primitives/toast/* (entire folder)
- primitives/tooltip/Tooltip.svelte

### From `components/forms/` (form inputs are primitives):
- Input.svelte → primitives/input/Input.svelte
- Select.svelte → primitives/select/Select.svelte (may conflict with existing)
- FormField.svelte → primitives/form/FormField.svelte

### From `components/media/`:
- LazyImage.svelte → primitives/image/LazyImage.svelte

## COMPOSITIONS (Multi-component compositions) - Move to `lib/compositions/`

### Product compositions → `compositions/product/`:
- components/product/ProductCard.svelte
- components/product/ProductGallery.svelte
- components/product/ProductInfo.svelte
- components/product/ProductBreadcrumb.svelte
- components/product/ProductHighlight.svelte
- components/product/ProductImage.svelte
- components/product/ProductMeta.svelte
- components/product/ProductPrice.svelte
- components/product/ProductSeller.svelte
- components/product/AppliedFilterPills.svelte
- components/product/AppliedFilters.svelte
- components/product/CategoryFilterDropdown.svelte
- components/product/FilterModal.svelte
- components/product/FilterPill.svelte
- components/product/FilterPillGroup.svelte
- components/product/FilterResultsAnnouncer.svelte
- components/product/StickyFilterModal.svelte
- components/product/ProductActions.svelte
- components/product/ProductReviews.svelte
- components/product/ProductSoldManager.svelte
- components/product/FeaturedProducts.svelte
- components/product/CategoryGrid.svelte
- components/product/VirtualProductGrid.svelte
- components/product/PromotedListingsSection.svelte

### Business compositions → `compositions/business/`:
- components/business/BuyBox.svelte
- components/business/BoostManagement.svelte
- components/business/BundleBuilder.svelte
- components/business/CheckoutSummary.svelte
- components/business/ConditionReport.svelte
- components/business/OrderActions.svelte
- components/business/OrderStatus.svelte
- components/business/OrderTimeline.svelte
- components/business/RatingSummary.svelte
- components/business/ReviewDisplay.svelte
- components/business/ReviewPrompt.svelte
- components/business/SellerProfile.svelte
- components/business/SellerQuickView.svelte
- components/business/ShippingEstimator.svelte
- components/business/SocialLinksEditor.svelte
- components/business/FeaturedSellers.svelte
- components/business/PartnerShowcase.svelte
- components/business/PromotedHighlights.svelte
- components/business/QuickActions.svelte

### Card compositions → `compositions/cards/`:
- components/cards/Card.svelte (if generic card wrapper)
- components/cards/PricingCard.svelte
- components/cards/ProductCard.svelte (DUPLICATE of product/ProductCard? Check)
- components/cards/ProductCardWithTracking.svelte
- components/cards/SellerCard.svelte
- components/cards/SellerProfileCard.svelte

### Form compositions → `compositions/forms/`:
- components/forms/AvatarSelector.svelte
- components/forms/BrandSelector.svelte
- components/forms/CategorySelector.svelte
- components/forms/CollapsibleCategorySelector.svelte
- components/forms/CollectionSelector.svelte
- components/forms/ConditionSelector.svelte
- components/forms/PaymentForm.svelte
- components/forms/PayoutMethodSelector.svelte
- components/forms/PriceInput.svelte
- components/forms/SearchInput.svelte
- components/forms/SizeSelector.svelte
- components/forms/TagInput.svelte
- components/forms/ErrorBoundary.svelte
- components/forms/DynamicContentErrorBoundary.svelte

### Navigation compositions → `compositions/navigation/`:
- components/navigation/BottomNav.svelte
- components/navigation/Breadcrumb.svelte
- components/navigation/CategoryDropdown.svelte
- components/navigation/CategoryNavigationSheet.svelte
- components/navigation/CategorySearchBar.svelte
- components/navigation/EnhancedSearchBar.svelte
- components/navigation/HeaderLogo.svelte
- components/navigation/HeaderNav.svelte
- components/navigation/HeaderSearch.svelte
- components/navigation/HeaderUserMenu.svelte
- components/navigation/IntegratedSearchBar.svelte
- components/navigation/LazySearchResults.svelte
- components/navigation/MainPageSearchBar.svelte
- components/navigation/MegaMenuCategories.svelte
- components/navigation/MobileMenuSearch.svelte
- components/navigation/MobileNavigationDialog.svelte
- components/navigation/SearchDropdown.svelte
- components/navigation/SearchEmptyState.svelte
- components/navigation/SearchFeedback.svelte
- components/navigation/SearchPageSearchBar.svelte
- components/navigation/TrendingDropdown.svelte
- components/navigation/TrendingSection.svelte

### Banner compositions → `compositions/banners/`:
- components/banners/Banner.svelte
- components/banners/EngagementBanner.svelte
- components/banners/LocaleDetectionBanner.svelte
- components/banners/PartnerBanner.svelte
- components/banners/SectionBanner.svelte
- components/banners/home/FeaturedSellersBanner.svelte
- components/banners/home/NewestListingsBanner.svelte
- components/banners/home/PromotedListingsBanner.svelte

### Modal compositions → `compositions/modals/`:
- components/modals/AdminModal.svelte
- components/modals/BrandPaymentModal.svelte
- components/modals/OnboardingSuccessModal.svelte
- components/modals/RatingModal.svelte
- components/modals/ReviewModal.svelte
- components/modals/WelcomeModal.svelte
- components/modals/FollowNotificationToast.svelte
- components/modals/MessageNotificationToast.svelte
- components/modals/OrderNotificationToast.svelte
- components/modals/SoldNotificationToast.svelte

### Auth compositions → `compositions/auth/`:
- components/auth/AccountTypeSelector.svelte
- components/auth/AuthPopup.svelte

### Media/Upload compositions → `compositions/media/`:
- components/media/ImageUploader.svelte
- components/media/ImageUploaderSupabase.svelte

### Notification compositions → `compositions/notifications/`:
- components/notifications/CountryDetectionBanner.svelte
- components/notifications/NotificationBell.svelte

### Description/Detail compositions → `compositions/description/`:
- components/description-list/DescriptionDetails.svelte
- components/description-list/DescriptionList.svelte
- components/description-list/DescriptionTerm.svelte

### Business/Shop-specific → `compositions/product/` (already grouped above):
- components/business/ProductBuyBox.svelte → compositions/product/ProductBuyBox.svelte

## LAYOUTS (Page-level layout components) - Move to `lib/layouts/`

### From `components/layout/`:
- Footer.svelte → layouts/Footer.svelte
- Container.svelte → layouts/Container.svelte
- CategoryBottomSheet.svelte → layouts/CategoryBottomSheet.svelte
- NotificationPanel.svelte → layouts/NotificationPanel.svelte
- SoldNotificationPanel.svelte → layouts/SoldNotificationPanel.svelte
- HStack.svelte → layouts/HStack.svelte
- Stack.svelte → layouts/Stack.svelte

### From `components/ui/`:
- components/ui/FavoriteButton.svelte → compositions/buttons/FavoriteButton.svelte (NOT layout)
- components/ui/FollowButton.svelte → compositions/buttons/FollowButton.svelte (NOT layout)
- components/ui/TrustBadges.svelte → compositions/badges/TrustBadges.svelte (NOT layout)

## UTILITIES (Client-safe utils) - ALREADY in `lib/utils/`
**Keep as-is:**
- utils/a11y.ts
- utils/cn.ts
- utils/form-a11y.ts
- utils/form-validation.svelte.ts
- utils/format.ts
- utils/imagePreloader.ts
- utils/index.ts
- utils/lazyLoad.ts
- utils/log.ts
- utils/navigation.ts
- utils/performance.ts
- utils/runtime.ts
- utils/scrollLock.ts
- utils/variants.ts
- utils/viewTracking.ts

## UTILITIES (Non-component) - Already correct or move

### From `components/utilities/`:
- ErrorStates.svelte → compositions/error/ErrorStates.svelte (NOT util, it's a component)
- LanguageSwitcher.svelte → compositions/i18n/LanguageSwitcher.svelte
- LoadingSpinner.svelte → primitives/spinner/LoadingSpinner.svelte
- LoadingStates.svelte → primitives/loading/LoadingStates.svelte
- OnboardingStep.svelte → compositions/onboarding/OnboardingStep.svelte
- Overlay.svelte → primitives/overlay/Overlay.svelte
- SEOMetaTags.svelte → compositions/seo/SEOMetaTags.svelte
- ToastContainer.svelte → primitives/toast/ToastContainer.svelte (already exists in primitives/toast/)
- ToastProvider.svelte → primitives/toast/ToastProvider.svelte (already exists in primitives/toast/)
- TutorialToast.svelte → compositions/tutorial/TutorialToast.svelte
- UnifiedCookieConsent.svelte → compositions/legal/UnifiedCookieConsent.svelte
- WelcomeTutorialFlow.svelte → compositions/tutorial/WelcomeTutorialFlow.svelte

## CONFLICTS TO RESOLVE

### Duplicate ProductCard:
- components/product/ProductCard.svelte
- components/cards/ProductCard.svelte
**Resolution:** Check which is canonical, keep one, delete other

### Duplicate Select:
- components/forms/Select.svelte
- primitives/select/Select.svelte
**Resolution:** primitives/select is more basic, forms/Select might wrap it

### Duplicate Toast components:
- components/utilities/ToastContainer.svelte
- primitives/toast/ToastContainer.svelte
- components/utilities/ToastProvider.svelte
- primitives/toast/ToastProvider.svelte
**Resolution:** Keep primitives/toast/ versions, delete utilities/ versions

## SUMMARY

**Total components:** 174
- **Primitives:** ~40 components
- **Compositions:** ~120 components
  - product: 24
  - business: 18
  - navigation: 22
  - forms: 13
  - cards: 6
  - banners: 8
  - modals: 10
  - auth: 2
  - media: 2
  - notifications: 2
  - description: 3
  - buttons: 2
  - error: 1
  - i18n: 1
  - onboarding: 1
  - seo: 1
  - tutorial: 2
  - legal: 1
- **Layouts:** ~7 components
- **Utils:** (already correct, no move needed)

## NEXT STEPS
1. Create target directory structure
2. Generate import mapping JSON
3. Copy files to new locations (don't delete old yet)
4. Update package.json exports
5. Generate and run import fix script
6. Test build
7. Delete old locations only after tests pass
