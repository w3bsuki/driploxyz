import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all subscription records
	const { data: subscriptions, error } = await locals.supabase
		.from('subscriptions')
		.select(`
			*,
			user:profiles!subscriptions_user_id_fkey(
				username,
				avatar_url,
				full_name
			)
		`)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching subscriptions:', error);
	}

	// Get stats
	const { count: totalSubscriptions } = await locals.supabase
		.from('subscriptions')
		.select('*', { count: 'exact', head: true });

	const { count: activeSubscriptions } = await locals.supabase
		.from('subscriptions')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'active');

	const { count: canceledSubscriptions } = await locals.supabase
		.from('subscriptions')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'canceled');

	// Calculate MRR (Monthly Recurring Revenue)
	const { data: activeSubsData } = await locals.supabase
		.from('subscriptions')
		.select('price_per_month')
		.eq('status', 'active');

	const mrr = activeSubsData?.reduce((sum, sub) => sum + (sub.price_per_month || 0), 0) || 0;

	return {
		subscriptions: subscriptions || [],
		stats: {
			total: totalSubscriptions || 0,
			active: activeSubscriptions || 0,
			canceled: canceledSubscriptions || 0,
			mrr: mrr.toFixed(2)
		}
	};
};