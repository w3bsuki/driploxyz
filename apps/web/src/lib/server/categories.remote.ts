// SvelteKit server-only category resolution utilities
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Category = Database['public']['Tables']['categories']['Row'];

export interface CategoryResolution {
  level: 1 | 2 | 3;
  l1?: Category;
  l2?: Category;
  l3?: Category;
  categoryIds: string[];
  canonicalPath: string;
  isValid: boolean;
  error?: string;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
  level: number;
}

export interface BreadcrumbResult {
  items: BreadcrumbItem[];
  jsonLd: any;
}

// Cache for category tree to avoid repeated DB queries
const categoryCache = new Map<string, { data: Category[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all categories with caching
 */
async function getCachedCategories(supabase: SupabaseClient<Database>): Promise<Category[]> {
  const cacheKey = 'all_categories';
  const cached = categoryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level')
    .order('sort_order')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categoriesData = categories || [];
  categoryCache.set(cacheKey, { data: categoriesData, timestamp: Date.now() });
  return categoriesData;
}

/**
 * Get clean slug for URL construction by removing parent prefixes
 */
function getCleanSlug(category: Category, parentCategory?: Category): string {
  if (!parentCategory || category.level === 1) {
    return category.slug;
  }
  
  // Remove parent prefix if present (e.g., "men-clothing" -> "clothing")
  const parentPrefix = `${parentCategory.slug}-`;
  if (category.slug.startsWith(parentPrefix)) {
    return category.slug.substring(parentPrefix.length);
  }
  
  return category.slug;
}

/**
 * Find category by slug, supporting both exact match and fuzzy matching
 */
function findCategoryBySlug(categories: Category[], slug: string, level?: number): Category | null {
  // First try exact slug match
  let category = categories.find(c => 
    c.slug === slug && 
    (level ? c.level === level : true) &&
    c.is_active
  );
  
  if (category) return category;
  
  // Try matching with parent prefix for L2/L3 categories
  if (level && level > 1) {
    const parentCategories = categories.filter(c => c.level === level - 1 && c.is_active);
    for (const parent of parentCategories) {
      const prefixedSlug = `${parent.slug}-${slug}`;
      category = categories.find(c => 
        c.slug === prefixedSlug && 
        c.level === level &&
        c.is_active
      );
      if (category) return category;
    }
  }
  
  // Then try name-based matching (case-insensitive)
  const searchName = slug.replace(/-/g, ' ').toLowerCase();
  category = categories.find(c => 
    c.name.toLowerCase() === searchName &&
    (level ? c.level === level : true) &&
    c.is_active
  );
  
  if (category) return category;
  
  // Finally try partial name matching
  return categories.find(c => 
    c.name.toLowerCase().includes(searchName) &&
    (level ? c.level === level : true) &&
    c.is_active
  ) || null;
}

/**
 * Get all descendants of a category using existing RPC function
 */
async function getCategoryDescendants(supabase: SupabaseClient<Database>, categoryId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_category_descendants', {
      category_id: categoryId
    });

    if (error) {
      console.error('Error getting category descendants:', error);
      return [categoryId];
    }

    const descendantIds = data?.map((d: any) => d.id) || [];
    return descendantIds; // RPC already includes self + descendants
  } catch (error) {
    console.error('Error in getCategoryDescendants:', error);
    return [categoryId];
  }
}

/**
 * Server function to resolve category path segments into category data and IDs
 */
