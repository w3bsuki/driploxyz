import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';
import { stripe } from '$lib/stripe/server.js';
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
    const { planId, discountCode = '' } = await event.request.json();
    
    if (!planId) {
      return json({ error: 'Plan ID is required' }, { status: 400 });
    }

    if (!stripe) {
      return json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const supabase = createServerSupabaseClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      if (DEBUG) console.error('[Subscription] Auth error:', authError);
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return json({ error: 'Plan not found' }, { status: 404 });
    }

    let discountAmount = 0;
    let finalAmount = plan.price_monthly;
    let validatedDiscountCode = '';

    // Validate discount code if provided
    if (discountCode) {
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_discount_code', {
          p_code: discountCode,
          p_plan_type: plan.plan_type,
          p_user_id: user.id,
          p_amount: plan.price_monthly
        });

      if (validationError) {
        if (DEBUG) console.error('[Subscription] Discount validation error:', validationError);
        return json({ error: 'Error validating discount code' }, { status: 400 });
      }

      if (!validationResult.valid) {
        return json({ error: validationResult.error }, { status: 400 });
      }

      discountAmount = validationResult.discount_amount;
      finalAmount = validationResult.final_amount;
      validatedDiscountCode = validationResult.code;
    }

    const subscriptionService = new SubscriptionService(supabase);
    const result = await subscriptionService.createStripeSubscription(
      user.id,
      planId,
      stripe,
      discountAmount,
      validatedDiscountCode
    );

    if (result.error) {
      if (DEBUG) console.error('[Subscription] Service error:', result.error);
      return json({ error: result.error.message }, { status: 400 });
    }

    return json({
      subscriptionId: result.subscriptionId,
      clientSecret: result.clientSecret,
      originalAmount: plan.price_monthly,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      discountCode: validatedDiscountCode
    });

  } catch (error) {
    if (DEBUG) console.error('[Subscription] Internal error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};