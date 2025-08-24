import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * Dashboard Page Load Function
 * 
 * This is the primary landing page after onboarding completion.
 * Must check onboarding status and redirect incomplete users.
 */
export const load: PageLoad = async ({ parent, url }) => {
  const { supabase, user, profile } = await parent();

  console.log('[DASHBOARD] Loading dashboard for user:', user?.email);
  console.log('[DASHBOARD] Profile status:', {
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    accountType: profile?.account_type
  });

  if (!user) {
    console.log('[DASHBOARD] No user, redirecting to login');
    throw redirect(303, '/login');
  }

  // CRITICAL: Check if onboarding is completed
  // This prevents users from accessing dashboard before completing onboarding
  if (!profile || profile.onboarding_completed !== true) {
    console.log('[DASHBOARD] User has not completed onboarding, redirecting');
    throw redirect(303, '/onboarding');
  }

  console.log('[DASHBOARD] User has completed onboarding, loading dashboard data');

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