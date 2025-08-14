import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';

export const POST: RequestHandler = async (event) => {
  try {
    const { planId, discountPercent = 0 } = await event.request.json();
    console.log('🔥 API ENDPOINT - Received request:', { planId, discountPercent });
    
    if (!planId) {
      console.error('🔥 API ENDPOINT - Missing plan ID');
      return json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const supabase = createClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('🔥 API ENDPOINT - Auth error:', authError);
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🔥 API ENDPOINT - User authenticated:', user.id);

    const subscriptionService = new SubscriptionService(supabase);
    
    console.log('🔥 API ENDPOINT - Creating subscription...');
    const result = await subscriptionService.createStripeSubscription(
      user.id,
      planId,
      discountPercent
    );
    
    console.log('🔥 API ENDPOINT - Service result:', result);

    if (result.error) {
      console.error('🔥 API ENDPOINT - Service error:', result.error);
      return json({ error: result.error.message }, { status: 400 });
    }

    return json({
      subscriptionId: result.subscriptionId,
      clientSecret: result.clientSecret
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};