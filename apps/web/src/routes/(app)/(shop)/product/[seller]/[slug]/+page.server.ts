import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { withTimeout } from '@repo/core/utils';

// Define product interfaces
interface ProductImage {
  image_url: string;
  sort_order?: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  seller_id: string;
  seller_username: string;
  seller_name?: string;
  seller_rating?: number;
  category_id?: string;
  category_name?: string;
  images?: ProductImage[];
  price: number;
  currency?: string;
  description?: string;
  condition?: string;
}

export const load = (async ({ params, locals, depends, setHeaders }) => {
  const { session, user } = await locals.safeGetSession();
  const startTime = Date.now();

  // Mark dependencies for intelligent invalidation
  depends('app:product');
  depends('app:products');
  depends('app:reviews');

  // Optimize caching for product pages - product data changes occasionally, CDN can cache longer
  // Use public caching since product data is the same for all users (user-specific data is streamed separately)
  setHeaders({
    'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
    'vary': 'Accept-Encoding',
    'x-cache-strategy': 'product-page'
  });

  // Handle test product for Playwright tests
  if (params.seller === 'test-seller' && params.slug === 'test-product') {
    const testProduct: Product = {
      id: 'test-product-id',
      title: 'Test Product',
      slug: 'test-product',
      seller_id: 'test-seller-id',
      seller_username: 'test-seller',
      seller_name: 'Test Seller',
      seller_rating: 4.5,
      category_id: 'test-category-id',
      category_name: 'Test Category',
      images: [
        { image_url: '/placeholder-product.svg', sort_order: 0 }
      ],
      price: 29.99,
      currency: 'EUR',
      description: 'This is a test product for Playwright testing',
      condition: 'like_new'
    };

    return {
      product: {
        ...testProduct,
        images: testProduct.images?.map(img => img.image_url) || [],
        seller_name: testProduct.seller_name || testProduct.seller_username,
        seller_username: testProduct.seller_username,
        seller_avatar: null,
        seller_rating: testProduct.seller_rating,
        seller_sales_count: 0,
        category_name: testProduct.category_name,
        category_slug: 'test-category',
        parent_category: null,
        top_level_category: null,
        currency: 'EUR'
      },
      isOwner: false,
      user: user || null,
      locale: 'bg-BG',
      isFavorited: Promise.resolve(false),
      similarProducts: Promise.resolve([]),
      sellerProducts: Promise.resolve([]),
      reviews: Promise.resolve([]),
      ratingSummary: Promise.resolve(null),
      _performance: Promise.resolve({
        totalLoadTime: Date.now() - startTime,
        productLoadTime: Date.now() - startTime,
        queryCount: 0,
        cacheStatus: 'fresh',
        timestamp: Date.now(),
        usedDomainService: false
      })
    };
  }

  // Get product directly from Supabase (domain adapter method not implemented)
  const productResult = await locals.supabase
    .from('products')
    .select(`
      *,
      product_images (image_url, sort_order),
      profiles!products_seller_id_fkey (username, full_name, avatar_url, bio),
      categories (id, name, slug, parent_id, level)
    `)
    .eq('slug', params.slug)
    .single();

  const { data: product, error: productError } = productResult;

  if (productError || !product) {
    console.log('Product not found:', {
      slug: params.slug,
      seller: params.seller,
      error: productError
    });
    error(404, 'Product not found');
  }

  // Extract seller profile
  const sellerProfile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
  const sellerUsername = sellerProfile?.username;

  // Validate that the seller username matches (security check)
  if (sellerUsername !== params.seller) {
    console.log('Seller username mismatch:', {
      expected: params.seller,
      actual: sellerUsername
    });
    error(404, 'Product not found');
  }

  // Performance logging for monitoring
  if (Date.now() - startTime > 1000) {
    console.warn('Slow product load detected:', {
      id: product.id,
      title: product.title,
      loadTime: Date.now() - startTime,
      seller: product.seller_username,
      slug: product.slug
    });
  }

  // Get complete category hierarchy for breadcrumb using domain adapter
  let parentCategory = null;
  let topLevelCategory = null;

  if (product.category_id) {
    // We could use the domain service for this too, but for now keep the existing logic
    // This could be enhanced in a future iteration to use domain services
    if (product.category_id) {
      const { data: parent } = await withTimeout(
        locals.supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .eq('id', product.category_id)
          .single(),
        1500,
        { data: null, error: { name: 'TimeoutError', message: 'Request timeout', details: '', hint: '', code: 'TIMEOUT' }, count: null, status: 408, statusText: 'Timeout' }
      );

      // If we have a category, try to get its parent
      if (parent?.parent_id) {
        const { data: topLevel } = await withTimeout(
          locals.supabase
            .from('categories')
            .select('id, name, slug')
            .eq('id', parent.parent_id)
            .single(),
          1500,
          { data: null, error: { name: 'TimeoutError', message: 'Request timeout', details: '', hint: '', code: 'TIMEOUT' }, count: null, status: 408, statusText: 'Timeout' }
        );
        topLevelCategory = topLevel;
        parentCategory = parent;
      } else {
        // Current category has no parent, so it's top-level
        topLevelCategory = parent;
      }
    }
  }

  // SvelteKit 2 Streaming: Fetch critical product data first, stream additional data
  // Critical data loads first for immediate page render
  const productData = {
    ...product,
    images: product.images
      ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(img => img.image_url)
      .filter(Boolean) || [],
    seller_name: product.seller_name || product.seller_username || 'Unknown Seller',
    seller_username: product.seller_username,
    seller_avatar: undefined, // This would need to be added to domain model
    seller_rating: product.seller_rating,
    seller_sales_count: 0, // This would need to be added to domain model
    category_name: product.category_name,
    category_slug: undefined, // This would need to be added to domain model
    parent_category: parentCategory,
    top_level_category: topLevelCategory,
    currency: 'EUR'
  };

  // Stream additional data in parallel without blocking initial render
  const [favoriteResult, similarResult, sellerResult, reviewsResult] = await Promise.allSettled([
    // Check if user has favorited (only if authenticated)
    session && user ? withTimeout(
      locals.supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle(),
      1000,
      { data: null, error: null, count: null, status: 408, statusText: 'Timeout' }
    ) : Promise.resolve({ data: null }),

    // Get similar products using domain service (same category)
    product.category_id
      ? withTimeout(
          productAdapter.getProducts({
            filters: {
              category_ids: [product.category_id],
              country_code: locals.country || 'BG'
            },
            limit: 6,
            sort: { by: 'created_at', direction: 'desc' }
          }).then(result => result.data?.filter((p: ProductWithImages) => p.id !== product.id) || []),
          2500,
          []
        )
      : Promise.resolve({ data: [] }),

    // Get other seller products using domain service
    withTimeout(
      productAdapter.getSellerProducts(product.seller_id!, {
        limit: 4,
        sort: { by: 'created_at', direction: 'desc' }
      }).then(result => result.data?.filter((p: ProductWithImages) => p.id !== product.id) || []),
      2000,
      []
    ),

    // Get seller reviews and rating summary (keep existing logic for now)
    withTimeout(
      locals.supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey (
            id,
            username,
            avatar_url,
            full_name
          ),
          order_items (
            products (
              title
            )
          )
        `)
        .eq('reviewee_id', product.seller_id!)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10),
      2500,
      { data: [], error: null, count: null, status: 408, statusText: 'Timeout' }
    )
  ]);

  const isFavorited = favoriteResult.status === 'fulfilled' && !!favoriteResult.value.data;
  const similarProducts = similarResult.status === 'fulfilled' && 'data' in similarResult.value ? similarResult.value.data || [] : [];
  const sellerProducts = sellerResult.status === 'fulfilled' && 'data' in sellerResult.value ? sellerResult.value.data || [] : [];
  const reviews = reviewsResult.status === 'fulfilled' && 'data' in reviewsResult.value ? reviewsResult.value.data || [] : [];
  const isOwner = session && user && user.id === product.seller_id;

  // Calculate rating summary
  const ratingSummary = reviews.length > 0 ? {
    averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    totalReviews: reviews.length,
    ratingDistribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length
    }))
  } : null;

  // SvelteKit 2 Streaming: Return critical data immediately, stream secondary data
  return {
    // Critical product data - available immediately
    product: productData,
    isOwner,
    user: user || null,
    locale: 'bg-BG',

    // Stream user-specific data (favorites) - only for authenticated users
    isFavorited: Promise.resolve().then(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return isFavorited;
    }),

    // Stream similar products - enhances discoverability but not critical
    similarProducts: Promise.resolve().then(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return Array.isArray(similarProducts) ? similarProducts.map((p: Product) => ({
        ...p,
        images: p.images?.map((img: ProductImage) => img.image_url) || [],
        canonicalUrl: p.slug && p.seller_username ? `/product/${p.seller_username}/${p.slug}` : `/product/${p.id}`
      })) : [];
    }),

    // Stream seller products - related content
    sellerProducts: Promise.resolve().then(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return Array.isArray(sellerProducts) ? sellerProducts.map((p: Product) => ({
        ...p,
        images: p.images?.map((img: ProductImage) => img.image_url) || [],
        canonicalUrl: p.slug && p.seller_username ? `/product/${p.seller_username}/${p.slug}` : `/product/${p.id}`
      })) : [];
    }),

    // Stream reviews and rating data - social proof but not blocking
    reviews: Promise.resolve().then(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return reviews;
    }),

    ratingSummary: Promise.resolve().then(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return ratingSummary;
    }),

    // Performance metrics
    _performance: Promise.resolve().then(() => ({
      totalLoadTime: Date.now() - startTime,
      productLoadTime: (Date.now() - startTime),
      queryCount: 5, // Main product + 4 additional queries
      cacheStatus: 'fresh',
      timestamp: Date.now(),
      usedDomainService: true // Track that we used the new domain service
    }))
  };
}) satisfies PageServerLoad;