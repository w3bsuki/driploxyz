import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
  const { session, supabase } = await parent();
  
  if (!session) {
    throw redirect(303, '/login');
  }
  
  return {
    user: session.user,
    supabase
  };
};