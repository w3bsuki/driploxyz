import { redirect } from '@sveltejs/kit';
import { getUserProfile } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

/**
 * Protected Route Guard
 * 
 * Ensures users are authenticated and handles the onboarding flow.
 * Key principles:
 * - Always redirect unauthenticated users to login
 * - Load profile data for authenticated users
 * - Let individual routes handle onboarding requirements
 * - Don't redirect to onboarding here (causes loops)
 */
export const load: LayoutServerLoad = async ({ locals: { session, user, supabase }, url }) => {
  console.log('[PROTECTED LAYOUT] Loading for path:', url.pathname);
  
  // Redirect to login if not authenticated
  if (!session || !user) {
    console.log('[PROTECTED LAYOUT] No session/user, redirecting to login');
    throw redirect(303, '/login');
  }

  console.log('[PROTECTED LAYOUT] User authenticated:', user.email);

  // Get fresh user profile data
  const profile = await getUserProfile(supabase, user.id);
  
  console.log('[PROTECTED LAYOUT] Profile loaded:', {
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    accountType: profile?.account_type,
    username: profile?.username
  });

  // IMPORTANT: Don't redirect to onboarding here!
  // Individual routes will handle onboarding requirements.
  // This prevents loops when onboarding is completed but cache isn't updated yet.
  
  return {
    session,
    user,
    profile
  };
};