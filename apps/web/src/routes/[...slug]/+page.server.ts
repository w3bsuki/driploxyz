import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * SEO-Friendly Product Route Handler
 * 
 * Handles URL patterns like:
 * - /products/:seller/:product_slug (canonical format)
 * - /products/:seller/:category_slug/:product_slug (with category)
 * - /product/uuid (legacy UUID format - redirects to canonical)
 * - /:legacy_slug (old single slug - redirects to canonical)
 * 
 * Resolution order:
 * 1. Legacy /product/:id → 301 to /products/:seller/:slug
 * 2. /products/:seller/:productSlug (with optional category segment)
 * 3. Legacy single-segment slug → look up product by slug, 301 to canonical
 * 4. Slug/username history → 301 to current canonical
 */
export const load = (async ({ params, locals: { supabase, safeGetSession, country } }) => {
  const { session } = await safeGetSession();
  const slug = params.slug;

  // Skip processing for known static paths and API routes
  if (!slug || 
      slug.startsWith('api/') || 
      slug.startsWith('_app/') ||
      slug.startsWith('profile/') ||
      slug.startsWith('favicon') ||
      slug.endsWith('.css') ||
      slug.endsWith('.js') ||
      slug.endsWith('.ico') ||
      slug.endsWith('.png') ||
      slug.endsWith('.jpg') ||
      slug.endsWith('.svg')) {
    throw error(404, 'Not found');
  }

  const parts = slug.split('/').filter(Boolean);
  let product = null;

  // Case 1: Handle legacy /product/uuid format
  if (parts[0] === 'product' && parts[1] && isUUID(parts[1])) {
    const uuid = parts[1];
    const { data: productData } = await supabase
      .from('products')
      .select(`
        id, slug,
        profiles!products_seller_id_fkey (username)
      `)
      .eq('id', uuid)
      .eq('is_active', true)
      .eq('country_code', country || 'BG')
      .single();
    
    if (productData?.slug && productData?.profiles?.username) {
      // Redirect to canonical URL
      throw redirect(301, `/products/${productData.profiles.username}/${productData.slug}`);
    } else if (productData) {
      // Fallback to internal product page
      return { redirectToInternal: `/product/${uuid}` };
    } else {
      throw error(404, 'Product not found');
    }
  }

  // Case 2: Handle /products/:seller/:slug or /products/:seller/:category/:slug
  if (parts[0] === 'products' && parts[1] && parts[2]) {
    const sellerUsername = parts[1];
    const productSlug = parts.length === 3 ? parts[2] : parts[3]; // Handle optional category segment
    const categorySegment = parts.length === 4 ? parts[2] : null;

    // Look up seller by username
    let { data: seller } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', sellerUsername)
      .single();

    // If seller not found by current username, check username history
    if (!seller) {
      const { data: usernameHistory } = await (supabase as any)
        .from('username_history')
        .select(`
          user_id,
          profiles!username_history_user_id_fkey (
            id, username
          )
        `)
        .eq('old_username', sellerUsername)
        .single();

      if (usernameHistory?.profiles?.username) {
        // Redirect to current username
        const newPath = categorySegment 
          ? `/products/${usernameHistory.profiles.username}/${categorySegment}/${productSlug}`
          : `/products/${usernameHistory.profiles.username}/${productSlug}`;
        throw redirect(301, newPath);
      } else {
        throw error(404, 'Seller not found');
      }
    }

    // Look up product by seller + slug (with null checks)
    if (!seller.id || !productSlug) {
      throw error(404, 'Invalid request parameters');
    }

    const { data: productData } = await supabase
      .from('products')
      .select(`
        id, slug,
        categories (slug, name)
      `)
      .eq('seller_id', seller.id)
      .eq('slug', productSlug)
      .eq('is_active', true)
      .eq('country_code', country || 'BG')
      .single();

    if (!productData) {
      throw error(404, 'Product not found');
    }

    // Check if category segment is correct (if provided)
    if (categorySegment && productData.categories?.slug !== categorySegment) {
      // Redirect to correct canonical URL
      const correctPath = productData.categories?.slug 
        ? `/products/${sellerUsername}/${productData.categories.slug}/${productSlug}`
        : `/products/${sellerUsername}/${productSlug}`;
      throw redirect(301, correctPath);
    }

    // Product found - get full data and render
    if (productData.id) {
      product = await getProductData(supabase, productData.id, session, country);
    }
  }

  // Case 3: Handle direct UUID
  if (!product && parts.length === 1 && parts[0] && isUUID(parts[0])) {
    const uuid = parts[0];
    
    if (!uuid) {
      throw error(404, 'Invalid UUID');
    }

    const { data: productData } = await supabase
      .from('products')
      .select(`
        id, slug,
        profiles!products_seller_id_fkey (username)
      `)
      .eq('id', uuid)
      .eq('is_active', true)
      .eq('country_code', country || 'BG')
      .single();
    
    if (productData?.slug && productData?.profiles?.username) {
      throw redirect(301, `/products/${productData.profiles.username}/${productData.slug}`);
    } else if (productData) {
      return { redirectToInternal: `/product/${uuid}` };
    }
  }

  // Case 4: Handle legacy single slug (backwards compatibility)
  if (!product && parts.length === 1 && parts[0] && !isUUID(parts[0])) {
    const legacySlug = parts[0];
    
    if (!legacySlug) {
      throw error(404, 'Invalid slug');
    }
    
    // First, look for product by slug globally
    const { data: productData } = await supabase
      .from('products')
      .select(`
        id, slug,
        profiles!products_seller_id_fkey (username)
      `)
      .eq('slug', legacySlug)
      .eq('is_active', true)
      .eq('country_code', country || 'BG')
      .single();

    if (productData?.profiles?.username && productData.slug) {
      throw redirect(301, `/products/${productData.profiles.username}/${productData.slug}`);
    }

    // If not found, check slug history for redirects
    if (!productData) {
      const { data: slugHistory } = await (supabase as any)
        .from('product_slug_history')
        .select(`
          product_id,
          products (
            id, slug,
            profiles!products_seller_id_fkey (username)
          )
        `)
        .eq('old_slug', legacySlug)
        .single();

      if (slugHistory?.products?.profiles?.username && slugHistory.products.slug) {
        throw redirect(301, `/products/${slugHistory.products.profiles.username}/${slugHistory.products.slug}`);
      }
    }
  }

  if (!product) {
    throw error(404, 'Product not found');
  }

  // Get parent category if exists
  let parentCategory = null;
  if (product.categories && product.categories.parent_id) {
    const { data: parent } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('id', product.categories.parent_id)
      .single();
    parentCategory = parent;
  }

  // Check favorite status and fetch related data in parallel
  const [favoriteResult, similarResult, sellerResult] = await Promise.allSettled([
    // Check if user has favorited (only if authenticated)
    session?.user ? supabase
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('product_id', product.id)
      .maybeSingle() : Promise.resolve({ data: null }),
    
    // Get similar products (same category, if category exists)
    product.category_id 
      ? supabase
          .from('products')
          .select(`
            id,
            title,
            price,
            condition,
            slug,
            product_images (
              image_url
            )
          `)
          .eq('category_id', product.category_id)
          .eq('is_active', true)
          .eq('is_sold', false)
          .neq('id', product.id)
          .limit(4)
      : Promise.resolve({ data: [] }),

    // Get other products from the same seller
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
        )
      `)
      .eq('seller_id', product.seller_id!)
      .eq('is_active', true)
      .eq('is_sold', false)
      .neq('id', product.id)
      .limit(4)
  ]);

  const isFavorited = favoriteResult.status === 'fulfilled' && !!favoriteResult.value.data;
  const similarProducts = similarResult.status === 'fulfilled' ? similarResult.value.data || [] : [];
  const sellerProducts = sellerResult.status === 'fulfilled' ? sellerResult.value.data || [] : [];
  const isOwner = session?.user?.id === product.seller_id;

  return {
    product: {
      ...product,
      images: product.product_images?.map((img: { image_url: string }) => img.image_url) || [],
      seller: product.profiles,
      seller_name: product.profiles?.full_name || product.profiles?.username || 'Unknown Seller',
      seller_username: product.profiles?.username,
      seller_avatar: product.profiles?.avatar_url,
      seller_rating: product.profiles?.rating,
      seller_sales_count: product.profiles?.sales_count,
      category_name: product.categories?.name,
      parent_category: parentCategory
    },
    similarProducts: similarProducts.map((p: any) => ({
      ...p,
      images: p.product_images?.map((img: { image_url: string }) => img.image_url) || []
    })),
    sellerProducts: sellerProducts.map((p: any) => ({
      ...p,
      images: p.product_images?.map((img: { image_url: string }) => img.image_url) || []
    })),
    isOwner,
    isFavorited,
    user: session?.user || null
  };
}) satisfies PageServerLoad;

/**
 * Check if a string is a valid UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Get complete product data with all related information
 */
async function getProductData(supabase: any, productId: string, _session: any, country?: string) {
  // Get main product with optimized query including full seller info
  const { data: product, error: productError } = await supabase
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
      seller_id,
      category_id,
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
        full_name,
        avatar_url,
        rating,
        sales_count,
        account_type,
        created_at
      )
    `)
    .eq('id', productId)
    .eq('is_active', true)
    .eq('country_code', country || 'BG')
    .single();

  if (productError || !product) {
    return null;
  }

  return product;
}
