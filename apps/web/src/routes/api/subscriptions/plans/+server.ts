import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { env } from '$env/dynamic/private';

const DEBUG = env.DEBUG === 'true';

export const GET: RequestHandler = async (event) => {
  try {
    const supabase = createServerSupabaseClient(event);
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('price_monthly', { ascending: true });

    if (error) {
      if (DEBUG) console.error('[Plans] Database error:', error);
      return json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
    }

    // Transform plans to include formatted prices
    const transformedPlans = plans?.map(plan => ({
      ...plan,
      formattedMonthlyPrice: `$${(plan.price_monthly / 100).toFixed(2)}`,
      formattedYearlyPrice: plan.price_yearly ? `$${(plan.price_yearly / 100).toFixed(2)}` : null,
      yearlySavings: plan.price_yearly 
        ? Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)
        : null
    })) || [];

    return json({ plans: transformedPlans });
    
  } catch (error) {
    if (DEBUG) console.error('[Plans] Internal error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};