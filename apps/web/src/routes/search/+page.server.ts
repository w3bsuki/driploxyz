import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Database } from '@repo/database';
import { canonicalizeFilterUrl, buildCanonicalUrl, searchParamsToSegments } from '$lib/utils/filter-url';

type Category = Database['public']['Tables']['categories']['Row'];

// Optimized cache for category hierarchy with longer TTL
const categoryHierarchyCache = new Map<string, { data: Record<string, any>; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - longer cache for better performance

/**
 * Optimized category resolution using new database functions
 * Reduces queries from 15+ to 1-2 maximum
 */
async function resolveCategoryIds(supabase: any, category: string, subcategory?: string, specific?: string): Promise<string[]> {
  try {
    // Use the optimized database function that resolves everything in a single query
    const { data, error } = await supabase.rpc('resolve_category_path', {
      level1_slug: category || null,
      level2_slug: subcategory || null,
      level3_slug: specific || null
    });

    if (error) {
      if (dev) console.warn('Category resolution RPC failed:', error);
      return [];
    }

    if (data && data.length > 0) {
      const result = data[0];
      if (result.is_valid && result.resolved_category_ids) {
        return result.resolved_category_ids;
      }
    }
  } catch (err) {
    if (dev) console.warn('Category resolution failed:', err);
  }

  return [];
}

/**
 * Optimized cross-gender category lookup using new database function
 */
async function getCrossGenderCategoryIds(supabase: any, categoryName: string, level: number = 2): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_cross_gender_categories', {
      category_name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      category_level: level
    });

    if (error) {
      if (dev) console.warn('Cross-gender category lookup failed:', error);
      return [];
    }

    return (data || []).map((item: any) => item.category_id);
  } catch (err) {
    if (dev) console.warn('Cross-gender category lookup error:', err);
    return [];
  }
}

/**
 * Build optimized category hierarchy using materialized view data
 */
function buildOptimizedCategoryHierarchy(categories: Category[]) {
  // Create cache key based on categories count and first/last timestamps
  const firstCat = categories[0];
  const lastCat = categories[categories.length - 1];
  const cacheKey = `hierarchy_optimized_${categories.length}_${firstCat?.updated_at || firstCat?.created_at}_${lastCat?.updated_at || lastCat?.created_at}`;
  const cached = categoryHierarchyCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const hierarchy: Record<string, any> = {};

  // Build hierarchy efficiently with single pass
  const level1Map = new Map<string, any>();
  const level2Map = new Map<string, any>();

  // First pass: build level 1 categories
  categories.filter(c => c.level === 1 && c.is_active).forEach(l1 => {
    const l1Data = {
      id: l1.id,
      name: l1.name,
      slug: l1.slug,
      level2: {}
    };
    hierarchy[l1.slug] = l1Data;
    level1Map.set(l1.id, l1Data);
  });

  // Second pass: build level 2 categories
  categories.filter(c => c.level === 2 && c.is_active).forEach(l2 => {
    const parent = level1Map.get(l2.parent_id!);
    if (parent) {
      const l2Data = {
        id: l2.id,
        name: l2.name,
        slug: l2.slug,
        parentId: l2.parent_id,
        level3: []
      };
      parent.level2[l2.slug] = l2Data;
      level2Map.set(l2.id, l2Data);
    }
  });

  // Third pass: build level 3 categories
  categories.filter(c => c.level === 3 && c.is_active).forEach(l3 => {
    const parent = level2Map.get(l3.parent_id!);
    if (parent) {
      parent.level3.push({
        id: l3.id,
        name: l3.name,
        slug: l3.slug,
        parentId: l3.parent_id
      });
    }
  });

  // Cache the result
  categoryHierarchyCache.set(cacheKey, {
    data: hierarchy,
    timestamp: Date.now()
  });

  return hierarchy;
}

