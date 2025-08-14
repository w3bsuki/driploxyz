import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';

export const GET: RequestHandler = async (event) => {
  try {
    const supabase = createClient(event);
    const subscriptionService = new SubscriptionService(supabase);
    
    // Return discount eligibility - this can be public information
    // We check early bird status without requiring authentication
    const { count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .gt('discount_percent', 0);
    
    const EARLY_BIRD_LIMIT = 100;
    const DISCOUNT_PERCENT = 50;
    
    const discountInfo = {
      eligible: (count || 0) < EARLY_BIRD_LIMIT,
      discountPercent: DISCOUNT_PERCENT
    };

    return json(discountInfo);

  } catch (error) {
    console.error('Error checking discount eligibility:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};