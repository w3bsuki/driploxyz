import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all listings with seller info
	const { data: listings, error } = await locals.supabase
		.from('listings')
		.select(`
			*,
			seller:profiles!listings_seller_id_fkey(
				username,
				avatar_url,
				verified
			)
		`)
		.order('created_at', { ascending: false })
		.limit(100);

	if (error) {
		console.error('Error fetching listings:', error);
	}

	// Get stats
	const { count: totalListings } = await locals.supabase
		.from('listings')
		.select('*', { count: 'exact', head: true });

	const { count: activeListings } = await locals.supabase
		.from('listings')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'active');

	const { count: soldListings } = await locals.supabase
		.from('listings')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'sold');

	const { count: reportedListings } = await locals.supabase
		.from('listings')
		.select('*', { count: 'exact', head: true })
		.eq('is_reported', true);

	return {
		listings: listings || [],
		stats: {
			total: totalListings || 0,
			active: activeListings || 0,
			sold: soldListings || 0,
			reported: reportedListings || 0
		}
	};
};