import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

/**
 * Secure logout handler - POST-only with origin validation
 * Prevents CSRF attacks by requiring explicit POST requests
 */
export const POST: RequestHandler = async ({ request, url, locals: { supabase } }) => {
  // Origin check for CSRF protection
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const expectedOrigin = `${url.protocol}//${host}`;
  
  if (!origin || origin !== expectedOrigin) {
    throw error(403, 'Invalid origin. Logout must be initiated from the same site.');
  }

  try {
    // Sign out from Supabase - this handles cookies automatically
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError && dev) {
      console.warn('Logout error:', signOutError.message);
    }
    
  } catch (err) {
    // Unexpected logout error handled
    // Continue with redirect even if there's an error - clear client state
    if (dev) {
      console.warn('Unexpected logout error:', err);
    }
  }
  
  // Always redirect to home after logout
  throw redirect(303, '/');
};

// Block GET method for security - logout must be POST-only
export const GET: RequestHandler = async () => {
  throw error(405, 'Method not allowed. Logout must use POST for security.');
};
