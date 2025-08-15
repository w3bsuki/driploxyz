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
    console.error('[ONBOARDING] Supabase client is null');
    // Don't throw error, let page handle it gracefully
    return {
      user,
      profile,
      supabase: null
    };
  }

  // Use profile from parent to avoid duplicate fetch
  // Parent already fetched profile, no need to fetch again
  if (profile?.onboarding_completed) {
    console.log('[ONBOARDING] Already completed, redirecting to dashboard');
    throw redirect(303, '/dashboard');
  }

  return {
    user,
    profile,
    supabase
  };
};