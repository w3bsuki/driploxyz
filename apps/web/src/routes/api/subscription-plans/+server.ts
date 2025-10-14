import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  try {
    const supabase = event.locals.supabase;
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      
      return json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
    }

    return json(plans || []);
  } catch {
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};