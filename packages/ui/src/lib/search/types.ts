/**
 * Search & Navigation Shared Types
 *
 * Consolidated types for search and navigation components that replace
 * local interfaces with Supabase-derived types plus UI extensions.
 *
 * Following the established pattern: Database Row + UI Fields = Component Type
 */

import type { Tables } from '@repo/database';
import type * as I18nNamespace from '@repo/i18n';
import type { FilterOption, FilterValue } from '../types/filters';
import type { SearchBarMode } from '../types/search';

type I18nNamespaceLike = typeof I18nNamespace & Record<string, (...args: unknown[]) => string>

export type SearchAppliedFilters = Record<string, string | null | undefined>;

import type { Product, Profile } from '../types';

// === Core Database Types ===

export type CategoryRow = Tables<'categories'>;
export type ProductImageRow = Tables<'product_images'>;

// === Extended Types for UI Components ===

// Category with hierarchical UI fields
export interface CategoryUIFields {
  children?: CategoryWithChildren[];
  product_count?: number;
  emoji?: string;
  // Legacy compatibility (marked for removal)
  /** @deprecated Use slug from database instead */
  key?: string;
  /** @deprecated Use parent_id from database instead */
  parentKey?: string;
}

// Main category type for search/navigation components
export type CategoryWithChildren = CategoryRow & CategoryUIFields;

// Product with images for search results
export interface ProductWithImagesUIFields {
  images: ProductImageRow[];
  // Seller information for search results
  category_name?: string;
  seller_name?: string;
  seller_username?: string;
  seller_rating?: number;
  seller_avatar?: string;
}

export type ProductWithImages = Tables<'products'> & ProductWithImagesUIFields;

// === Search Context Types ===

// Different search/navigation contexts
export type SearchContext = 'main' | 'search' | 'category';

// Collection/filter shortcut interface
export interface Collection {
  key: string;
  label: string;
  emoji: string;
  product_count?: number;
}

// === Seller Types ===

// Seller extended with UI fields for search/navigation
export interface SellerUIFields {
  username: string;
  full_name?: string;
  avatar_url?: string;
  total_products: number;
  rating?: number;
  is_verified?: boolean;
}

export type SearchSeller = Profile & SellerUIFields;
// Search main navigation categories for quick links
export interface SearchMainCategory {
  key: string;
  label: string;
  icon: string;
}

// Shared analytics callbacks for search bars
export interface SearchAnalyticsHandlers {
  onSearch: (query: string) => void;
  onCategorySelect: (categorySlug: string, level?: number, path?: string[]) => void;
  onFilterChange: (key: string, value: FilterValue) => void;
  onFilterRemove: (key: string) => void;
  onClearAllFilters: () => void;
}

export interface SearchPageSearchBarProps extends SearchAnalyticsHandlers {
  mode?: SearchBarMode;
  searchValue?: string;
  megaMenuData?: CategoryWithChildren[];
  mainCategories?: SearchMainCategory[];
  conditionFilters?: FilterOption[];
  appliedFilters?: SearchAppliedFilters;
  availableSizes?: string[];
  availableColors?: string[];
  availableBrands?: string[];
  currentResultCount?: number;
  totalResultCount?: number;
  i18n: I18nNamespaceLike;
  onQuickSearch?: (query: string) => Promise<{ data: unknown[]; error: string | null }>;
  enableQuickResults?: boolean;
}

export interface CategorySearchBarProps extends SearchAnalyticsHandlers {
  searchValue?: string;
  megaMenuData?: CategoryWithChildren[];
  mainCategories?: SearchMainCategory[];
  conditionFilters?: FilterOption[];
  appliedFilters?: SearchAppliedFilters;
  currentCategory?: string | null;
  i18n: I18nNamespaceLike;
  onQuickSearch?: (query: string) => Promise<{ data: unknown[]; error: string | null }>;
  enableQuickResults?: boolean;
}

// === Search Component Props ===

// SearchDropdown component props
export interface SearchDropdownProps {
  query: string;
  context?: SearchContext;
  categoryContext?: string | CategoryWithChildren | null;
  onSearch?: (query: string) => Promise<{ data: ProductWithImages[]; error: string | null }>;
  onSelect?: (product: ProductWithImages) => void;
  onClose?: () => void;
  maxResults?: number;
  showCategories?: boolean;
  class?: string;
  visible?: boolean;
  listboxId?: string;
  categories?: CategoryWithChildren[];
  sellers?: SearchSeller[];
  collections?: Collection[];
  onCategorySelect?: (category: CategoryWithChildren) => void;
  onSellerSelect?: (seller: SearchSeller) => void;
  onCollectionSelect?: (collection: Collection) => void;
  translations?: {
    categories?: string;
    collections?: string;
    sellers?: string;
    products?: string;
    searching?: string;
    viewAllResults?: string;
  };
}

// MobileNavigationDialog component props
export interface MobileNavigationDialogProps {
  id?: string;
  isOpen: boolean;
  isLoggedIn: boolean;
  user?: Profile;
  profile?: Profile;
  userDisplayName?: string;
  initials?: string;
  canSell?: boolean;
  currentLanguage: string;
  languages: Array<{
    code: string;
    name: string;
    flag?: string;
  }>;
  categories?: CategoryWithChildren[];
  onClose: () => void;
  onSignOut: () => void;
  onCategoryClick: (category: string, level?: number, path?: string[]) => void;
  onLanguageChange: (lang: string) => void;
  signingOut?: boolean;
  searchFunction?: (query: string) => Promise<{ data: ProductWithImages[]; error: string | null }>;
  unreadMessages?: number;
  unreadNotifications?: number;
  translations?: {
    sellItems?: string;
    myProfile?: string;
    startSelling?: string;
    settings?: string;
    signOut?: string;
    signingOut?: string;
    signIn?: string;
    signUp?: string;
    browseCategories?: string;
    whatLookingFor?: string;
    browseAll?: string;
    popularBrands?: string;
    newToday?: string;
    orders?: string;
    favorites?: string;
    categoryWomen?: string;
    categoryMen?: string;
    categoryKids?: string;
    categoryUnisex?: string;
    help?: string;
    privacy?: string;
    terms?: string;
    returns?: string;
    trustSafety?: string;
    searchPlaceholder?: string;
    quickActionsLabel?: string;
    settingsLabel?: string;
    supportLabel?: string;
  };
}

// === Navigation State Types ===

// Category navigation breadcrumb
export interface CategoryBreadcrumb {
  name: string;
  slug: string;
}

// Navigation state for hierarchical category browsing
export interface CategoryNavigationState {
  categories: CategoryWithChildren[];
  level: number;
}

// === Utility Functions Type Guards ===

export function isCategoryWithChildren(category: unknown): category is CategoryWithChildren {
  return (
    typeof category === 'object' &&
    category !== null &&
    'id' in category &&
    'name' in category &&
    'slug' in category
  );
}

export function isProductWithImages(product: unknown): product is ProductWithImages {
  return (
    typeof product === 'object' &&
    product !== null &&
    'id' in product &&
    'title' in product &&
    'price' in product &&
    'images' in product &&
    Array.isArray((product as any).images)
  );
}

// === Re-exports from other type modules ===

// Re-export commonly used types from the main types module
export type { SearchBarMode } from '../types/search';
export type { FilterState as SearchFilters } from '../types/filters';
export type { Product } from '../types/product';