export async function resolveCategoryPath(
  segments: string[],
  supabase: SupabaseClient<Database>
): Promise<CategoryResolution> {
  try {
    if (!segments || segments.length === 0) {
      return {
        level: 1,
        categoryIds: [],
        canonicalPath: '/category',
        isValid: false,
        error: 'No segments provided'
      };
    }

    const categories = await getCachedCategories(supabase);
    
    if (categories.length === 0) {
      return {
        level: 1,
        categoryIds: [],
        canonicalPath: '/category',
        isValid: false,
        error: 'No categories found'
      };
    }

    const [l1Slug, l2Slug, l3Slug] = segments;
    
    // Find Level 1 category (Gender: women, men, kids, unisex)
    const l1Category = findCategoryBySlug(categories, l1Slug || '', 1);
    
    if (!l1Category) {
      return {
        level: 1,
        categoryIds: [],
        canonicalPath: '/category',
        isValid: false,
        error: `Level 1 category '${l1Slug}' not found`
      };
    }

    // If only L1 provided
    if (segments.length === 1) {
      const categoryIds = await getCategoryDescendants(supabase, l1Category.id);
      return {
        level: 1,
        l1: l1Category,
        categoryIds,
        canonicalPath: `/category/${l1Category.slug}`,
        isValid: true
      };
    }

    // Find Level 2 category (Product Type: clothing, shoes, accessories, bags)
    const l2Categories = categories.filter(c => 
      c.level === 2 && 
      c.parent_id === l1Category.id && 
      c.is_active
    );
    
    const l2Category = l2Categories.find(c => 
      findCategoryBySlug([c], l2Slug || '') !== null
    );

    if (!l2Category) {
      // L2 not found under L1, return L1 with error
      const categoryIds = await getCategoryDescendants(supabase, l1Category.id);
      return {
        level: 1,
        l1: l1Category,
        categoryIds,
        canonicalPath: `/category/${l1Category.slug}`,
        isValid: false,
        error: `Level 2 category '${l2Slug}' not found under '${l1Slug}'`
      };
    }

    // If only L1 and L2 provided
    if (segments.length === 2) {
      const categoryIds = await getCategoryDescendants(supabase, l2Category.id);
      return {
        level: 2,
        l1: l1Category,
        l2: l2Category,
        categoryIds,
        canonicalPath: `/category/${l1Category.slug}/${getCleanSlug(l2Category, l1Category)}`,
        isValid: true
      };
    }

    // Find Level 3 category (Specific Items: t-shirts, dresses, sneakers, etc.)
    const l3Categories = categories.filter(c => 
      c.level === 3 && 
      c.parent_id === l2Category.id && 
      c.is_active
    );
    
    const l3Category = l3Categories.find(c => 
      findCategoryBySlug([c], l3Slug || '') !== null
    );

    if (!l3Category) {
      // L3 not found under L2, return L2 with error
      const categoryIds = await getCategoryDescendants(supabase, l2Category.id);
      return {
        level: 2,
        l1: l1Category,
        l2: l2Category,
        categoryIds,
        canonicalPath: `/category/${l1Category.slug}/${getCleanSlug(l2Category, l1Category)}`,
        isValid: false,
        error: `Level 3 category '${l3Slug}' not found under '${l1Slug}/${l2Slug}'`
      };
    }

    // All levels found
    const categoryIds = [l3Category.id]; // L3 is leaf, no descendants needed
    return {
      level: 3,
      l1: l1Category,
      l2: l2Category,
      l3: l3Category,
      categoryIds,
      canonicalPath: `/category/${l1Category.slug}/${getCleanSlug(l2Category, l1Category)}/${getCleanSlug(l3Category, l2Category)}`,
      isValid: true
    };

  } catch (error) {
    console.error('Error in resolveCategoryPath:', error);
    return {
      level: 1,
      categoryIds: [],
      canonicalPath: '/category',
      isValid: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Server function to build breadcrumbs for category path
 */
export async function getCategoryBreadcrumbs(
  segments: string[],
  supabase: SupabaseClient<Database>
): Promise<BreadcrumbResult> {
  try {
    const resolution = await resolveCategoryPath(segments, supabase);
    
    const items: BreadcrumbItem[] = [
      { name: 'Home', href: '/', level: 0 }
    ];

    if (resolution.l1) {
      items.push({
        name: resolution.l1.name,
        href: `/category/${resolution.l1.slug}`,
        level: 1
      });
    }

    if (resolution.l2) {
      items.push({
        name: resolution.l2.name,
        href: `/category/${resolution.l1!.slug}/${resolution.l2.slug}`,
        level: 2
      });
    }

    if (resolution.l3) {
      items.push({
        name: resolution.l3.name,
        href: `/category/${resolution.l1!.slug}/${resolution.l2!.slug}/${resolution.l3.slug}`,
        level: 3
      });
    }

    // Generate JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.href === '/' ? 'https://driplo.com/' : `https://driplo.com${item.href}`
      }))
    };

    return { items, jsonLd };
  } catch (error) {
    console.error('Error in getCategoryBreadcrumbs:', error);
    return {
      items: [{ name: 'Home', href: '/', level: 0 }],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://driplo.com/'
        }]
      }
    };
  }
}