import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all products with seller info
	const { data: listings, error } = await locals.supabase
		.from('products')
		.select(`
			*,
			seller:profiles!products_seller_id_fkey(
				username,
				avatar_url,
				verified
			)
		`)
		.order('created_at', { ascending: false })
		.limit(100);

	if (error) {
		console.error('Error fetching products:', error);
	}

	// Get stats
	const { count: totalListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true });

	const { count: activeListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'available');

	const { count: soldListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'sold');

	const { count: reportedListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('is_flagged', true);

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