// Core UI components
export { default as Badge } from './components/badges/Badge.svelte';
export type { SvelteComponent as _BadgeComponent } from 'svelte';
export { default as Banner } from './components/banners/Banner.svelte';
export { default as SectionBanner } from './components/banners/SectionBanner.svelte';

// Home banner components
export { default as PromotedListingsBanner } from './components/banners/home/PromotedListingsBanner.svelte';
export { default as FeaturedSellersBanner } from './components/banners/home/FeaturedSellersBanner.svelte';
export { default as NewestListingsBanner } from './components/banners/home/NewestListingsBanner.svelte';
export { default as Button } from './components/ui/Button.svelte';
export { default as Card } from './components/cards/Card.svelte';
export { default as Input } from './components/forms/Input.svelte';
export { default as Modal } from './components/modals/Modal.svelte';
export { default as Overlay } from './components/utilities/Overlay.svelte';
export { default as ProductCard } from './components/cards/ProductCard.svelte';
export { default as IntegratedSearchBar } from './components/navigation/IntegratedSearchBar.svelte';
export { default as CategoryDropdown } from './components/navigation/CategoryDropdown.svelte';
export { default as CategoryBottomSheet } from './components/navigation/CategoryNavigationSheet.svelte';
export { default as Avatar } from './components/ui/Avatar.svelte';
export { default as SellerProfileCard } from './components/cards/SellerProfileCard.svelte';
export { default as FeaturedSellers } from './components/business/FeaturedSellers.svelte';
export { default as Breadcrumb } from './components/navigation/Breadcrumb.svelte';
export { default as ErrorBoundary } from './components/forms/ErrorBoundary.svelte';
export { default as DynamicContentErrorBoundary } from './components/forms/DynamicContentErrorBoundary.svelte';
export { default as LazyImage } from './components/media/LazyImage.svelte';
export { default as EngagementBanner } from './components/banners/EngagementBanner.svelte';

// Enhanced product components
export { default as BuyBox } from './components/business/BuyBox.svelte';
export { default as ShippingEstimator } from './components/business/ShippingEstimator.svelte';
export { default as TrustBadges } from './components/ui/TrustBadges.svelte';

// Core product page components only (5 components total)
export { default as ProductGallery } from './components/product/ProductGallery.svelte';
export { default as ProductInfo } from './components/product/ProductInfo.svelte';
export { default as ProductSeller } from './components/product/ProductSeller.svelte';
export { default as ProductBuyBox } from './components/product/ProductBuyBox.svelte';
export { default as ProductReviews } from './components/product/ProductReviews.svelte';

// Utils will be exported at the end

// Loading components
export { default as LoadingSpinner } from './components/utilities/LoadingSpinner.svelte';

// Form and selector components
export { default as SizeSelector } from './components/forms/SizeSelector.svelte';
export { default as SellerCard } from './components/cards/SellerCard.svelte';

// Core product components
export { default as ProductBreadcrumb } from './components/product/ProductBreadcrumb.svelte';
export { default as ProductActions } from './components/product/ProductActions.svelte';

// Removed PDP Components - Over-engineered and unused
// Current product page uses direct component imports which is better practice

// Removed lazy-loaded PDP components - were over-engineered and unused
// Current product page handles lazy loading more efficiently with IntersectionObserver

// Seller components
export { default as SellerProfile } from './components/business/SellerProfile.svelte';
export { default as TabGroup } from './components/ui/TabGroup.svelte';
export { default as Tabs } from './primitives/tabs/Tabs.svelte';

// Payment components
export { default as PaymentForm } from './components/forms/PaymentForm.svelte';
export { default as CheckoutSummary } from './components/business/CheckoutSummary.svelte';

// Filter components
export { default as FilterPill } from './components/product/FilterPill.svelte';
export { default as FilterPillGroup } from './components/product/FilterPillGroup.svelte';
export { default as CategoryPill } from './components/ui/CategoryPill.svelte';
export { default as CategoryFilterDropdown } from './components/product/CategoryFilterDropdown.svelte';
export { default as FilterModal } from './components/product/FilterModal.svelte';
export { default as StickyFilterModal } from './components/product/StickyFilterModal.svelte';
export { default as AppliedFilters } from './components/product/AppliedFilters.svelte';
export { default as AppliedFilterPills } from './components/product/AppliedFilterPills.svelte';
export { default as FilterResultsAnnouncer } from './components/product/FilterResultsAnnouncer.svelte';

// Rating components
export { default as RatingModal } from './components/modals/RatingModal.svelte';

// Notification components
export { default as NotificationBell } from './components/notifications/NotificationBell.svelte';
export { default as NotificationPanel } from './components/layout/NotificationPanel.svelte';
export { default as Container } from './components/layout/Container.svelte';
export { default as Stack } from './components/layout/Stack.svelte';
export { default as HStack } from './components/layout/HStack.svelte';
export { default as MessageNotificationToast } from './components/modals/MessageNotificationToast.svelte';
export { default as FollowNotificationToast } from './components/modals/FollowNotificationToast.svelte';
export { default as TypingIndicator } from './components/ui/TypingIndicator.svelte';

