import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  try {
    const { session, user } = await safeGetSession();

    // For testing - allow access without authentication
    // In production, uncomment the redirect below
    // if (!session) {
    //   throw redirect(303, '/auth/login');
    // }

    // Get available subscription plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (plansError) {
      console.error('Error loading subscription plans:', plansError);
    }

    // Get user's current subscriptions (only if user exists)
    let userSubscriptions = [];
    let profile = null;
    
    if (user) {
      const { data: subs, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subscriptionsError) {
        console.error('Error loading user subscriptions:', subscriptionsError);
      } else {
        userSubscriptions = subs || [];
      }

      // Get user profile
      const { data: prof, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
      } else {
        profile = prof;
      }
    }

    // Check early bird discount eligibility
    const { count, error: countError } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .gt('discount_percent', 0);

    if (countError) {
      console.error('Error checking discount eligibility:', countError);
    }

    const discountInfo = {
      eligible: (count || 0) < 100,
      discountPercent: 50
    };

    return {
      user,
      profile,
      plans: plans || [],
      userSubscriptions: userSubscriptions || [],
      discountInfo
    };

  } catch (error) {
    console.error('Error in upgrade page load:', error);
    
    // If it's a redirect, re-throw it
    if (error?.status === 303) {
      throw error;
    }
    
    // For other errors, return empty data
    return {
      user: null,
      profile: null,
      plans: [],
      userSubscriptions: [],
      discountInfo: { eligible: false, discountPercent: 0 }
    };
  }
};