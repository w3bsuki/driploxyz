import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { safeGetSession } }) => {
  const { user } = await safeGetSession();
  
  return {
    user
  };
}) satisfies PageServerLoad;