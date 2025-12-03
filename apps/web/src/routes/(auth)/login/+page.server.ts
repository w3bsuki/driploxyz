import { redirect, fail } from '@sveltejs/kit';
import { LoginSchema } from '$lib/validation/auth';
import { checkRateLimit, rateLimiter } from '$lib/server/security/rate-limiter';
import { checkLockout, recordAuthFailure, recordAuthSuccess } from '$lib/server/security';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
  const { session } = await event.locals.safeGetSession();

  if (session) {
    redirect(303, '/');
  }
  
  // Handle auth callback errors
  const error = event.url.searchParams.get('error');
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
}) satisfies PageServerLoad;

export const actions = {
  signin: async (event) => {
    const { request, locals: { supabase } } = event;
    
    // Get form data
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Manual validation using Zod schema
    const validation = LoginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0 && typeof error.path[0] === 'string') {
          errors[error.path[0]] = error.message;
        }
      });
      return fail(400, { errors, values: { email, password } });
    }
    
    const { email: validatedEmail, password: validatedPassword } = validation.data;
    const normalizedEmail = validatedEmail.toLowerCase().trim();

    // Get client IP for rate limiting and lockout
    let clientIp = 'unknown';
    try {
      clientIp = event.getClientAddress();
    } catch {
      // In development, getClientAddress might fail - use fallback
      clientIp = event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'localhost';
    }

    // Phase 5: Check account lockout (persistent lockout after failed attempts)
    const lockoutStatus = checkLockout(normalizedEmail, clientIp);
    if (lockoutStatus.locked) {
      return fail(429, { 
        errors: { _form: lockoutStatus.message || `Account temporarily locked. Please try again in ${lockoutStatus.retryAfter} seconds.` }, 
        values: { email: validatedEmail, password: '' } 
      });
    }

    // Rate limiting by IP address (short-term throttle)
    const rateLimitKey = `login:${clientIp}`;
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 'login');
    
    if (!allowed) {
      return fail(429, { 
        errors: { _form: `Too many login attempts. Please try again in ${retryAfter} seconds.` }, 
        values: { email: validatedEmail, password: '' } 
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: validatedPassword
    });

    if (error) {
      // Record failed authentication attempt for lockout tracking
      const lockoutResult = recordAuthFailure(normalizedEmail, clientIp);
      
      let errorMessage = 'Unable to sign in';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
        // Add remaining attempts warning if applicable
        if (lockoutResult.message && !lockoutResult.locked) {
          errorMessage += `. ${lockoutResult.message}`;
        }
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // If lockout was triggered by this attempt, use lockout message
      if (lockoutResult.locked) {
        errorMessage = lockoutResult.message || 'Account temporarily locked due to too many failed attempts';
      }
      
      return fail(lockoutResult.locked ? 429 : 400, { 
        errors: { _form: errorMessage }, 
        values: { email: validatedEmail, password: '' } 
      });
    }

    if (!data.user || !data.session) {
      recordAuthFailure(normalizedEmail, clientIp);
      return fail(400, { 
        errors: { _form: 'Authentication failed. Please try again.' }, 
        values: { email: validatedEmail, password: '' } 
      });
    }
    
    // Reset rate limit and lockout on successful login
    rateLimiter.reset(rateLimitKey);
    recordAuthSuccess(normalizedEmail, clientIp);
    
    // CRITICAL: Don't check profile here - let +layout.server.ts handle onboarding redirect
    // This prevents race conditions with auth state propagation
    
    // Redirect to homepage after successful login
    redirect(303, '/');
  }
} satisfies Actions;