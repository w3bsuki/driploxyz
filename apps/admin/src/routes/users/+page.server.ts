import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all users with their profile info and stats
	const { data: users, error } = await locals.supabase
		.from('profiles')
		.select(`
			*,
			_count_products:products(count),
			_count_orders_as_buyer:orders!orders_buyer_id_fkey(count),
			_count_orders_as_seller:orders!orders_seller_id_fkey(count)
		`)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching users:', error);
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

	return {
		users: users || [],
		stats: {
			total: totalUsers || 0,
			verified: verifiedUsers || 0,
			brands: brandUsers || 0,
			admins: adminUsers || 0,
			banned: bannedUsers || 0,
			ukUsers: geoStats['UK'] || geoStats['GB'] || 0,
			bgUsers: geoStats['BG'] || 0
		}
	};
};

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