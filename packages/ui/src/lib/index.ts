// Core UI components
export { default as Badge } from './primitives/badge/Badge.svelte';
export type { SvelteComponent as _BadgeComponent } from 'svelte';
export { default as Banner } from './compositions/banners/Banner.svelte';
export { default as SectionBanner } from './compositions/banners/SectionBanner.svelte';
export { default as FeaturedHero } from './compositions/banners/FeaturedHero.svelte';
export { default as FeaturedHeroSlide } from './compositions/banners/FeaturedHeroSlide.svelte';

// Home banner components
export { default as PromotedListingsBanner } from './compositions/banners/PromotedListingsBanner.svelte';
export { default as PromoBanner } from './compositions/banners/PromoBanner.svelte';
export { default as FeaturedSellersBanner } from './compositions/banners/FeaturedSellersBanner.svelte';
export { default as NewestListingsBanner } from './compositions/banners/NewestListingsBanner.svelte';
export { default as Button } from './primitives/button/Button.svelte';
export { default as Card } from './compositions/cards/Card.svelte';
export { default as Input } from './primitives/input/Input.svelte';
export { default as Modal } from './primitives/modal/Modal.svelte';
export { default as Overlay } from './primitives/overlay/Overlay.svelte';
export { default as ProductCard } from './compositions/cards/ProductCard.svelte';
export { default as IntegratedSearchBar } from './compositions/navigation/IntegratedSearchBar.svelte';
export { default as SearchDropdownInput } from './compositions/search/SearchDropdownInput.svelte';
export { default as CategoryDropdown } from './compositions/navigation/CategoryDropdown.svelte';
export { default as Avatar } from './primitives/avatar/Avatar.svelte';
export { default as SellerProfileCard } from './compositions/cards/SellerProfileCard.svelte';
export { default as FeaturedSellers } from './compositions/business/FeaturedSellers.svelte';
export { default as Breadcrumb } from './compositions/navigation/Breadcrumb.svelte';
export { default as ErrorBoundary } from './compositions/forms/ErrorBoundary.svelte';
export { default as DynamicContentErrorBoundary } from './compositions/forms/DynamicContentErrorBoundary.svelte';
export { default as LazyImage } from './primitives/image/LazyImage.svelte';
export { default as EngagementBanner } from './compositions/banners/EngagementBanner.svelte';

// Enhanced product components
export { default as ShippingEstimator } from './compositions/business/ShippingEstimator.svelte';
export { default as TrustBadges } from './compositions/badges/TrustBadges.svelte';

// Core product page components only (5 components total)
export { default as ProductGallery } from './compositions/product/ProductGallery.svelte';
export { default as ProductInfo } from './compositions/product/ProductInfo.svelte';
export { default as ProductSeller } from './compositions/product/ProductSeller.svelte';
export { default as ProductBuyBox } from './compositions/product/ProductBuyBox.svelte';
export { default as ProductReviews } from './compositions/product/ProductReviews.svelte';

// Utils will be exported at the end

// Loading components
export { default as LoadingSpinner } from './primitives/spinner/LoadingSpinner.svelte';

// Form and selector components
export { default as SizeSelector } from './compositions/forms/SizeSelector.svelte';
export { default as SellerCard } from './compositions/cards/SellerCard.svelte';

// Core product components
export { default as ProductBreadcrumb } from './compositions/product/ProductBreadcrumb.svelte';
export { default as ProductActions } from './compositions/product/ProductActions.svelte';

// Removed PDP Components - Over-engineered and unused
// Current product page uses direct component imports which is better practice

// Removed lazy-loaded PDP components - were over-engineered and unused
// Current product page handles lazy loading more efficiently with IntersectionObserver

// Seller components
export { default as SellerProfile } from './compositions/business/SellerProfile.svelte';
export { default as TabGroup } from './primitives/tabs/TabGroup.svelte';
export { default as Tabs } from './primitives/tabs/Tabs.svelte';

// Payment components
export { default as PaymentForm } from './compositions/forms/PaymentForm.svelte';
export { default as CheckoutSummary } from './compositions/business/CheckoutSummary.svelte';

// Filter components
export { default as CategoryPill } from './primitives/pill/CategoryPill.svelte';


