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
    console.log('🔴 LOGIN ACTION CALLED');
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    
    const form = await superValidate(request, zod(LoginSchema));
    console.log('Form validation result:', form.valid);
    console.log('Form data:', form.data);
    
    if (!form.valid) {
      console.log('❌ Form validation failed:', form.errors);
      return fail(400, { form });
    }
    
    const { email, password } = form.data;
    console.log('🔐 Attempting login for:', email);
    
    // Sign in with Supabase
    console.log('📡 Calling Supabase signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('📡 Supabase response:', { data: !!data, error: !!error });

    if (error) {
      console.error('Supabase auth error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        setError(form, '', 'Invalid email or password');
        return fail(400, { form });
      }
      if (error.message.includes('Email not confirmed')) {
        setError(form, '', 'Please verify your email before logging in');
        return fail(400, { form });
      }
      
      // Return fail with form for superforms to handle properly
      setError(form, '', error.message || 'Unable to sign in');
      return fail(400, { form });
    }

    if (!data.user || !data.session) {
      setError(form, '', 'Authentication failed. Please try again.');
      return fail(400, { form });
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
      console.warn('Profile check failed:', err);
    }
    
    // Success - redirect to homepage
    throw redirect(303, '/');
  }
};