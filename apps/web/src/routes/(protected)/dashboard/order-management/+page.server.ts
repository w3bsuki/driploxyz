import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, depends, setHeaders }) => {
  const { safeGetSession, supabase } = locals;
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    redirect(303, '/login');
  }

  // Set cache headers for dashboard data
  setHeaders({
    'cache-control': 'private, max-age=30, stale-while-revalidate=300'
  });

  // Add dependency tracking for granular invalidation
  depends('app:user-data', 'app:orders', 'app:profile');

  try {
    // Run profile and orders queries in parallel using Promise.allSettled
    const [profileResult, ordersResult] = await Promise.allSettled([
      // Get user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),

      // Get all orders for this user (as buyer or seller)
      supabase
        .from('orders')
        .select(`
          *,
          product:products(
            id,
            title,
            price,
            images,
            first_image,
            seller_id
          ),
          buyer:profiles!buyer_id(
            id,
            username,
            full_name,
            avatar_url
          ),
          seller:profiles!seller_id(
            id,
            username,
            full_name,
            avatar_url
          ),
          order_items(
            id,
            product_id,
            price,
            quantity,
            size,
            product:products(
              id,
              title,
              images,
              first_image
            )
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
    ]);

    // Extract results with error handling
    const profile = profileResult.status === 'fulfilled' && !profileResult.value.error
      ? profileResult.value.data
      : null;

    const orders = ordersResult.status === 'fulfilled' && !ordersResult.value.error
      ? ordersResult.value.data || []
      : [];

    return {
      user,
      profile,
      orders
    };

  } catch (err) {
    console.error('Order management dashboard error:', err);
    return {
      user,
      profile: null,
      orders: []
    };
  }
}) satisfies PageServerLoad;