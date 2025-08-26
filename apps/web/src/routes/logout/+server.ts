import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle both GET and POST requests for logout
const handleLogout: RequestHandler = async ({ locals: { supabase }, cookies }) => {
  // Always try to sign out, don't check session first
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Supabase signOut error:', error);
  }
  
  // Clear ALL cookies that start with 'sb-' to ensure complete logout
  const allCookies = cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      // Delete cookie with all possible configurations
      cookies.delete(cookie.name, { path: '/' });
      cookies.delete(cookie.name, { path: '/', httpOnly: true });
      cookies.delete(cookie.name, { path: '/', secure: true });
      cookies.delete(cookie.name, { path: '/', sameSite: 'lax' });
      cookies.delete(cookie.name, { path: '/', sameSite: 'strict' });
      cookies.delete(cookie.name, { path: '/', sameSite: 'none', secure: true });
    }
  }
  
  // Also clear specific auth cookies we know about
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  
  throw redirect(303, '/');
};

export const POST = handleLogout;
export const GET = handleLogout;