import { redirect, fail } from '@sveltejs/kit';
import { SignupSchema } from '$lib/validation/auth';
import { checkRateLimit } from '$lib/server/security/rate-limiter';
import type { Actions, PageServerLoad } from './$types';
// Future enhancement imports for locale/country detection
// import { detectLanguage } from '@repo/i18n';
// import { getUserCountry } from '$lib/country/detection';
import { env } from '$env/dynamic/public';
import { authLogger } from '$lib/utils/log';

export const load = (async (event) => {
  const { session } = await event.locals.safeGetSession();
  
  if (session) {
    try {
      redirect(303, '/');
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      console.error('Signup load redirect error:', error);
      // Continue loading the page instead of crashing
      return {};
    }
  }
  
  return {};
}) satisfies PageServerLoad;

export const actions = {
  signup: async (event) => {
    const { request, locals: { supabase }, url, getClientAddress } = event;

    // Get PUBLIC_SITE_URL from SvelteKit env (typed and consistent)
    const PUBLIC_SITE_URL = env.PUBLIC_SITE_URL;
    
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;
    const terms = formData.get('terms') === 'on';
    
    // Manual validation using Zod schema
    const validation = SignupSchema.safeParse({ 
      email, 
      password, 
      confirmPassword, 
      fullName, 
      terms 
    });
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0 && typeof error.path[0] === 'string') {
          errors[error.path[0]] = error.message;
        }
      });
      return fail(400, { 
        errors, 
        values: { email, fullName, password: '', confirmPassword: '' } 
      });
    }
    
    const { email: validatedEmail, password: validatedPassword, fullName: validatedFullName } = validation.data;
    
    // Rate limiting by IP address
    const clientIp = getClientAddress();
    const rateLimitKey = `signup:${clientIp}`;
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 'signup');
    
    if (!allowed) {
      return fail(429, { 
        errors: { _form: `Too many signup attempts. Please try again in ${retryAfter} seconds.` }, 
        values: { email: validatedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
      });
    }
    
    // Future enhancement: Get user's locale and country for personalization
    // const localeCookie = cookies.get('locale');
    // const acceptLanguage = request.headers.get('accept-language') || '';
    // const userLocale = localeCookie || detectLanguage(acceptLanguage);
    // const userCountry = await getUserCountry(event);
    
    // Determine redirect URL with fallback
    const redirectOrigin = PUBLIC_SITE_URL || url.origin;
    const emailRedirectTo = `${redirectOrigin}/auth/callback?next=/onboarding`;
    
    
    // Normalize email to lowercase for consistency
    const normalizedEmail = validatedEmail.toLowerCase().trim();
    
    // Create user with proper error handling
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: validatedPassword,
      options: {
        data: {
          full_name: validatedFullName
        },
        emailRedirectTo
      }
    });
      

    if (error) {
      authLogger.error('Signup error', error, { 
        email: normalizedEmail, 
        errorCode: error.code 
      });
      
      // Handle specific Supabase auth errors
      if (error.message.includes('User already registered') || 
          error.message.includes('already registered') || 
          error.message.includes('already exists') ||
          error.code === 'user_already_exists') {
        return fail(400, { 
          errors: { email: 'An account with this email already exists. Please sign in instead.' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      if (error.message.includes('Database error') || error.message.includes('database error')) {
        // Future: Check if user actually exists in auth.users
        // const { data: existingUser } = await supabase.auth.getUser();
        
        return fail(500, { 
          errors: { _form: 'A temporary issue occurred. Please try again in a moment.' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      if (error.message.includes('Password should be at least')) {
        return fail(400, { 
          errors: { password: 'Password must be at least 6 characters' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      if (error.message.includes('rate limit') || error.message.includes('Rate limit') || error.code === 'over_email_send_rate_limit') {
        return fail(429, { 
          errors: { _form: 'Email rate limit exceeded. Please try again in an hour, or contact support if this persists.' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      if (error.message.includes('Signup is disabled')) {
        return fail(503, { 
          errors: { _form: 'Account creation is temporarily disabled' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      
      return fail(400, { 
        errors: { _form: error.message || 'Failed to create account' }, 
        values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
      });
    }
    
    // IMPORTANT: Check if this was actually a new signup or an existing user
    // Supabase returns success even for existing users (security issue)
    if (data?.user && !data?.session) {
      // User was created successfully (new user)
    } else if (data?.user && data?.session) {
      // This means the user already existed and was signed in
      // Sign them out immediately
      await supabase.auth.signOut();
      return fail(400, { 
        errors: { email: 'An account with this email already exists. Please sign in instead.' }, 
        values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
      });
    }

    if (!data.user) {
      return fail(400, { 
        errors: { _form: 'Failed to create account. Please try again' }, 
        values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
      });
    }

    // Profile creation is handled by database trigger - no manual insertion needed
    // This prevents race conditions and ensures consistency
    // The onboarding process will UPDATE the profile with user's chosen data

    // If user has a session (e.g., email confirmation not required), redirect to onboarding
    if (data.session) {
      try {
        redirect(303, '/onboarding');
      } catch (error) {
        // Re-throw actual redirects (they're Response objects)
        if (error instanceof Response && error.status >= 300 && error.status < 400) {
          throw error;
        }
        // Log and handle unexpected errors
        console.error('Signup onboarding redirect error:', error);
        // Return success without redirect if redirect fails
        return {
          success: true,
          message: `Account created successfully! You can now continue to onboarding.`,
          email: normalizedEmail,
          redirectPath: '/onboarding'
        };
      }
    }
    
    // Otherwise return success response with email confirmation message
    return {
      success: true,
      message: `Account created successfully! We've sent a verification email to ${normalizedEmail}. Please check your inbox to complete your registration.`,
      email: normalizedEmail
    };
  }
} satisfies Actions;