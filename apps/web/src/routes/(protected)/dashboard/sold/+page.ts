import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
  const { session } = await parent();
  
  if (!session) {
    throw redirect(303, '/login');
  }
  
  return {
    user: session.user
  };
}) satisfies PageLoad;