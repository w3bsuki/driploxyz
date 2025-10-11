import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
	// Redirect wishlist to existing favorites functionality
	redirect(302, '/favorites');
}) satisfies PageLoad;