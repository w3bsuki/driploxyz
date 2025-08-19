import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth';
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
  signin: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod(LoginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { email, password } = form.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError(form, '', 'Invalid email or password');
        return fail(400, { form });
      }
      if (error.message.includes('Email not confirmed')) {
        setError(form, '', 'Please verify your email before logging in');
        return fail(400, { form });
      }
      
      setError(form, '', error.message || 'Unable to sign in');
      return fail(400, { form });
    }

    if (!data.user || !data.session) {
      setError(form, '', 'Authentication failed. Please try again.');
      return fail(400, { form });
    }
    
    // Use message pattern exactly like signup
    return message(form, {
      type: 'success',
      text: 'Successfully signed in! Welcome back to Driplo.'
    });
  }
};