import { redirect, fail, error } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth';
import { checkRateLimit, rateLimiter } from '$lib/security/rate-limiter';
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
  signin: async ({ request, locals: { supabase }, getClientAddress }) => {
    const form = await superValidate(request, zod(LoginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { email, password } = form.data;
    
    // Rate limiting by IP address
    const clientIp = getClientAddress();
    const rateLimitKey = `login:${clientIp}`;
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 'login');
    
    if (!allowed) {
      setError(form, '', `Too many login attempts. Please try again in ${retryAfter} seconds.`);
      return fail(429, { form });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(), // Normalize email
      password
    });

    if (error) {
      console.error('Login error:', error.message);
      
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
    
    // Reset rate limit on successful login
    rateLimiter.reset(rateLimitKey);
    
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();
    
    if (!profile || !profile.onboarding_completed) {
      throw redirect(303, '/onboarding');
    }
    
    // Redirect to home page after successful login
    throw redirect(303, '/');
  }
};