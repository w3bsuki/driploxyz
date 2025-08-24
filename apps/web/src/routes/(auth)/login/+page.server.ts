import { redirect, fail, error } from '@sveltejs/kit';
import { LoginSchema } from '$lib/validation/auth';
import { checkRateLimit, rateLimiter } from '$lib/security/rate-limiter';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
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
  
  return { errorMessage };
};

export const actions: Actions = {
  signin: async ({ request, locals: { supabase }, getClientAddress }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Manual validation using Zod schema
    const validation = LoginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          errors[error.path[0]] = error.message;
        }
      });
      return fail(400, { errors, values: { email, password } });
    }
    
    const { email: validatedEmail, password: validatedPassword } = validation.data;
    
    // Rate limiting by IP address
    const clientIp = getClientAddress();
    const rateLimitKey = `login:${clientIp}`;
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 'login');
    
    if (!allowed) {
      return fail(429, { 
        errors: { _form: `Too many login attempts. Please try again in ${retryAfter} seconds.` }, 
        values: { email: validatedEmail, password: '' } 
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedEmail.toLowerCase().trim(), // Normalize email
      password: validatedPassword
    });

    if (error) {
      let errorMessage = 'Unable to sign in';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return fail(400, { 
        errors: { _form: errorMessage }, 
        values: { email: validatedEmail, password: '' } 
      });
    }

    if (!data.user || !data.session) {
      return fail(400, { 
        errors: { _form: 'Authentication failed. Please try again.' }, 
        values: { email: validatedEmail, password: '' } 
      });
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
    
    // Redirect to home after successful login
    throw redirect(303, '/');
  }
};