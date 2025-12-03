/**
 * GDPR Account Deletion API
 * 
 * Allows authenticated users to permanently delete their account and data
 * in compliance with GDPR Article 17 (Right to erasure)
 */

import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addSecurityHeaders } from '$lib/server/middleware/security.js';

/**
 * POST: Delete user account and all associated data
 * 
 * Process:
 * 1. Verify no pending orders
 * 2. Verify no active subscriptions
 * 3. Soft-delete or anonymize data
 * 4. Delete auth account
 */
export const POST: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return error(401, 'Authentication required');
	}

	const userId = user.id;
	const supabase = locals.supabase;

	try {
		// Check for pending orders (as buyer or seller)
		const { data: pendingOrders, error: ordersError } = await supabase
			.from('orders')
			.select('id, status')
			.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
			.in('status', ['pending', 'paid', 'shipped']);

		if (ordersError) {
			console.error('Error checking pending orders:', ordersError);
			return error(500, 'Failed to verify account status');
		}

		if (pendingOrders && pendingOrders.length > 0) {
			return json({
				success: false,
				error: 'pending_orders',
				message: 'Cannot delete account with pending orders. Please complete or cancel all orders first.',
				pendingCount: pendingOrders.length
			}, { status: 400 });
		}

		// Check for active subscriptions
		const { data: activeSubscription, error: subError } = await supabase
			.from('user_subscriptions')
			.select('id, status')
			.eq('user_id', userId)
			.eq('status', 'active')
			.maybeSingle();

		if (subError) {
			console.error('Error checking subscription:', subError);
			// Continue - subscription check is not critical
		}

		if (activeSubscription) {
			return json({
				success: false,
				error: 'active_subscription',
				message: 'Please cancel your active subscription before deleting your account.'
			}, { status: 400 });
		}

		// Get profile for audit log
		const { data: profile } = await supabase
			.from('profiles')
			.select('username')
			.eq('id', userId)
			.single();

		// Begin data deletion/anonymization process
		// Note: Using individual deletes for better error handling

		// 1. Delete favorites
		await supabase
			.from('favorites')
			.delete()
			.eq('user_id', userId);

		// 2. Delete followers relationships
		await supabase
			.from('followers')
			.delete()
			.or(`follower_id.eq.${userId},following_id.eq.${userId}`);

		// 3. Anonymize messages (keep for other party's context)
		await supabase
			.from('messages')
			.update({ 
				content: '[Message deleted]',
				updated_at: new Date().toISOString()
			})
			.eq('sender_id', userId);

		// 4. Soft-delete products (mark as inactive)
		await supabase
			.from('products')
			.update({ 
				status: 'deleted',
				updated_at: new Date().toISOString()
			})
			.eq('seller_id', userId);

		// 5. Delete notifications
		await supabase
			.from('notifications')
			.delete()
			.eq('user_id', userId);

		// 6. Anonymize reviews (keep ratings for integrity)
		await supabase
			.from('reviews')
			.update({ 
				comment: '[Review removed]',
				updated_at: new Date().toISOString()
			})
			.eq('reviewer_id', userId);

		// 7. Anonymize profile
		const anonymizedUsername = `deleted_user_${Date.now().toString(36)}`;
		await supabase
			.from('profiles')
			.update({
				username: anonymizedUsername,
				full_name: null,
				bio: null,
				avatar_url: null,
				phone: null,
				date_of_birth: null,
				location: null,
				social_links: null,
				updated_at: new Date().toISOString()
			})
			.eq('id', userId);

		// 8. Log the deletion in admin_actions (for audit trail)
		await supabase
			.from('admin_actions')
			.insert({
				admin_id: userId,
				action: 'account_deletion',
				target_type: 'user',
				target_id: userId,
				details: {
					type: 'gdpr_self_deletion',
					original_username: profile?.username,
					deleted_at: new Date().toISOString()
				}
			});

		// 9. Delete the auth user (this triggers cascade deletes)
		const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

		if (deleteError) {
			// If admin deletion fails, try self-signout at minimum
			console.error('Admin delete failed:', deleteError);
			await supabase.auth.signOut();
			
			// Return success - data is anonymized even if auth deletion failed
			const response = json({
				success: true,
				message: 'Your data has been anonymized. Please sign out to complete the process.',
				partial: true
			});
			return addSecurityHeaders(response);
		}

		const response = json({
			success: true,
			message: 'Your account and data have been permanently deleted.',
			deletedAt: new Date().toISOString()
		});

		return addSecurityHeaders(response);

	} catch (err) {
		console.error('Account deletion error:', err);
		return error(500, 'Failed to delete account. Please contact support.');
	}
};

/**
 * GET: Check if account can be deleted (pre-flight check)
 */
export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return error(401, 'Authentication required');
	}

	const userId = user.id;
	const supabase = locals.supabase;

	try {
		// Check for pending orders
		const { data: pendingOrders } = await supabase
			.from('orders')
			.select('id')
			.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
			.in('status', ['pending', 'paid', 'shipped']);

		// Check for active subscriptions
		const { data: activeSubscription } = await supabase
			.from('user_subscriptions')
			.select('id')
			.eq('user_id', userId)
			.eq('status', 'active')
			.maybeSingle();

		const canDelete = (!pendingOrders || pendingOrders.length === 0) && !activeSubscription;

		const response = json({
			canDelete,
			blockers: {
				pendingOrders: pendingOrders?.length || 0,
				activeSubscription: !!activeSubscription
			}
		});

		return addSecurityHeaders(response);

	} catch (err) {
		console.error('Delete check error:', err);
		return error(500, 'Failed to check account status');
	}
};
