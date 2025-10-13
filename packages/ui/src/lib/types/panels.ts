/**
 * UI Panel Component Types
 *
 * Centralized prop interfaces for major UI panel components.
 * Follows the established pattern: Database Row + UI Fields = Component Props
 */

import type { Product, ProductRow } from './product';

// === Footer Component Types ===

export interface FooterProps {
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

// === Product Quick View Component Types ===

// Seller information for quick view
export interface QuickViewSellerInfo {
  id: string;
  username: string;
  avatar?: string | null;
  joinedAt?: string;
  verified?: boolean;
}

export interface HighlightQuickViewProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (productId: string, selectedSize?: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorited?: boolean;
  isLoadingFavorite?: boolean;
}

// === Product Information Component Types ===

// Minimal product data for components that only need basic info
export interface ProductInfoProduct {
  id: string;
  favorite_count: number;
}

// Seller information for product info component
export interface ProductInfoSeller {
  id: string;
  username: string;
  avatar?: string | null;
  joinedAt?: string;
  verified?: boolean;
}

// Valid product condition values (from Supabase enum)
export type ProductCondition =
  | 'brand_new_with_tags'
  | 'new_without_tags'
  | 'like_new'
  | 'good'
  | 'worn'
  | 'fair';

export interface ProductInfoProps {
  title: string;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  condition?: ProductCondition;
  description?: string;
  favoriteCount: number;
  isFavorited: boolean;
  onFavorite?: () => void;
  showQuickFacts?: boolean;
  category?: string;
  productId: string;
  seller?: ProductInfoSeller;
  showSellerRow?: boolean;
  favoriteButton?: any; // Svelte snippet for custom favorite button
}

// === Attribute Display Types ===

export interface ProductAttribute {
  key: string;
  label: string;
  value: string;
  type: 'badge' | 'text';
}

// === Tab Configuration Types ===

export interface TabConfiguration {
  id: string;
  label: string;
  count: number;
  show: boolean;
}

// === Language Configuration Types ===

export interface LanguageOption {
  code: string;
  name: string;
  flag?: string;
}

// === Re-exports for backward compatibility ===

// These types are commonly used together with panel components
export type { Product, ProductRow } from './product';
export type { Profile } from '../types';

// === Type Guards ===

export function isValidProductCondition(value: unknown): value is ProductCondition {
  return typeof value === 'string' && [
    'brand_new_with_tags',
    'new_without_tags',
    'like_new',
    'good',
    'worn',
    'fair'
  ].includes(value);
}