// Onboarding components
export { default as WelcomeModal } from './components/modals/WelcomeModal.svelte';
export { default as OnboardingStep } from './components/utilities/OnboardingStep.svelte';
export { default as AccountTypeSelector } from './components/auth/AccountTypeSelector.svelte';
export { default as AvatarSelector } from './components/forms/AvatarSelector.svelte';
export { default as SocialLinksEditor } from './components/business/SocialLinksEditor.svelte';
export { default as PayoutMethodSelector } from './components/forms/PayoutMethodSelector.svelte';
export { default as OnboardingSuccessModal } from './components/modals/OnboardingSuccessModal.svelte';
export { default as BrandPaymentModal } from './components/modals/BrandPaymentModal.svelte';

// Specialized badges (domain-specific)
export { default as ProBadge } from './components/badges/ProBadge.svelte';
export { default as BrandBadge } from './components/badges/BrandBadge.svelte';
export { default as UserBadge } from './components/badges/UserBadge.svelte';
export { default as ConditionBadge } from './components/badges/ConditionBadge.svelte';
export { default as NewSellerBadge } from './components/badges/NewSellerBadge.svelte';
export { default as PremiumBadge } from './components/badges/PremiumBadge.svelte';
export { default as AdminBadge } from './components/badges/AdminBadge.svelte';

// Admin Management Components (moved to respective apps)
// REMOVED: BrandPaymentModal - admin-specific
// REMOVED: WelcomeTutorialFlow - unused

// Country/Region components
// REMOVED: CountryDetectionBanner - unused

// Order and Review components
export { default as OrderStatus } from './components/business/OrderStatus.svelte';
export { default as OrderTimeline } from './components/business/OrderTimeline.svelte';
export { default as OrderActions } from './components/business/OrderActions.svelte';
export { default as ReviewModal } from './components/modals/ReviewModal.svelte';
export { default as ReviewDisplay } from './components/business/ReviewDisplay.svelte';
export { default as RatingSummary } from './components/business/RatingSummary.svelte';
export { default as ReviewPrompt } from './components/business/ReviewPrompt.svelte';

// Product sold status components
export { default as SoldOverlay } from './components/ui/SoldOverlay.svelte';
export { default as SoldNotificationToast } from './components/modals/SoldNotificationToast.svelte';
// REMOVED: ProductSoldManager - over-engineered
// REMOVED: SoldNotificationPanel - over-engineered

// Image components

// Search components
export { default as TrendingDropdown } from './components/navigation/TrendingDropdown.svelte';
export { default as SearchDropdown } from './components/navigation/SearchDropdown.svelte';
export { default as EnhancedSearchBar } from './components/navigation/EnhancedSearchBar.svelte';
export { default as SearchInput } from './components/forms/SearchInput.svelte';
export { default as MainPageSearchBar } from './components/navigation/MainPageSearchBar.svelte';
export { default as SearchPageSearchBar } from './components/navigation/SearchPageSearchBar.svelte';
export { default as CategorySearchBar } from './components/navigation/CategorySearchBar.svelte';

// Virtual scrolling and search components
export { default as VirtualProductGrid } from './components/product/VirtualProductGrid.svelte';
export { default as LazySearchResults } from './components/navigation/LazySearchResults.svelte';

// Skeleton loading components
export { default as ProductCardSkeleton } from './components/skeleton/ProductCardSkeleton.svelte';
export { default as ProductDetailSkeleton } from './components/skeleton/ProductDetailSkeleton.svelte';
export { default as SellerCardSkeleton } from './components/skeleton/SellerCardSkeleton.svelte';
export { default as CategoryCardSkeleton } from './components/skeleton/CategoryCardSkeleton.svelte';
export { default as ListItemSkeleton } from './components/skeleton/ListItemSkeleton.svelte';
export { default as TextSkeleton } from './components/skeleton/TextSkeleton.svelte';
export { default as ImageSkeleton } from './components/skeleton/ImageSkeleton.svelte';

// Language switcher
export { default as LanguageSwitcher } from './components/utilities/LanguageSwitcher.svelte';

// Cookie consent and locale detection
export { default as UnifiedCookieConsent } from './components/utilities/UnifiedCookieConsent.svelte';
export { default as LocaleDetectionBanner } from './components/banners/LocaleDetectionBanner.svelte';

// SEO and meta components
export { default as SEOMetaTags } from './components/utilities/SEOMetaTags.svelte';

// Navigation progress
export { default as TopProgress } from './components/ui/TopProgress.svelte';

// Order management toasts
export { default as OrderNotificationToast } from './components/modals/OrderNotificationToast.svelte';

// Navigation components
export { default as BottomNav } from './components/navigation/BottomNav.svelte';

