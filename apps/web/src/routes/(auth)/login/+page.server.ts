import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';

const DEBUG = dev;

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
    
    if (DEBUG) {
      console.log('[LOGIN] ========== LOGIN ACTION START ==========');
      console.log('[LOGIN] Form valid:', form.valid);
    }

    if (!form.valid) {
      if (DEBUG) console.log('[LOGIN] Form validation failed');
      return fail(400, { form });
    }
    
    const { email, password } = form.data;
    
    if (DEBUG) {
      console.log('[LOGIN] Attempting login for:', email);
      console.log('[LOGIN] Supabase client exists:', !!supabase);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (DEBUG) {
      console.log('[LOGIN] Auth response - has error:', !!error);
      console.log('[LOGIN] Auth response - has data:', !!data);
      console.log('[LOGIN] Auth response - has user:', !!data?.user);
    }

    if (error) {
      if (DEBUG) console.log('[LOGIN] Auth error:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        return fail(400, {
          form: setError(form, '', 'Invalid email or password')
        });
      }
      if (error.message.includes('Email not confirmed')) {
        return fail(400, {
          form: setError(form, '', 'Please verify your email before logging in')
        });
      }
      
      return fail(400, {
        form: setError(form, '', error.message || 'Unable to sign in')
      });
    }

    if (!data.user || !data.session) {
      if (DEBUG) console.log('[LOGIN] No user or session returned');
      return fail(400, {
        form: setError(form, '', 'Authentication failed. Please try again.')
      });
    }

    if (DEBUG) {
      console.log('[LOGIN] Login successful!');
      console.log('[LOGIN] ========== LOGIN ACTION END ==========');
    }
    
    // Use message pattern exactly like signup
    return message(form, {
      type: 'success',
      text: 'Successfully signed in! Welcome back to Driplo.'
    });
  }
};