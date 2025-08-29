import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

/**
 * Secure logout handler - POST-only with origin validation
 * Prevents CSRF attacks by requiring explicit POST requests
 */
export const POST: RequestHandler = async ({ request, locals: { supabase }, url }) => {
  // Origin validation to prevent CSRF attacks
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Check if request comes from same origin
  const expectedOrigin = url.origin;
  const validOrigin = origin === expectedOrigin || (referer && new URL(referer).origin === expectedOrigin);
  
  if (!validOrigin && !dev) {
    if (dev) console.warn('🚫 Logout blocked: Invalid origin', { origin, referer, expectedOrigin });
    throw error(403, 'Invalid request origin');
  }
  
  try {
    // Sign out from Supabase - this handles cookies automatically
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('Logout error:', signOutError);
      // Even if logout fails on server, clear local state
    }
    
    if (dev) console.log('👋 User logged out successfully');
    
  } catch (error) {
    console.error('Unexpected logout error:', error);
    // Continue with redirect even if there's an error - clear client state
  }
  
  // Always redirect to home after logout
  throw redirect(303, '/');
};

// Removed GET handler for security - use POST-only
// If you need convenience logout links, use a form with method="POST"