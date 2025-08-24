import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/onboarding';
  const providerError = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  
  console.log('[AUTH CALLBACK] Processing callback with code:', code ? 'present' : 'missing');
  console.log('[AUTH CALLBACK] Next redirect:', next);

  // Provider-side error
  if (providerError) {
    console.error('Auth provider error:', providerError, errorDescription);
    throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || providerError)}`);
  }

  if (!code) {
    throw redirect(303, '/login?error=no_auth_code');
  }

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('Session exchange error:', exchangeError);
    throw redirect(303, '/login?error=session_exchange_failed');
  }

  if (data.session && data.user) {
    // Force refresh session to ensure we have the correct user
    await supabase.auth.refreshSession();
    
    // Check if this is email verification (user just verified their email)
    const isEmailVerification = data.user.email_confirmed_at && 
      new Date(data.user.email_confirmed_at).getTime() > Date.now() - 300000; // Within last 5 minutes
    
    console.log('[AUTH CALLBACK] Email verification check:', {
      isEmailVerification,
      email_confirmed_at: data.user.email_confirmed_at,
      user_email: data.user.email
    });
    
    // Check if profile exists (DON'T CREATE - only check)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    // Profile doesn't exist = new user, send to onboarding
    if (profileError && profileError.code === 'PGRST116') {
      console.log('[AUTH CALLBACK] New user - no profile exists, redirecting to onboarding');
      throw redirect(303, '/onboarding?welcome=true');
    }

    // If email was just verified and profile needs onboarding
    if (isEmailVerification) {
      console.log('[AUTH CALLBACK] Email verified, checking onboarding status');
      
      // If profile doesn't exist or onboarding not completed, go to onboarding
      if (!profile || profile.onboarding_completed !== true) {
        console.log('[AUTH CALLBACK] Redirecting to onboarding after email verification');
        throw redirect(303, '/onboarding?verified=true');
      }
      
      // Otherwise, they're a returning user who just verified - go to dashboard
      throw redirect(303, '/dashboard?verified=true');
    }

    // ALWAYS CHECK ONBOARDING STATUS - NO EXCEPTIONS
    if (!profile || profile.onboarding_completed !== true) {
      console.log('[AUTH CALLBACK] User needs onboarding, redirecting...');
      throw redirect(303, '/onboarding');
    }

    // Only redirect elsewhere if onboarding is complete
    let redirectPath = '/dashboard';
    if (next && next !== 'undefined' && next !== 'null') {
      if (next.startsWith('/') && !next.includes('://')) {
        redirectPath = next;
      }
    }
    throw redirect(303, redirectPath);
  }

  // Fallback
  throw redirect(303, '/login?error=auth_failed');
};
