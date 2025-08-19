import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { SignupSchema } from '$lib/validation/auth';
import { dev, building } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { detectLanguage } from '@repo/i18n';

const DEBUG = dev;

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  const form = await superValidate(zod(SignupSchema));
  return { form };
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
    
    const form = await superValidate(request, zod(SignupSchema));
    console.log('[SIGNUP] Form validation result:', { valid: form.valid, data: form.data, errors: form.errors });
    
    if (!form.valid) {
      console.log('[SIGNUP] Form invalid - returning fail with errors');
      return fail(400, { form });
    }
    
    const { email, password, fullName, terms } = form.data;
    
    // Get user's locale from cookie or Accept-Language header
    const localeCookie = cookies.get('locale');
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = localeCookie || detectLanguage(acceptLanguage);

    if (DEBUG) {
      console.log('[SIGNUP] Attempting signup');
      console.log('[SIGNUP] Terms accepted:', terms);
      console.log('[SIGNUP] User locale:', userLocale);
      console.log('[SIGNUP] Supabase client exists:', !!supabase);
    }
    
    // Determine redirect URL with fallback
    const redirectOrigin = PUBLIC_SITE_URL || url.origin;
    const emailRedirectTo = `${redirectOrigin}/auth/callback?next=/onboarding`;
    
    if (DEBUG) {
      console.log('[SIGNUP] Email redirect URL constructed:', emailRedirectTo);
    }
    
    // Create user with proper error handling
    if (DEBUG) console.log('[SIGNUP] Calling supabase.auth.signUp...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
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
        setError(form, 'email', 'An account with this email already exists');
        return fail(400, { form });
      }
      if (error.message.includes('Password should be at least')) {
        setError(form, 'password', 'Password must be at least 6 characters');
        return fail(400, { form });
      }
      if (error.message.includes('Signup is disabled')) {
        setError(form, '', 'Account creation is temporarily disabled');
        return fail(503, { form });
      }
      
      setError(form, '', error.message || 'Failed to create account');
      return fail(400, { form });
    }

    if (!data.user) {
      setError(form, '', 'Failed to create account. Please try again');
      return fail(400, { form });
    }

    // Generate a unique username based on name and user ID
    const username = `user_${data.user.id.substring(0, 8)}`;
    
    // Create profile for the new user with detected locale
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        full_name: fullName,
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
    
    // Use Superforms message helper for success
    return message(form, {
      type: 'success',
      text: `Account created successfully! We've sent a verification email to ${email}. Please check your inbox to complete your registration.`
    });
  }
};