import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // Redirect to consolidated sales page
  throw redirect(301, '/dashboard/sales');
}) satisfies PageServerLoad;