// Form components
export { default as FormField } from './components/forms/FormField.svelte';
export { default as Select } from './components/forms/Select.svelte';
export { default as ConditionSelector } from './components/forms/ConditionSelector.svelte';
export { default as BrandSelector } from './components/forms/BrandSelector.svelte';
export { default as CategorySelector } from './components/forms/CategorySelector.svelte';
export { default as CollapsibleCategorySelector } from './components/forms/CollapsibleCategorySelector.svelte';
export { default as ImageUploader } from './components/media/ImageUploader.svelte';
export { default as ImageUploaderSupabase } from './components/media/ImageUploaderSupabase.svelte';
export { default as AvatarUploader } from './components/ui/AvatarUploader.svelte';
export { default as PriceInput } from './components/forms/PriceInput.svelte';
export { default as TagInput } from './components/forms/TagInput.svelte';

// Enhanced Toast System - Recommended for all new code
export { toast, toasts } from './toast';
export type { Toast as ToastMessage, ToastType, ToastStoreOptions, ErrorDetails } from './toast';

// Modern Toast System - Melt UI based (low-level access)
export {
  Toast as ToastComponent,
  ToastProvider,
  ToastContainer as MeltToastContainer,
  toastHelpers,
  toastPatterns,
  toastUtils,
  setToastProvider
} from './primitives';

export { toasts as modernToasts } from './primitives';

// Legacy Toast components (maintained for backwards compatibility)
export { default as ToastContainer } from './components/utilities/ToastContainer.svelte';
export { default as TutorialToast } from './components/utilities/TutorialToast.svelte';

// Convenience aliases for gradual migration
export { toastStore as legacyToasts } from './primitives/toast';

// Filter components - accessibility-first filtering system (deduplicated)

// Pricing and subscription components
export { default as PricingCard } from './components/cards/PricingCard.svelte';
export { default as Accordion } from './components/ui/Accordion.svelte';


// Seller components
export { default as SellerQuickView } from './components/business/SellerQuickView.svelte';

// REMOVED: HighlightQuickView - unused experimental component

// Auth components
export { default as AuthPopup } from './components/auth/AuthPopup.svelte';

// Bundle components
export { default as BundleBuilder } from './components/business/BundleBuilder.svelte';

// Header components - NEW modular header components
export { default as HeaderLogo } from './components/navigation/HeaderLogo.svelte';
export { default as HeaderUserMenu } from './components/navigation/HeaderUserMenu.svelte';
export { default as HeaderNav } from './components/navigation/HeaderNav.svelte';
export { default as HeaderSearch } from './components/navigation/HeaderSearch.svelte';
export { default as CategoryGrid } from './components/product/CategoryGrid.svelte';
export { default as MegaMenuCategories } from './components/navigation/MegaMenuCategories.svelte';
export { default as MobileNavigationDialog } from './components/navigation/MobileNavigationDialog.svelte';
export { default as MobileMenuSearch } from './components/navigation/MobileMenuSearch.svelte';
export { default as CategoryNavigationSheet } from './components/navigation/CategoryNavigationSheet.svelte';
export { default as Footer } from './components/layout/Footer.svelte';
export { default as PartnerShowcase } from './components/business/PartnerShowcase.svelte';
export { default as PartnerBanner } from './components/banners/PartnerBanner.svelte';
export { default as ProductHighlight } from './components/product/ProductHighlight.svelte';
export { default as TrendingSection } from './components/navigation/TrendingSection.svelte';
export { default as ThemeToggle } from './components/ui/ThemeToggle.svelte';

// Product display components
export { default as FavoriteButton } from './components/ui/FavoriteButton.svelte';
export { default as ProductImage } from './components/product/ProductImage.svelte';
export { default as ProductMeta } from './components/product/ProductMeta.svelte';
export { default as ProductPrice } from './components/product/ProductPrice.svelte';

// Feature components - NEWLY MIGRATED
export { default as FeaturedProducts } from './components/product/FeaturedProducts.svelte';
export { default as PromotedHighlights } from './components/business/PromotedHighlights.svelte';
export { default as PromotedListingsSection } from './components/product/PromotedListingsSection.svelte';
export { default as BoostManagement } from './components/business/BoostManagement.svelte';
export { default as ProductCardWithTracking } from './components/cards/ProductCardWithTracking.svelte';

// Semantic CSS styles should be imported directly by consuming applications
// import '../styles/semantic.css';

// Type definitions
export * from './types';

// Design tokens
export * from './tokens';

// Removed PDP utilities - were unused and over-engineered
// Current product page has simpler, more maintainable approach

// Description list primitives
export { default as DescriptionList } from './components/description-list/DescriptionList.svelte';
export { default as DescriptionTerm } from './components/description-list/DescriptionTerm.svelte';
export { default as DescriptionDetails } from './components/description-list/DescriptionDetails.svelte';

// Performance utilities
export * from './utils/lazyLoad';
export * from './utils/imagePreloader';

// Core utilities
export * from './utils/index';

// Loading and Error States
export { default as LoadingStates } from './components/utilities/LoadingStates.svelte';
export { default as ErrorStates } from './components/utilities/ErrorStates.svelte';

// Melt UI Primitives
export * from './primitives';
