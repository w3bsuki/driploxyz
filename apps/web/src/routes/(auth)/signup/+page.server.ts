import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { detectLanguage } from '@repo/i18n';

export const load: PageServerLoad = async ({ locals: { session } }) => {
  if (session) {
    throw redirect(303, '/');
  }
};

export const actions: Actions = {
  signup: async ({ request, locals: { supabase }, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;
    const terms = formData.get('terms') as string;
    
    // Get user's locale from cookie or Accept-Language header
    const localeCookie = cookies.get('locale');
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = localeCookie || detectLanguage(acceptLanguage);

    // Validation
    if (!email || !password || !fullName) {
      return fail(400, {
        error: 'All fields are required',
        email,
        fullName
      });
    }

    if (password !== confirmPassword) {
      return fail(400, {
        error: 'Passwords do not match',
        email,
        fullName
      });
    }

    if (password.length < 8) {
      return fail(400, {
        error: 'Password must be at least 8 characters',
        email,
        fullName
      });
    }

    if (!terms) {
      return fail(400, {
        error: 'You must agree to the terms and conditions',
        email,
        fullName
      });
    }

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
        return fail(400, {
          error: 'An account with this email already exists',
          email,
          fullName
        });
      }
      
      return fail(400, {
        error: error.message,
        email,
        fullName
      });
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
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        email
      };
    }

    return fail(400, {
      error: 'Unable to create account',
      email,
      fullName
    });
  }
};