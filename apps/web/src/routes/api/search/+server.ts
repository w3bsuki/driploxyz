import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { ProductDomainAdapter } from '@repo/core/services';

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
  const country = locals.country || 'BG';

  // PERFORMANCE FIX: Optimize caching headers
  setHeaders({
    'cache-control': locals.user ? 'private, max-age=15' : 'public, max-age=30, s-maxage=120',
    'vary': 'Authorization, Cookie'
  });

  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '50', 10), 100); // Limit page size

  // Handle both canonical and legacy parameter names
  const category = url.searchParams.get('category') || url.searchParams.get('level1') || '';
  const subcategory = url.searchParams.get('subcategory') || url.searchParams.get('level2') || '';
  const specific = url.searchParams.get('specific') || url.searchParams.get('level3') || '';

  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  // PERFORMANCE FIX: Early return for empty queries
  if (!query.trim() && !category && !brand) {
    return json({
      data: [],
      pagination: { page, pageSize, total: 0, hasMore: false },
      message: 'Please enter a search term or filter criteria'
    });
  }

  try {
    // PERFORMANCE FIX: Use domain adapter with optimized query patterns
    const productAdapter = new ProductDomainAdapter(locals.supabase);

    // PERFORMANCE FIX: Parallel category resolution with validation
    const categorySegments = [category, subcategory, specific].filter(Boolean);
    const [categoryResult] = await Promise.all([
      categorySegments.length > 0
        ? productAdapter.resolveCategorySegments.execute(categorySegments)
        : Promise.resolve({ success: true, data: [] })
    ]);

    let categoryIds: string[] = [];
    if (categoryResult.success) {
      categoryIds = categoryResult.data;
    }

    // PERFORMANCE FIX: Optimized sort mapping with defaults
    const sortMap: Record<string, { by: 'created_at' | 'price' | 'popularity' | 'relevance'; direction: 'asc' | 'desc' }> = {
      'price-low': { by: 'price', direction: 'asc' },
      'price-high': { by: 'price', direction: 'desc' },
      'newest': { by: 'created_at', direction: 'desc' },
      'oldest': { by: 'created_at', direction: 'asc' },
      'popular': { by: 'popularity', direction: 'desc' },
      'relevance': { by: 'relevance', direction: 'desc' }
    };

    const sortOptions = sortMap[sortBy] || sortMap.relevance;

    // PERFORMANCE FIX: Optimized search options with proper typing
    const searchOptions = {
      limit: Math.min(pageSize, 100), // Hard limit for performance
      country_code: country,
      category_ids: categoryIds.length > 0 ? categoryIds : undefined,
      min_price: minPrice ? Math.max(0, parseFloat(minPrice)) : undefined,
      max_price: maxPrice ? Math.min(999999, parseFloat(maxPrice)) : undefined,
      conditions: condition && condition !== 'all' ? [condition] : undefined,
      brands: brand && brand !== 'all' ? [brand] : undefined,
      sizes: size && size !== 'all' ? [size] : undefined,
      sort: sortOptions,
      // PERFORMANCE FIX: Add pagination offset for efficient queries
      offset: (page - 1) * pageSize
    };

    // PERFORMANCE FIX: Execute search with timeout protection
    const searchPromise = productAdapter.searchProductsWithFilters(query, searchOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), 5000)
    );

    const result = await Promise.race([searchPromise, timeoutPromise]) as {
      data?: unknown[];
      total?: number;
      error?: unknown;
    };

    if (result.error) {
      console.error('[API Search] Domain error:', result.error);
      return json({
        error: 'Search temporarily unavailable',
        data: [],
        pagination: { page, pageSize, total: 0, hasMore: false }
      }, { status: 503 });
    }

    // PERFORMANCE FIX: Optimized pagination - no client-side slicing
    const data = result.data || [];
    const total = result.total || data.length;
    const hasMore = data.length === pageSize && (page * pageSize) < total;

    return json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        hasMore,
        // PERFORMANCE FIX: Add performance metadata
        queryTime: Date.now(),
        cacheable: !locals.user
      }
    });

  } catch (error) {
    console.error('[API Search] Error:', error);

    // PERFORMANCE FIX: Better error handling with appropriate status codes
    const isTimeout = error instanceof Error && error.message === 'Search timeout';
    const status = isTimeout ? 504 : 500;
    const message = isTimeout ? 'Search request timed out' : 'Search temporarily unavailable';

    return json({
      error: message,
      data: [],
      pagination: { page, pageSize, total: 0, hasMore: false }
    }, { status });
  }
};