import { json, error } from '@sveltejs/kit';
import { checkRateLimit } from '$lib/security/rate-limiter';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Validation schema for resend verification request
const ResendVerificationSchema = z.object({
  email: z.string().email('Invalid email address')
});

/**
 * Resend email verification endpoint
 * POST /api/auth/resend-verification
 */
export const POST: RequestHandler = async ({ request, locals: { supabase }, getClientAddress }) => {
  try {
    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = ResendVerificationSchema.safeParse(body);
    
    if (!validation.success) {
      return json(
        { 
          error: 'Invalid request data', 
          details: validation.error.errors.map(e => e.message) 
        }, 
        { status: 400 }
      );
    }
    
    const { email } = validation.data;
    
    // Rate limiting by IP address (using passwordReset limits for email operations)
    const clientIp = getClientAddress();
    const rateLimitKey = `resend-verification:${clientIp}`;
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 'passwordReset');
    
    if (!allowed) {
      return json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many verification email requests. Please try again in ${retryAfter} seconds.`,
          retryAfter
        }, 
        { status: 429 }
      );
    }
    
    // Also rate limit by email to prevent abuse of specific addresses
    const emailRateLimitKey = `resend-verification:email:${email.toLowerCase()}`;
    const emailRateLimit = checkRateLimit(emailRateLimitKey, 'passwordReset');
    
    if (!emailRateLimit.allowed) {
      return json(
        { 
          error: 'Email rate limit exceeded',
          message: 'Too many verification emails sent to this address. Please check your inbox or try again later.',
          retryAfter: emailRateLimit.retryAfter
        }, 
        { status: 429 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Attempt to resend verification email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail
    });

    if (resendError) {
      
      
      // Handle specific Supabase errors
      if (resendError.message?.includes('rate limit') || resendError.message?.includes('Rate limit')) {
        return json(
          { 
            error: 'Service rate limit exceeded',
            message: 'Email service rate limit reached. Please try again in an hour.'
          }, 
          { status: 429 }
        );
      }
      
      if (resendError.message?.includes('User not found') || resendError.message?.includes('not found')) {
        return json(
          { 
            error: 'Account not found',
            message: 'No unverified account found with this email address.'
          }, 
          { status: 404 }
        );
      }
      
      if (resendError.message?.includes('already confirmed') || resendError.message?.includes('already verified')) {
        return json(
          { 
            error: 'Already verified',
            message: 'This email address is already verified. You can sign in normally.'
          }, 
          { status: 400 }
        );
      }
      
      // Generic error for other cases
      return json(
        { 
          error: 'Verification email failed',
          message: 'Unable to send verification email. Please try again or contact support.'
        }, 
        { status: 500 }
      );
    }

    // Success response
    return json({
      success: true,
      message: `Verification email sent successfully to ${normalizedEmail}. Please check your inbox.`,
      email: normalizedEmail
    });
    
  } catch {
    
    
    return json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.'
      }, 
      { status: 500 }
    );
  }
};

// Only POST method is allowed for security
export const GET: RequestHandler = async () => {
  throw error(405, 'Method not allowed. Use POST.');
};