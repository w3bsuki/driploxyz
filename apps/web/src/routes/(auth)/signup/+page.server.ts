import { redirect, fail } from '@sveltejs/kit';
import { SignupSchema } from '$lib/validation/auth';
import { dev, building } from '$app/environment';
import { checkRateLimit, rateLimiter } from '$lib/security/rate-limiter';
import type { Actions, PageServerLoad } from './$types';
import { detectLanguage } from '@repo/i18n';

const DEBUG = dev;

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  return {};
};

export const actions: Actions = {
  signup: async ({ request, locals: { supabase }, cookies, url, getClientAddress }) => {
    // Always log in production to debug Vercel issues
    console.log('[SIGNUP] ========== SIGNUP ACTION START ==========');
    console.log('[SIGNUP] Timestamp:', new Date().toISOString());
    console.log('[SIGNUP] Request method:', request.method);
    console.log('[SIGNUP] Request URL:', request.url);
    console.log('[SIGNUP] Site URL origin:', url.origin);
    
    // Get PUBLIC_SITE_URL from environment (dynamic)
    const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL;
    console.log('[SIGNUP] PUBLIC_SITE_URL:', PUBLIC_SITE_URL || 'undefined');
    console.log('[SIGNUP] Email redirect will use:', PUBLIC_SITE_URL || url.origin);
    console.log('[SIGNUP] Environment:', { dev, building: typeof building !== 'undefined' ? building : 'undefined' });
    console.log('[SIGNUP] Has supabase client:', !!supabase);
    console.log('[SIGNUP] Headers:', Object.fromEntries(request.headers.entries()));
    
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
    
    console.log('[SIGNUP] Form validation result:', { valid: validation.success });
    
    if (!validation.success) {
      console.log('[SIGNUP] Form invalid - returning fail with errors');
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0) {
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
    
    // Get user's locale from cookie or Accept-Language header
    const localeCookie = cookies.get('locale');
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = localeCookie || detectLanguage(acceptLanguage);

    if (DEBUG) {
      console.log('[SIGNUP] Attempting signup');
      console.log('[SIGNUP] Terms accepted:', validation.data.terms);
      console.log('[SIGNUP] User locale:', userLocale);
      console.log('[SIGNUP] Supabase client exists:', !!supabase);
    }
    
    // Determine redirect URL with fallback
    const redirectOrigin = PUBLIC_SITE_URL || url.origin;
    const emailRedirectTo = `${redirectOrigin}/auth/callback?next=/onboarding`;
    
    if (DEBUG) {
      console.log('[SIGNUP] Email redirect URL constructed:', emailRedirectTo);
    }
    
    // CRITICAL: Check if user already exists BEFORE signup
    // Supabase's signUp has a security issue where it auto-signs in existing users
    if (DEBUG) console.log('[SIGNUP] Checking if user already exists...');
    
    // Normalize email to lowercase for consistency
    const normalizedEmail = validatedEmail.toLowerCase().trim();
    
    // First, attempt to sign up - this will tell us if the user exists
    if (DEBUG) console.log('[SIGNUP] Attempting signUp with normalized email:', normalizedEmail);
    
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
      
    if (DEBUG) {
      console.log('[SIGNUP] Auth response received');
      console.log('[SIGNUP] Has data:', !!data);
      console.log('[SIGNUP] Has user:', !!data?.user);
      console.log('[SIGNUP] User ID:', data?.user?.id);
      console.log('[SIGNUP] Error:', error ? { message: error.message, status: error.status, code: error.code } : null);
    }

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('User already registered')) {
        return fail(400, { 
          errors: { email: 'An account with this email already exists. Please sign in instead.' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      if (error.message.includes('Password should be at least')) {
        return fail(400, { 
          errors: { password: 'Password must be at least 6 characters' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      if (error.message.includes('Signup is disabled')) {
        return fail(503, { 
          errors: { _form: 'Account creation is temporarily disabled' }, 
          values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
        });
      }
      
      // Log the full error for debugging
      console.error('[SIGNUP] Error during signup:', error);
      return fail(400, { 
        errors: { _form: error.message || 'Failed to create account' }, 
        values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
      });
    }
    
    // IMPORTANT: Check if this was actually a new signup or an existing user
    // Supabase returns success even for existing users (security issue)
    if (data?.user && !data?.session) {
      // User was created successfully (new user)
      if (DEBUG) console.log('[SIGNUP] New user created successfully');
    } else if (data?.user && data?.session) {
      // This means the user already existed and was signed in
      if (DEBUG) console.log('[SIGNUP] User already existed! Supabase signed them in');
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

    // Generate a unique username based on name and user ID
    const username = `user_${data.user.id.substring(0, 8)}`;
    
    // Create profile for the new user with detected locale
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        full_name: validatedFullName,
        locale: userLocale,
        onboarding_completed: false
      });

    if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
      console.warn('[SIGNUP] Profile creation warning:', profileError.message);
    }

    // Success - return success response with message
    if (DEBUG) {
      console.log('[SIGNUP] Signup successful!');
      console.log('[SIGNUP] ========== SIGNUP ACTION END ==========');
    }
    
    // Return success response
    return {
      success: true,
      message: `Account created successfully! We've sent a verification email to ${normalizedEmail}. Please check your inbox to complete your registration.`
    };
  }
};