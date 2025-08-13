import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session } }) => {
  // If not logged in, redirect to login
  if (!session?.user?.id) {
    throw redirect(303, '/login?redirect=/profile/me');
  }

  // Redirect to the user's actual profile page
  throw redirect(303, `/profile/${session.user.id}`);
};