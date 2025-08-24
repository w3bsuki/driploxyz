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
    accountType: profile?.account_type,
    username: profile?.username
  });

  if (!user) {
    console.log('[DASHBOARD] No user, redirecting to login');
    throw redirect(303, '/login');
  }

  // CRITICAL: Re-fetch profile directly to ensure we have the latest data
  // This prevents cache issues where the profile might be stale
  const { data: freshProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('[DASHBOARD] Error fetching fresh profile:', profileError);
  }

  console.log('[DASHBOARD] Fresh profile data:', {
    hasProfile: !!freshProfile,
    onboardingCompleted: freshProfile?.onboarding_completed,
    accountType: freshProfile?.account_type,
    username: freshProfile?.username
  });

  // Use fresh profile for the check
  if (!freshProfile || freshProfile.onboarding_completed !== true) {
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