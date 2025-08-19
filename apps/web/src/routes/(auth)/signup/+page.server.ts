import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { SignupSchema } from '$lib/validation/auth.js';
import { dev } from '$app/environment';
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
  signup: async ({ request, locals: { supabase }, cookies }) => {
    console.log('[SIGNUP] ========== SIGNUP ACTION START ==========');
    console.log('[SIGNUP] Timestamp:', new Date().toISOString());
    console.log('[SIGNUP] Request method:', request.method);
    console.log('[SIGNUP] Request URL:', request.url);
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

    try {
      if (DEBUG) {
        console.log('[SIGNUP] Attempting signup');
        console.log('[SIGNUP] Terms accepted:', terms);
        console.log('[SIGNUP] User locale:', userLocale);
        console.log('[SIGNUP] Supabase client exists:', !!supabase);
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
          emailRedirectTo: `${request.url.origin}/auth/callback`
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
          return setError(form, 'email', 'An account with this email already exists');
        }
        if (error.message.includes('Password should be at least')) {
          return setError(form, 'password', 'Password must be at least 6 characters');
        }
        if (error.message.includes('Signup is disabled')) {
          return setError(form, '', 'Account creation is temporarily disabled');
        }
        
        return setError(form, '', error.message || 'Failed to create account');
      }

      if (!data.user) {
        return setError(form, '', 'Failed to create account. Please try again');
      }

      try {
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

        if (profileError) {
          // Continue anyway - profile might already exist or be created by trigger
        }
      } catch (profileErr) {
        // Non-fatal error - continue with signup success
      }

      // Success - return success response with message
      if (DEBUG) {
        console.log('[SIGNUP] Signup successful!');
        console.log('[SIGNUP] ========== SIGNUP ACTION END ==========');
      }
      
      // Return success with email for display
      return {
        form,
        success: true, 
        email,
        message: 'Account created successfully! Please check your email to verify your account.'
      };

    } catch (e: any) {
      // Check if it's a SvelteKit redirect (has status 303)
      if (e?.status === 303 || e?.location) {
        console.log('[SIGNUP] Throwing redirect');
        throw e;
      }
      
      console.error('[SIGNUP] Exception:', e);
      console.log('[SIGNUP] ========== SIGNUP ACTION END (ERROR) ==========');
      return setError(form, '', 'Account creation service temporarily unavailable');
    }
  }
};