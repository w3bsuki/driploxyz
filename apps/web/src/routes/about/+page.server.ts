import type { PageServerLoad } from './$types';

export const load = (async () => {
	// About page is public, no special data needed
	return {
		page: {
			title: 'About Driplo',
			description: 'Learn about Driplo, Bulgaria and UK\'s premier marketplace for second-hand fashion. Our mission is to make sustainable fashion accessible to everyone.'
		}
	};
}) satisfies PageServerLoad;