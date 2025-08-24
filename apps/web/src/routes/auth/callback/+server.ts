import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Bulletproof Auth Callback Handler
 * 
 * Handles OAuth callbacks and email verification redirects.
 * Key principles:
 * - Profiles are ALWAYS created by database trigger on signup
 * - Only UPDATE profiles during onboarding, never CREATE
 * - Simple, bulletproof logic with minimal edge cases
 * - Clear logging for debugging
 */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';
  const providerError = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  
  console.log('[AUTH CALLBACK] Processing callback:', {
    hasCode: !!code,
    nextRedirect: next,
    providerError
  });

  // Handle provider-side errors immediately
  if (providerError) {
    console.error('[AUTH CALLBACK] Provider error:', { providerError, errorDescription });
    throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || providerError)}`);
  }

  // Require auth code
  if (!code) {
    console.error('[AUTH CALLBACK] No auth code provided');
    throw redirect(303, '/login?error=no_auth_code');
  }

  try {
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[AUTH CALLBACK] Session exchange failed:', exchangeError);
      throw redirect(303, '/login?error=session_exchange_failed');
    }

    if (!data.session || !data.user) {
      console.error('[AUTH CALLBACK] No session or user after exchange');
      throw redirect(303, '/login?error=auth_failed');
    }

    console.log('[AUTH CALLBACK] Session exchanged successfully for user:', data.user.email);

    // Check profile status (profiles should always exist due to DB trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    // If no profile exists (extremely rare due to DB trigger), redirect to onboarding
    if (profileError?.code === 'PGRST116') {
      console.log('[AUTH CALLBACK] No profile found (DB trigger failed?), redirecting to onboarding');
      throw redirect(303, '/onboarding?welcome=true');
    }

    if (profileError) {
      console.error('[AUTH CALLBACK] Profile fetch error:', profileError);
      throw redirect(303, '/login?error=profile_fetch_failed');
    }

    // Check if this is email verification (user just verified their email)
    const isEmailVerification = data.user.email_confirmed_at && 
      new Date(data.user.email_confirmed_at).getTime() > Date.now() - 60000; // Within last minute
    
    // Route based on onboarding status
    if (profile.onboarding_completed !== true) {
      console.log('[AUTH CALLBACK] User needs onboarding');
      // Show success page first for email verification
      if (isEmailVerification) {
        throw redirect(303, '/auth/verified');
      }
      throw redirect(303, '/onboarding');
    }

    // User is fully onboarded - redirect to intended destination
    console.log('[AUTH CALLBACK] User fully onboarded, redirecting to:', next);
    
    // Validate and sanitize redirect URL
    let redirectPath = '/dashboard';
    if (next && next !== 'undefined' && next !== 'null') {
      // Only allow relative URLs starting with / and not external URLs
      if (next.startsWith('/') && !next.includes('://')) {
        redirectPath = next;
      }
    }
    
    throw redirect(303, redirectPath);
    
  } catch (error) {
    // If it's already a redirect, re-throw it
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    
    console.error('[AUTH CALLBACK] Unexpected error:', error);
    throw redirect(303, '/login?error=callback_failed');
  }
};
