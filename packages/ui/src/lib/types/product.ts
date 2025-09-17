/**
 * Product Type Bridge
 *
 * This file provides a bridge between the database product types from @repo/database
 * and the UI-specific product interface needed by components.
 *
 * It keeps database types clean while providing UI-specific extensions.
 */

import type { Tables } from '@repo/database';

// Base product type from database (clean, no overrides)
export type DatabaseProduct = Tables<'products'>;

// UI-specific product interface that extends database product with UI-only computed fields
export interface UIProduct extends DatabaseProduct {
  // UI-specific computed properties (NEVER override database fields)
  images: string[];
  slug?: string; // Generated from title for SEO-friendly URLs
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
  /** @deprecated Use seller_id instead */
  sellerId: string;
  /** @deprecated Use created_at instead */
  createdAt: string;
  /** @deprecated Use is_featured from database */
  is_promoted?: boolean;
}

// Main Product type for UI components - use this instead of DatabaseProduct
export type Product = UIProduct;

// Helper type for creating products from database data + UI data
export interface ProductWithUIData {
  product: DatabaseProduct;
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

    // Legacy compatibility mappings
    sellerId: product.seller_id,
    createdAt: product.created_at,
    is_promoted: product.is_featured || false,
  };
}

// Re-export other types that components commonly use
export type ProductCondition = DatabaseProduct['condition'];
export type ProductStatus = DatabaseProduct['status'];

// User and Review types (keeping existing structure for now)
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  memberSince: string;
  location?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  reviewerId: string;
  reviewerName: string;
  productId?: string;
  sellerId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  images?: string[];
  timestamp: string;
  read: boolean;
}

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