/**
 * CONSOLIDATED AUTH API - LOGIN
 *
 * Clean login endpoint using consolidated auth system.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LoginSchema } from '$lib/validation/auth';
import { createServerSupabase } from '$lib/auth/index';

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return json(
        { success: false, error: 'Invalid login data' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Create Supabase client
    const supabase = createServerSupabase(cookies, fetch);

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (!data.session || !data.user) {
      return json(
        { success: false, error: 'Login failed' },
        { status: 400 }
      );
    }

    // Success - cookies are automatically set by Supabase client
    return json({ success: true });
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};