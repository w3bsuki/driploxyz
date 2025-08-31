import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load = (async ({ params, url, locals: { supabase, country } }) => {
  const { slug } = params;
  const currentCountry = country || 'BG';
  const services = createServices(supabase, null);

  try {
    // Get category by slug first (required for other queries)
    const { data: category, error: categoryError } = await services.categories.getCategoryBySlug(slug);
    
    if (categoryError || !category) {
      throw error(404, 'Category not found');
    }

    // Parse query parameters for filtering and pagination
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 24;
    const offset = (page - 1) * limit;

    // Build hierarchical filters from query parameters
    const hierarchicalFilters: any = {
      category_id: category.id,
      include_descendants: true, // Always include subcategories
      country_code: currentCountry
    };

    if (searchParams.get('min_price')) {
      hierarchicalFilters.min_price = parseFloat(searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      hierarchicalFilters.max_price = parseFloat(searchParams.get('max_price')!);
    }
    if (searchParams.get('condition')) {
      hierarchicalFilters.conditions = searchParams.getAll('condition');
    }
    if (searchParams.get('size')) {
      hierarchicalFilters.sizes = searchParams.getAll('size');
    }
    if (searchParams.get('brand')) {
      hierarchicalFilters.brands = searchParams.getAll('brand');
    }

    // Get sort options
    const sortBy = (searchParams.get('sort') || 'created_at') as any;
    const sortDirection = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    const sort = { by: sortBy, direction: sortDirection };

    // Use parallel promises for better performance
    const [
      productsResult,
      breadcrumbResult,
      subcategoriesResult,
      level3CategoriesResult,
      sellersResult
    ] = await Promise.allSettled([
      // Get products using hierarchical filtering
      services.products.getProductsForCategoryLevel(
        category.id,
        category.level || 1,
        hierarchicalFilters,
        sort,
        limit,
        offset
      ),
      
      // Get breadcrumb trail
      services.categories.getCompleteBreadcrumb(category.id),
      
      // Get direct children (subcategories) with counts
      getSubcategoriesWithCounts(services, category.id, currentCountry),
      
      // Get level 3 categories for pills
      getLevel3CategoriesForPills(services, supabase, category, currentCountry),
      
      // Get sellers in this category
      getSellersInCategory(supabase, category.id, currentCountry)
    ]);

    // Extract results with error handling
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [];
    const total = productsResult.status === 'fulfilled' ? productsResult.value.total || 0 : 0;
    const breadcrumb = breadcrumbResult.status === 'fulfilled' ? breadcrumbResult.value.data || [] : [];
    const subcategories = subcategoriesResult.status === 'fulfilled' ? subcategoriesResult.value || [] : [];
    const level3Categories = level3CategoriesResult.status === 'fulfilled' ? level3CategoriesResult.value || [] : [];
    const sellers = sellersResult.status === 'fulfilled' ? sellersResult.value || [] : [];

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      category,
      breadcrumb,
      subcategories,
      level3Categories,
      products,
      sellers,
      pagination: {
        page,
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit
      },
      filters: {
        min_price: hierarchicalFilters.min_price,
        max_price: hierarchicalFilters.max_price,
        conditions: hierarchicalFilters.conditions || [],
        sizes: hierarchicalFilters.sizes || [],
        brands: hierarchicalFilters.brands || [],
        sort: sortBy,
        order: sortDirection
      }
    };
  } catch (err) {
    console.error('Category page load error:', err);
    throw error(500, 'Failed to load category');
  }
}) satisfies PageServerLoad;

/**
 * Get subcategories with hierarchical product counts
 */
async function getSubcategoriesWithCounts(services: any, categoryId: string, countryCode: string) {
  const { data: subcategories, error } = await services.categories.getSubcategories(categoryId);
  
  if (error || !subcategories?.length) {
    return [];
  }

  // Get hierarchical product counts for each subcategory
  const subcategoriesWithCounts = await Promise.all(
    subcategories.map(async (subcat: any) => {
      const { count } = await services.categories.getHierarchicalProductCount(subcat.id);
      return {
        ...subcat,
        productCount: count
      };
    })
  );

  return subcategoriesWithCounts
    .filter((cat: any) => cat.productCount > 0)
    .sort((a: any, b: any) => b.productCount - a.productCount);
}

/**
 * Get level 3 categories for dynamic pills based on current category level
 */
async function getLevel3CategoriesForPills(services: any, supabase: any, category: any, countryCode: string) {
  let level3Categories: any[] = [];

  if (category.level === 2) {
    // Level 2 page: Get direct children (level 3)
    const { data: level3Data } = await services.categories.getSubcategories(category.id);
    level3Categories = level3Data || [];
  } else if (category.level === 1) {
    // Level 1 page: Get ALL level 3 categories under all level 2 children
    const { data: level2Categories } = await services.categories.getSubcategories(category.id);
    
    if (level2Categories?.length) {
      const level3Promises = level2Categories.map(async (l2cat: any) => {
        const { data: level3Data } = await services.categories.getSubcategories(l2cat.id);
        return level3Data || [];
      });
      
      const allLevel3Arrays = await Promise.all(level3Promises);
      level3Categories = allLevel3Arrays.flat();
    }
  }

  // Get product counts for level 3 categories using hierarchical counting
  if (level3Categories.length > 0) {
    const categoriesWithCounts = await Promise.all(
      level3Categories.map(async (l3cat: any) => {
        const { count } = await services.products.getCategoryProductCount(l3cat.id);
        return {
          ...l3cat,
          productCount: count
        };
      })
    );

    return categoriesWithCounts
      .filter((cat: any) => cat.productCount > 0)
      .sort((a: any, b: any) => b.productCount - a.productCount);
  }

  return [];
}

/**
 * Get sellers who have products in this category (hierarchical)
 */
async function getSellersInCategory(supabase: any, categoryId: string, countryCode: string) {
  try {
    // Get product IDs in category tree
    const { data: productIds, error: productIdsError } = await supabase.rpc('get_products_in_category_tree', {
      category_uuid: categoryId
    });

    if (productIdsError || !productIds?.length) {
      return [];
    }

    const ids = productIds.map((p: any) => p.product_id);

    // Get sellers for these products
    const { data: categorySellers, error: sellersError } = await supabase
      .from('products')
      .select(`
        seller_id,
        seller:profiles!seller_id (
          id,
          username,
          avatar_url,
          created_at
        )
      `)
      .in('id', ids)
      .eq('is_active', true)
      .eq('is_sold', false)
      .eq('country_code', countryCode)
      .not('seller_id', 'is', null);

    if (sellersError || !categorySellers) {
      return [];
    }

    // Process sellers to get unique list with item counts
    const sellersMap = new Map();
    categorySellers.forEach((item: any) => {
      if (item.seller_id && item.seller) {
        if (!sellersMap.has(item.seller_id)) {
          sellersMap.set(item.seller_id, {
            id: item.seller_id,
            username: item.seller.username || 'Unknown',
            avatar_url: item.seller.avatar_url || '/default-avatar.png',
            created_at: item.seller.created_at,
            itemCount: 0
          });
        }
        sellersMap.get(item.seller_id).itemCount++;
      }
    });

    return Array.from(sellersMap.values())
      .sort((a: any, b: any) => {
        // Prioritize new sellers (1 item) first
        if (a.itemCount === 1 && b.itemCount > 1) return -1;
        if (b.itemCount === 1 && a.itemCount > 1) return 1;
        // Then sort by most recent activity
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  } catch (error) {
    console.error('Error getting sellers in category:', error);
    return [];
  }
}