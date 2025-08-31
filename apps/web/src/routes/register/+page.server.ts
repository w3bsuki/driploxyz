import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // Redirect /register to /signup
  throw redirect(301, '/signup');
}) satisfies PageServerLoad;