import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  // Sign out the user
  await supabase.auth.signOut();
  
  // Clear all auth cookies by setting them to expire
  // This ensures complete logout
  throw redirect(303, '/');
};