import type { PageServerLoad, Actions } from './$types';
import { fail, error } from '@sveltejs/kit';

export const load = (async ({ locals, url }) => {
	try {
	// Get search params
	const searchQuery = url.searchParams.get('q');
	const countryFilter = url.searchParams.get('country');
	const statusFilter = url.searchParams.get('status');
	const subscriptionFilter = url.searchParams.get('subscription');
	
	// Build query with admin override to see all countries
	let query = locals.supabase
		.from('profiles')
		.select('*');
	
	// Apply filters
	if (searchQuery) {
		query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
	}
	
	if (countryFilter && countryFilter !== 'all') {
		// Convert UK to GB for database query
		const dbCountry = countryFilter === 'UK' ? 'GB' : countryFilter;
		query = query.eq('country', dbCountry);
	}
	
	if (statusFilter && statusFilter !== 'all') {
		// Handle activity-based filtering
		const now = new Date();
		switch (statusFilter) {
			case 'active':
				// Active in last 7 days
				const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				query = query.gte('last_active_at', sevenDaysAgo.toISOString());
				break;
			case 'recent':
				// Active in last 30 days
				const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				query = query.gte('last_active_at', thirtyDaysAgo.toISOString());
				break;
			case 'inactive':
				// Not active in last 30 days
				const inactiveDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				query = query.lt('last_active_at', inactiveDate.toISOString());
				break;
		}
	}
	
	if (subscriptionFilter && subscriptionFilter !== 'all') {
		query = query.eq('subscription_tier', subscriptionFilter);
	}
	
	const { data: users, error: fetchError } = await query.order('created_at', { ascending: false });

	if (fetchError) {
		console.error('Error fetching users:', fetchError);
		throw error(500, 'Failed to fetch users');
	}

	// Get user statistics
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

	const { count: bannedUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.eq('role', 'banned');

	// Get geo distribution
	const { data: geoData } = await locals.supabase
		.from('profiles')
		.select('country')
		.not('country', 'is', null);

	const geoStats = geoData?.reduce((acc: any, user) => {
		acc[user.country] = (acc[user.country] || 0) + 1;
		return acc;
	}, {}) || {};
	
	// Get current balance totals per country
	const { data: balanceData } = await locals.supabase
		.from('profiles')
		.select('country, current_balance')
		.gt('current_balance', 0);
	
	const pendingPayoutsByCountry = balanceData?.reduce((acc: any, user) => {
		const country = user.country || 'UK';
		if (!acc[country]) acc[country] = { count: 0, total: 0 };
		acc[country].count++;
		acc[country].total += user.current_balance || 0;
		return acc;
	}, {}) || {};

	return {
		users: users || [],
		stats: {
			total: totalUsers || 0,
			verified: verifiedUsers || 0,
			brands: brandUsers || 0,
			admins: adminUsers || 0,
			banned: bannedUsers || 0,
			ukUsers: geoStats['UK'] || geoStats['GB'] || 0,
			bgUsers: geoStats['BG'] || 0,
			pendingPayoutsUK: pendingPayoutsByCountry['GB'] || pendingPayoutsByCountry['UK'] || { count: 0, total: 0 },
			pendingPayoutsBG: pendingPayoutsByCountry['BG'] || { count: 0, total: 0 }
		}
	};
	} catch (err) {
		console.error('Error in users load function:', err);
		throw error(500, {
			message: 'Failed to load users data',
			details: err instanceof Error ? err.message : 'Unknown error'
		});
	}
}) satisfies PageServerLoad;

export const actions = {
	verifyUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		const { error } = await locals.supabase
			.from('profiles')
			.update({ is_verified: true })
			.eq('id', userId);

		if (error) {
			return fail(400, { message: 'Failed to verify user' });
		}

		return { success: true };
	},

	unverifyUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		const { error } = await locals.supabase
			.from('profiles')
			.update({ is_verified: false })
			.eq('id', userId);

		if (error) {
			return fail(400, { message: 'Failed to unverify user' });
		}

		return { success: true };
	},

	banUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const reason = formData.get('reason') as string;

		// Update user role to banned
		const { error } = await locals.supabase
			.from('profiles')
			.update({ 
				role: 'banned',
				ban_reason: reason,
				banned_at: new Date().toISOString()
			})
			.eq('id', userId);

		if (error) {
			return fail(400, { message: 'Failed to ban user' });
		}

		// Deactivate all their listings
		await locals.supabase
			.from('products')
			.update({ is_active: false })
			.eq('seller_id', userId);

		return { success: true };
	},

	unbanUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		const { error } = await locals.supabase
			.from('profiles')
			.update({ 
				role: 'user',
				ban_reason: null,
				banned_at: null
			})
			.eq('id', userId);

		if (error) {
			return fail(400, { message: 'Failed to unban user' });
		}

		return { success: true };
	},

	makeAdmin: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		const { error } = await locals.supabase
			.from('profiles')
			.update({ role: 'admin' })
			.eq('id', userId);

		if (error) {
			return fail(400, { message: 'Failed to make admin' });
		}

		return { success: true };
	},

	removeAdmin: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		const { error } = await locals.supabase
			.from('profiles')
			.update({ role: 'user' })
			.eq('id', userId);

		if (error) {
			return fail(400, { message: 'Failed to remove admin' });
		}

		return { success: true };
	}
} satisfies Actions;