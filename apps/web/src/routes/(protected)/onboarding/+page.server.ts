import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';
import { completeOnboarding, type OnboardingData } from '$lib/auth/onboarding';
import { hasCompletedOnboarding } from '$lib/auth/index';

const log = createLogger('onboarding');

/**
 * Onboarding Page Load Function
 * 
 * Ensures users who have already completed onboarding are redirected to dashboard.
 * Provides necessary data for users still in onboarding process.
 */
export const load = (async ({ locals: { safeGetSession }, parent }) => {
  const { session, user } = await safeGetSession();
  
  log.debug('Loading onboarding page', { userEmail: user?.email });
  
  if (!session || !user) {
    log.debug('No session/user, redirecting to login');
    redirect(303, '/login');
  }

  const parentData = await parent();
  
  log.debug('Profile status check', {
    hasProfile: (!!parentData.profile).toString(),
    onboardingCompleted: parentData.profile?.onboarding_completed?.toString(),
    accountType: parentData.profile?.account_type || undefined
  });
  
  // Check if onboarding is already completed
  if (hasCompletedOnboarding(parentData.profile)) {
    log.debug('User already completed onboarding, redirecting to dashboard');
    redirect(303, '/dashboard');
  }

  log.debug('User needs onboarding, proceeding with page load');

  return {
    user,
    profile: parentData.profile
  };
}) satisfies PageServerLoad;

export const actions = {
  complete: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session, user } = await safeGetSession();

    if (!session || !user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();

    // Extract form data
    const accountType = formData.get('accountType') as 'personal' | 'brand' | 'pro';
    const username = formData.get('username') as string;
    const fullName = formData.get('fullName') as string;
    const location = formData.get('location') as string;
    const avatarUrl = formData.get('avatarUrl') as string;
    const bio = formData.get('bio') as string;
    const payoutMethod = formData.get('payoutMethod') as string;
    const payoutDetails = formData.get('payoutDetails') as string;
    const payoutName = formData.get('payoutName') as string;
    const socialLinks = formData.get('socialLinks') as string;

    log.debug('Starting onboarding completion', {
      userEmail: user.email,
      accountType
    });

    // Parse social links
    let parsedSocialLinks = [];
    try {
      parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : [];
    } catch (e) {
      log.warn('Failed to parse social links', { error: String(e) });
      parsedSocialLinks = [];
    }

    // Build onboarding data
    const onboardingData: OnboardingData = {
      accountType,
      username,
      fullName,
      location,
      avatarUrl,
      bio,
      payoutMethod: {
        type: payoutMethod,
        details: payoutDetails,
        name: payoutName
      },
      socialLinks: parsedSocialLinks
    };

    // Complete onboarding using consolidated system
    const result = await completeOnboarding(supabase, user, onboardingData);

    if (!result.success) {
      if (result.needsPayment) {
        return fail(402, {
          error: result.error,
          needsPayment: true
        });
      }
      return fail(400, { error: result.error });
    }

    log.info('Onboarding completed successfully', { userEmail: user.email });

    return {
      success: true,
      profile: result.profile,
      redirectTo: '/dashboard'
    };
  }
} satisfies Actions;