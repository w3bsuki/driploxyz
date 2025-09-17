import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Database } from '@repo/database';
import { canonicalizeFilterUrl, buildCanonicalUrl, searchParamsToSegments } from '$lib/utils/filter-url';

type Category = Database['public']['Tables']['categories']['Row'];

/**
 * Simple category resolution using basic queries
 * Much faster and easier to maintain than complex RPC functions
 */
async function resolveCategoryIds(supabase: any, category?: string, subcategory?: string, specific?: string): Promise<string[]> {
  try {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('is_active', true);

    if (specific) {
      // Looking for specific Level 3 category
      query = query.eq('slug', specific).eq('level', 3);
    } else if (subcategory) {
      // Looking for Level 2 category and its children
      const { data: subcatData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', subcategory)
        .eq('level', 2)
        .eq('is_active', true)
        .single();

      if (subcatData) {
        const { data: childrenData } = await supabase
          .from('categories')
          .select('id')
          .or(`id.eq.${subcatData.id},parent_id.eq.${subcatData.id}`)
          .eq('is_active', true);

        return (childrenData || []).map(cat => cat.id);
      }
      return [];
    } else if (category) {
      // Looking for Level 1 category and all its descendants
      const { data: mainCatData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .eq('level', 1)
        .eq('is_active', true)
        .single();

      if (mainCatData) {
        // Get all children and grandchildren
        const { data: allDescendants } = await supabase
          .from('categories')
          .select('id')
          .or(`id.eq.${mainCatData.id},parent_id.eq.${mainCatData.id}`)
          .eq('is_active', true);

        const allIds = (allDescendants || []).map(cat => cat.id);

        // Also get grandchildren (Level 3)
        if (allIds.length > 1) {
          const level2Ids = allIds.filter(id => id !== mainCatData.id);
          const { data: grandchildren } = await supabase
            .from('categories')
            .select('id')
            .in('parent_id', level2Ids)
            .eq('is_active', true);

          allIds.push(...(grandchildren || []).map(cat => cat.id));
        }

        return allIds;
      }
      return [];
    }

    const { data } = await query;
    return (data || []).map(cat => cat.id);
  } catch (err) {
    if (dev) console.warn('Category resolution failed:', err);
    return [];
  }
}

/**
 * Build simple category hierarchy for UI
 */
function buildCategoryHierarchy(categories: Category[]) {
  const hierarchy: Record<string, any> = {};
  const level1Map = new Map<string, any>();
  const level2Map = new Map<string, any>();

  // Build level 1 categories
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

  // Build level 2 categories
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

  // Build level 3 categories
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
    // Simple parallel queries for categories and filtering
    const [categoriesResult, categoryCountsResult] = await Promise.all([
      // Query 1: Fetch all categories for hierarchy
      locals.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('level')
        .order('sort_order'),

      // Query 2: Get real category product counts
      locals.supabase.rpc('get_category_product_counts', {
        p_country_code: country
      })
    ]);

    const { data: allCategories } = categoriesResult;
    const { data: categoryCountsData } = categoryCountsResult;

    // Resolve category IDs for filtering (if any category filters are applied)
    let categoryIds: string[] = [];
    if ((category && category !== 'all') || (subcategory && subcategory !== 'all') || (specific && specific !== 'all')) {
      categoryIds = await resolveCategoryIds(locals.supabase, category, subcategory, specific);
    }

    // Category IDs already resolved above

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

    // Build simple 3-level hierarchy for UI
    const categoryHierarchy = allCategories ? buildCategoryHierarchy(allCategories as Category[]) : {};

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

    // Build real category product counts from our new function
    const categoryProductCounts: Record<string, number> = {};
    if (categoryCountsData) {
      categoryCountsData.forEach((row: any) => {
        if (row.category_level === 1) { // Only top-level categories for main pills
          categoryProductCounts[row.category_slug] = row.product_count || 0;
        }
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