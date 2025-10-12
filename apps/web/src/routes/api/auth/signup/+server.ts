/**
 * CONSOLIDATED AUTH API - SIGNUP
 *
 * Clean signup endpoint using consolidated auth system.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SignupSchema } from '$lib/validation/auth';
import { createServerSupabase } from '$lib/auth/index';

export const POST: RequestHandler = async ({ request, cookies, fetch, url }) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = SignupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || 'Invalid signup data';
      return json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { email, password, fullName } = validation.data;

    // Create Supabase client
    const supabase = createServerSupabase(cookies, fetch);

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${url.origin}/auth/callback`
      }
    });

    if (error) {
      return json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Check if user needs email confirmation
    if (data.user && !data.session) {
      return json({
        success: true,
        message: 'Please check your email to confirm your account',
        needsConfirmation: true
      });
    }

    // Success - user is signed up and possibly signed in
    return json({ success: true });
  } catch (error) {
    console.error('[Auth API] Signup error:', error);
    return json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};