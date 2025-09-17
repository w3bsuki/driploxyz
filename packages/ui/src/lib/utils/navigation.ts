import type { Product } from '../types/product';

export interface Seller {
  username: string;
  id?: string;
}

export interface Collection {
  slug: string;
  id?: string;
}

export interface Brand {
  slug: string;
  name: string;
}

/**
 * Get URL for a product page
 * Follows the pattern: /product/{seller_username}/{product_slug}
 */
export function getProductUrl(product: Product): string {
  const sellerUsername = product.sellerName || 'unknown';
  const productSlug = product.slug || 'item';
  return `/product/${sellerUsername}/${productSlug}`;
}

/**
 * Get URL for a collection page
 * Follows the pattern: /collection/{collection_slug}
 */
export function getCollectionUrl(collection: Collection): string {
  return `/collection/${collection.slug}`;
}

/**
 * Get URL for a seller profile page
 * Follows the pattern: /sellers/{seller_username}
 */
export function getSellerUrl(seller: Seller): string {
  return `/sellers/${seller.username}`;
}

/**
 * Get URL for a brand page
 * Follows the pattern: /brands/{brand_slug}
 */
export function getBrandUrl(brand: Brand): string {
  return `/brands/${brand.slug}`;
}

/**
 * Get URL for a category page
 * Follows the pattern: /category/{...segments}
 */
export function getCategoryUrl(segments: string[]): string {
  const path = segments.filter(Boolean).join('/');
  return `/category/${path}`;
}

/**
 * Get URL for search results
 * Supports query and filter parameters
 */
export function getSearchUrl(query?: string, filters?: Record<string, any>): string {
  const params = new URLSearchParams();

  if (query) {
    params.set('q', query);
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  return `/search${queryString ? `?${queryString}` : ''}`;
}

/**
 * Get URL for dashboard with optional section
 * Follows the pattern: /dashboard/{section?}
 */
export function getDashboardUrl(section?: string): string {
  return section ? `/dashboard/${section}` : '/dashboard';
}

/**
 * Get URL for profile page
 * Follows the pattern: /profile/{profile_id}
 */
export function getProfileUrl(profileId: string): string {
  return `/profile/${profileId}`;
}

/**
 * Utility for handling product card clicks with analytics
 * Returns URL for navigation - parent component handles actual navigation
 */
export function handleProductClick(product: Product, source?: string): string {
  // Future: Add analytics tracking here
  // analytics.track('product_clicked', { product_id: product.id, source });

  return getProductUrl(product);
}

/**
 * Utility for handling search result clicks with analytics
 * Returns URL for navigation - parent component handles actual navigation
 */
export function handleSearchResultClick(result: any, query?: string, position?: number): string | undefined {
  // Future: Add analytics tracking here
  // analytics.track('search_result_clicked', {
  //   result_id: result.id,
  //   query,
  //   position
  // });

  if (result.type === 'product') {
    return getProductUrl(result);
  } else if (result.type === 'collection') {
    return getCollectionUrl(result);
  } else if (result.type === 'seller') {
    return getSellerUrl(result);
  }

  // Fallback - return the result's URL if available
  return result.url;
}

/**
 * Get clean URL for sharing or copying
 * Removes tracking parameters and normalizes the URL
 */
export function getCleanUrl(path: string, baseUrl?: string): string {
  const url = new URL(path, baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://example.com'));

  // Remove common tracking parameters
  const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
  trackingParams.forEach(param => url.searchParams.delete(param));

  return url.toString();
}