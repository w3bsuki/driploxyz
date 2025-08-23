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

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return json({ valid: false, error: 'Plan not found' }, { status: 404 });
    }

    // Validate discount code using the database function
    const { data: result, error: validationError } = await supabase
      .rpc('validate_discount_code', {
        p_code: code.toUpperCase(),
        p_plan_type: plan.plan_type,
        p_user_id: user.id,
        p_amount: plan.price_monthly
      });

    if (validationError) {
      console.error('Discount validation error:', validationError);
      return json({ valid: false, error: 'Failed to validate discount code' }, { status: 500 });
    }

    return json(result);
  } catch (error) {
    console.error('Internal error:', error);
    return json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
};