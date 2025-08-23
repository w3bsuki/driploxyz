import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { supabase, user, profile } = await parent();

  if (!user) {
    throw redirect(303, '/login');
  }

  // Fetch user's products with images and categories
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      category:category_id (
        id,
        name
      ),
      images:product_images (
        image_url,
        display_order
      )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user's orders as seller
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      product:product_id (
        id,
        title
      ),
      buyer:buyer_id (
        id,
        username,
        full_name
      )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  return {
    products: products || [],
    orders: orders || [],
    profile,
    user
  };
};