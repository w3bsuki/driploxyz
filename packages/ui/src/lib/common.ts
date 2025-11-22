/**
 * Common UI Components Barrel Export
 *
 * This file provides convenient access to frequently used UI components.
 * Use this for components that are imported together often.
 */

// Core UI Components
export { default as Button } from './components/ui/Button.svelte';
export { default as Avatar } from './components/media/Avatar.svelte';
export { default as Badge } from './components/badges/Badge.svelte';
export { default as Banner } from './components/banners/Banner.svelte';

// Product & Commerce Components
export { default as ProductCard } from './components/cards/ProductCard.svelte';
export { default as SellerCard } from './components/cards/SellerCard.svelte';
export { default as BrandBadge } from './components/badges/BrandBadge.svelte';
export { default as PricingCard } from './components/cards/PricingCard.svelte';

// Navigation & Search
export { default as BottomNav } from './components/navigation/BottomNav.svelte';
export { default as CategoryPill } from './components/navigation/CategoryPill.svelte';
export { default as SearchDropdown } from './components/navigation/SearchDropdown.svelte';

// Form & Input Components
export { default as Accordion } from './components/ui/Accordion.svelte';
export { default as OrderStatus } from './components/ui/OrderStatus.svelte';
export { default as Tabs } from './primitives/tabs/Tabs.svelte';

// Loading & Feedback
export { default as LoadingSpinner } from './components/utilities/LoadingSpinner.svelte';
export { default as ErrorBoundary } from './components/utilities/ErrorBoundary.svelte';

// Skeletons
export { default as ProductCardSkeleton } from './skeleton/ProductCardSkeleton.svelte';
export { default as SellerCardSkeleton } from './skeleton/SellerCardSkeleton.svelte';
export { default as ImageSkeleton } from './skeleton/ImageSkeleton.svelte';
export { default as TextSkeleton } from './skeleton/TextSkeleton.svelte';

// Admin Components
export { default as AdminModal } from './components/modals/AdminModal.svelte';

// Utilities
export * from './utils/navigation.js';

// Analytics & Feedback
export { default as SearchEmptyState } from './components/utilities/SearchEmptyState.svelte';
export { default as SearchFeedback } from './components/utilities/SearchFeedback.svelte';

// Toast System
export { toasts } from './primitives';

// Types (commonly used)
export type { Product, SearchFilters } from './types/product';
export type { User, Review, Message, ButtonVariant, ButtonSize, BadgeVariant, BadgeSize } from './types';

/**
 * Frequently Used Component Combinations
 *
 * These are pre-defined sets of components that are commonly imported together
 * for specific page types or use cases.
 */

// Product Page Components
export const ProductPageComponents = {
  ProductCard: () => import('./components/cards/ProductCard.svelte'),
  Button: () => import('./components/ui/Button.svelte'),
  Avatar: () => import('./components/media/Avatar.svelte'),
  Badge: () => import('./components/badges/Badge.svelte'),
  LoadingSpinner: () => import('./components/utilities/LoadingSpinner.svelte')
};

// Search Page Components
export const SearchPageComponents = {
  ProductCard: () => import('./components/cards/ProductCard.svelte'),
  SearchDropdown: () => import('./components/navigation/SearchDropdown.svelte'),
  CategoryPill: () => import('./components/navigation/CategoryPill.svelte'),
  ProductCardSkeleton: () => import('./skeleton/ProductCardSkeleton.svelte'),
  BottomNav: () => import('./components/navigation/BottomNav.svelte')
};

// Dashboard Components
export const DashboardComponents = {
  Button: () => import('./components/ui/Button.svelte'),
  Avatar: () => import('./components/media/Avatar.svelte'),
  ProductCard: () => import('./components/cards/ProductCard.svelte'),
  OrderStatus: () => import('./components/ui/OrderStatus.svelte'),
  Tabs: () => import('./primitives/tabs/Tabs.svelte'),
  LoadingSpinner: () => import('./components/utilities/LoadingSpinner.svelte')
};

// Admin Components
export const AdminComponents = {
  AdminModal: () => import('./components/modals/AdminModal.svelte'),
  Button: () => import('./components/ui/Button.svelte'),
  Avatar: () => import('./components/media/Avatar.svelte'),
  LoadingSpinner: () => import('./components/utilities/LoadingSpinner.svelte'),
  ErrorBoundary: () => import('./components/utilities/ErrorBoundary.svelte')
};