import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect to consolidated sales page with earnings tab
  throw redirect(301, '/dashboard/sales?tab=earnings');
};