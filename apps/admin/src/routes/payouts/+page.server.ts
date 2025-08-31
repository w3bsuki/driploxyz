import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ locals }) => {
	// Verify admin access
	if (!locals.isAdmin) {
		throw error(403, 'Admin access required');
	}

	const supabase = locals.supabase;

	// Fetch pending payouts using the admin view
	const { data: payouts, error: payoutsError } = await supabase
		.from('admin_payout_dashboard')
		.select('*')
		.order('requested_at', { ascending: true });

	if (payoutsError) {
		console.error('Error fetching payouts:', payoutsError);
		throw error(500, 'Failed to fetch payouts');
	}

	// Get summary stats
	const { data: stats } = await supabase.rpc('admin_get_dashboard_summary');

	return {
		payouts: payouts || [],
		stats: stats || {}
	};
}) satisfies PageServerLoad;

export const actions = {
	approve: async ({ request, locals }) => {
		if (!locals.isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		const formData = await request.formData();
		const payoutId = formData.get('payout_id') as string;
		const notes = formData.get('notes') as string;

		if (!payoutId) {
			return fail(400, { error: 'Payout ID required' });
		}

		// Call the admin approve function
		const { data, error: approveError } = await locals.supabase.rpc('admin_quick_approve_payout', {
			p_payout_id: payoutId
		});

		if (approveError) {
			console.error('Error approving payout:', approveError);
			return fail(500, { error: 'Failed to approve payout' });
		}

		return {
			success: true,
			message: `Payout approved successfully. Reference: ${data?.reference_number}`
		};
	},

	complete: async ({ request, locals }) => {
		if (!locals.isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		const formData = await request.formData();
		const payoutId = formData.get('payout_id') as string;
		const reference = formData.get('reference') as string;

		if (!payoutId || !reference) {
			return fail(400, { error: 'Payout ID and reference required' });
		}

		// Call the admin complete function
		const { data, error: completeError } = await locals.supabase.rpc('admin_quick_complete_payout', {
			p_payout_id: payoutId,
			p_reference: reference
		});

		if (completeError) {
			console.error('Error completing payout:', completeError);
			return fail(500, { error: 'Failed to complete payout' });
		}

		return {
			success: true,
			message: `Payout completed successfully. Amount: ${data?.amount}`
		};
	},

	reject: async ({ request, locals }) => {
		if (!locals.isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		const formData = await request.formData();
		const payoutId = formData.get('payout_id') as string;
		const reason = formData.get('reason') as string;

		if (!payoutId || !reason) {
			return fail(400, { error: 'Payout ID and reason required' });
		}

		// Update payout status to rejected
		const { error: rejectError } = await locals.supabase
			.from('payout_requests')
			.update({
				status: 'rejected',
				rejection_reason: reason,
				reviewed_at: new Date().toISOString()
			})
			.eq('id', payoutId);

		if (rejectError) {
			console.error('Error rejecting payout:', rejectError);
			return fail(500, { error: 'Failed to reject payout' });
		}

		// Return funds to available balance
		const { error: balanceError } = await locals.supabase.rpc('return_payout_to_balance', {
			p_payout_id: payoutId
		});

		if (balanceError) {
			console.error('Error returning balance:', balanceError);
		}

		return {
			success: true,
			message: 'Payout rejected and funds returned to user balance'
		};
	}
} satisfies Actions;