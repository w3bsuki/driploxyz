import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // Redirect to consolidated sales page
  redirect(301, '/dashboard/sales');
}) satisfies PageServerLoad;