// Rating components
export { default as RatingModal } from './compositions/modals/RatingModal.svelte';

// Discovery modal
export { default as DiscoverModal } from './compositions/modals/DiscoverModal.svelte';

// Notification components
export { default as NotificationBell } from './compositions/notifications/NotificationBell.svelte';
export { default as NotificationPanel } from './layouts/NotificationPanel.svelte';
export { default as Container } from './layouts/Container.svelte';
export { default as Stack } from './layouts/Stack.svelte';
export { default as HStack } from './layouts/HStack.svelte';
export { default as MessageNotificationToast } from './compositions/modals/MessageNotificationToast.svelte';
export { default as FollowNotificationToast } from './compositions/modals/FollowNotificationToast.svelte';
export { default as TypingIndicator } from './primitives/indicator/TypingIndicator.svelte';

// Onboarding components
export { default as WelcomeModal } from './compositions/modals/WelcomeModal.svelte';
export { default as OnboardingStep } from './compositions/onboarding/OnboardingStep.svelte';
export { default as AccountTypeSelector } from './compositions/auth/AccountTypeSelector.svelte';
export { default as AvatarSelector } from './compositions/forms/AvatarSelector.svelte';
export { default as SocialLinksEditor } from './compositions/business/SocialLinksEditor.svelte';
export { default as PayoutMethodSelector } from './compositions/forms/PayoutMethodSelector.svelte';
export { default as OnboardingSuccessModal } from './compositions/modals/OnboardingSuccessModal.svelte';
export { default as BrandPaymentModal } from './compositions/modals/BrandPaymentModal.svelte';

// Specialized badges (domain-specific)
export { default as ProBadge } from './primitives/badge/ProBadge.svelte';
export { default as BrandBadge } from './primitives/badge/BrandBadge.svelte';
export { default as UserBadge } from './primitives/badge/UserBadge.svelte';
export { default as ConditionBadge } from './primitives/badge/ConditionBadge.svelte';
export { default as NewSellerBadge } from './primitives/badge/NewSellerBadge.svelte';
export { default as PremiumBadge } from './primitives/badge/PremiumBadge.svelte';
export { default as AdminBadge } from './primitives/badge/AdminBadge.svelte';

// Admin Management Components (moved to respective apps)
// REMOVED: BrandPaymentModal - admin-specific
// REMOVED: WelcomeTutorialFlow - unused

// Country/Region components
// REMOVED: CountryDetectionBanner - unused

// Order and Review components
export { default as OrderStatus } from './compositions/business/OrderStatus.svelte';
export { default as OrderTimeline } from './compositions/business/OrderTimeline.svelte';
export { default as OrderActions } from './compositions/business/OrderActions.svelte';
export { default as ReviewModal } from './compositions/modals/ReviewModal.svelte';
export { default as ReviewDisplay } from './compositions/business/ReviewDisplay.svelte';
export { default as RatingSummary } from './compositions/business/RatingSummary.svelte';
export { default as ReviewPrompt } from './compositions/business/ReviewPrompt.svelte';

// Product sold status components
export { default as SoldOverlay } from './primitives/overlay/SoldOverlay.svelte';
export { default as SoldNotificationToast } from './compositions/modals/SoldNotificationToast.svelte';
// REMOVED: ProductSoldManager - over-engineered
// REMOVED: SoldNotificationPanel - over-engineered

// Image components

// Search components
export { default as TrendingDropdown } from './compositions/navigation/TrendingDropdown.svelte';
export { default as SearchDropdown } from './compositions/navigation/SearchDropdown.svelte';
export { default as EnhancedSearchBar } from './compositions/navigation/EnhancedSearchBar.svelte';
export { default as SearchInput } from './compositions/forms/SearchInput.svelte';
export { default as MainPageSearchBar } from './compositions/navigation/MainPageSearchBar.svelte';
export { default as SearchPageSearchBar } from './compositions/navigation/SearchPageSearchBar.svelte';
export { default as CategorySearchBar } from './compositions/navigation/CategorySearchBar.svelte';

// Virtual scrolling and search components
export { default as VirtualProductGrid } from './compositions/product/VirtualProductGrid.svelte';
export { default as LazySearchResults } from './compositions/navigation/LazySearchResults.svelte';

