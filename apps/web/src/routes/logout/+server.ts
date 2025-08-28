import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple, clean logout handler
export const POST: RequestHandler = async ({ locals: { supabase } }) => {
  // Sign out from Supabase - this handles cookies automatically
  await supabase.auth.signOut();
  
  // Redirect to home
  throw redirect(303, '/');
};

// Support GET for convenience (e.g., <a href="/logout">)
export const GET = POST;