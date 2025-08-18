import { redirect, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms/server';
import { SignupSchema } from '$lib/validation/auth.js';
import type { Actions, PageServerLoad } from './$types';
import { detectLanguage } from '@repo/i18n';

export const load: PageServerLoad = async ({ locals: { session } }) => {
  if (session) {
    throw redirect(303, '/');
  }
  
  const form = await superValidate(SignupSchema);
  return { form };
};

export const actions: Actions = {
  signup: async ({ request, locals: { supabase }, cookies }) => {
    const form = await superValidate(request, SignupSchema);
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { email, password, fullName, terms } = form.data as { email: string; password: string; fullName: string; terms: boolean };
    
    // Get user's locale from cookie or Accept-Language header
    const localeCookie = cookies.get('locale');
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = localeCookie || detectLanguage(acceptLanguage);

    // Create user
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
      console.error('Sign up error:', error);
      
      // Handle specific errors
      if (error.message.includes('already registered')) {
        return setError(form, 'email', 'An account with this email already exists');
      }
      
      return setError(form, '', error.message);
    }

    if (data.user) {
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
        console.error('Profile creation error:', profileError);
        // Continue anyway - profile might already exist
      }

      // Don't auto-login - require email verification
      return {
        form,
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        email: form.data.email
      };
    }

    return setError(form, '', 'Unable to create account');
  }
};