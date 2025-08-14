import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';

export const GET: RequestHandler = async (event) => {
  try {
    const supabase = createClient(event);
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price_monthly');

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};