import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession }, cookies }) => {
  const { session } = await safeGetSession();
  if (session) {
    await supabase.auth.signOut();
  }
  
  // Clear ALL cookies that start with 'sb-' to ensure complete logout
  // This works regardless of the Supabase project ID
  const allCookies = cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      cookies.delete(cookie.name, { path: '/' });
    }
  }
  
  throw redirect(303, '/');
};