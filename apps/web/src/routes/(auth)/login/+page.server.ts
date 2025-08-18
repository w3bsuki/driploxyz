import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  const form = await superValidate(zod(LoginSchema));
  return { form };
};

export const actions: Actions = {
  signin: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod(LoginSchema));
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { email, password } = form.data as { email: string; password: string };
    
    // Minimal production logging
    console.log('[LOGIN_ATTEMPT]', { email: email.substring(0, email.indexOf('@')), origin: url.origin });

    let data, error;
    
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
      data = response.data;
      error = response.error;
    } catch (e) {
      console.error('[LOGIN_ERROR] Exception during sign in:', e);
      return setError(form, '', 'Authentication service error. Please try again.');
    }

    if (error) {
      console.error('[LOGIN_ERROR]', {
        code: error.code,
        message: error.message,
        status: error.status
      });
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return setError(form, '', 'Invalid email or password');
      }
      if (error.message.includes('Email not confirmed')) {
        return setError(form, '', 'Please verify your email before logging in');
      }
      
      return setError(form, '', error.message || 'Unable to sign in');
    }

    if (data.user) {
      // Check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();
      
      // Handle onboarding redirection
      if (!profile || profile.onboarding_completed !== true) {
        throw redirect(303, '/onboarding');
      }
      
      throw redirect(302, '/');
    }
    
    return setError(form, '', 'Authentication failed. Please try again.');
  }
};