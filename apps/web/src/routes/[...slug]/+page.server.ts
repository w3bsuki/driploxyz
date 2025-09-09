import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * SEO-Friendly Product Route Handler
 * 
 * Handles URL patterns like:
 * - /product/:seller/:product_slug (canonical format)
 * - /product/:seller/:category_slug/:product_slug (with optional category)
 * - /product/uuid (legacy UUID format - redirects to canonical)
 * - /:legacy_slug (old single slug - redirects to canonical)
 * 
 * Resolution order:
 * 1. Legacy /product/:id → 301 to /product/:seller/:slug
 * 2. /product/:seller/:productSlug (with optional category segment)
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

  // Normalize any /product/* path to canonical /product/:seller/:slug and redirect
  if (parts[0] === 'product' && parts.length >= 3) {
    const seller = parts[1];
    const productSlug = parts[parts.length - 1];
    const canonical = `/product/${seller}/${productSlug}`;
    // Extra path segment (e.g., category) → permanent redirect
    if (parts.length > 3) throw redirect(301, canonical);
    // Exactly seller + slug → temporary redirect to canonical route (lets specific route take over)
    throw redirect(302, canonical);
  }

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
      throw redirect(301, `/product/${productData.profiles.username}/${productData.slug}`);
    } else {
      throw error(404, 'Product not found');
    }
  }

  // Case 2: Handle /product/:seller/:slug or /product/:seller/:category/:slug
  if (parts[0] === 'product' && parts[1] && parts[2]) {
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
          ? `/product/${usernameHistory.profiles.username}/${categorySegment}/${productSlug}`
          : `/product/${usernameHistory.profiles.username}/${productSlug}`;
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
        ? `/product/${sellerUsername}/${productData.categories.slug}/${productSlug}`
        : `/product/${sellerUsername}/${productSlug}`;
      throw redirect(301, correctPath);
    }

    // Product found - redirect to canonical route handled by specific page
    if (productData.id) {
      const canonical = `/product/${sellerUsername}/${productSlug}`;
      throw redirect(302, canonical);
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
      throw redirect(301, `/product/${productData.profiles.username}/${productData.slug}`);
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
      throw redirect(301, `/product/${productData.profiles.username}/${productData.slug}`);
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
        throw redirect(301, `/product/${slugHistory.products.profiles.username}/${slugHistory.products.slug}`);
      }
    }
  }

  // For any other paths, return 404 from this catch‑all to avoid duplicate UI
  throw error(404, 'Not found');
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
