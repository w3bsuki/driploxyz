import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { COOKIES } from '$lib/cookies/production-cookie-system';

/**
 * Secure logout handler - POST-only with origin validation
 * Cleans auth cookies but preserves user preferences (locale, country, theme)
 */
export const POST: RequestHandler = async ({ request, url, cookies, locals: { supabase } }) => {
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
      // Development logging for sign out error
    }
    
  } catch {
    // Unexpected logout error handled
    // Continue with cleanup even if there's an error
    if (dev) {
      // Development logging for catch block error
    }
  }
  
  // Explicit cleanup of auth-related cookies (in case Supabase missed any)
  const authCookiesToClear = [
    'sb-auth-token',
    'sb-refresh-token', 
    'sb-provider-token',
    'sb-access-token',
    COOKIES.SESSION_ID,
    COOKIES.CSRF
  ];
  
  authCookiesToClear.forEach(cookieName => {
    cookies.set(cookieName, '', { 
      path: '/', 
      maxAge: 0,
      httpOnly: true,
      secure: !dev,
      sameSite: 'strict'
    });
  });
  
  // Get all cookies and clean any that start with 'sb-' (Supabase)
  const allCookies = cookies.getAll();
  allCookies.forEach(cookie => {
    if (cookie.name.startsWith('sb-')) {
      cookies.set(cookie.name, '', { 
        path: '/', 
        maxAge: 0,
        httpOnly: true,
        secure: !dev,
        sameSite: 'strict'
      });
    }
  });
  
  if (dev) {
    // Development logging for logout completion
  }
  
  // Always redirect to home after logout
  throw redirect(303, '/');
};

// Block GET method for security - logout must be POST-only
export const GET: RequestHandler = async () => {
  throw error(405, 'Method not allowed. Logout must use POST for security.');
};
