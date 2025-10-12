import type { PageServerLoad } from './$types';

export const load = (async () => {
	// Careers page is public, no special data needed
	return {
		page: {
			title: 'Careers at Driplo',
			description: 'Join our team and help build the future of sustainable fashion in Bulgaria and the UK.'
		}
	};
}) satisfies PageServerLoad;