import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';
import { env } from '$env/dynamic/private';

const DEBUG = env.DEBUG === 'true';

function getPlanTypeFromId(planId: string): string {
  // Map plan IDs to plan types
  const planMap: Record<string, string> = {
    'c0587696-cbcd-4e6b-b6bc-ba84fb47ddce': 'premium',
    '989b722e-4050-4c63-ac8b-ab105f14027c': 'brand',
    '6ac0c16b-f873-41e6-beb1-1f5540f5c535': 'basic',
    '9af2e506-8bed-4630-9f34-2ebb64c763a3': 'free'
  };
  return planMap[planId] || '';
}

export const POST: RequestHandler = async (event) => {
  try {
    const { planId, discountPercent = 0, discountCode = '' } = await event.request.json();
    
    if (!planId) {
      return json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(event);
    
    // Validate discount code if provided
    let validatedDiscountPercent = discountPercent;
    if (discountCode) {
      const { data: codeData, error: codeError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode)
        .eq('is_active', true)
        .single();
      
      if (!codeError && codeData) {
        // Check if code is valid for this plan
        if (!codeData.plan_type || codeData.plan_type === getPlanTypeFromId(planId)) {
          // Check if code hasn't exceeded max uses
          if (!codeData.max_uses || codeData.uses_count < codeData.max_uses) {
            // Check if code is within valid date range
            const now = new Date();
            const validFrom = new Date(codeData.valid_from);
            const validUntil = codeData.valid_until ? new Date(codeData.valid_until) : null;
            
            if (now >= validFrom && (!validUntil || now <= validUntil)) {
              validatedDiscountPercent = codeData.discount_percent;
              
              // Increment uses count
              await supabase
                .from('discount_codes')
                .update({ uses_count: codeData.uses_count + 1 })
                .eq('id', codeData.id);
            }
          }
        }
      }
    }

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
      validatedDiscountPercent
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