import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle both GET and POST requests for logout
const handleLogout: RequestHandler = async ({ locals: { supabase, safeGetSession }, cookies }) => {
  const { session } = await safeGetSession();
  if (session) {
    await supabase.auth.signOut();
  }
  
  // Clear ALL cookies that start with 'sb-' to ensure complete logout
  // This works regardless of the Supabase project ID
  const allCookies = cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      // Delete cookie with multiple path variations to ensure it's removed
      cookies.delete(cookie.name, { path: '/' });
      cookies.delete(cookie.name, { path: '/', sameSite: 'lax' });
      cookies.delete(cookie.name, { path: '/', sameSite: 'lax', secure: true });
      cookies.delete(cookie.name, { path: '/', sameSite: 'none', secure: true });
    }
  }
  
  throw redirect(303, '/');
};

export const POST = handleLogout;
export const GET = handleLogout;