import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { browser } from '$app/environment';
import { notificationActions, showBrowserNotification, playNotificationSound } from '$lib/stores/notifications';

// Database tables type reserved for future functionality

export class RealtimeNotificationService {
	private supabase: SupabaseClient<Database>;
	private userId: string;
	private channel: RealtimeChannel | null = null;
	private isDestroyed = false;

	constructor(supabase: SupabaseClient<Database>, userId: string) {
		this.supabase = supabase;
		this.userId = userId;
	}

	/**
	 * Initialize a SINGLE channel with all subscriptions
	 */
	initialize() {
		if (this.channel || this.isDestroyed) {
			return;
		}

		// Create ONE channel for all subscriptions
		this.channel = this.supabase
			.channel('user_notifications_' + this.userId)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `receiver_id=eq.${this.userId}`
				},
				async (payload) => {
					// Handle new messages
					console.log('New message:', payload);
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notifications',
					filter: `user_id=eq.${this.userId}`
				},
				async (payload) => {
					// Handle new notifications (orders, sales, etc.)
					const notification = payload.new as any;
					
					// Add to notification store
					notificationActions.add({
						type: this.mapNotificationType(notification.type),
						title: notification.title,
						message: notification.message,
						read: false,
						action_url: notification.order_id ? `/dashboard/order-management` : undefined
					});

					// Show browser notification if permission granted
					if (browser) {
						showBrowserNotification(notification.title, {
							body: notification.message,
							tag: notification.type
						});
						
						// Play sound for important notifications
						if (['new_sale', 'order_placed', 'order_shipped'].includes(notification.type)) {
							playNotificationSound();
						}
					}
				}
			)
			.subscribe();
	}

	/**
	 * Map database notification types to UI notification types
	 */
	private mapNotificationType(dbType: string): 'message' | 'like' | 'sale' | 'offer' | 'system' {
		switch (dbType) {
			case 'new_sale':
			case 'order_placed':
			case 'order_shipped':
			case 'order_delivered':
				return 'sale';
			case 'new_message':
				return 'message';
			case 'new_offer':
			case 'offer_accepted':
			case 'offer_declined':
				return 'offer';
			case 'product_liked':
			case 'profile_followed':
				return 'like';
			default:
				return 'system';
		}
	}

	/**
	 * Cleanup subscription
	 */
	destroy() {
		this.isDestroyed = true;
		if (this.channel) {
			this.supabase.removeChannel(this.channel);
			this.channel = null;
		}
	}
}