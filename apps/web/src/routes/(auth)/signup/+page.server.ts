import { redirect, fail } from '@sveltejs/kit';
import { SignupSchema } from '$lib/validation/auth';
import { checkRateLimit, rateLimiter } from '$lib/security/rate-limiter';
import type { Actions, PageServerLoad } from './$types';
import { detectLanguage } from '@repo/i18n';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  return {};
};

export const actions: Actions = {
  signup: async ({ request, locals: { supabase }, cookies, url, getClientAddress }) => {
    // Get PUBLIC_SITE_URL from environment (dynamic)
    const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL;
    
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
      console.error('Signup error:', error);
      
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
        // Check if user actually exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', normalizedEmail)
          .single();
          
        if (existingUser) {
          return fail(400, { 
            errors: { email: 'An account with this email already exists. Please sign in instead.' }, 
            values: { email: normalizedEmail, fullName: validatedFullName, password: '', confirmPassword: '' } 
          });
        }
        
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
      // Profile creation failed, but continue with signup success
    }

    // If user has a session (e.g., email confirmation not required), redirect to onboarding
    if (data.session) {
      throw redirect(303, '/onboarding');
    }
    
    // Otherwise return success response with email confirmation message
    return {
      success: true,
      message: `Account created successfully! We've sent a verification email to ${normalizedEmail}. Please check your inbox to complete your registration.`,
      email: normalizedEmail
    };
  }
};