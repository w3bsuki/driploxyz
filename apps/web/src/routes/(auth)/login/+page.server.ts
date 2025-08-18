import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session } }) => {
  if (session) {
    throw redirect(303, '/');
  }
};

export const actions: Actions = {
  signin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required',
        email
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return fail(400, {
        error: error.message,
        email
      });
    }

    if (data.user) {
      // Check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();
      
      // Log for debugging on Vercel
      console.log('[LOGIN_DEBUG]', { 
        userId: data.user.id, 
        profile, 
        profileError,
        onboardingCompleted: profile?.onboarding_completed 
      });
      
      // If profile doesn't exist, send to onboarding
      if (!profile) {
        console.log('[LOGIN_REDIRECT] No profile found, sending to onboarding');
        throw redirect(303, '/onboarding');
      }
      
      // If onboarding_completed is null or false, send to onboarding
      if (profile.onboarding_completed !== true) {
        console.log('[LOGIN_REDIRECT] Onboarding not completed, sending to onboarding');
        throw redirect(303, '/onboarding');
      }
      
      // Otherwise redirect to home page
      console.log('[LOGIN_REDIRECT] Sending to home');
      throw redirect(303, '/');
    }

    return fail(400, {
      error: 'Unable to sign in',
      email
    });
  }
};