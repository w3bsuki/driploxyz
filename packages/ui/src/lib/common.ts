/**
 * Common UI Components Barrel Export
 *
 * This file provides convenient access to frequently used UI components.
 * Use this for components that are imported together often.
 */

// Core UI Components
export { default as Button } from './Button.svelte';
export { default as Avatar } from './Avatar.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Banner } from './Banner.svelte';

// Product & Commerce Components
export { default as ProductCard } from './ProductCard.svelte';
export { default as SellerCard } from './SellerCard.svelte';
export { default as BrandBadge } from './BrandBadge.svelte';
export { default as PricingCard } from './PricingCard.svelte';

// Navigation & Search
export { default as BottomNav } from './BottomNav.svelte';
export { default as CategoryPill } from './CategoryPill.svelte';
export { default as SearchDropdown } from './SearchDropdown.svelte';
export { default as AppliedFilterPills } from './AppliedFilterPills.svelte';

// Form & Input Components
export { default as Accordion } from './Accordion.svelte';
export { default as OrderStatus } from './OrderStatus.svelte';
export { default as Tabs } from './primitives/tabs/Tabs.svelte';

// Loading & Feedback
export { default as LoadingSpinner } from './LoadingSpinner.svelte';
export { default as ErrorBoundary } from './ErrorBoundary.svelte';

// Skeletons
export { default as ProductCardSkeleton } from './skeleton/ProductCardSkeleton.svelte';
export { default as SellerCardSkeleton } from './skeleton/SellerCardSkeleton.svelte';
export { default as ImageSkeleton } from './skeleton/ImageSkeleton.svelte';
export { default as TextSkeleton } from './skeleton/TextSkeleton.svelte';

// Admin Components
export { default as AdminModal } from './AdminModal.svelte';

// Utilities
export * from './utils/navigation.js';

// Analytics & Feedback
export { default as SearchEmptyState } from './SearchEmptyState.svelte';
export { default as SearchFeedback } from './SearchFeedback.svelte';

// Toast System
export { toasts } from './toast-store.js';

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
  ProductCard: () => import('./ProductCard.svelte'),
  Button: () => import('./Button.svelte'),
  Avatar: () => import('./Avatar.svelte'),
  Badge: () => import('./Badge.svelte'),
  LoadingSpinner: () => import('./LoadingSpinner.svelte')
};

// Search Page Components
export const SearchPageComponents = {
  ProductCard: () => import('./ProductCard.svelte'),
  SearchDropdown: () => import('./SearchDropdown.svelte'),
  CategoryPill: () => import('./CategoryPill.svelte'),
  AppliedFilterPills: () => import('./AppliedFilterPills.svelte'),
  ProductCardSkeleton: () => import('./skeleton/ProductCardSkeleton.svelte'),
  BottomNav: () => import('./BottomNav.svelte')
};

// Dashboard Components
export const DashboardComponents = {
  Button: () => import('./Button.svelte'),
  Avatar: () => import('./Avatar.svelte'),
  ProductCard: () => import('./ProductCard.svelte'),
  OrderStatus: () => import('./OrderStatus.svelte'),
  Tabs: () => import('./primitives/tabs/Tabs.svelte'),
  LoadingSpinner: () => import('./LoadingSpinner.svelte')
};

// Admin Components
export const AdminComponents = {
  AdminModal: () => import('./AdminModal.svelte'),
  Button: () => import('./Button.svelte'),
  Avatar: () => import('./Avatar.svelte'),
  LoadingSpinner: () => import('./LoadingSpinner.svelte'),
  ErrorBoundary: () => import('./ErrorBoundary.svelte')
};