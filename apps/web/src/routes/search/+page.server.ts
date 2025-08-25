import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals }) => {
  const country = locals.country || 'BG';
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
    // Build optimized products query - select only essential fields for search results
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
        categories!inner (
          id,
          name,
          slug,
          parent_id
        ),
        profiles!products_seller_id_fkey (
          username,
          avatar_url
        ),
        product_images!inner (
          image_url
        )
      `)
      .eq('is_sold', false)
      .eq('is_active', true)
      .eq('country_code', country);

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
      // Filter by category slug or name
      productsQuery = productsQuery.or(`categories.slug.eq.${category},categories.name.ilike.%${category}%`);
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

    // Parallel fetch of categories for navigation
    const [categoriesResult] = await Promise.allSettled([
      locals.supabase
        .from('categories')
        .select('id, name, slug')
        .is('parent_id', null)
        .order('name')
    ]);

    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.data || [] : [];

    // Transform products data for frontend - minimal processing
    const transformedProducts = (products || []).map(product => {
      // Determine main category and subcategory
      const hasParent = product.categories?.parent_id !== null;
      const mainCategory = hasParent ? product.categories?.parent : product.categories;
      const subcategory = hasParent ? product.categories : null;
      
      // Debug log to check what we're getting
      if (product.title?.includes('Shirt') || product.title?.includes('Top')) {
        console.log('Product:', product.title);
        console.log('Category:', product.categories?.name);
        console.log('Parent:', product.categories?.parent);
        console.log('Main Category:', mainCategory?.name);
        console.log('Subcategory:', subcategory?.name);
      }
      
      return {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        images: [product.product_images?.[0]?.image_url].filter(Boolean), // Only first image for search results
        product_images: product.product_images,
        brand: product.brand,
        size: product.size,
        condition: product.condition,
        category: {
          name: product.categories?.name,
          slug: product.categories?.slug
        },
        // Add proper category hierarchy
        main_category_name: mainCategory?.name,
        category_name: mainCategory?.name,
        subcategory_name: subcategory?.name,
        seller: {
          username: product.profiles?.username,
          avatar_url: product.profiles?.avatar_url
        },
        created_at: product.created_at,
        location: product.location
      };
    });

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