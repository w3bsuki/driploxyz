import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';

export const POST: RequestHandler = async (event) => {
  try {
    const { subscriptionId } = await event.request.json();
    
    if (!subscriptionId) {
      return json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    const supabase = createClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionService = new SubscriptionService(supabase);
    
    const result = await subscriptionService.cancelSubscription(user.id, subscriptionId);

    if (result.error) {
      return json({ error: result.error.message }, { status: 400 });
    }

    return json({ success: true });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};