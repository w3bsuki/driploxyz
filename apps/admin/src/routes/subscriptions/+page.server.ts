import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	// Fetch all subscription records
	const { data: subscriptions, error } = await locals.supabase
		.from('user_subscriptions')
		.select(`
			*,
			user:profiles!user_subscriptions_user_id_fkey(
				username,
				avatar_url,
				full_name
			),
			plan:subscription_plans!user_subscriptions_plan_id_fkey(
				name,
				price_gbp,
				features
			)
		`)
		.order('created_at', { ascending: false });

	if (error) {
		
	}

	// Get stats
	const { count: totalSubscriptions } = await locals.supabase
		.from('user_subscriptions')
		.select('*', { count: 'exact', head: true });

	const { count: activeSubscriptions } = await locals.supabase
		.from('user_subscriptions')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'active');

	const { count: canceledSubscriptions } = await locals.supabase
		.from('user_subscriptions')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'cancelled');

	// Calculate MRR (Monthly Recurring Revenue)
	const { data: activeSubsData } = await locals.supabase
		.from('user_subscriptions')
		.select(`
			*,
			plan:subscription_plans!user_subscriptions_plan_id_fkey(
				price_gbp
			)
		`)
		.eq('status', 'active');

	const mrr = activeSubsData?.reduce((sum, sub) => sum + (sub.plan?.price_gbp || 0), 0) || 0;

	return {
		subscriptions: subscriptions || [],
		stats: {
			total: totalSubscriptions || 0,
			active: activeSubscriptions || 0,
			canceled: canceledSubscriptions || 0,
			mrr: mrr.toFixed(2)
		}
	};
}) satisfies PageServerLoad;