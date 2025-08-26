import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canSell, getCannotSellReason } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, session } = locals;
  
  if (!session) {
    throw redirect(303, '/login?redirect=/become-seller');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // If user can already sell, redirect to sell page
  if (canSell(profile)) {
    throw redirect(303, '/sell');
  }

  // Get the specific reason why they can't sell
  const reason = getCannotSellReason(profile);
  
  return {
    profile,
    reason,
    needsOnboarding: !profile?.onboarding_completed
  };
};