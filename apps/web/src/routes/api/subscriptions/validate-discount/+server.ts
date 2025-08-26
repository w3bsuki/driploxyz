import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';

export const POST: RequestHandler = async (event) => {
  try {
    const { code, planId } = await event.request.json();
    console.log('[Validate Discount] Request:', { code, planId });
    
    if (!code || !planId) {
      return json({ 
        valid: false, 
        error: 'Discount code and plan ID are required' 
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return json({ 
        valid: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Get plan details to determine plan type
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('plan_type, price_monthly')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return json({ 
        valid: false, 
        error: 'Plan not found' 
      }, { status: 404 });
    }

    // Validate discount code using the stored procedure
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_discount_code', {
        p_code: code.toUpperCase(),
        p_plan_type: plan.plan_type,
        p_user_id: user.id,
        p_amount: plan.price_monthly
      })
      .single();

    if (validationError) {
      console.error('[Discount Validation] Database error:', validationError);
      return json({ 
        valid: false, 
        error: 'Failed to validate discount code' 
      }, { status: 500 });
    }

    console.log('[Discount Validation] Result:', validationResult);

    // Handle both nested and flat response structures
    const result = (validationResult as any)?.validate_discount_code || validationResult;
    
    // Return the validation result
    if (result && result.valid) {
      return json({
        valid: true,
        code: result.code,
        discount_amount: result.discount_amount,
        final_amount: result.final_amount,
        discount_percent: result.discount_percent,
        description: result.description
      });
    } else {
      return json({
        valid: false,
        error: result?.error || 'Invalid discount code'
      });
    }

  } catch (error) {
    console.error('[Discount Validation] Internal error:', error);
    return json({ 
      valid: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};