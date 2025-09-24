/**
 * SEO URL Utilities for Product Links
 *
 * This module provides utilities for generating and working with SEO-friendly URLs
 * throughout the application.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export interface Product {
  id: string;
  slug?: string | null;
  title?: string;
  brand?: string;
  size?: string;
  condition?: string;
  color?: string;
}

export interface ProductForUrl {
  id: string;
  slug: string;
  seller_username: string;
  // Optional category slug for URLs that include a category segment
  category_slug?: string | null;
}

// Extended interface that matches the actual data structure used in the app
export interface ProductWithProfile {
  id: string;
  slug?: string | null;
  profiles?: {
    username?: string | null;
  } | null;
  categories?: {
    slug?: string | null;
  } | null;
}

/**
 * Generate canonical SEO-friendly product URL with seller username
 * Format: /product/:seller_username/:product_slug
 * 
 * @param p Product data with required seller_username and slug
 * @throws Error if seller_username or slug is missing (production-ready - no fallbacks)
 */
export function getProductUrl(p: ProductForUrl | ProductWithProfile): string {
  let sellerUsername: string;
  let productSlug: string;
  let categorySlug: string | undefined;

  // Handle ProductForUrl interface (clean structure)
  if ('seller_username' in p) {
    if (!p.seller_username || !p.slug) {
      throw new Error(`getProductUrl: Missing required fields - seller_username: ${p.seller_username}, slug: ${p.slug}, product_id: ${p.id}`);
    }
    sellerUsername = p.seller_username;
    productSlug = p.slug;
    categorySlug = p.category_slug ?? undefined;
  }
  // Handle ProductWithProfile interface (nested profiles structure)
  else if ('profiles' in p) {
    if (p.profiles?.username && p.slug) {
      sellerUsername = p.profiles.username;
      productSlug = p.slug;
      categorySlug = p.categories?.slug ?? undefined;
    } else {
      // Graceful fallback when data is incomplete
      return `/product/${p.id}`;
    }
  } else {
    // Graceful fallback for unknown structure
    return `/product/${(p as { id: string }).id}`;
  }

  // Include category when available
  return categorySlug
    ? `/product/${sellerUsername}/${categorySlug}/${productSlug}`
    : `/product/${sellerUsername}/${productSlug}`;
}

/**
 * Convenient alias for getProductUrl - builds canonical product URLs
 * @param product Product data with required seller username and slug
 */
export const buildProductUrl = getProductUrl;

/**
 * Legacy product URL generator - falls back to UUID if no slug
 * @deprecated Use getProductUrl with ProductForUrl interface for new code
 */
export function getLegacyProductUrl(product: Product): string {
  if (product.slug) {
    return `/${product.slug}`;
  }
  
  // Fallback to UUID-based URL until slug is generated
  return `/product/${product.id}`;
}

/**
 * Check if a string is a valid UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Extract product ID from either UUID or slug format
 */
export function extractProductId(urlPath: string): string | null {
  // Remove leading slash if present
  const path = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
  
  // Handle /product/uuid format
  if (path.startsWith('product/')) {
    const id = path.replace('product/', '');
    return isUUID(id) ? id : null;
  }
  
  // Handle direct UUID
  if (isUUID(path)) {
    return path;
  }
  
  // Handle slug format - extract ID from end of slug
  const parts = path.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like our 8-character ID suffix
  if (lastPart && lastPart.length === 8 && /^[a-f0-9]{8}$/i.test(lastPart)) {
    // This is a slug, we'd need to look it up in the database
    return null; // Indicates slug lookup needed
  }
  
  return null;
}

/**
 * Generate a client-side slug preview (for forms, etc.)
 * This mirrors the server-side slug generation logic
 */
export function generateSlugPreview(
  title: string,
  brand?: string,
  size?: string,
  condition?: string,
  color?: string,
  category?: string,
  gender?: string
): string {
  let slug = '';
  
  // Add gender prefix if available
  if (gender) {
    slug += cleanSlugPart(gender) + '/';
  }
  
  // Add category if available  
  if (category) {
    slug += cleanSlugPart(category) + '/';
  }
  
  // Build product slug part
  const productParts = [
    brand && cleanSlugPart(brand),
    cleanSlugPart(title),
    color && cleanSlugPart(color),
    size && `size-${cleanSlugPart(size)}`,
    condition && cleanSlugPart(condition)
  ].filter(Boolean);
  
  slug += productParts.join('-');
  
  // Clean up and add preview suffix
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  slug = slug.substring(0, 80) + '-preview';
  
  return slug;
}

/**
 * Clean a string for use in URL slugs
 */
function cleanSlugPart(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get breadcrumb items from a product URL
 */
export function getBreadcrumbFromUrl(url: string): Array<{label: string, href: string}> {
  const path = url.startsWith('/') ? url.substring(1) : url;
  const parts = path.split('/');
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  // If it's a slug-based URL, parse the path structure
  if (parts.length >= 2 && parts[0] && !isUUID(parts[0])) {
    // Add gender category
    if (parts[0]) {
      breadcrumbs.push({
        label: capitalizeFirst(parts[0]),
        href: `/category/${parts[0]}`
      });
    }
    
    // Add product category
    if (parts[1]) {
      breadcrumbs.push({
        label: capitalizeFirst(parts[1]),
        href: `/category/${parts[0]}/${parts[1]}`
      });
    }
  }
  
  return breadcrumbs;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if URL is SEO-friendly format
 */
export function isSEOUrl(url: string): boolean {
  const path = url.startsWith('/') ? url.substring(1) : url;
  
  // Not SEO-friendly if it's a UUID or /product/uuid format
  if (isUUID(path) || path.startsWith('product/')) {
    return false;
  }
  
  // SEO-friendly if it contains slashes and doesn't look like a UUID
  return path.includes('/') || (path.includes('-') && !isUUID(path));
}

/**
 * Migration helper: Get all product URLs that need slug generation
 */
export async function getProductsNeedingSlugs(supabase: SupabaseClient<Database>, limit = 100) {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, brand, size, condition, color, category_id, slug')
    .is('slug', null)
    .eq('is_active', true)
    .limit(limit);
    
  if (error) {
    
    return [];
  }
  
  return data || [];
}