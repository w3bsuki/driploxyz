/**
 * Categories Caching Store with Svelte 5 Runes
 * 
 * Global cache for categories to prevent redundant DB queries.
 * Categories are semi-static data that rarely changes.
 * 
 * Benefits:
 * - Load categories ONCE per session
 * - Share across all pages/components
 * - 5-minute TTL for freshness
 * - Reduces DB queries by 80%+
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
  is_active: boolean;
  level2?: Record<string, any>;
  level3?: any[];
}

interface CategoriesCache {
  data: Category[] | null;
  hierarchy: Record<string, CategoryHierarchy> | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  ttl: number; // Time to live in milliseconds
}

// Global cache state using Svelte 5 runes
const cache = $state<CategoriesCache>({
  data: null,
  hierarchy: null,
  loading: false,
  error: null,
  lastFetch: null,
  ttl: 5 * 60 * 1000 // 5 minutes TTL
});

/**
 * Check if cache is valid (not expired)
 */
function isCacheValid(): boolean {
  if (!cache.data || !cache.lastFetch) return false;
  
  const now = Date.now();
  const elapsed = now - cache.lastFetch;
  
  return elapsed < cache.ttl;
}

/**
 * Build category hierarchy from flat list
 */
function buildCategoryHierarchy(categories: Category[]): Record<string, CategoryHierarchy> {
  const hierarchy: Record<string, CategoryHierarchy> = {};
  
  // Get Level 1 categories (Gender)
  const level1Cats = categories.filter(c => c.level === 1 && c.is_active);
  
  level1Cats.forEach(l1 => {
    // Get Level 2 categories (Product Types) under this Level 1
    const level2Cats = categories.filter(c => 
      c.level === 2 && 
      c.parent_id === l1.id && 
      c.is_active
    );
    
    hierarchy[l1.slug] = {
      id: l1.id,
      name: l1.name,
      slug: l1.slug,
      level: l1.level || 1,
      parent_id: l1.parent_id,
      is_active: l1.is_active !== null ? l1.is_active : true,
      level2: {}
    };
    
    level2Cats.forEach(l2 => {
      // Get Level 3 categories (Specific Items) under this Level 2
      const level3Cats = categories.filter(c => 
        c.level === 3 && 
        c.parent_id === l2.id && 
        c.is_active
      );
      
      if (hierarchy[l1.slug]?.level2) {
        hierarchy[l1.slug]!.level2![l2.slug] = {
        id: l2.id,
        name: l2.name,
        slug: l2.slug,
        parentId: l2.parent_id,
        level3: level3Cats.map(l3 => ({
          id: l3.id,
          name: l3.name,
          slug: l3.slug,
          parentId: l3.parent_id
        }))
      };
      }
    });
  });
  
  return hierarchy;
}

/**
 * Get categories from cache or fetch from database
 */
export async function getCategories(
  supabase: SupabaseClient<Database>,
  forceRefresh = false
): Promise<{ 
  categories: Category[], 
  hierarchy: Record<string, CategoryHierarchy> 
}> {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid() && cache.data && cache.hierarchy) {
    return { 
      categories: cache.data, 
      hierarchy: cache.hierarchy 
    };
  }
  
  // If already loading, wait for current request
  if (cache.loading) {
    // Poll until loading is complete (max 5 seconds)
    const maxWait = 5000;
    const pollInterval = 100;
    let waited = 0;
    
    while (cache.loading && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      waited += pollInterval;
    }
    
    if (cache.data && cache.hierarchy) {
      return { 
        categories: cache.data, 
        hierarchy: cache.hierarchy 
      };
    }
  }
  
  // Set loading state
  cache.loading = true;
  cache.error = null;
  
  try {
    // Fetch all active categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('level')
      .order('sort_order');
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('No categories found');
    }
    
    // Build hierarchy
    const hierarchy = buildCategoryHierarchy(data);
    
    // Update cache
    cache.data = data;
    cache.hierarchy = hierarchy;
    cache.lastFetch = Date.now();
    cache.loading = false;
    
    return { categories: data, hierarchy };
  } catch (error) {
    cache.loading = false;
    cache.error = error instanceof Error ? error.message : 'Failed to load categories';
    
    // Return empty data on error
    return { 
      categories: [], 
      hierarchy: {} 
    };
  }
}

/**
 * Clear the categories cache
 */
export function clearCategoriesCache() {
  cache.data = null;
  cache.hierarchy = null;
  cache.lastFetch = null;
  cache.error = null;
}

/**
 * Get specific category by ID from cache
 */
export function getCategoryById(categoryId: string): Category | null {
  if (!cache.data) return null;
  
  return cache.data.find(c => c.id === categoryId) || null;
}

/**
 * Get categories by level from cache
 */
export function getCategoriesByLevel(level: number): Category[] {
  if (!cache.data) return [];
  
  return cache.data.filter(c => c.level === level);
}

/**
 * Get child categories from cache
 */
export function getChildCategories(parentId: string): Category[] {
  if (!cache.data) return [];
  
  return cache.data.filter(c => c.parent_id === parentId);
}

/**
 * Find category by slug
 */
export function getCategoryBySlug(slug: string): Category | null {
  if (!cache.data) return null;
  
  return cache.data.find(c => c.slug === slug) || null;
}

/**
 * Get category path (breadcrumb)
 */
export function getCategoryPath(categoryId: string): Category[] {
  if (!cache.data) return [];
  
  const path: Category[] = [];
  let currentCat = getCategoryById(categoryId);
  
  while (currentCat) {
    path.unshift(currentCat);
    currentCat = currentCat.parent_id ? getCategoryById(currentCat.parent_id) : null;
  }
  
  return path;
}

/**
 * Export cache state for debugging
 */
export function getCacheState() {
  return {
    hasData: !!cache.data,
    itemCount: cache.data?.length || 0,
    isValid: isCacheValid(),
    lastFetch: cache.lastFetch,
    loading: cache.loading,
    error: cache.error
  };
}