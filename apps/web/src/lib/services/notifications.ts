import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Tables = Database['public']['Tables'];
type AdminNotification = Tables['admin_notifications']['Row'];

export class NotificationService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Get unread admin notifications
	 */
	async getUnreadNotifications(limit: number = 50) {
		return await this.supabase
			.from('admin_notifications')
			.select('id, title, message, type, priority, is_read, created_at, related_id, related_table')
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
	 * Mark notification as read
	 */
	async markAsRead(notificationId: string) {
		return await this.supabase
			.from('admin_notifications')
			.update({ 
				is_read: true, 
				read_at: new Date().toISOString() 
			})
			.eq('id', notificationId);
	}

	/**
	 * Mark all notifications as read
	 */
	async markAllAsRead() {
		return await this.supabase
			.from('admin_notifications')
			.update({ 
				is_read: true, 
				read_at: new Date().toISOString() 
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

		const { data: unreadData } = await this.supabase
			.from('admin_notifications')
			.select('id', { count: 'exact', head: true })
			.eq('is_read', false);

		// For type counts, we still need to fetch but only the type column
		const { data: typeData, error } = await this.supabase
			.from('admin_notifications')
			.select('type');

		if (error) return { total: 0, unread: 0, byType: {} };

		const total = totalData?.length || 0;
		const unread = unreadData?.length || 0;
		const byType = typeData?.reduce((acc, notification) => {
			acc[notification.type] = (acc[notification.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return { total, unread, byType };
	}

	/**
	 * Subscribe to real-time notifications
	 */
	subscribeToNotifications(callback: (notification: AdminNotification) => void) {
		return this.supabase
			.channel('admin_notifications')
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
		priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
		relatedId?: string,
		relatedTable?: string
	) {
		return await this.supabase
			.from('notifications')
			.insert({
				user_id: 'system',
				title,
				message,
				type,
				related_id: relatedId,
				related_table: relatedTable
			});
	}

	/**
	 * Send external notification (email, Slack, etc.)
	 */
	async sendExternalNotification(
		type: string,
		recipient: string,
		subject: string,
		message: string,
		metadata: Record<string, any> = {}
	) {
		// Log the notification attempt
		const { data: log } = await this.supabase
			.from('notifications')
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
			console.log(`External notification: ${type} to ${recipient}`);
			console.log(`Subject: ${subject}`);
			console.log(`Message: ${message}`);

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
			stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
			
			// Count by day
			const day = notification.created_at.split('T')[0];
			stats.dailyCount[day] = (stats.dailyCount[day] || 0) + 1;
		});

		return stats;
	}
}