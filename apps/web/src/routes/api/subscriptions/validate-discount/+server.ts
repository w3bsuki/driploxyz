import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  try {
    const { code, planId } = await event.request.json();
    // Validating discount code for subscription
    
    if (!code || !planId) {
      return json({ 
        valid: false, 
        error: 'Discount code and plan ID are required' 
      }, { status: 400 });
    }

    const supabase = event.locals.supabase;
    
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
      // Discount validation database error
      return json({ 
        valid: false, 
        error: 'Failed to validate discount code' 
      }, { status: 500 });
    }

    // Discount validation completed

    // Type the validation result properly
    interface DiscountValidationResult {
      valid: boolean;
      code?: string;
      discount_amount?: number;
      final_amount?: number;
      discount_percent?: number;
      description?: string;
      error?: string;
    }

    // Handle both nested and flat response structures
    const result = (validationResult as { validate_discount_code?: DiscountValidationResult } | DiscountValidationResult);
    const typedResult = ('validate_discount_code' in result ? result.validate_discount_code : result) as DiscountValidationResult;

    // Return the validation result
    if (typedResult && typedResult.valid) {
      return json({
        valid: true,
        code: typedResult.code,
        discount_amount: typedResult.discount_amount,
        final_amount: typedResult.final_amount,
        discount_percent: typedResult.discount_percent,
        description: typedResult.description
      });
    } else {
      return json({
        valid: false,
        error: typedResult?.error || 'Invalid discount code'
      });
    }

  } catch {
    // Internal error during discount validation
    return json({ 
      valid: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};