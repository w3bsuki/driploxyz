import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { SubscriptionService } from '@repo/core/services/subscriptions';
import { stripe } from '@repo/core/stripe/server';
import { enforceRateLimit } from '$lib/security/rate-limiter';
import { env } from '$env/dynamic/private';

const DEBUG = env.DEBUG === 'true';

export const POST: RequestHandler = async (event) => {
  // Critical rate limiting for subscription creation
  const rateLimitResponse = await enforceRateLimit(
    event.request, 
    event.getClientAddress, 
    'payment',
    `subscription-create:${event.getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
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
      if (DEBUG) {
        console.error('Authentication error:', authError);
      }
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
      // Handle INDECISIVE test discount code directly
      if (discountCode.toUpperCase() === 'INDECISIVE') {
        discountAmount = plan.price_monthly * 0.90; // 90% off
        finalAmount = plan.price_monthly * 0.10; // 10% of original price
        validatedDiscountCode = 'INDECISIVE';
        console.log('[Subscription] INDECISIVE discount applied:', { 
          original: plan.price_monthly, 
          discount: discountAmount, 
          final: finalAmount 
        });
      } else {
        // Try database validation for other codes
        const { data: validationResult, error: validationError } = await supabase
          .rpc('validate_discount_code', {
            p_code: discountCode,
            p_plan_type: plan.plan_type,
            p_user_id: user.id,
            p_amount: plan.price_monthly
          })
          .single();

        if (validationError) {
          if (DEBUG) {
            console.error('Discount validation error:', validationError);
          }
          return json({ error: 'Invalid discount code' }, { status: 400 });
        }

        // Handle nested response structure
        const result = (validationResult as { validate_discount_code?: unknown })?.validate_discount_code || validationResult;

        const typedResult = result as { valid?: boolean; error?: string; discount_amount?: number; final_amount?: number; code?: string };
        if (!typedResult?.valid) {
          return json({ error: typedResult?.error || 'Invalid discount code' }, { status: 400 });
        }

        discountAmount = typedResult.discount_amount || 0;
        finalAmount = typedResult.final_amount || finalAmount;
        validatedDiscountCode = typedResult.code || '';
      }
    }

    const subscriptionService = new SubscriptionService(supabase);
    const result = await subscriptionService.createStripeSubscription(
      user.id,
      planId,
      stripe,
      discountAmount
    );

    if (result.error) {
      if (DEBUG) {
        console.error('Subscription creation error:', result.error);
      }
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
    if (DEBUG) {
      console.error('Subscription create error:', error);
    }
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};