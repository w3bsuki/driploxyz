import { error, redirect } from '@sveltejs/kit';
import { buildProductUrl } from '$lib/utils/seo-urls.js';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals: { supabase, safeGetSession, country } }) => {
  const { session } = await safeGetSession();

  // Get main product with minimal data needed for redirect
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      is_active,
      country_code,
      profiles!products_seller_id_fkey (
        username
      )
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .eq('country_code', country || 'BG')
    .single();

  if (productError || !product) {
    console.log('Product query error for redirect:', productError);
    throw error(404, 'Product not found');
  }

  // If we have the required data for SEO URL, redirect to canonical URL
  if (product.slug && product.profiles?.username) {
    const canonicalUrl = buildProductUrl({
      id: product.id,
      slug: product.slug,
      seller_username: product.profiles.username
    });
    
    console.log('Redirecting legacy URL to canonical:', {
      from: `/product/${params.id}`,
      to: canonicalUrl
    });
    
    // Use 308 redirect to preserve the method and indicate permanent redirect
    throw redirect(308, canonicalUrl);
  }

  // Fallback: if slug or username is missing, throw 404
  // This indicates data quality issues that should be addressed
  console.error('Product missing required data for SEO redirect:', {
    id: product.id,
    slug: product.slug,
    username: product.profiles?.username
  });
  throw error(404, 'Product not available');
}) satisfies PageServerLoad;