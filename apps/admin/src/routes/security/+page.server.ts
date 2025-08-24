import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get admin users
	const { data: adminUsers } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('role', 'admin')
		.order('created_at', { ascending: false });

	// Get recent security events (placeholder - no audit_logs table yet)
	const recentEvents: any[] = [];

	// Get banned users (using role field to check for banned status)
	const { data: bannedUsers } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('role', 'banned')
		.order('updated_at', { ascending: false });

	// Get reported/flagged content
	const { data: reportedListings } = await locals.supabase
		.from('products')
		.select(`
			*,
			seller:profiles!products_seller_id_fkey(
				username,
				avatar_url
			)
		`)
		.eq('is_featured', true)
		.order('updated_at', { ascending: false })
		.limit(10);

	// Security stats
	const { count: totalAdmins } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.eq('role', 'admin');

	const { count: bannedCount } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.eq('role', 'banned');

	const { count: reportedCount } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('is_featured', true);

	// Get suspicious activities (placeholder - no audit_logs table yet)
	const suspiciousActivities = 0;

	return {
		adminUsers: adminUsers || [],
		recentEvents: recentEvents || [],
		bannedUsers: bannedUsers || [],
		reportedListings: reportedListings || [],
		stats: {
			totalAdmins: totalAdmins || 0,
			bannedUsers: bannedCount || 0,
			reportedContent: reportedCount || 0,
			suspiciousActivities: suspiciousActivities || 0
		}
	};
};