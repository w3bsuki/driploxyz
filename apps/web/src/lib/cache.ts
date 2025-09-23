import { invalidate } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

/**
 * Advanced cache system for SvelteKit 2 with modern performance optimizations
 * Implements memory caching, stale-while-revalidate, and intelligent cache warming
 */

export interface CacheStrategy {
  key: string;
  ttl?: number; // Time to live in seconds
  tags: string[]; // Cache tags for invalidation
  priority?: 'low' | 'medium' | 'high' | 'critical';
  staleWhileRevalidate?: number; // Additional time to serve stale content
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  hitCount: number;
  lastAccessed: number;
  staleWhileRevalidate?: number;
}

// In-memory cache with LRU eviction
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000; // Maximum number of entries
  private hitStats = { hits: 0, misses: 0 };

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.hitStats.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = age > entry.ttl * 1000;
    const isStale = entry.staleWhileRevalidate
      ? age > (entry.ttl + entry.staleWhileRevalidate) * 1000
      : isExpired;

    if (isStale) {
      this.cache.delete(key);
      this.hitStats.misses++;
      return null;
    }

    // Update access stats
    entry.hitCount++;
    entry.lastAccessed = now;
    this.hitStats.hits++;

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return { data: entry.data as T, isStale: isExpired };
  }

  set<T>(key: string, data: T, strategy: CacheStrategy): void {
    const now = Date.now();

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: strategy.ttl || 300, // Default 5 minutes
      tags: strategy.tags,
      priority: strategy.priority || 'medium',
      hitCount: 0,
      lastAccessed: now,
      staleWhileRevalidate: strategy.staleWhileRevalidate
    };

    this.cache.set(key, entry);
  }

  invalidateByTags(tags: string[]): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.hitStats.hits / (this.hitStats.hits + this.hitStats.misses) || 0,
      ...this.hitStats
    };
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    let lowestPriority = 'critical';

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize eviction by priority, then by last accessed time
      const priorityScore = { low: 0, medium: 1, high: 2, critical: 3 }[entry.priority] || 0;
      const priorityMap = { low: 0, medium: 1, high: 2, critical: 3 };
      const currentPriorityScore = priorityMap[lowestPriority as keyof typeof priorityMap] || 0;

      // Priority mapping moved inline above

      if (priorityScore < currentPriorityScore ||
          (priorityScore === currentPriorityScore && entry.lastAccessed < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.lastAccessed;
        lowestPriority = entry.priority;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Global cache instance
const memoryCache = new MemoryCache();

// Cache key generators with enhanced patterns and versioning
export const cacheKeys = {
  homepage: (country?: string) => `homepage:v2:${country || 'BG'}`,
  product: (id: string) => `product:v2:${id}`,
  productWithImages: (id: string) => `product:v2:${id}:images`,
  category: (slug: string) => `category:v2:${slug}`,
  categoryHierarchy: (country: string) => `categories:v2:hierarchy:${country}`,
  categoryProducts: (slug: string, filters?: string) => `category:v2:${slug}:products${filters ? `:${filters}` : ''}`,
  userProfile: (id: string) => `profile:v2:${id}`,
  sellerProducts: (sellerId: string, page?: number, cursor?: string) => {
    const base = `seller:v2:${sellerId}:products`;
    if (cursor) return `${base}:cursor:${cursor}`;
    if (page) return `${base}:p${page}`;
    return base;
  },
  productSearch: (query: string, filters?: string) => `search:v2:${encodeURIComponent(query)}${filters ? `:${filters}` : ''}`,
  searchResults: (params: string) => `search:v2:results:${params}`,
  featuredProducts: (country: string, limit: number) => `featured:v2:${country}:${limit}`,
  topSellers: (country: string) => `sellers:v2:top:${country}`,
  realtimeData: (userId: string, type: string) => `realtime:v2:${userId}:${type}`,
  // New streaming cache keys
  streamingData: (type: string, id: string) => `stream:v2:${type}:${id}`,
  performanceMetrics: (route: string) => `perf:v2:${route}`
} as const;

// Cache tags for enhanced invalidation patterns
export const cacheTags = {
  products: 'products',
  categories: 'categories',
  profiles: 'profiles',
  orders: 'orders',
  homepage: 'homepage',
  search: 'search',
  realtime: 'realtime',
  favorites: 'favorites',
  sellers: 'sellers'
} as const;

/**
 * Enhanced cache management with SvelteKit 2 streaming and stale-while-revalidate support
 */
export class CacheManager {
  /**
   * Get data from cache with SvelteKit 2 streaming and stale-while-revalidate support
   */
  static async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy
  ): Promise<T> {
    if (!browser) {
      // Server-side: always fetch fresh data but track for warming
      const data = await fetcher();
      // Warm the cache for subsequent client-side requests
      if (strategy.priority === 'critical' || strategy.priority === 'high') {
        // Use preload hint for critical data
        setTimeout(() => memoryCache.set(key, data, strategy), 0);
      }
      return data;
    }

    const cached = memoryCache.get<T>(key);

    if (cached) {
      if (!cached.isStale) {
        // Fresh data - log cache hit for metrics
        cacheMonitoring.logCacheHit(key);
        return cached.data;
      }

      // Stale data: serve stale, fetch fresh in background
      if (strategy.staleWhileRevalidate) {
        // Background revalidation without blocking
        Promise.resolve().then(async () => {
          try {
            const freshData = await fetcher();
            memoryCache.set(key, freshData, strategy);
          } catch (error) {
            // Silently handle background refresh failures
            console.debug(`Background cache refresh failed for ${key}:`, error);
          }
        });

        cacheMonitoring.logCacheHit(key);
        return cached.data;
      }
    }

    // No cached data or expired: fetch fresh
    cacheMonitoring.logCacheMiss(key);
    const freshData = await fetcher();
    memoryCache.set(key, freshData, strategy);
    return freshData;
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, strategy: CacheStrategy): void {
    if (browser) {
      memoryCache.set(key, data, strategy);
    }
  }

  /**
   * Invalidate cache by tags
   */
  static invalidateByTags(tags: string[]): void {
    if (browser) {
      memoryCache.invalidateByTags(tags);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    if (browser) {
      return memoryCache.getStats();
    }
    return { size: 0, hitRate: 0, hits: 0, misses: 0 };
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    if (browser) {
      memoryCache.clear();
    }
  }
}

/**
 * Optimized cache invalidation based on data changes
 */
export async function invalidateCache(tags: string[]) {
  // Invalidate memory cache
  CacheManager.invalidateByTags(tags);

  // Use targeted SvelteKit invalidation
  const invalidationMap: Record<string, string> = {
    'products': 'app:products',
    'categories': 'app:categories',
    'profiles': 'app:profiles',
    'orders': 'app:orders',
    'homepage': 'app:homepage',
    'search': 'app:search',
    'realtime': 'app:realtime',
    'favorites': 'app:favorites',
    'sellers': 'app:sellers'
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
    } catch {
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
    } catch {
      // Categories cache warming failed - not critical, continue silently
    }
  }
};

/**
 * Performance monitoring for cache effectiveness
 */
class CacheMonitoring {
  private metrics = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    hitsByKey: new Map<string, number>(),
    missByKey: new Map<string, number>()
  };

  logCacheHit(key: string) {
    this.metrics.hits++;
    this.metrics.hitsByKey.set(key, (this.metrics.hitsByKey.get(key) || 0) + 1);
  }

  logCacheMiss(key: string) {
    this.metrics.misses++;
    this.metrics.missByKey.set(key, (this.metrics.missByKey.get(key) || 0) + 1);
  }

  logCacheInvalidation(tags: string[]) {
    this.metrics.invalidations++;
    if (browser && tags.length > 10) {
      console.debug('Large cache invalidation:', tags.length, 'tags');
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
      topHitKeys: Array.from(this.metrics.hitsByKey.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topMissKeys: Array.from(this.metrics.missByKey.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };
  }

  reset() {
    this.metrics = {
      hits: 0,
      misses: 0,
      invalidations: 0,
      hitsByKey: new Map(),
      missByKey: new Map()
    };
  }
}

export const cacheMonitoring = new CacheMonitoring();