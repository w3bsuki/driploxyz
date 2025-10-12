import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
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
		
	}

	// Get stats
	const { count: totalListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true });

	const { count: activeListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('is_active', true)
		.eq('is_sold', false);

	const { count: soldListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('is_sold', true);

	const { count: reportedListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('is_featured', true);

	return {
		listings: listings || [],
		stats: {
			total: totalListings || 0,
			active: activeListings || 0,
			sold: soldListings || 0,
			reported: reportedListings || 0
		}
	};
}) satisfies PageServerLoad;

export const actions = {
	approveListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;

		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_active: true,
				is_approved: true,
				approved_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to approve listing' });
		}

		return { success: true };
	},

	rejectListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;
		const reason = formData.get('reason') as string;

		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_active: false,
				is_approved: false,
				rejection_reason: reason,
				rejected_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to reject listing' });
		}

		return { success: true };
	},

	featureListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;

		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_featured: true,
				featured_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to feature listing' });
		}

		return { success: true };
	},

	unfeatureListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;

		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_featured: false,
				featured_at: null
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to unfeature listing' });
		}

		return { success: true };
	},

	deleteListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;
		const reason = formData.get('reason') as string;

		// Soft delete - mark as deleted with reason
		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_active: false,
				is_deleted: true,
				deletion_reason: reason,
				deleted_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to delete listing' });
		}

		return { success: true };
	},

	activateListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;

		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_active: true,
				reactivated_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to activate listing' });
		}

		return { success: true };
	},

	deactivateListing: async ({ request, locals }) => {
		const formData = await request.formData();
		const listingId = formData.get('listingId') as string;

		const { error } = await locals.supabase
			.from('products')
			.update({ 
				is_active: false,
				deactivated_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (error) {
			return fail(400, { message: 'Failed to deactivate listing' });
		}

		return { success: true };
	}
} satisfies Actions;