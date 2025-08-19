import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { SignupSchema } from '$lib/validation/auth.js';
import type { Actions, PageServerLoad } from './$types';
import { detectLanguage } from '@repo/i18n';

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
    const form = await superValidate(request, zod(SignupSchema));
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { email, password, fullName, terms } = form.data;
    
    // Get user's locale from cookie or Accept-Language header
    const localeCookie = cookies.get('locale');
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = localeCookie || detectLanguage(acceptLanguage);

    try {
      // Create user with proper error handling
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

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

      // Success - redirect to email verification page
      throw redirect(303, `/auth/verify-email?email=${encodeURIComponent(email)}`);

    } catch (e) {
      // If it's a redirect, rethrow it
      if (e instanceof redirect) throw e;
      
      return setError(form, '', 'Account creation service temporarily unavailable');
    }
  }
};