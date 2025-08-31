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
export const load = (async ({ locals: { session, user, supabase }, url }) => {
  // Redirect to login if not authenticated
  if (!session || !user) {
    throw redirect(303, '/login');
  }

  // Get fresh user profile data
  const profile = await getUserProfile(supabase, user.id);

  // IMPORTANT: Don't redirect to onboarding here!
  // Individual routes will handle onboarding requirements.
  // This prevents loops when onboarding is completed but cache isn't updated yet.
  
  return {
    session,
    user,
    profile
  };
}) satisfies LayoutServerLoad;