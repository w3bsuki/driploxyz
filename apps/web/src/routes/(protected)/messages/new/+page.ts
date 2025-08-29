import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { createBrowserSupabaseClient } from '$lib/supabase/client';

export const load: PageLoad = async ({ parent, url }) => {
  const { user } = await parent();
  const supabase = createBrowserSupabaseClient();

  if (!user) {
    throw redirect(303, '/login');
  }

  const searchParams = url.searchParams;
  const recipientId = searchParams.get('to');
  const productId = searchParams.get('product');

  if (!recipientId) {
    throw redirect(303, '/messages');
  }

  // Fetch recipient data
  const { data: recipient, error: recipientError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', recipientId)
    .single();

  // Fetch product data if provided
  let product = null;
  if (productId) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        images:product_images (
          image_url,
          display_order
        )
      `)
      .eq('id', productId)
      .single();

    if (!productError) {
      product = productData;
    }
  }

  if (recipientError) {
    console.error('Error fetching recipient:', recipientError);
    throw redirect(303, '/messages');
  }

  return {
    recipient,
    product
  };
};