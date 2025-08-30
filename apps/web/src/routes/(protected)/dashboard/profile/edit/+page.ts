import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // Redirect to the main profile edit page
  throw redirect(301, '/profile/edit');
};