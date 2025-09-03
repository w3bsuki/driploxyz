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
  const next = url.searchParams.get('next') ?? '/';
  const providerError = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  

  // Handle provider-side errors immediately
  if (providerError) {
    throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || providerError)}`);
  }

  // Require auth code
  if (!code) {
    throw redirect(303, '/login?error=no_auth_code');
  }

  try {
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      // Handle specific exchange errors
      if (exchangeError.message?.includes('expired') || exchangeError.message?.includes('invalid')) {
        throw redirect(303, '/login?error=' + encodeURIComponent('Verification link has expired or already been used. Please sign in normally.'));
      }
      
      throw redirect(303, '/login?error=' + encodeURIComponent('Authentication failed. Please try signing in again.'));
    }

    if (!data.session || !data.user) {
      throw redirect(303, '/login?error=auth_failed');
    }


    // Check profile status (profiles should always exist due to DB trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    // If no profile exists (extremely rare due to DB trigger), redirect to onboarding
    if (profileError?.code === 'PGRST116') {
      throw redirect(303, '/onboarding?welcome=true');
    }

    if (profileError) {
      throw redirect(303, '/login?error=profile_fetch_failed');
    }

    // Check if this is email verification (user just verified their email)
    const isEmailVerification = data.user.email_confirmed_at && 
      new Date(data.user.email_confirmed_at).getTime() > Date.now() - 60000; // Within last minute
    
    // Route based on onboarding status
    if (profile.onboarding_completed !== true) {
      // Show success page first for email verification
      if (isEmailVerification) {
        throw redirect(303, '/auth/verified');
      }
      throw redirect(303, '/onboarding');
    }

    // User is fully onboarded - redirect to intended destination
    
    // Validate and sanitize redirect URL
    let redirectPath = '/';
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
    
    throw redirect(303, '/login?error=callback_failed');
  }
};
