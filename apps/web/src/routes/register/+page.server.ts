import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect /register to /signup
  throw redirect(301, '/signup');
};