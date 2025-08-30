import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	if (!session?.user) {
		return {
			listings: []
		};
	}

	// Fetch user's products only
	const { data: listings, error } = await locals.supabase
		.from('products')
		.select(`
			*,
			category:categories(
				name
			)
		`)
		.eq('seller_id', session.user.id)
		.order('created_at', { ascending: false });

	if (error) {
		// Error fetching user listings - return empty array
		return {
			listings: []
		};
	}

	// Get stats for user's listings
	const { count: totalListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('seller_id', session.user.id);

	const { count: activeListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('seller_id', session.user.id)
		.eq('status', 'active')
		.eq('is_sold', false);

	const { count: soldListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('seller_id', session.user.id)
		.eq('is_sold', true);

	const { count: draftListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('seller_id', session.user.id)
		.eq('status', 'draft');

	return {
		listings: listings || [],
		stats: {
			total: totalListings || 0,
			active: activeListings || 0,
			sold: soldListings || 0,
			draft: draftListings || 0
		}
	};
};