import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals }) => {
  const query = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  // Show all products by default if no search criteria

  try {
    // Build products query with proper Supabase full-text search
    let productsQuery = locals.supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        brand,
        size,
        condition,
        location,
        created_at,
        seller_id,
        category_id,
        is_sold,
        is_active,
        category:category_id (
          id,
          name,
          slug
        ),
        seller:seller_id (
          id,
          username,
          full_name,
          rating,
          avatar_url
        ),
        images:product_images (
          image_url,
          sort_order
        )
      `)
      .eq('is_sold', false)
      .eq('is_active', true);

    // OFFICIAL SUPABASE FULL-TEXT SEARCH PATTERN
    if (query) {
      // Use proper full-text search with websearch type for better results
      productsQuery = productsQuery.textSearch('title', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply category filter
    if (category) {
      // Handle both slug and name-based category filtering
      productsQuery = productsQuery.or(`category.slug.eq.${category},category.name.ilike.%${category}%`);
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

    // Apply condition filter
    if (condition) {
      productsQuery = productsQuery.eq('condition', condition);
    }

    // Apply brand filter
    if (brand) {
      productsQuery = productsQuery.ilike('brand', `%${brand}%`);
    }

    // Apply size filter
    if (size) {
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
        productsQuery = productsQuery.order('created_at', { ascending: false });
        break;
      case 'relevance':
      default:
        // For text search, Supabase orders by relevance automatically
        // For other searches, default to newest first
        if (!query) {
          productsQuery = productsQuery.order('created_at', { ascending: false });
        }
        break;
    }

    // Limit results for performance
    productsQuery = productsQuery.limit(100);

    // Execute products query
    const { data: products, error: productsError } = await productsQuery;

    if (productsError) {
      console.error('Search error:', productsError);
      return {
        products: [],
        categories: [],
        searchQuery: query,
        total: 0,
        error: 'Search failed. Please try again.',
        filters: {
          category,
          minPrice,
          maxPrice,
          condition,
          brand,
          size,
          sortBy
        }
      };
    }

    // Fetch categories for navigation (cache this in production)
    const { data: categories, error: categoriesError } = await locals.supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (categoriesError) {
      console.error('Categories error:', categoriesError);
    }

    // Transform products data for component compatibility
    const transformedProducts = (products || []).map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      images: product.images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(img => img.image_url) || [],
      brand: product.brand,
      size: product.size,
      condition: product.condition,
      category: product.category,
      seller_id: product.seller_id,
      seller: product.seller,
      created_at: product.created_at,
      location: product.location
    }));

    return {
      products: transformedProducts,
      categories: categories || [],
      searchQuery: query,
      total: transformedProducts.length,
      filters: {
        category,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      products: [],
      categories: [],
      searchQuery: query,
      total: 0,
      error: 'Search failed. Please try again.',
      filters: {
        category,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };
  }
};