import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
  const { session, profile } = await parent();
  
  if (!session) {
    redirect(303, '/login');
  }
  
  return {
    user: session.user,
    profile
  };
}) satisfies PageLoad;