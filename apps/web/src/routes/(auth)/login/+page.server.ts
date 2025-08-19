import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth';
import { dev, building } from '$app/environment';
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
  signin: async ({ request, locals: { supabase }, url }) => {
    // Always log in production to debug Vercel issues
    console.log('[LOGIN] ========== LOGIN ACTION START ==========');
    console.log('[LOGIN] Timestamp:', new Date().toISOString());
    console.log('[LOGIN] Request method:', request.method);
    console.log('[LOGIN] Request URL:', request.url);
    console.log('[LOGIN] Site URL origin:', url.origin);
    console.log('[LOGIN] Environment:', { dev, building: typeof building !== 'undefined' ? building : 'undefined' });
    console.log('[LOGIN] Has supabase client:', !!supabase);
    console.log('[LOGIN] Headers:', Object.fromEntries(request.headers.entries()));
    
    const form = await superValidate(request, zod(LoginSchema));
    console.log('[LOGIN] Form validation result:', { valid: form.valid, data: form.data, errors: form.errors });
    
    if (!form.valid) {
      console.log('[LOGIN] Form invalid - returning fail with errors');
      return fail(400, { form });
    }
    
    const { email, password } = form.data;
    console.log('[LOGIN] Attempting login');
    console.log('[LOGIN] Supabase client exists:', !!supabase);
    
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

    if (error) {
      // Handle specific error cases
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
      
      // Return fail with form for superforms to handle properly
      return fail(400, {
        form: setError(form, '', error.message || 'Unable to sign in')
      });
    }

    if (!data.user || !data.session) {
      return fail(400, {
        form: setError(form, '', 'Authentication failed. Please try again.')
      });
    }

    // Check onboarding status (non-blocking)
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();
    
    if (!profile || profile.onboarding_completed !== true) {
      // Redirect to onboarding
      throw redirect(303, '/onboarding');
    }
    
    // Success - redirect to homepage
    console.log('[LOGIN] Login successful! Redirecting to homepage');
    console.log('[LOGIN] ========== LOGIN ACTION END ==========');
    throw redirect(303, '/');
  }
};