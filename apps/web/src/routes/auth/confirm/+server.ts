import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Bulletproof Email Verification Handler
 * 
 * Handles email confirmation via OTP token.
 * Consistent with auth/callback approach:
 * - Never manually create profiles (DB trigger handles this)
 * - Simple routing logic based on onboarding status
 * - Clear error handling and logging
 */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') ?? '/dashboard';
  
  console.log('[AUTH CONFIRM] Processing email verification:', {
    hasTokenHash: !!token_hash,
    type,
    nextRedirect: next
  });

  // Require both token_hash and type
  if (!token_hash || !type) {
    console.error('[AUTH CONFIRM] Missing required parameters:', { token_hash: !!token_hash, type });
    throw redirect(303, '/login?error=invalid_verification_link');
  }

  try {
    // Verify the OTP token
    const { data, error: verificationError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    
    console.log('[AUTH CONFIRM] Verification result:', {
      success: !verificationError,
      error: verificationError?.message,
      userEmail: data?.user?.email
    });

    if (verificationError || !data.user) {
      console.error('[AUTH CONFIRM] Verification failed:', verificationError);
      throw redirect(303, '/login?error=verification_failed');
    }

    console.log('[AUTH CONFIRM] Email verified successfully for user:', data.user.email);

    // Check profile status (should exist due to DB trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    // If no profile exists (DB trigger failed?), redirect to onboarding
    if (profileError?.code === 'PGRST116') {
      console.log('[AUTH CONFIRM] No profile found (DB trigger failed?), redirecting to onboarding');
      throw redirect(303, '/onboarding?verified=true&welcome=true');
    }

    if (profileError) {
      console.error('[AUTH CONFIRM] Profile fetch error:', profileError);
      throw redirect(303, '/login?error=profile_fetch_failed');
    }

    // Route based on onboarding status
    if (profile.onboarding_completed !== true) {
      console.log('[AUTH CONFIRM] User needs onboarding after verification');
      throw redirect(303, '/onboarding?verified=true');
    }

    // User is fully verified and onboarded
    console.log('[AUTH CONFIRM] User fully verified and onboarded, redirecting to:', next);
    
    // Validate and sanitize redirect URL
    let redirectPath = '/dashboard';
    if (next && next !== 'undefined' && next !== 'null') {
      if (next.startsWith('/') && !next.includes('://')) {
        redirectPath = next;
      }
    }
    
    throw redirect(303, `${redirectPath}?verified=true`);
    
  } catch (error) {
    // If it's already a redirect, re-throw it
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    
    console.error('[AUTH CONFIRM] Unexpected error:', error);
    throw redirect(303, '/login?error=confirmation_failed');
  }
};