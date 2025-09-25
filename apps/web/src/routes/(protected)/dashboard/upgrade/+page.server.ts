// import { redirect } from '@sveltejs/kit'; // For future auth redirect
import type { PageServerLoad } from './$types';
import type { Tables } from '@repo/database';

type SubscriptionPlan = Tables<'subscription_plans'>;
type UserSubscription = Tables<'user_subscriptions'> & {
  subscription_plans?: SubscriptionPlan | null;
};
type Profile = Tables<'profiles'>;

export const load = (async ({ locals: { supabase, safeGetSession }, depends, setHeaders }) => {
  try {
    const { user } = await safeGetSession();

    // For testing - allow access without authentication
    // In production, add proper auth check
    // const { session } = await safeGetSession();
    // if (!session) redirect(303, '/auth/login');

    // Set cache headers for dashboard data
    setHeaders({
      'cache-control': 'private, max-age=300, stale-while-revalidate=600'
    });

    // Add dependency tracking for granular invalidation
    depends('app:user-data', 'app:subscriptions', 'app:plans');

    // Always run plans and discount queries in parallel (they don't depend on user)
    const baseQueries = [
      // Get available subscription plans
      supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true }),

      // Check early bird discount eligibility
      supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gt('discount_percent', 0)
    ];

    // Add user-specific queries if user exists
    const userQueries = user ? [
      // Get user's current subscriptions
      supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active'),

      // Get user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    ] : [];

    // Run all queries in parallel using Promise.allSettled
    const allQueries = [...baseQueries, ...userQueries];
    const results = await Promise.allSettled(allQueries);

    // Extract base results with proper type handling
    const plansResult = results[0];
    const discountCountResult = results[1];

    let plans: SubscriptionPlan[] = [];
    let discountCount = 0;

    if (plansResult?.status === 'fulfilled') {
      const plansResponse = plansResult.value as { data: SubscriptionPlan[] | null; error: unknown };
      if (!plansResponse.error) {
        plans = plansResponse.data || [];
      }
    }

    if (discountCountResult?.status === 'fulfilled') {
      const countResponse = discountCountResult.value as { count: number | null; error: unknown };
      if (!countResponse.error) {
        discountCount = countResponse.count || 0;
      }
    }

    // Extract user-specific results if user exists
    let userSubscriptions: UserSubscription[] = [];
    let profile: Profile | null = null;

    if (user && results.length > 2) {
      const subscriptionsResult = results[2];
      const profileResult = results[3];

      if (subscriptionsResult?.status === 'fulfilled') {
        const subsResponse = subscriptionsResult.value as { data: UserSubscription[] | null; error: unknown };
        if (!subsResponse.error) {
          userSubscriptions = subsResponse.data || [];
        }
      }

      if (profileResult?.status === 'fulfilled') {
        const profileResponse = profileResult.value as { data: Profile | null; error: unknown };
        if (!profileResponse.error) {
          profile = profileResponse.data;
        }
      }
    }

    // Map proper plan names and descriptions based on plan_type
    const plansWithProperNames = plans.map((plan: SubscriptionPlan) => {
      let name = plan.name;
      let description = plan.description;

      switch(plan.plan_type) {
        case 'free':
          name = 'Free Plan';
          description = 'Start selling with basic features';
          break;
        case 'basic':
          name = 'Basic Plan';
          description = 'Essential tools for casual sellers';
          break;
        case 'premium':
          name = 'Premium Plan';
          description = 'Boost your visibility and sales';
          break;
        case 'brand':
          name = 'Brand Plan';
          description = 'Professional tools for businesses';
          break;
      }

      return {
        ...plan,
        name,
        description
      };
    });

    const discountInfo = {
      eligible: discountCount < 100,
      discountPercent: 50
    };

    return {
      user,
      profile,
      plans: plansWithProperNames,
      userSubscriptions,
      discountInfo
    };

  } catch (error) {
    console.error('Upgrade dashboard error:', error);

    // If it's a redirect, re-throw it
    if (error instanceof Response && error.status === 303) {
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
}) satisfies PageServerLoad;