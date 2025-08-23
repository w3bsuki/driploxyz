import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession }, cookies }) => {
  const { session } = await safeGetSession();
  if (session) {
    await supabase.auth.signOut();
  }
  
  // Clear all auth-related cookies explicitly
  cookies.delete('sb-koowfhsaqmarfdkwsfiz-auth-token', { path: '/' });
  cookies.delete('sb-koowfhsaqmarfdkwsfiz-auth-token-code-verifier', { path: '/' });
  
  throw redirect(303, '/');
};