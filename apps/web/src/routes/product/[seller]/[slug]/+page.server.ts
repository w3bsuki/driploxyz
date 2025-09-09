import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { withTimeout } from '@repo/utils';

export const load = (async ({ params, locals: { supabase, safeGetSession, country } }) => {
  const { session } = await safeGetSession();

  // Get product by seller username and slug with timeout for resilience
  // This is the new SEO-friendly URL format: /product/{seller}/{slug}
  const { data: product, error: productError } = await withTimeout(
    supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        condition,
        size,
        brand,
        color,
        material,
        location,
        is_active,
        is_sold,
        created_at,
        view_count,
        favorite_count,
        seller_id,
        category_id,
        country_code,
        region,
        slug,
        product_images (
          id,
          image_url,
          sort_order
        ),
        categories!left (
          id,
          name,
          slug,
          parent_id
        ),
        profiles!products_seller_id_fkey (
          id,
          username,
          avatar_url,
          rating,
          bio,
          created_at,
          sales_count,
          full_name
        )
      `)
      .eq('slug', params.slug)
      .eq('is_active', true)
      .eq('country_code', country || 'BG')
      .eq('profiles.username', params.seller)
      .single(),
    3000,
    { data: null, error: { message: 'Request timeout' } }
  );

  if (productError || !product) {
    console.log('Product query error:', productError);
    console.log('Params:', { seller: params.seller, slug: params.slug });
    throw error(404, 'Product not found');
  }

  // Verify the seller username matches (extra security check)
  if (product.profiles?.username !== params.seller) {
    console.log('Seller username mismatch:', {
      expected: params.seller,
      actual: product.profiles?.username
    });
    throw error(404, 'Product not found');
  }

  console.log('Product loaded via SEO URL:', {
    id: product.id,
    title: product.title,
    price: product.price,
    seller: product.profiles?.username,
    slug: product.slug,
    favorite_count: product.favorite_count
  });

  // Get complete category hierarchy for breadcrumb (Men/Women/Kids)
  let parentCategory = null;
  let topLevelCategory = null;
  
  if (product.categories?.parent_id) {
    const { data: parent } = await withTimeout(
      supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .eq('id', product.categories.parent_id)
        .single(),
      1500,
      { data: null }
    );
    parentCategory = parent;
    
    // If parent has a parent, get the top-level category (MEN/WOMEN/KIDS)
    if (parent?.parent_id) {
      const { data: topLevel } = await withTimeout(
        supabase
          .from('categories')
          .select('id, name, slug')
          .eq('id', parent.parent_id)
          .single(),
        1500,
        { data: null }
      );
      topLevelCategory = topLevel;
    } else {
      // Parent is already top-level
      topLevelCategory = parent;
    }
  } else if (product.categories) {
    // Current category has no parent, so it's top-level
    topLevelCategory = {
      id: product.categories.id,
      name: product.categories.name,
      slug: product.categories.slug
    };
  }

  // Check favorite status and fetch related data in parallel with timeouts
  const [favoriteResult, similarResult, sellerResult, reviewsResult] = await Promise.allSettled([
    // Check if user has favorited (only if authenticated)
    session?.user ? withTimeout(
      supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .maybeSingle(),
      1000,
      { data: null }
    ) : Promise.resolve({ data: null }),
    
    // Get similar products (same category, if category exists)
    product.category_id 
      ? withTimeout(
          supabase
            .from('products')
            .select(`
              id,
              title,
              price,
              condition,
              slug,
              product_images (
                image_url
              ),
              profiles!products_seller_id_fkey (
                username
              ),
              categories (
                slug
              )
            `)
            .eq('category_id', product.category_id)
            .eq('is_active', true)
            .eq('is_sold', false)
            .neq('id', product.id)
            .eq('country_code', country || 'BG')
            .limit(6),
          2500,
          { data: [] }
        )
      : Promise.resolve({ data: [] }),
    
    // Get other seller products
    withTimeout(
      supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          slug,
          product_images!product_id (
            image_url
          ),
          profiles!products_seller_id_fkey (
            username
          ),
          categories (
            slug
          )
        `)
        .eq('seller_id', product.seller_id!)
        .eq('is_active', true)
        .eq('is_sold', false)
        .neq('id', product.id)
        .eq('country_code', country || 'BG')
        .limit(4),
      2000,
      { data: [] }
    ),
    
    // Get seller reviews and rating summary
    withTimeout(
      supabase
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
      { data: [] }
    )
  ]);

  const isFavorited = favoriteResult.status === 'fulfilled' && !!favoriteResult.value.data;
  const similarProducts = similarResult.status === 'fulfilled' ? similarResult.value.data || [] : [];
  const sellerProducts = sellerResult.status === 'fulfilled' ? sellerResult.value.data || [] : [];
  const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value.data || [] : [];
  const isOwner = session?.user?.id === product.seller_id;

  // Calculate rating summary
  const ratingSummary = reviews.length > 0 ? {
    averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    totalReviews: reviews.length,
    ratingDistribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length
    }))
  } : null;

  return {
    product: {
      ...product,
      images: product.product_images
        ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(img => img.image_url)
        .filter(Boolean) || [],
      seller: product.profiles,
      seller_name: product.profiles?.full_name || product.profiles?.username || 'Unknown Seller',
      seller_username: product.profiles?.username,
      seller_avatar: product.profiles?.avatar_url,
      seller_rating: product.profiles?.rating,
      seller_sales_count: product.profiles?.sales_count,
      category_name: product.categories?.name,
      category_slug: product.categories?.slug,
      parent_category: parentCategory,
      top_level_category: topLevelCategory,
      currency: 'EUR'
    },
    similarProducts: similarProducts.map(p => ({
      ...p,
      images: p.product_images?.map(img => img.image_url) || [],
      canonicalUrl: p.slug && p.profiles?.username ? `/product/${p.profiles.username}/${p.slug}` : `/product/${p.id}`
    })),
    sellerProducts: sellerProducts.map(p => ({
      ...p,
      images: p.product_images?.map(img => img.image_url) || [],
      canonicalUrl: p.slug && p.profiles?.username ? `/product/${p.profiles.username}/${p.slug}` : `/product/${p.id}`
    })),
    reviews,
    ratingSummary,
    isOwner,
    isFavorited,
    user: session?.user || null,
    locale: 'bg-BG'
  };
}) satisfies PageServerLoad;