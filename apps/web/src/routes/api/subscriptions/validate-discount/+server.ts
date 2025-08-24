import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';

export const POST: RequestHandler = async (event) => {
  try {
    const { code, planId } = await event.request.json();
    
    if (!code || !planId) {
      return json({ valid: false, error: 'Code and plan ID are required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(event);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return json({ valid: false, error: 'Authentication required' }, { status: 401 });
    }

    // Determine base price based on plan
    let basePrice = 50; // default brand price
    let planType = 'brand';
    
    if (planId === 'brand_monthly' || planId === 'brand') {
      basePrice = 50;
      planType = 'brand';
    } else if (planId === 'premium_monthly' || planId === 'premium') {
      basePrice = 25;
      planType = 'premium';
    }

    // Validate discount code using the database function
    const { data: result, error: validationError } = await supabase
      .rpc('validate_discount_code', {
        p_code: code.toUpperCase().trim(),
        p_plan_type: planType,
        p_user_id: user.id,
        p_amount: basePrice
      });

    if (validationError) {
      console.error('Discount validation error:', validationError);
      return json({ valid: false, error: 'Invalid discount code' }, { status: 400 });
    }

    // The RPC function returns the result directly
    if (result && result.valid) {
      return json({
        valid: true,
        discount_amount: result.discount_amount || 0,
        final_amount: result.final_amount || basePrice,
        discount_percent: result.discount_percent || 0,
        code: code.toUpperCase().trim(),
        description: result.description || ''
      });
    }

    return json({ valid: false, error: 'Invalid discount code' }, { status: 400 });
  } catch (error) {
    console.error('Internal error:', error);
    return json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
};