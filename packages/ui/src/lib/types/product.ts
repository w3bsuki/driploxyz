/**
 * Product Type Bridge
 *
 * This file provides a bridge between the database product types from @repo/database
 * and the UI-specific product interface needed by components.
 *
 * It keeps database types clean while providing UI-specific extensions.
 */

import type { Tables } from '@repo/database';

// Explicit split: Database row type
export type ProductRow = Tables<'products'>;

// UI-specific fields interface (only computed/display fields, never override database fields)
export interface ProductUIFields {
  // UI-specific computed properties (NEVER override database fields)
  images: string[];
  slug?: string; // Generated from title for SEO-friendly URLs
  currency?: string; // Derived from country_code for price formatting
  availableSizes?: string[]; // Computed from size_options or size field
  sellerName: string;
  sellerRating: number;
  sellerAvatar?: string;
  sellerAccountType?: 'new_seller' | 'pro' | 'brand';
  category_name?: string;
  main_category_name?: string;
  subcategory_name?: string;
  specific_category_name?: string;
  seller_badges?: {
    is_pro: boolean;
    is_brand: boolean;
    is_verified: boolean;
  };
  seller_subscription_tier?: 'free' | 'basic' | 'pro' | 'brand';
  product_images?: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    sort_order?: number;
  }>;

  // Legacy compatibility properties (marked for future removal)
  /** @deprecated Use seller_id instead - TODO: Remove after all consumers migrated */
  sellerId: string;
  /** @deprecated Use created_at instead - TODO: Remove after all consumers migrated */
  createdAt: string;
  /** @deprecated Use is_featured from database - TODO: Remove after all consumers migrated */
  is_promoted?: boolean;
}

// Main Product type for UI components - intersection of database row and UI fields
export type Product = ProductRow & ProductUIFields;

// Lightweight product type for components that only need minimal data
export interface ProductPreview {
  id: string;
  favorite_count: number;
  is_sold?: boolean;
}

// Legacy alias for backwards compatibility
/** @deprecated Use Product or ProductRow instead */
export type UIProduct = Product;
/** @deprecated Use ProductRow instead */
export type DatabaseProduct = ProductRow;

// Helper type for creating products from database data + UI data
export interface ProductWithUIData {
  product: ProductRow;
  seller: {
    username: string;
    rating: number;
    avatar?: string;
    account_type?: string;
    badges?: {
      is_pro: boolean;
      is_brand: boolean;
      is_verified: boolean;
    };
    subscription_tier?: string;
  };
  images: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    sort_order?: number;
  }>;
  category?: {
    name: string;
    main_category_name?: string;
    subcategory_name?: string;
    specific_category_name?: string;
  };
}

// Utility function to transform database product + related data into UI product
export function transformToUIProduct(data: ProductWithUIData): Product {
  const { product, seller, images, category } = data;

  return {
    // All database fields inherited automatically via extends DatabaseProduct
    ...product,

    // UI-specific computed fields only
    images: images.map(img => img.image_url),
    slug: generateSlugFromTitle(product.title),
    currency: getCurrencyFromCountryCode(product.country_code),
    availableSizes: product.size ? [product.size] : [],
    sellerName: seller.username,
    sellerRating: seller.rating,
    sellerAvatar: seller.avatar,
    sellerAccountType: seller.account_type as 'new_seller' | 'pro' | 'brand',
    category_name: category?.name,
    main_category_name: category?.main_category_name,
    subcategory_name: category?.subcategory_name,
    specific_category_name: category?.specific_category_name,
    seller_badges: seller.badges,
    seller_subscription_tier: seller.subscription_tier as 'free' | 'basic' | 'pro' | 'brand',
    product_images: images,

    // Legacy compatibility mappings (handle nullable database fields)
    sellerId: product.seller_id,
    createdAt: product.created_at || new Date().toISOString(),
    is_promoted: product.is_featured || false,
  };
}

// Re-export other types that components commonly use
export type ProductCondition = ProductRow['condition'];
export type ProductStatus = ProductRow['status'];

// User, Review, and Message types are now imported from index.ts to avoid duplication

export interface SearchFilters {
  category?: string;
  brand?: string;
  size?: string[];
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'relevance';
}

// Utility function to generate URL-friendly slug from product title
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Utility function to derive currency from country code
function getCurrencyFromCountryCode(countryCode: string | null): string {
  if (!countryCode) return 'USD'; // Default currency

  const currencyMap: Record<string, string> = {
    'US': 'USD',
    'GB': 'GBP',
    'EU': 'EUR',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'CA': 'CAD',
    'AU': 'AUD',
    'JP': 'JPY',
    'KR': 'KRW',
    'CN': 'CNY',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'SG': 'SGD',
    'HK': 'HKD',
    'CH': 'CHF',
    'SE': 'SEK',
    'NO': 'NOK',
    'DK': 'DKK',
    'PL': 'PLN',
    'CZ': 'CZK',
    'HU': 'HUF',
    'RO': 'RON',
    'BG': 'BGN',
    'HR': 'HRK',
    'SI': 'EUR',
    'SK': 'EUR',
    'LT': 'EUR',
    'LV': 'EUR',
    'EE': 'EUR',
    'MT': 'EUR',
    'CY': 'EUR',
    'LU': 'EUR',
    'AT': 'EUR',
    'BE': 'EUR',
    'FI': 'EUR',
    'IE': 'EUR',
    'PT': 'EUR',
    'GR': 'EUR'
  };

  return currencyMap[countryCode.toUpperCase()] || 'USD';
}