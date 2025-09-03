import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { env } from '$env/dynamic/private';

const DEBUG = env.DEBUG === 'true';

// Configuration constants
const EARLY_BIRD_LIMIT = 100;
const DISCOUNT_PERCENT = 50;

export const GET: RequestHandler = async (event) => {
  try {
    const supabase = createServerSupabaseClient(event);
    
    // Check early bird eligibility without requiring authentication
    const { count, error } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .gt('discount_percent', 0);
    
    if (error) {
      if (DEBUG) console.error('[Discount] Database error:', error);
      return json({ 
        eligible: false, 
        discountPercent: 0,
        error: 'Unable to check discount eligibility' 
      }, { status: 500 });
    }
    
    const discountInfo = {
      eligible: (count || 0) < EARLY_BIRD_LIMIT,
      discountPercent: DISCOUNT_PERCENT,
      remaining: Math.max(0, EARLY_BIRD_LIMIT - (count || 0))
    };

    return json(discountInfo);

  } catch (error) {
    if (DEBUG) console.error('[Discount] Internal error:', error);
    return json({ 
      eligible: false, 
      discountPercent: 0,
      error: 'Internal server error' 
    }, { status: 500 });
  }
};