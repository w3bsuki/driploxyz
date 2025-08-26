import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';
import { stripe } from '$lib/stripe/server.js';
import { env } from '$env/dynamic/private';

const DEBUG = env.DEBUG === 'true';

export const POST: RequestHandler = async (event) => {
  try {
    const { subscriptionId } = await event.request.json();
    
    if (!subscriptionId) {
      return json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionService = new SubscriptionService(supabase);
    
    const result = await subscriptionService.cancelSubscription(user.id, subscriptionId, stripe);

    if (result.error) {
      return json({ error: result.error.message }, { status: 400 });
    }

    return json({ success: true });

  } catch (error) {
    if (DEBUG) console.error('[Cancel] Internal error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};