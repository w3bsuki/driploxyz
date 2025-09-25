/**
 * LOGOUT PAGE
 *
 * Simple logout page that signs out user and redirects.
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerSupabase } from '$lib/auth/index';

export const load = (async ({ cookies, fetch }) => {
  // Create Supabase client and sign out
  const supabase = createServerSupabase(cookies, fetch);

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('[Logout] Sign out error:', error);
    // Continue with redirect even if signout fails
  }

  // Redirect to home page
  redirect(303, '/');
}) satisfies PageServerLoad;