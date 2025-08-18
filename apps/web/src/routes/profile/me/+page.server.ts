import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { user } = await safeGetSession();
  
  // Production debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('[PROFILE_ME]', {
      hasUser: !!user,
      userId: user?.id?.substring(0, 8)
    });
  }
  
  // If not logged in, redirect to login
  if (!user?.id) {
    console.log('[PROFILE_ME] No user found, redirecting to login');
    throw redirect(303, '/login');
  }

  // Redirect to the user's actual profile page
  console.log('[PROFILE_ME] Redirecting to user profile:', user.id);
  throw redirect(303, `/profile/${user.id}`);
};