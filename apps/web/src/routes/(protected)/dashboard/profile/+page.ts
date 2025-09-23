import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { user, profile } = await parent();
  
  if (!user) {
    throw redirect(303, '/login');
  }

  // Redirect to user's profile page using their username or ID
  const profileId = profile?.username || user.id;
  throw redirect(301, `/profile/${profileId}`);
}) satisfies PageLoad;