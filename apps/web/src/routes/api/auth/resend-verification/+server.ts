import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase }, url }) => {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Resend verification email with proper redirect
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback?next=/onboarding`
      }
    });
    
    if (error) {
      console.error('[RESEND_VERIFICATION] Error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Email rate limit exceeded')) {
        return json({ 
          error: 'Please wait a few minutes before requesting another verification email' 
        }, { status: 429 });
      }
      
      if (error.message.includes('User not found')) {
        return json({ 
          error: 'No account found with this email address' 
        }, { status: 404 });
      }
      
      if (error.message.includes('Email not confirmed')) {
        return json({ 
          error: 'This email is already verified. Please try logging in.' 
        }, { status: 400 });
      }
      
      return json({ error: error.message || 'Failed to send verification email' }, { status: 400 });
    }
    
    return json({ 
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.' 
    });
    
  } catch (err) {
    console.error('[RESEND_VERIFICATION] Exception:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};