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
    console.log('[LOGIN] ========== LOGIN ACTION START ==========');
    console.log('[LOGIN] Timestamp:', new Date().toISOString());
    console.log('[LOGIN] Request method:', request.method);
    console.log('[LOGIN] Request URL:', request.url);
    console.log('[LOGIN] Headers:', Object.fromEntries(request.headers.entries()));
    
    const form = await superValidate(request, zod(LoginSchema));
    console.log('[LOGIN] Form validation result:', { valid: form.valid, data: form.data, errors: form.errors });
    
    if (!form.valid) {
      console.log('[LOGIN] Form invalid - returning fail with errors');
      return fail(400, { form });
    }
    
    const { email, password } = form.data;
    console.log('[LOGIN] Attempting login for email:', email);
    console.log('[LOGIN] Supabase client exists:', !!supabase);
    console.log('[LOGIN] Supabase auth exists:', !!supabase?.auth);
    
    try {
      // Sign in with Supabase
      console.log('[LOGIN] Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('[LOGIN] Auth response received');
      console.log('[LOGIN] Has data:', !!data);
      console.log('[LOGIN] Has user:', !!data?.user);
      console.log('[LOGIN] Has session:', !!data?.session);
      console.log('[LOGIN] Error:', error ? { message: error.message, status: error.status, code: error.code } : null);
    } catch (e: any) {
      console.error('[LOGIN] Exception during auth:', e);
      return setError(form, '', `Authentication exception: ${e.message}`);
    }

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
    } catch (err: any) {
      // Check if it's a SvelteKit redirect (has status 303)
      if (err?.status === 303 || err?.location) throw err;
      // Otherwise continue - profile check is non-critical
    }
    
    // Success - redirect to homepage
    console.log('[LOGIN] Login successful! Redirecting to homepage');
    console.log('[LOGIN] ========== LOGIN ACTION END ==========');
    throw redirect(303, '/');
  }
};