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
    
    const { email, password } = form.data;
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return setError(form, '', 'Invalid email or password');
      }
      if (error.message.includes('Email not confirmed')) {
        return setError(form, '', 'Please verify your email before logging in');
      }
      
      // Return fail with form for superforms to handle properly
      return setError(form, '', error.message || 'Unable to sign in');
    }

    if (!data.user || !data.session) {
      return setError(form, '', 'Authentication failed. Please try again.');
    }

    // Check onboarding status (non-blocking)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();
      
      if (!profile || profile.onboarding_completed !== true) {
        // Redirect to onboarding
        throw redirect(303, '/onboarding');
      }
    } catch (err) {
      // If it's a redirect, rethrow it
      if (err instanceof redirect) throw err;
      // Otherwise continue - profile check is non-critical
    }
    
    // Success - redirect to homepage
    throw redirect(303, '/');
  }
};