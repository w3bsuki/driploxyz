import { redirect, error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user, profile, supabase } = await parent();
  
  // User authentication check
  if (!user) {
    throw redirect(303, '/login');
  }

  // Critical null guard for supabase client
  if (!supabase) {
    // Don't throw error, let page handle it gracefully
    return {
      user,
      profile,
      supabase: null
    };
  }

  // Use profile from parent to avoid duplicate fetch
  // Parent already fetched profile, no need to fetch again
  if (profile?.onboarding_completed === true) {
    throw redirect(303, '/');
  }

  return {
    user,
    profile,
    supabase
  };
};