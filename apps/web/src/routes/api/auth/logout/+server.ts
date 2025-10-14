/**
 * CONSOLIDATED AUTH API - LOGOUT
 *
 * Clean logout endpoint using consolidated auth system.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Use Supabase client from locals
    const supabase = locals.supabase;

    // Sign out - this will clear the cookies
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('[Auth API] Logout error:', error);
      // Don't fail logout if there's an error - just clear cookies
    }

    // Return success
    return json({ success: true });
  } catch (error) {
    console.error('[Auth API] Logout error:', error);
    // Even on error, return success to ensure logout flow completes
    return json({ success: true });
  }
};