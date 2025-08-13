import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user, supabase } = await parent();
  
  if (!user) {
    throw redirect(303, '/login');
  }

  // Check if onboarding is already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    throw redirect(303, '/dashboard');
  }

  return {
    user,
    supabase
  };
};