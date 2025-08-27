import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * SEO-Friendly Product Route Handler
 * 
 * Handles URL patterns like:
 * - /men/shoes/nike-air-force-white-size-42-good-abc123de (SEO-friendly with slug)
 * - /product/uuid (legacy UUID format - redirects to SEO URL)
 * - /uuid (direct UUID fallback)
 * 
 * This route catches all unmatched paths and attempts to:
 * 1. Parse SEO-friendly product slugs
 * 2. Handle direct UUID lookups 
 * 3. Redirect legacy /product/uuid URLs to SEO URLs
 */
export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession }, url }) => {
  const { session } = await safeGetSession();
  const slug = params.slug;

  // Skip processing for known static paths and API routes
  if (!slug || 
      slug.startsWith('api/') || 
      slug.startsWith('_app/') ||
      slug.startsWith('favicon') ||
      slug.endsWith('.css') ||
      slug.endsWith('.js') ||
      slug.endsWith('.ico') ||
      slug.endsWith('.png') ||
      slug.endsWith('.jpg') ||
      slug.endsWith('.svg')) {
    throw error(404, 'Not found');
  }

  let product = null;
  let shouldRedirect = false;
  let redirectUrl = '';

  // Case 1: Handle legacy /product/uuid format
  if (slug.startsWith('product/')) {
    const uuid = slug.replace('product/', '');
    if (isUUID(uuid)) {
      // Look up product by UUID and redirect to SEO URL if it has a slug
      const { data: productData } = await supabase
        .from('products')
        .select('id, slug')
        .eq('id', uuid)
        .eq('is_active', true)
        .single();
      
      if (productData?.slug) {
        throw redirect(301, `/${productData.slug}`);
      } else {
        // Fallback to old product page if no slug exists yet
        throw redirect(301, `/product/${uuid}`);
      }
    }
  }

  // Case 2: Check if this is a direct UUID
  if (isUUID(slug)) {
    const { data: productData } = await supabase
      .from('products')
      .select('id, slug')
      .eq('id', slug)
      .eq('is_active', true)
      .single();
    
    if (productData?.slug) {
      // Redirect UUID to SEO-friendly URL
      throw redirect(301, `/${productData.slug}`);
    } else if (productData) {
      // Use UUID until slug is generated
      product = await getProductData(supabase, slug, session);
    }
  }

  // Case 3: Look for product by slug (SEO-friendly URL)
  if (!product) {
    const { data: productData } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (productData) {
      product = await getProductData(supabase, productData.id, session);
    }
  }

  if (!product) {
    throw error(404, 'Product not found');
  }

  return product;
};

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
async function getProductData(supabase: any, productId: string, session: any) {
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
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
    return null;
  }

  // Get parent category for breadcrumb (Men/Women/Kids)
  let parentCategory = null;
  if (product.categories?.parent_id) {
    const { data: parent } = await supabase
      .from('categories')
      .select('id, name')
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
      .eq('product_id', productId)
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
          .neq('id', productId)
          .limit(6)
      : Promise.resolve({ data: [] }),
    
    // Get other seller products
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
      .neq('id', productId)
      .limit(4)
  ]);

  const isFavorited = favoriteResult.status === 'fulfilled' && !!favoriteResult.value.data;
  const similarProducts = similarResult.status === 'fulfilled' ? similarResult.value.data || [] : [];
  const sellerProducts = sellerResult.status === 'fulfilled' ? sellerResult.value.data || [] : [];
  const isOwner = session?.user?.id === product.seller_id;

  return {
    product: {
      ...product,
      images: product.product_images?.map(img => img.image_url) || [],
      seller: product.profiles,
      seller_name: product.profiles?.full_name || product.profiles?.username || 'Unknown Seller',
      seller_username: product.profiles?.username,
      seller_avatar: product.profiles?.avatar_url,
      seller_rating: product.profiles?.rating,
      seller_sales_count: product.profiles?.sales_count,
      category_name: product.categories?.name,
      parent_category: parentCategory
    },
    similarProducts: similarProducts.map(p => ({
      ...p,
      images: p.product_images?.map(img => img.image_url) || []
    })),
    sellerProducts: sellerProducts.map(p => ({
      ...p,
      images: p.product_images?.map(img => img.image_url) || []
    })),
    isOwner,
    isFavorited,
    user: session?.user || null
  };
}