import { invalidateAll } from '$app/navigation';
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
 * Invalidate cache based on data changes
 */
export async function invalidateCache(tags: string[]) {
  console.log('[CACHE] Invalidating cache for tags:', tags);
  
  // Use SvelteKit's invalidation system
  await invalidateAll();
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
      console.log('[CACHE WARMING] Homepage data preloaded');
      return data;
    } catch (error) {
      console.error('[CACHE WARMING] Failed to warm homepage:', error);
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
      console.log('[CACHE WARMING] Categories data preloaded');
      return data;
    } catch (error) {
      console.error('[CACHE WARMING] Failed to warm categories:', error);
    }
  }
};

/**
 * Performance monitoring for cache effectiveness
 */
export const cacheMonitoring = {
  logCacheHit(key: string) {
    console.log(`[CACHE HIT] ${key}`);
  },

  logCacheMiss(key: string) {
    console.log(`[CACHE MISS] ${key}`);
  },

  logCacheInvalidation(tags: string[]) {
    console.log(`[CACHE INVALIDATION] Tags: ${tags.join(', ')}`);
  }
};