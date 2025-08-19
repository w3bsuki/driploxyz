import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals: { supabase }, url }) => {
    console.log('[LOGIN-TEMP] ========== TEMP LOGIN ACTION START ==========');
    console.log('[LOGIN-TEMP] Timestamp:', new Date().toISOString());
    console.log('[LOGIN-TEMP] Emergency workaround - simple form');
    
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    console.log('[LOGIN-TEMP] Form data:', { email: email || 'missing', hasPassword: !!password });
    
    // Basic validation
    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required',
        email
      });
    }
    
    if (!email.includes('@')) {
      return fail(400, {
        error: 'Please enter a valid email address',
        email
      });
    }
    
    if (password.length < 8) {
      return fail(400, {
        error: 'Password must be at least 8 characters',
        email
      });
    }
    
    try {
      console.log('[LOGIN-TEMP] Attempting login for email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('[LOGIN-TEMP] Auth response:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error ? { message: error.message, status: error.status } : null
      });

      if (error) {
        console.log('[LOGIN-TEMP] Auth error:', error.message);
        
        let errorMessage = 'Unable to sign in';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before logging in';
        } else {
          errorMessage = error.message;
        }
        
        return fail(400, {
          error: errorMessage,
          email
        });
      }

      if (!data.user || !data.session) {
        console.log('[LOGIN-TEMP] No user or session returned');
        return fail(400, {
          error: 'Authentication failed. Please try again.',
          email
        });
      }

      // Check onboarding status
      let needsOnboarding = false;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();
          
        needsOnboarding = !profile || profile.onboarding_completed !== true;
        console.log('[LOGIN-TEMP] Profile check:', { profile, needsOnboarding });
      } catch (profileError) {
        console.warn('[LOGIN-TEMP] Profile check failed:', profileError);
        // Assume needs onboarding if we can't check
        needsOnboarding = true;
      }
      
      console.log('[LOGIN-TEMP] Login successful!');
      console.log('[LOGIN-TEMP] ========== TEMP LOGIN ACTION END ==========');
      
      // Redirect based on onboarding status
      if (needsOnboarding) {
        throw redirect(303, '/onboarding');
      } else {
        throw redirect(303, '/');
      }
      
    } catch (unexpectedError) {
      console.error('[LOGIN-TEMP] Unexpected error:', unexpectedError);
      
      // If it's already a redirect, re-throw it
      if (unexpectedError instanceof Response && unexpectedError.status >= 300 && unexpectedError.status < 400) {
        throw unexpectedError;
      }
      
      return fail(500, {
        error: 'An unexpected error occurred. Please try again.',
        email
      });
    }
  }
};