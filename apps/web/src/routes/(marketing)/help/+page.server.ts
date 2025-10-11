import type { PageServerLoad } from './$types';

export const load = (async () => {
	// Help page is public, no special data needed
	return {
		page: {
			title: 'Help Center',
			description: 'Get help with buying, selling, and using Driplo. Find answers to common questions and contact support.'
		}
	};
}) satisfies PageServerLoad;