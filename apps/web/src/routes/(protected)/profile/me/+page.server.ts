import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { user } = await safeGetSession();
  
  if (!user) {
    throw redirect(302, '/login');
  }

  throw redirect(302, `/profile/${user.id}`);
};