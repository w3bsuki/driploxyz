import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { user, profile } = await parent();
  
  // User authentication check
  if (!user) {
    redirect(303, '/login');
  }

  // Use profile from parent to avoid duplicate fetch
  // Parent already fetched profile, no need to fetch again
  if (profile?.onboarding_completed === true) {
    redirect(303, '/');
  }

  return {
    user,
    profile
  };
}) satisfies PageLoad;