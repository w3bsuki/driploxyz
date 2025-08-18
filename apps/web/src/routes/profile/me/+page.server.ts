import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { user } = await safeGetSession();
  
  // Production debugging
  console.log('[PROFILE_ME] Route accessed', {
    hasUser: !!user,
    userId: user?.id?.substring(0, 8),
    env: process.env.NODE_ENV
  });
  
  // If not logged in, redirect to login
  if (!user?.id) {
    console.log('[PROFILE_ME] No user found, redirecting to login');
    // Use 302 to avoid caching issues
    throw redirect(302, '/login');
  }

  // Redirect to the user's actual profile page with 302 (temporary redirect)
  console.log('[PROFILE_ME] Redirecting to user profile:', user.id);
  throw redirect(302, `/profile/${user.id}`);