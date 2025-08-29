import type { PageLoad } from './$types';
import { createBrowserSupabaseClient } from '$lib/supabase/client';

/**
 * Dashboard Page Load Function
 * 
 * This is the primary landing page after onboarding completion.
 * Uses profile from parent layout to avoid re-fetching.
 */
export const load: PageLoad = async ({ parent }) => {
  const { user, profile } = await parent();
  const supabase = createBrowserSupabaseClient();

  console.log('[DASHBOARD] Loading dashboard for user:', user?.email);
  console.log('[DASHBOARD] Profile status:', {
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    accountType: profile?.account_type,
    username: profile?.username
  });

  if (!user) {
    console.log('[DASHBOARD] No user found in parent data');
    return {
      products: [],
      orders: [],
      profile: null,
      user: null
    };
  }

  // Trust the profile from parent layout - it's already fresh from the server
  // This prevents unnecessary re-fetching and potential loops
  
  // Only redirect if profile explicitly shows onboarding not completed
  // Allow dashboard access if onboarding_completed is null (for backward compatibility)
  if (profile && profile.onboarding_completed === false) {
    console.log('[DASHBOARD] Onboarding not completed, user should complete it');
    // Don't redirect here, let the UI show a message instead
  }

  console.log('[DASHBOARD] Loading dashboard data');

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
    .order('created_at', { ascending: false })
    .limit(50); // Reasonable limit for dashboard view

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
    .order('created_at', { ascending: false })
    .limit(50); // Reasonable limit for dashboard view

  if (productsError) {
    console.error('[DASHBOARD] Error fetching products:', productsError);
  }

  if (ordersError) {
    console.error('[DASHBOARD] Error fetching orders:', ordersError);
  }

  return {
    products: products || [],
    orders: orders || [],
    profile: profile || null,
    user
  };
};