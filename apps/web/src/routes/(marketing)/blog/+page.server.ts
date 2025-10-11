import type { PageServerLoad } from './$types';

export const load = (async () => {
	// Blog page is public, no special data needed
	return {
		page: {
			title: 'Driplo Blog',
			description: 'Discover fashion insights, sustainable living tips, and stories from our community.'
		}
	};
}) satisfies PageServerLoad;