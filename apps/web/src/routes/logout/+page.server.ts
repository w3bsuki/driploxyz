/**
 * LOGOUT PAGE
 *
 * Simple logout page that signs out user and redirects.
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  // Use Supabase client from locals and sign out
  const supabase = locals.supabase;

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('[Logout] Sign out error:', error);
    // Continue with redirect even if signout fails
  }

  // Redirect to home page
  redirect(303, '/');
}) satisfies PageServerLoad;