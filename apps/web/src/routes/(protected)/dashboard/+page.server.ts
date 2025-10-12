import type { PageServerLoad } from './$types';

/**
 * Dashboard Page Server Load Function
 *
 * Moved to server-side for:
 * - Database security (server-side queries)
 * - Better performance (no client-side data fetching)
 * - SEO optimization (server-rendered content)
 */
export const load = (async ({ locals, parent }) => {
  const { user, profile } = await parent();
  const supabase = locals.supabase;

  if (!user) {
    return {
      products: [],
      orders: [],
      profile: null,
      user: null
    };
  }

  // Fetch user's products with images and categories - server-side for security
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
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch user's orders as seller - server-side for security
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
    .order('created_at', { ascending: false })
    .limit(50);

  // Log errors in development but don't throw
  if (productsError) {
    console.warn('Dashboard products fetch error:', productsError);
  }

  if (ordersError) {
    console.warn('Dashboard orders fetch error:', ordersError);
  }

  return {
    products: products || [],
    orders: orders || [],
    profile: profile || null,
    user
  };
}) satisfies PageServerLoad;