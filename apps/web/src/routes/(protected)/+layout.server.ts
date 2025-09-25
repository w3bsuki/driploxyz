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
export const load = (async ({ locals: { session, user, supabase } }) => {
  // Redirect to login if not authenticated
  if (!session || !user) {
    try {
      redirect(303, '/login');
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      console.error('Protected layout redirect error:', error);
      // This is a critical auth failure - we can't continue without authentication
      throw new Error('Authentication system error');
    }
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