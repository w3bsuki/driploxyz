import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProfileService } from '$lib/services/profiles';

export const load = (async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  
  if (!user) {
    redirect(302, '/login');
  }

  // Get user's profile to find their username
  const profileService = new ProfileService(locals.supabase);
  const { data: profile, error } = await profileService.getProfile(user.id);
  
  if (error || !profile || !profile.username) {
    // If no username found, redirect to onboarding to complete profile
    redirect(302, '/onboarding');
  }

  // Redirect to user's profile using their username
  redirect(302, `/profile/${profile.username}`);
}) satisfies PageServerLoad;