// Skeleton loading components
export { default as ProductCardSkeleton } from './primitives/skeleton/ProductCardSkeleton.svelte';
export { default as ProductDetailSkeleton } from './primitives/skeleton/ProductDetailSkeleton.svelte';
export { default as SellerCardSkeleton } from './primitives/skeleton/SellerCardSkeleton.svelte';
export { default as CategoryCardSkeleton } from './primitives/skeleton/CategoryCardSkeleton.svelte';
export { default as ListItemSkeleton } from './primitives/skeleton/ListItemSkeleton.svelte';
export { default as TextSkeleton } from './primitives/skeleton/TextSkeleton.svelte';
export { default as ImageSkeleton } from './primitives/skeleton/ImageSkeleton.svelte';

// Language switcher
export { default as LanguageSwitcher } from './compositions/i18n/LanguageSwitcher.svelte';

// Cookie consent and locale detection
export { default as UnifiedCookieConsent } from './compositions/legal/UnifiedCookieConsent.svelte';
export { default as LocaleDetectionBanner } from './compositions/banners/LocaleDetectionBanner.svelte';

// SEO and meta components
export { default as SEOMetaTags } from './compositions/seo/SEOMetaTags.svelte';

// Navigation progress
export { default as TopProgress } from './primitives/progress/TopProgress.svelte';

// Order management toasts
export { default as OrderNotificationToast } from './compositions/modals/OrderNotificationToast.svelte';

// Navigation components
export { default as BottomNav } from './compositions/navigation/BottomNav.svelte';

// Form components
export { default as FormField } from './primitives/form/FormField.svelte';
export { default as Select } from './compositions/forms/Select.svelte';
export { default as ConditionSelector } from './compositions/forms/ConditionSelector.svelte';
export { default as BrandSelector } from './compositions/forms/BrandSelector.svelte';
export { default as CategorySelector } from './compositions/forms/CategorySelector.svelte';
export { default as CollapsibleCategorySelector } from './compositions/forms/CollapsibleCategorySelector.svelte';
export { default as ImageUploader } from './compositions/media/ImageUploader.svelte';
export { default as ImageUploaderSupabase } from './compositions/media/ImageUploaderSupabase.svelte';
export { default as AvatarUploader } from './primitives/avatar/AvatarUploader.svelte';
export { default as PriceInput } from './compositions/forms/PriceInput.svelte';
export { default as TagInput } from './compositions/forms/TagInput.svelte';
export { default as CollectionSelector } from './compositions/forms/CollectionSelector.svelte';

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
export { default as ToastContainer } from './primitives/toast/ToastContainer.svelte';
export { default as TutorialToast } from './compositions/tutorial/TutorialToast.svelte';

// Convenience aliases for gradual migration
export { toastStore as legacyToasts } from './primitives/toast';

// Filter components - accessibility-first filtering system (deduplicated)

// Pricing and subscription components
export { default as PricingCard } from './compositions/cards/PricingCard.svelte';
export { default as Accordion } from './primitives/accordion/Accordion.svelte';


// Seller components
export { default as SellerQuickView } from './compositions/business/SellerQuickView.svelte';

// REMOVED: HighlightQuickView - unused experimental component

// Auth components
export { default as AuthPopup } from './compositions/auth/AuthPopup.svelte';

// Bundle components
export { default as BundleBuilder } from './compositions/business/BundleBuilder.svelte';

// Header components - NEW modular header components
export { default as HeaderLogo } from './compositions/navigation/HeaderLogo.svelte';
export { default as HeaderUserMenu } from './compositions/navigation/HeaderUserMenu.svelte';
export { default as HeaderNav } from './compositions/navigation/HeaderNav.svelte';
export { default as HeaderSearch } from './compositions/navigation/HeaderSearch.svelte';
export { default as CategoryGrid } from './compositions/product/CategoryGrid.svelte';
export { default as MegaMenuCategories } from './compositions/navigation/MegaMenuCategories.svelte';
export { default as MobileNavigationDialog } from './compositions/navigation/MobileNavigationDialog.svelte';
export { default as MobileMenuSearch } from './compositions/navigation/MobileMenuSearch.svelte';
export { default as CategoryNavigationSheet } from './compositions/navigation/CategoryNavigationSheet.svelte';
export { default as Footer } from './layouts/Footer.svelte';
export { default as PartnerShowcase } from './compositions/business/PartnerShowcase.svelte';
export { default as PartnerBanner } from './compositions/banners/PartnerBanner.svelte';
export { default as ProductHighlight } from './compositions/product/ProductHighlight.svelte';
export { default as TrendingSection } from './compositions/navigation/TrendingSection.svelte';
export { default as ThemeToggle } from './primitives/toggle/ThemeToggle.svelte';

