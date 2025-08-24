import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all users with their profiles
	const { data: users, error } = await locals.supabase
		.from('profiles')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching users:', error);
	}

	// Get stats
	const { count: totalUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true });

	const { count: verifiedUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.eq('is_verified', true);

	const { count: brandUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.eq('account_type', 'brand');

	const { count: adminUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.eq('role', 'admin');

	return {
		users: users || [],
		stats: {
			total: totalUsers || 0,
			verified: verifiedUsers || 0,
			brands: brandUsers || 0,
			admins: adminUsers || 0
		}
	};
};