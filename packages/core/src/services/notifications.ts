import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Tables = Database['public']['Tables'];
type AdminNotification = Tables['admin_notifications']['Row'];

export class NotificationService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Get unis_read admin notifications
	 */
	async getUnis_readNotifications(limit: number = 50) {
		return await this.supabase
			.from('admin_notifications')
			.select('id, title, message, type, priority, is_read, created_at, order_id')
			.eq('is_read', false)
			.order('created_at', { ascending: false })
			.limit(limit);
	}

	/**
	 * Get all admin notifications with pagination
	 */
	async getAdminNotifications(page: number = 1, limit: number = 20, type?: string) {
		let query = this.supabase
			.from('admin_notifications')
			.select('*', { count: 'exact' });

		if (type) {
			query = query.eq('type', type);
		}

		const offset = (page - 1) * limit;
		return await query
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);
	}

	/**
	 * Mark notification as is_read
	 */
	async markAsRead(notificationId: string) {
		return await this.supabase
			.from('admin_notifications')
			.update({ 
				is_read: true
			})
			.eq('id', notificationId);
	}

	/**
	 * Mark all notifications as is_read
	 */
	async markAllAsRead() {
		return await this.supabase
			.from('admin_notifications')
			.update({ 
				is_read: true
			})
			.eq('is_read', false);
	}

	/**
	 * Get notification counts by type - optimized to use SQL aggregation
	 */
	async getNotificationCounts() {
		// Use SQL aggregation instead of client-side processing
		const { data: totalData } = await this.supabase
			.from('admin_notifications')
			.select('id', { count: 'exact', head: true });

		const { data: unis_readData } = await this.supabase
			.from('admin_notifications')
			.select('id', { count: 'exact', head: true })
			.eq('is_read', false);

		// For type counts, we still need to fetch but only the type column
		const { data: typeData, error } = await this.supabase
			.from('admin_notifications')
			.select('type');

		if (error) return { total: 0, unis_read: 0, byType: {} };

		const total = totalData?.length || 0;
		const unis_read = unis_readData?.length || 0;
		const byType = typeData?.reduce((acc, notification) => {
			acc[notification.type] = (acc[notification.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return { total, unis_read, byType };
	}

	/**
	 * Subscribe to real-time notifications
	 */
	subscribeToNotifications(callback: (notification: AdminNotification) => void) {
		return this.supabase
			.channel('notifications')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'admin_notifications'
				},
				(payload) => {
					callback(payload.new as AdminNotification);
				}
			)
			.subscribe();
	}

	/**
	 * Create a manual admin notification
	 */
	async createNotification(
		title: string,
		message: string,
		type: string,
		relatedId?: string
	) {
		return await this.supabase
			.from('admin_notifications')
			.insert({
				user_id: 'system',
				title,
				message,
				type,
				order_id: relatedId
			});
	}

	/**
	 * Send external notification (email, Slack, etc.)
	 */
	async sendExternalNotification(
		type: string,
		recipient: string,
		subject: string,
		message: string
	) {
		// Log the notification attempt
		await this.supabase
			.from('admin_notifications')
			.insert({
				user_id: recipient,
				type,
				title: subject,
				message
			})
			.select()
			.single();

		try {
			// Here you would integrate with your email service, Slack API, etc.
			// For now, we'll just log it
			
			
			

			return { success: true };
		} catch (error) {
			return { success: false, error: error as Error };
		}
	}

	/**
	 * Get notification statistics for dashboard
	 */
	async getNotificationStats(days: number = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const { data } = await this.supabase
			.from('admin_notifications')
			.select('type, priority, created_at')
			.gte('created_at', startDate.toISOString());

		const stats = {
			totalNotifications: data?.length || 0,
			byType: {} as Record<string, number>,
			byPriority: {} as Record<string, number>,
			dailyCount: {} as Record<string, number>
		};

		data?.forEach(notification => {
			// Count by type
			stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
			
			// Count by priority
			if (notification.priority) {
				stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
			}
			
			// Count by day
			if (notification.created_at) {
				const dayPart = notification.created_at.split('T')[0];
				if (dayPart) {
					stats.dailyCount[dayPart] = (stats.dailyCount[dayPart] || 0) + 1;
				}
			}
		});

		return stats;
	}
}