// Button primitives
export { default as FavoriteButton } from './primitives/buttons/FavoriteButton.svelte';
export { default as FollowButton } from './primitives/buttons/FollowButton.svelte';

// Product display components
export { default as ProductImage } from './compositions/product/ProductImage.svelte';
export { default as ProductMeta } from './compositions/product/ProductMeta.svelte';
export { default as ProductPrice } from './compositions/product/ProductPrice.svelte';

// Feature components - NEWLY MIGRATED
export { default as FeaturedProducts } from './compositions/product/FeaturedProducts.svelte';
export { default as PromotedHighlights } from './compositions/business/PromotedHighlights.svelte';
export { default as PromotedListingsSection } from './compositions/product/PromotedListingsSection.svelte';
export { default as BoostManagement } from './compositions/business/BoostManagement.svelte';
export { default as ProductCardWithTracking } from './compositions/cards/ProductCardWithTracking.svelte';

// Semantic CSS styles should be imported directly by consuming applications
// import '../styles/semantic.css';

// Type definitions
export * from './types';

// Design tokens
export * from './tokens';

// Removed PDP utilities - were unused and over-engineered
// Current product page has simpler, more maintainable approach

// Description list primitives
export { default as DescriptionList } from './compositions/description/DescriptionList.svelte';
export { default as DescriptionTerm } from './compositions/description/DescriptionTerm.svelte';
export { default as DescriptionDetails } from './compositions/description/DescriptionDetails.svelte';

// Performance utilities
export * from './utils/lazyLoad';
export * from './utils/imagePreloader';

// Core utilities
export * from './utils/index';

// Loading and Error States
export { default as LoadingStates } from './primitives/loading/LoadingStates.svelte';
export { default as ErrorStates } from './compositions/error/ErrorStates.svelte';

// Melt UI Primitives
export * from './primitives';

// === NEWLY MIGRATED COMPONENTS (2025-10-13) ===

// Image & Loader Primitives
export { default as OptimizedImage } from './primitives/image/OptimizedImage.svelte';
export { default as PageLoader } from './primitives/loader/PageLoader.svelte';

// Modal Compositions
export { default as PayoutRequestModal } from './compositions/modals/PayoutRequestModal.svelte';
export { default as RegionSwitchModal } from './compositions/modals/RegionSwitchModal.svelte';

// Search Compositions
export { default as HeroSearch } from './compositions/search/HeroSearch.svelte';
export { default as BrowseByType } from './compositions/search/BrowseByType.svelte';
export { default as RecentSearches } from './compositions/search/RecentSearches.svelte';
export { default as TrendingSearches } from './compositions/search/TrendingSearches.svelte';
export { default as FilterBar } from './compositions/search/FilterBar.svelte';
export { default as SearchResultsHeader } from './compositions/search/SearchResultsHeader.svelte';



// Mobile-first filter and browse components
export { default as FilterDrawer } from './compositions/product/FilterDrawer.svelte';
export { default as CategorySideDrawer } from './compositions/navigation/CategorySideDrawer.svelte';
export { default as CategorySidebar } from './compositions/navigation/CategorySidebar.svelte';

// Legacy components (kept for backwards compatibility)
export { default as CategoryBrowseSheet } from './compositions/navigation/CategoryBrowseSheet.svelte';

export { default as DiscoveryBanners } from './compositions/navigation/DiscoveryBanners.svelte';

// Once UI System
export { default as OnceThemeProvider } from './providers/ThemeProvider.svelte';
export { theme as onceTheme } from './stores/theme';
export * from './once-ui-config';
