import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { ProductDomainAdapter } from '$lib/services/products.domain';

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
  const country = locals.country || 'BG';

  // Cache briefly at the edge for anonymous traffic
  setHeaders({ 'cache-control': 'public, max-age=30, s-maxage=120' });

  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);

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

  try {
    // Use domain adapter for search functionality
    const productAdapter = new ProductDomainAdapter(locals.supabase);

    // Resolve category IDs using domain adapter's category resolution
    const categoryResult = await productAdapter.resolveCategorySegments([category, subcategory, specific].filter(Boolean));
    let categoryIds: string[] = [];

    if (categoryResult.success) {
      categoryIds = categoryResult.data;
    }

    // Map sort parameter to domain sort format
    let sortOptions: { by: 'created_at' | 'price' | 'popularity' | 'relevance'; direction: 'asc' | 'desc' } = { by: 'created_at', direction: 'desc' };
    switch (sortBy) {
      case 'price-low':
        sortOptions = { by: 'price', direction: 'asc' };
        break;
      case 'price-high':
        sortOptions = { by: 'price', direction: 'desc' };
        break;
      case 'newest':
        sortOptions = { by: 'created_at', direction: 'desc' };
        break;
      case 'relevance':
      default:
        sortOptions = { by: 'relevance', direction: 'desc' };
        break;
    }

    // Build search options for domain adapter
    const searchOptions = {
      limit: pageSize,
      country_code: country,
      category_ids: categoryIds.length > 0 ? categoryIds : undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
      conditions: condition && condition !== 'all' ? [condition] : undefined,
      brands: brand && brand !== 'all' ? [brand] : undefined,
      sizes: size && size !== 'all' ? [size] : undefined,
      sort: sortOptions
    };

    // Execute search using domain adapter
    const result = await productAdapter.searchProductsWithFilters(query, searchOptions);

    if (result.error) {
      return json({
        error: result.error,
        data: [],
        pagination: { page, pageSize, total: 0, hasMore: false }
      }, { status: 500 });
    }

    // Apply pagination for legacy compatibility
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = result.data.slice(startIndex, endIndex);
    const total = result.data.length;
    const hasMore = endIndex < total;

    return json({
      data: paginatedData,
      pagination: { page, pageSize, total, hasMore }
    });

  } catch (error) {
    console.error('[API Search] Error:', error);
    return json({
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      pagination: { page, pageSize, total: 0, hasMore: false }
    }, { status: 500 });
  }
};