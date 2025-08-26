import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect /purchases to /orders (consolidated page)
  throw redirect(301, '/orders');
};