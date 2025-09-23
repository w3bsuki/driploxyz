import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
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
  
  if (dev) {
    console.log('[AUTH CONFIRM] Processing email verification:', {
      hasTokenHash: !!token_hash,
      type,
      nextRedirect: next
    });
  }

  // Require both token_hash and type
  if (!token_hash || !type) {
    if (dev) {
      // Development logging for invalid verification link
    }
    throw redirect(303, '/login?error=invalid_verification_link');
  }

  try {
    // Verify the OTP token
    const { data, error: verificationError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    
    if (dev) {
      console.log('[AUTH CONFIRM] Verification result:', {
        success: !verificationError,
        error: verificationError?.message,
        userEmail: data?.user?.email
      });
    }

    if (verificationError || !data.user) {
      // Check if this is because the token was already used
      if (dev) {
        // Development logging for verification error
      }
      
      // Common case: token already used, user already verified
      // Redirect to onboarding with message that email is already verified
      if (verificationError?.message?.includes('expired') || 
          verificationError?.message?.includes('used') ||
          verificationError?.message?.includes('invalid')) {
        if (dev) {
          // Development logging for expired/used token
        }
        throw redirect(303, '/onboarding?email_verified=true&message=Your+email+is+already+verified');
      }
      
      throw redirect(303, '/login?error=verification_failed');
    }

    if (dev) {
      // Development logging for successful verification
    }

    // After successful verification, always redirect to onboarding
    // The onboarding page will handle showing the success message
    if (dev) {
      // Development logging for redirect to onboarding
    }
    throw redirect(303, '/onboarding?email_verified=true&welcome=true');
    
  } catch (error) {
    // If it's already a redirect, re-throw it
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    
    if (dev) {
      // Development logging for catch block error
    }
    throw redirect(303, '/login?error=confirmation_failed');
  }
};