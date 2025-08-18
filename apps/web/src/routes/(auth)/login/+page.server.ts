import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  const form = await superValidate(zod(LoginSchema));
  
  // Handle auth callback errors
  const error = url.searchParams.get('error');
  let errorMessage = null;
  
  if (error) {
    switch (error) {
      case 'auth_failed':
        errorMessage = 'Authentication failed. Please try again.';
        break;
      case 'session_exchange_failed':
        errorMessage = 'Unable to complete sign in. Please try again.';
        break;
      case 'auth_callback_failed':
        errorMessage = 'Authentication callback failed. Please try signing in again.';
        break;
      case 'no_auth_code':
        errorMessage = 'Authentication code missing. Please try signing in again.';
        break;
      default:
        errorMessage = decodeURIComponent(error);
    }
  }
  
  return { form, errorMessage };
};

export const actions: Actions = {
  signin: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod(LoginSchema));
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { email, password } = form.data as { email: string; password: string };
    

    let data, error;
    
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
      data = response.data;
      error = response.error;
    } catch (e) {
      return setError(form, '', 'Authentication service error. Please try again.');
    }

    if (error) {
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