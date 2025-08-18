import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';
import { env } from '$env/dynamic/private';

const DEBUG = env.DEBUG === 'true';

export const POST: RequestHandler = async (event) => {
  try {
    const { planId, discountPercent = 0 } = await event.request.json();
    
    if (!planId) {
      return json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      if (DEBUG) console.error('[Subscription] Auth error:', authError);
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionService = new SubscriptionService(supabase);
    const result = await subscriptionService.createStripeSubscription(
      user.id,
      planId,
      discountPercent
    );

    if (result.error) {
      if (DEBUG) console.error('[Subscription] Service error:', result.error);
      return json({ error: result.error.message }, { status: 400 });
    }

    return json({
      subscriptionId: result.subscriptionId,
      clientSecret: result.clientSecret
    });

  } catch (error) {
    if (DEBUG) console.error('[Subscription] Internal error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};