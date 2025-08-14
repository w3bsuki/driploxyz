import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
  // Redirect to login if not authenticated
  if (!session) {
    throw redirect(303, '/login?redirect=/sell');
  }

  const services = createServices(supabase);

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, subscription_tier, premium_boosts_remaining')
      .eq('id', session.user.id)
      .single();

    // Check if brand user can list products
    let canListProducts = true;
    if (profile?.account_type === 'brand') {
      canListProducts = profile.subscription_tier === 'brand';
    }

    // Get all categories for the form
    const { data: categories, error: categoriesError } = await services.categories.getCategories();

    if (categoriesError) {
      console.error('Error loading categories:', categoriesError);
    }

    // Get available subscription plans for upgrade prompt
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    return {
      user: session.user,
      profile,
      categories: categories || [],
      canListProducts,
      plans: plans || [],
      needsBrandSubscription: profile?.account_type === 'brand' && !canListProducts
    };
  } catch (error) {
    console.error('Error loading sell page:', error);
    return {
      user: session.user,
      profile: null,
      categories: [],
      canListProducts: true,
      plans: [],
      needsBrandSubscription: false
    };
  }
};