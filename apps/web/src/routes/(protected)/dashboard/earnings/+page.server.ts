import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // Redirect to consolidated sales page with earnings tab
  redirect(301, '/dashboard/sales?tab=earnings');
}) satisfies PageServerLoad;