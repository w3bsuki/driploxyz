import { redirect } from '@sveltejs/kit';
import { getUserProfile } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase } }) => {
  // Redirect to login if not authenticated
  if (!session || !user) {
    throw redirect(303, '/login');
  }

  // Get user profile
  const profile = await getUserProfile(supabase, user.id);

  return {
    session,
    user,
    profile
  };
};