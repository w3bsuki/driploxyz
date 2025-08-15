import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
  const { session, supabase, profile } = await parent();
  
  if (!session) {
    throw redirect(303, '/login');
  }
  
  return {
    user: session.user,
    profile,
    supabase
  };
};