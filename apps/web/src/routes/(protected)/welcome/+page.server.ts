import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { PageServerLoad } from './$types';

/**
 * Welcome page after successful onboarding
 * This page verifies the profile is complete and redirects to the dashboard
 */
export const load = (async ({ locals: { safeGetSession }, parent }) => {
  const { session, user } = await safeGetSession();
  
  if (!session || !user) {
    redirect(303, '/login');
  }

  const parentData = await parent();
  
  if (dev) {
    
    console.log('[WELCOME] Profile data:', {
      hasProfile: !!parentData.profile,
      onboardingCompleted: parentData.profile?.onboarding_completed,
      accountType: parentData.profile?.account_type,
      username: parentData.profile?.username
    });
  }

  // If onboarding not completed, send back to onboarding
  if (!parentData.profile || !parentData.profile.onboarding_completed) {
    if (dev) {
      // Development logging for onboarding redirect
    }
    redirect(303, '/onboarding');
  }

  // Profile is complete, proceed to dashboard
  if (dev) {
    console.log('Development mode - redirecting to dashboard');
  }
  redirect(303, '/dashboard');
}) satisfies PageServerLoad;