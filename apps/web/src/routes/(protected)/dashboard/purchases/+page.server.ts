import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // Redirect /dashboard/purchases to /orders (consolidated page)
  redirect(301, '/orders');
}) satisfies PageServerLoad;