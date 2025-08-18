import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types.js';
import { 
	notificationActions, 
	messageToastActions, 
	playNotificationSound,
	showBrowserNotification 
} from '$lib/stores/notifications.js';
import { browser } from '$app/environment';

type Tables = Database['public']['Tables'];
type Message = Tables['messages']['Row'] & {
	sender: Tables['profiles']['Row'];
	receiver: Tables['profiles']['Row'];
	product?: Tables['products']['Row'] & {
		images: Tables['product_images']['Row'][];
	};
};

export class RealtimeNotificationService {
	private supabase: SupabaseClient<Database>;
	private userId: string;
	private channels: RealtimeChannel[] = [];
	private isActive = true;
	private lastActivityTime = Date.now();

	constructor(supabase: SupabaseClient<Database>, userId: string) {
		this.supabase = supabase;
		this.userId = userId;

		if (browser) {
			this.setupActivityTracking();
		}
	}

	/**
	 * Initialize all real-time subscriptions
	 */
	initialize() {
		this.subscribeToMessages();
		this.subscribeToNotifications();
		this.subscribeToProductLikes();
		this.subscribeToProductSales();
		this.updateUserActiveStatus();
	}

	/**
	 * Subscribe to new messages
	 */
	private subscribeToMessages() {
		const messagesChannel = this.supabase
			.channel('user_messages')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `receiver_id=eq.${this.userId}`
				},
				async (payload) => {
					const message = payload.new as Tables['messages']['Row'];
					await this.handleNewMessage(message);
				}
			)
			.subscribe();

		this.channels.push(messagesChannel);
	}

	/**
	 * Subscribe to admin notifications
	 * TODO: Enable when admin_notifications table exists
	 */
	private subscribeToNotifications() {
		// Disabled - admin_notifications table doesn't exist yet
		// const notificationsChannel = this.supabase
		// 	.channel('user_notifications')
		// 	.on(
		// 		'postgres_changes',
		// 		{
		// 			event: 'INSERT',
		// 			schema: 'public',
		// 			table: 'admin_notifications'
		// 		},
		// 		(payload) => {
		// 			const notification = payload.new as Tables['admin_notifications']['Row'];
		// 			this.handleNewNotification(notification);
		// 		}
		// 	)
		// 	.subscribe();

		// this.channels.push(notificationsChannel);
	}

	/**
	 * Subscribe to product likes/favorites
	 */
	private subscribeToProductLikes() {
		const likesChannel = this.supabase
			.channel('product_likes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'favorites'
				},
				async (payload) => {
					const favorite = payload.new as Tables['favorites']['Row'];
					await this.handleProductLike(favorite);
				}
			)
			.subscribe();

		this.channels.push(likesChannel);
	}

	/**
	 * Subscribe to product sales
	 */
	private subscribeToProductSales() {
		const salesChannel = this.supabase
			.channel('product_sales')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'orders'
				},
				async (payload) => {
					const order = payload.new as Tables['orders']['Row'];
					await this.handleProductSale(order);
				}
			)
			.subscribe();

		this.channels.push(salesChannel);
	}

	/**
	 * Handle new message received
	 */
	private async handleNewMessage(message: Tables['messages']['Row']) {
		try {
			// Fetch sender details
			const { data: sender } = await this.supabase
				.from('profiles')
				.select('id, username, avatar_url')
				.eq('id', message.sender_id)
				.single();

			if (!sender) return;

			// Fetch product details if available
			let product;
			if (message.product_id) {
				const { data: productData } = await this.supabase
					.from('products')
					.select(`
						id, title,
						images:product_images(image_url)
					`)
					.eq('id', message.product_id)
					.single();

				if (productData) {
					product = {
						id: productData.id,
						title: productData.title,
						image: productData.images?.[0]?.image_url || '/placeholder-product.svg'
					};
				}
			}

			// Show toast notification if user is active
			if (this.isActive) {
				messageToastActions.add({
					sender: {
						id: sender.id,
						username: sender.username,
						avatar_url: sender.avatar_url
					},
					message: message.content,
					product
				});
			} else {
				// Add to notifications without toast
				notificationActions.add({
					type: 'message',
					title: `New message from ${sender.username}`,
					message: message.content,
					sender: {
						id: sender.id,
						username: sender.username,
						avatar_url: sender.avatar_url
					},
					product,
					read: false,
					action_url: `/messages?conversation=${sender.id}`
				});
			}

			// Play notification sound
			playNotificationSound();

			// Show browser notification if permission granted and user inactive
			if (!this.isActive && browser) {
				showBrowserNotification(
					`New message from ${sender.username}`,
					{
						body: message.content,
						icon: sender.avatar_url || '/icon-192.png',
						tag: `message-${message.id}`
					}
				);
			}

		} catch (error) {
			console.error('Error handling new message:', error);
		}
	}

	/**
	 * Handle new admin notification
	 */
	private handleNewNotification(notification: Tables['admin_notifications']['Row']) {
		notificationActions.add({
			type: 'system',
			title: notification.title,
			message: notification.message,
			read: false
		});

		playNotificationSound();

		// Show browser notification
		if (browser) {
			showBrowserNotification(notification.title, {
				body: notification.message,
				tag: `admin-${notification.id}`
			});
		}
	}

	/**
	 * Handle product like notification
	 */
	private async handleProductLike(favorite: Tables['favorites']['Row']) {
		try {
			// Only notify if it's the product owner
			const { data: product } = await this.supabase
				.from('products')
				.select(`
					id, title, seller_id,
					images:product_images(image_url)
				`)
				.eq('id', favorite.product_id)
				.single();

			if (!product || product.seller_id !== this.userId) return;

			// Fetch liker details
			const { data: liker } = await this.supabase
				.from('profiles')
				.select('id, username, avatar_url')
				.eq('id', favorite.user_id)
				.single();

			if (!liker) return;

			notificationActions.add({
				type: 'like',
				title: `${liker.username} liked your item`,
				message: product.title,
				sender: {
					id: liker.id,
					username: liker.username,
					avatar_url: liker.avatar_url
				},
				product: {
					id: product.id,
					title: product.title,
					image: product.images?.[0]?.image_url || '/placeholder-product.svg'
				},
				read: false,
				action_url: `/product/${product.id}`
			});

			playNotificationSound();

		} catch (error) {
			console.error('Error handling product like:', error);
		}
	}

	/**
	 * Handle product sale notification
	 */
	private async handleProductSale(order: Tables['orders']['Row']) {
		try {
			// Only notify if it's the seller
			const { data: product } = await this.supabase
				.from('products')
				.select(`
					id, title, price, seller_id,
					images:product_images(image_url)
				`)
				.eq('id', order.product_id)
				.single();

			if (!product || product.seller_id !== this.userId) return;

			// Fetch buyer details
			const { data: buyer } = await this.supabase
				.from('profiles')
				.select('id, username, avatar_url')
				.eq('id', order.buyer_id)
				.single();

			if (!buyer) return;

			notificationActions.add({
				type: 'sale',
				title: 'Item sold!',
				message: `${buyer.username} bought ${product.title} for $${product.price}`,
				sender: {
					id: buyer.id,
					username: buyer.username,
					avatar_url: buyer.avatar_url
				},
				product: {
					id: product.id,
					title: product.title,
					image: product.images?.[0]?.image_url || '/placeholder-product.svg'
				},
				read: false,
				action_url: `/dashboard/earnings`
			});

			playNotificationSound();

			// Show browser notification
			if (browser) {
				showBrowserNotification('Item sold!', {
					body: `${buyer.username} bought ${product.title} for $${product.price}`,
					icon: product.images?.[0]?.image_url || '/icon-192.png',
					tag: `sale-${order.id}`
				});
			}

		} catch (error) {
			console.error('Error handling product sale:', error);
		}
	}

	/**
	 * Setup activity tracking to determine when to show toasts vs notifications
	 */
	private setupActivityTracking() {
		if (!browser) return;

		const updateActivity = () => {
			this.lastActivityTime = Date.now();
			this.isActive = true;
		};

		// Track user activity
		document.addEventListener('mousemove', updateActivity);
		document.addEventListener('keypress', updateActivity);
		document.addEventListener('scroll', updateActivity);
		document.addEventListener('click', updateActivity);

		// Check activity every 30 seconds
		setInterval(() => {
			const now = Date.now();
			const inactive = now - this.lastActivityTime > 60000; // 1 minute
			
			if (this.isActive && inactive) {
				this.isActive = false;
			}
		}, 30000);

		// Update user's last active status every 2 minutes
		setInterval(() => {
			this.updateUserActiveStatus();
		}, 120000);
	}

	/**
	 * Update user's last active status
	 */
	private async updateUserActiveStatus() {
		try {
			await this.supabase
				.from('profiles')
				.update({ last_active_at: new Date().toISOString() })
				.eq('id', this.userId);
		} catch (error) {
			console.error('Error updating user active status:', error);
		}
	}

	/**
	 * Cleanup all subscriptions
	 */
	destroy() {
		this.channels.forEach(channel => {
			this.supabase.removeChannel(channel);
		});
		this.channels = [];
	}
}