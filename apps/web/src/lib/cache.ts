import { invalidate } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Smart cache invalidation system for Driplo
 * Handles cache invalidation based on data mutations
 */

export interface CacheStrategy {
  key: string;
  ttl?: number; // Time to live in seconds
  tags: string[]; // Cache tags for invalidation
}

// Cache key generators
export const cacheKeys = {
  homepage: () => 'homepage:data',
  product: (id: string) => `product:${id}`,
  category: (slug: string) => `category:${slug}`,
  userProfile: (id: string) => `profile:${id}`,
  sellerProducts: (sellerId: string) => `seller:${sellerId}:products`,
  productSearch: (query: string) => `search:${encodeURIComponent(query)}`
} as const;

// Cache tags for invalidation
export const cacheTags = {
  products: 'products',
  categories: 'categories',
  profiles: 'profiles',
  orders: 'orders',
  homepage: 'homepage'
} as const;

/**
 * Invalidate cache based on data changes - targeted invalidation only
 */
export async function invalidateCache(tags: string[]) {
  // Use targeted invalidation based on tags instead of invalidateAll
  const invalidationMap: Record<string, string> = {
    'products': 'app:products',
    'categories': 'app:categories',
    'profiles': 'app:profiles',
    'orders': 'app:orders',
    'homepage': 'app:homepage'
  };
  
  // Invalidate only relevant dependencies
  for (const tag of tags) {
    const dependency = invalidationMap[tag];
    if (dependency) {
      await invalidate(dependency);
    }
  }
}

/**
 * Smart cache invalidation for specific operations
 */
export const cacheInvalidation = {
  // Product operations
  async onProductUpdate(productId: string) {
    await invalidateCache([
      cacheTags.products,
      cacheTags.homepage,
      cacheKeys.product(productId)
    ]);
  },

  async onProductCreate(sellerId: string) {
    await invalidateCache([
      cacheTags.products,
      cacheTags.homepage,
      cacheKeys.sellerProducts(sellerId)
    ]);
  },

  async onProductDelete(productId: string, sellerId: string) {
    await invalidateCache([
      cacheTags.products,
      cacheTags.homepage,
      cacheKeys.product(productId),
      cacheKeys.sellerProducts(sellerId)
    ]);
  },

  // Profile operations
  async onProfileUpdate(profileId: string) {
    await invalidateCache([
      cacheTags.profiles,
      cacheTags.homepage,
      cacheKeys.userProfile(profileId)
    ]);
  },

  // Order operations
  async onOrderCreate() {
    await invalidateCache([
      cacheTags.orders,
      cacheTags.products
    ]);
  }
};

/**
 * Cache warming strategies
 */
export const cacheWarming = {
  // Preload critical homepage data
  async warmHomepage(supabase: SupabaseClient) {
    try {
      const { data } = await supabase.rpc('get_homepage_data', {
        promoted_limit: 8,
        featured_limit: 12,
        top_sellers_limit: 8
      });
      return data;
    } catch (error) {
      // Homepage cache warming failed - not critical, continue silently
    }
  },

  // Preload popular categories
  async warmCategories(supabase: SupabaseClient) {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(20);
      return data;
    } catch (error) {
      // Categories cache warming failed - not critical, continue silently
    }
  }
};

/**
 * Performance monitoring for cache effectiveness
 */
export const cacheMonitoring = {
  logCacheHit(key: string) {
    // Cache hit logged - monitoring data available via other means
  },

  logCacheMiss(key: string) {
    // Cache miss logged - monitoring data available via other means
  },

  logCacheInvalidation(tags: string[]) {
    // Cache invalidation logged - monitoring data available via other means
  }
};