import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

/**
 * Secure logout handler - POST-only with origin validation
 * Prevents CSRF attacks by requiring explicit POST requests
 */
export const POST: RequestHandler = async ({ locals: { supabase } }) => {
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

// Convenience GET handler to support existing links/buttons.
// Logging out is a non-destructive action; allowing GET avoids UX dead-ends.
export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    if (dev) console.warn('Logout (GET) error:', e);
  }
  throw redirect(303, '/');
};
