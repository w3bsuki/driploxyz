import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Bulletproof Email Verification Handler
 * 
 * Handles email confirmation via OTP token.
 * NOTE: Email verification links are ONE-TIME USE ONLY
 * If user clicks twice, we handle it gracefully
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
      // Check if this is because the token was already used
      console.error('[AUTH CONFIRM] Verification failed:', verificationError);
      
      // Common case: token already used, user already verified
      // Redirect to onboarding with message that email is already verified
      if (verificationError?.message?.includes('expired') || 
          verificationError?.message?.includes('used') ||
          verificationError?.message?.includes('invalid')) {
        console.log('[AUTH CONFIRM] Token already used or expired, redirecting to onboarding');
        throw redirect(303, '/onboarding?email_verified=true&message=Your+email+is+already+verified');
      }
      
      throw redirect(303, '/login?error=verification_failed');
    }

    console.log('[AUTH CONFIRM] Email verified successfully for user:', data.user.email);

    // After successful verification, always redirect to onboarding
    // The onboarding page will handle showing the success message
    console.log('[AUTH CONFIRM] Email verified, redirecting to onboarding');
    throw redirect(303, '/onboarding?email_verified=true&welcome=true');
    
  } catch (error) {
    // If it's already a redirect, re-throw it
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    
    console.error('[AUTH CONFIRM] Unexpected error:', error);
    throw redirect(303, '/login?error=confirmation_failed');
  }
};