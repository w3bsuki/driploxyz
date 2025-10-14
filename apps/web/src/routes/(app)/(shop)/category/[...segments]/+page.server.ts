import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProductDomainAdapter } from '@repo/core/services';
// TODO: CategoryDomainAdapter needs to be implemented or removed
import type { Database } from '@repo/database';

export const load = (async ({ params, url, locals: { country, supabase }, setHeaders }) => {
  const currentCountry = country || 'BG';

  // Set cache headers for better performance
  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=300' // 1min client, 5min CDN
  });

  // Initialize domain adapters
  const productAdapter = new ProductDomainAdapter(supabase);
  // TODO: CategoryDomainAdapter needs to be implemented or removed
  // const categoryAdapter = new CategoryDomainAdapter(supabase);

  try {
    const segments = (params.segments || '').split('/').filter(Boolean);

    // TODO: Implement category resolution without CategoryDomainAdapter
    // Fallback: Simple resolution object
    const resolution = {
      categoryIds: [],
      canonicalPath: null,
      isVirtual: true,
      l1: null,
      l2: null,
      l3: null
    };

    // Check if current path matches canonical path (for redirects)
    const currentPath = `/category/${segments.join('/')}`;
    if (resolution.canonicalPath && resolution.canonicalPath !== currentPath) {
      // Only redirect if the canonical path is actually different and non-empty
      // This prevents redirect loops
      if (resolution.canonicalPath !== '/' && resolution.canonicalPath !== '/category') {
        const redirectUrl = resolution.canonicalPath + (url.search ? `?${url.search}` : '');

        redirect(301, redirectUrl);
      }
    }

    // TODO: Generate breadcrumbs without CategoryDomainAdapter
    const breadcrumbsResult = {
      items: [],
      jsonLd: {}
    };

    // Parse query parameters for filtering and pagination
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 24;

    // Build hierarchical filters from the resolved categories
    const hierarchicalFilters: {
      country_code: string;
      category_ids?: string[];
      showEmptyFallback?: boolean;
      min_price?: number;
      max_price?: number;
      conditions?: Database['public']['Enums']['product_condition'][];
      sizes?: string[];
      brands?: string[];
      subcategory_slug?: string;
    } = {
      country_code: currentCountry
    };

    // Apply category filtering with empty result guard
    if (resolution.categoryIds.length > 0) {
      hierarchicalFilters.category_ids = resolution.categoryIds;
    } else {
      // Guard against empty categoryIds - show newest products as fallback
      hierarchicalFilters.showEmptyFallback = true;
    }

    // Apply additional filters from URL
    if (searchParams.get('min_price')) {
      hierarchicalFilters.min_price = parseFloat(searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      hierarchicalFilters.max_price = parseFloat(searchParams.get('max_price')!);
    }
    if (searchParams.get('condition')) {
      hierarchicalFilters.conditions = searchParams.getAll('condition') as Database['public']['Enums']['product_condition'][];
    }
    if (searchParams.get('size')) {
      hierarchicalFilters.sizes = searchParams.getAll('size');
    }
    if (searchParams.get('brand')) {
      hierarchicalFilters.brands = searchParams.getAll('brand');
    }
    
    // Handle subcategory filter for virtual categories (e.g., ?subcategory=sneakers)
    if (resolution.isVirtual && searchParams.get('subcategory')) {
      const subcategorySlug = searchParams.get('subcategory')!;
      hierarchicalFilters.subcategory_slug = subcategorySlug;
    }

    // Get sort options
    const sortBy = (searchParams.get('sort') || 'created_at') as 'created_at' | 'price' | 'price-low' | 'price-high' | 'newest';
    const sortDirection = sortBy === 'price-low' ? 'asc' : sortBy === 'price-high' ? 'desc' : 'desc';

    // TODO: Get category navigation without CategoryDomainAdapter
    const navigationPromise = Promise.resolve({
      pills: [],
      dropdown: []
    });

    const [
      productsResult,
      navigationResult,
      sellersResult
    ] = await Promise.allSettled([
      // Fetch actual products using domain adapter
      (async () => {
        if (resolution.categoryIds.length > 0 && !resolution.isVirtual) {
          // Use domain service for real categories
          const categoryId = resolution.categoryIds[0]; // Use primary category
          const result = await productAdapter.getProductsByCategory(categoryId || '', {
            limit,
            offset: (page - 1) * limit,
            sort: { by: (sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : 'created_at') as 'created_at' | 'price' | 'popularity', direction: sortDirection as 'asc' | 'desc' }
          });
          return {
            data: Array.isArray(result.data) ? result.data : [],
            total: typeof result.total === 'number' ? result.total : 0
          };
        } else {
          // Fallback to search for virtual or invalid categories
          const searchOptions = {
            limit,
            country_code: currentCountry,
            category_ids: hierarchicalFilters.category_ids,
            min_price: hierarchicalFilters.min_price,
            max_price: hierarchicalFilters.max_price,
            conditions: hierarchicalFilters.conditions,
            sizes: hierarchicalFilters.sizes,
            brands: hierarchicalFilters.brands,
            sort: { by: (sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : 'created_at') as 'created_at' | 'price' | 'popularity', direction: sortDirection as 'asc' | 'desc' }
          };

          return await productAdapter.searchProductsWithFilters('', searchOptions);
        }
      })(),

      // Get category navigation using domain adapter
      navigationPromise,

      // For now, return empty sellers array (could be implemented later)
      Promise.resolve([])
    ]);

    // Extract results with error handling
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [];
    const total = productsResult.status === 'fulfilled' && 'total' in productsResult.value ? productsResult.value.total || 0 : 0;
    const navigation = navigationResult.status === 'fulfilled' ? navigationResult.value : { pills: [], dropdown: [] };
    const sellers = sellersResult.status === 'fulfilled' ? sellersResult.value || [] : [];

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // TODO: Generate SEO meta without CategoryDomainAdapter
    const metaData = {
      title: 'Category',
      description: 'Browse products in this category',
      keywords: []
    };

    return {
      // Category information
      category: resolution.isVirtual ? null : (resolution.l3 || resolution.l2 || resolution.l1),
      resolution,
      breadcrumbs: breadcrumbsResult.items,
      breadcrumbsJsonLd: breadcrumbsResult.jsonLd,

      // Content - level-aware navigation categories
      pillCategories: navigation.pills,        // Level-appropriate categories for pills
      dropdownCategories: navigation.dropdown,    // Level-appropriate categories for dropdown
      products,
      sellers,

      // Backward compatibility (deprecated - use pillCategories instead)
      subcategories: navigation.dropdown,
      level3Categories: navigation.pills,
      
      // Empty category fallback indicator
      isEmptyFallback: hierarchicalFilters.showEmptyFallback || false,
      
      // Pagination
      pagination: {
        page,
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit
      },
      
      // Filters
      filters: {
        min_price: hierarchicalFilters.min_price,
        max_price: hierarchicalFilters.max_price,
        conditions: hierarchicalFilters.conditions || [],
        sizes: hierarchicalFilters.sizes || [],
        brands: hierarchicalFilters.brands || [],
        sort: sortBy,
        order: sortDirection
      },

      // SEO
      meta: metaData
    };
  } catch (err) {
    // Re-throw redirect and error responses
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    error(500, 'Failed to load category');
  }
}) satisfies PageServerLoad;

