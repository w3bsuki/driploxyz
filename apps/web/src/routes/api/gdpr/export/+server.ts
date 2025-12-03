/**
 * GDPR Data Export API
 * 
 * Allows authenticated users to download all their personal data
 * in compliance with GDPR Article 20 (Right to data portability)
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addSecurityHeaders } from '$lib/server/middleware/security.js';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return error(401, 'Authentication required');
	}

	const userId = user.id;
	const supabase = locals.supabase;

	try {
		// Collect all user data from various tables
		const exportData: Record<string, unknown> = {
			exportDate: new Date().toISOString(),
			exportVersion: '1.0',
			gdprCompliance: 'Article 20 - Right to data portability',
			user: {
				id: user.id,
				email: user.email,
				created_at: user.created_at
			}
		};

		// 1. User Profile
		const { data: profile } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (profile) {
			exportData.profile = {
				username: profile.username,
				full_name: profile.full_name,
				bio: profile.bio,
				location: profile.location,
				region: profile.region,
				country_code: profile.country_code,
				avatar_url: profile.avatar_url,
				created_at: profile.created_at,
				updated_at: profile.updated_at,
				account_type: profile.account_type,
				subscription_tier: profile.subscription_tier,
				verified: profile.verified,
				rating: profile.rating,
				review_count: profile.review_count,
				sales_count: profile.sales_count,
				purchases_count: profile.purchases_count,
				phone: profile.phone,
				date_of_birth: profile.date_of_birth,
				social_links: profile.social_links
			};
		}

		// 2. User Products/Listings
		const { data: products } = await supabase
			.from('products')
			.select(`
				id, title, description, price, condition, size, color,
				created_at, updated_at, is_sold, status, views_count, favorites_count,
				brand_id, category_id
			`)
			.eq('seller_id', userId);

		if (products) {
			exportData.products = products;
		}

		// 3. User Orders (as buyer)
		const { data: purchases } = await supabase
			.from('orders')
			.select(`
				id, status, total_amount, currency, shipping_address,
				created_at, updated_at, tracking_number,
				payment_status, shipping_status
			`)
			.eq('buyer_id', userId);

		if (purchases) {
			exportData.purchases = purchases;
		}

		// 4. User Sales (as seller)
		const { data: sales } = await supabase
			.from('orders')
			.select(`
				id, status, total_amount, currency,
				created_at, updated_at, tracking_number,
				payment_status, shipping_status
			`)
			.eq('seller_id', userId);

		if (sales) {
			exportData.sales = sales;
		}

		// 5. User Messages (conversations)
		const { data: messages } = await supabase
			.from('messages')
			.select(`
				id, content, created_at, read_at,
				sender_id, conversation_id
			`)
			.eq('sender_id', userId)
			.order('created_at', { ascending: false })
			.limit(1000);

		if (messages) {
			exportData.messagesSent = messages;
		}

		// 6. User Reviews (given and received)
		const { data: reviewsGiven } = await supabase
			.from('reviews')
			.select('id, rating, comment, created_at, reviewee_id')
			.eq('reviewer_id', userId);

		const { data: reviewsReceived } = await supabase
			.from('reviews')
			.select('id, rating, comment, created_at, reviewer_id')
			.eq('reviewee_id', userId);

		exportData.reviews = {
			given: reviewsGiven || [],
			received: reviewsReceived || []
		};

		// 7. User Favorites
		const { data: favorites } = await supabase
			.from('favorites')
			.select(`
				created_at,
				product_id
			`)
			.eq('user_id', userId);

		if (favorites) {
			exportData.favorites = favorites;
		}

		// 8. User Followers/Following
		const { data: followers } = await supabase
			.from('followers')
			.select('follower_id, created_at')
			.eq('following_id', userId);

		const { data: following } = await supabase
			.from('followers')
			.select('following_id, created_at')
			.eq('follower_id', userId);

		exportData.socialConnections = {
			followers: followers?.length || 0,
			following: following?.length || 0,
			followersList: followers || [],
			followingList: following || []
		};

		// 9. User Notifications
		const { data: notifications } = await supabase
			.from('notifications')
			.select('id, type, title, message, created_at, read_at')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(500);

		if (notifications) {
			exportData.notifications = notifications;
		}

		// 10. Balance History
		const { data: balanceHistory } = await supabase
			.from('balance_history')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (balanceHistory) {
			exportData.balanceHistory = balanceHistory;
		}

		// 11. Transactions
		const { data: transactions } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (transactions) {
			exportData.transactions = transactions;
		}

		// Generate filename with timestamp
		const timestamp = new Date().toISOString().split('T')[0];
		const filename = `driplo-data-export-${timestamp}.json`;

		// Return as downloadable JSON
		const response = new Response(JSON.stringify(exportData, null, 2), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="${filename}"`,
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'X-Content-Type-Options': 'nosniff'
			}
		});

		return addSecurityHeaders(response);

	} catch (err) {
		console.error('GDPR data export error:', err);
		return error(500, 'Failed to generate data export. Please try again later.');
	}
};