export const load = (async ({ url, locals, setHeaders }) => {
  const country = locals.country || 'BG';
  
  // Check if this is a legacy category hierarchy pattern in search
  const searchParams = url.searchParams;
  const hasLegacyCategoryParams = searchParams.has('category') && (searchParams.has('subcategory') || searchParams.has('specific'));
  
  if (hasLegacyCategoryParams) {
    // Convert to new hierarchical route
    const result = searchParamsToSegments(searchParams);
    if (result.needsRedirect && result.canonicalPath) {
      const newUrl = result.canonicalPath + (result.searchParams.toString() ? `?${result.searchParams.toString()}` : '');
      throw redirect(301, newUrl);
    }
  }
  
  // Handle other legacy URL parameters and redirect if needed
  const urlResult = canonicalizeFilterUrl(url);
  if (urlResult.needsRedirect) {
    const canonicalUrl = buildCanonicalUrl(url, urlResult.canonical);
    throw redirect(301, canonicalUrl);
  }
  
  // Set optimized cache headers for better performance
  setHeaders({
    'cache-control': 'public, max-age=120, s-maxage=300', // Cache for 2 min client, 5 min CDN
    'vary': 'Accept-Encoding' // Enable compression
  });
  
  // Parse all URL parameters
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = 50; // Reasonable page size
  
  // Category hierarchy parameters - canonical names only
  // Level 1: Gender (women/men/kids/unisex)
  const category = url.searchParams.get('category') || '';
  // Level 2: Product Type (clothing/shoes/bags/accessories)
  const subcategory = url.searchParams.get('subcategory') || '';
  // Level 3: Specific Item (t-shirts/dresses/sneakers/etc)
  const specific = url.searchParams.get('specific') || '';
  
  // Other filters
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  try {
    // Optimized: Use PARALLEL queries to fetch data efficiently
    const [categoriesResult, categoryIdsResult] = await Promise.all([
      // Query 1: Fetch all categories for hierarchy (cached in materialized view)
      locals.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('level')
        .order('sort_order'),

      // Query 2: Resolve category IDs efficiently using new database functions
      (() => {
        if (category && category !== 'all') {
          // Handle cross-gender searches for known Level 2 categories
          if (!subcategory && (category === 'accessories' || category === 'clothing' || category === 'shoes' || category === 'bags')) {
            return getCrossGenderCategoryIds(locals.supabase, category, 2);
          }
          // Standard hierarchical resolution
          return resolveCategoryIds(locals.supabase, category, subcategory, specific);
        } else if (subcategory && subcategory !== 'all') {
          // Cross-gender Level 2 search
          return getCrossGenderCategoryIds(locals.supabase, subcategory, 2);
        } else if (specific && specific !== 'all') {
          // Direct Level 3 search
          return getCrossGenderCategoryIds(locals.supabase, specific, 3);
        }
        return Promise.resolve([]);
      })()
    ]);

    const { data: allCategories } = categoriesResult;
    let categoryIds = await categoryIdsResult;

    // Build the products query with proper category hierarchy
    let productsQuery = locals.supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        brand,
        size,
        condition,
        location,
        created_at,
        seller_id,
        category_id,
        country_code,
        slug,
        product_images (
          image_url
        ),
        profiles!products_seller_id_fkey (
          username,
          avatar_url,
          account_type
        ),
        categories!inner (
          id,
          name,
          slug,
          parent_id,
          level
        )
      `, { count: 'exact' })
      .eq('is_sold', false)
      .eq('is_active', true)
      .eq('country_code', country);

    // Apply category filter
    if (categoryIds.length > 0) {
      productsQuery = productsQuery.in('category_id', categoryIds);
    }

    // Apply search query
    if (query && query.trim()) {
      productsQuery = productsQuery.ilike('title', `%${query}%`);
    }

    // Apply price filters
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        productsQuery = productsQuery.gte('price', min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        productsQuery = productsQuery.lte('price', max);
      }
    }

    // Apply other filters
    if (condition && condition !== 'all') {
      const validConditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'] as const;
      if (validConditions.includes(condition as any)) {
        productsQuery = productsQuery.eq('condition', condition as typeof validConditions[number]);
      }
    }

    if (brand && brand !== 'all') {
      productsQuery = productsQuery.ilike('brand', `%${brand}%`);
    }

    if (size && size !== 'all') {
      productsQuery = productsQuery.eq('size', size);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        productsQuery = productsQuery.order('price', { ascending: true });
        break;
      case 'price-high':
        productsQuery = productsQuery.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        productsQuery = productsQuery.order('created_at', { ascending: false });
        break;
    }

    // Execute query with pagination and count
    const offset = (page - 1) * pageSize;
    productsQuery = productsQuery
      .range(offset, offset + pageSize - 1);
    const { data: products, error: productsError, count } = await productsQuery;

    if (productsError) {
      if (dev) console.error('Products query error:', productsError);
      return {
        products: [],
        categories: [],
        categoryHierarchy: {},
        searchQuery: query,
        total: 0,
        error: 'Search failed. Please try again.',
        filters: {
          category: category,
          subcategory: subcategory,
          specific: specific,
          minPrice,
          maxPrice,
          condition,
          brand,
          size,
          sortBy
        }
      };
    }

    // Build optimized 3-level hierarchy for UI using efficient algorithm
    const categoryHierarchy = allCategories ? buildOptimizedCategoryHierarchy(allCategories as Category[]) : {};

    // Category hierarchy built successfully

    // Get Level 1 categories for pills
    const level1Categories = allCategories?.filter(c => c.level === 1) || [];
    
    // Sort by predefined order
    const categoryOrder = ['Women', 'Men', 'Kids', 'Unisex'];
    const sortedCategories = level1Categories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.name);
      const bIndex = categoryOrder.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Optimized product transformation using efficient lookups
    const categoryLookup = new Map<string, Category>();
    allCategories?.forEach(cat => categoryLookup.set(cat.id, cat));

    const transformedProducts = (products || []).map(product => {
      let mainCategoryName = '';
      let subcategoryName = '';
      let specificCategoryName = '';

      if (product.categories) {
        const category = product.categories;

        if (category.level === 1) {
          mainCategoryName = category.name;
        } else if (category.level === 2) {
          subcategoryName = category.name;
          const parentCat = categoryLookup.get(category.parent_id!);
          if (parentCat) mainCategoryName = parentCat.name;
        } else if (category.level === 3) {
          specificCategoryName = category.name;
          const parentCat = categoryLookup.get(category.parent_id!);
          if (parentCat) {
            subcategoryName = parentCat.name;
            const grandparentCat = categoryLookup.get(parentCat.parent_id!);
            if (grandparentCat) mainCategoryName = grandparentCat.name;
          }
        }
      }

      return {
        ...product,
        images: product.product_images?.map((img: any) => img.image_url) || [],
        seller: product.profiles ? {
          id: product.seller_id,
          username: product.profiles.username,
          avatar_url: product.profiles.avatar_url,
          account_type: product.profiles.account_type
        } : null,
        category: product.categories || null,
        main_category_name: mainCategoryName || null,
        category_name: mainCategoryName || null, // For backward compatibility
        subcategory_name: subcategoryName || null,
        specific_category_name: specificCategoryName || null
      };
    });

    // Get real category product counts using RPC function
    let categoryProductCounts: Record<string, number> = {};
    try {
      const { data: countData } = await locals.supabase.rpc('get_category_product_counts', {
        p_country_code: country
      });

      if (countData) {
        countData.forEach((row: any) => {
          if (row.category_level === 1) { // Only top-level categories
            categoryProductCounts[row.category_slug] = row.product_count || 0;
          }
        });
      }
    } catch (err) {
      if (dev) console.warn('Category counts RPC failed:', err);
      // Fallback to estimated counts
      const totalEstimate = count || 0;
      level1Categories.forEach(cat => {
        categoryProductCounts[cat.slug] = Math.floor(totalEstimate / level1Categories.length);
      });
    }

    return {
      products: transformedProducts,
      categories: sortedCategories,
      categoryHierarchy,
      categoryProductCounts,
      searchQuery: query,
      total: count || 0,
      hasMore: transformedProducts.length === pageSize, // Simple check for more results
      currentPage: page,
      pageSize,
      filters: {
        category: category,
        subcategory: subcategory,
        specific: specific,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };

  } catch (err) {
    if (dev) console.error('Search error:', err);
    throw error(500, 'Failed to load search results');
  }
}) satisfies PageServerLoad;