import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type _Tables = Database['public']['Tables'];

export interface AdminNotification {
  id: string;
  type: 'payout_request' | 'user_signup' | 'high_value_sale' | 'suspicious_activity' | 'system_alert' | 'payment_failed';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  country_code?: string;
  user_id?: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}

export interface NotificationStats {
  total_unread: number;
  by_priority: Record<string, number>;
  by_country: Record<string, number>;
  by_type: Record<string, number>;
}

export class AdminNotificationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create a new admin notification
   */
  async createNotification(notification: Omit<AdminNotification, 'id' | 'created_at' | 'is_read'>): Promise<AdminNotification | null> {
    try {
      // For now, just log the notification since the table might not exist yet

      // Create a mock notification object for return
      const mockNotification: AdminNotification = {
        id: crypto.randomUUID(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        country_code: notification.country_code,
        user_id: notification.user_id,
        is_read: false,
        created_at: new Date().toISOString(),
        action_url: notification.action_url,
        action_label: notification.action_label
      };

      // Trigger real-time notification if configured
      await this.triggerRealTimeNotification(mockNotification);

      return mockNotification;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all admin notifications with filtering
   */
  async getNotifications(_filters?: {
    type?: string;
    priority?: string;
    country?: string;
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AdminNotification[]> {
    try {
      // Return mock notifications for now
      
      // Return empty array until the table is properly set up
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      // Return mock stats for now
      
      return {
        total_unread: 0,
        by_priority: { urgent: 0, high: 0, normal: 0, low: 0 },
        by_country: { UK: 0, BG: 0 },
        by_type: {
          payout_request: 0,
          user_signup: 0,
          high_value_sale: 0,
          suspicious_activity: 0,
          system_alert: 0,
          payment_failed: 0
        }
      };
    } catch (error) {
      return {
        total_unread: 0,
        by_priority: { urgent: 0, high: 0, normal: 0, low: 0 },
        by_country: { UK: 0, BG: 0 },
        by_type: {
          payout_request: 0,
          user_signup: 0,
          high_value_sale: 0,
          suspicious_activity: 0,
          system_alert: 0,
          payment_failed: 0
        }
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(_notificationId: string): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  subscribeToNotifications(
    callback: (notification: AdminNotification) => void,
    options?: {
      priority?: 'urgent' | 'high';
      country?: string;
    }
  ) {
    const channel = this.supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: options?.country ? `country_code=eq.${options.country}` : undefined
        },
        (payload) => {
          const notification = payload.new as AdminNotification;
          
          // Filter by priority if specified
          if (options?.priority && notification.priority !== options.priority && notification.priority !== 'urgent') {
            return;
          }
          
          callback(notification);
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Create payout request notification
   */
  async notifyPayoutRequest(
    userId: string,
    username: string,
    amount: number,
    currency: string,
    countryCode: string
  ): Promise<void> {
    await this.createNotification({
      type: 'payout_request',
      title: 'New Payout Request',
      message: `${username} requested payout of ${new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency 
      }).format(amount)}`,
      priority: amount > 1000 ? 'high' : 'normal',
      country_code: countryCode,
      user_id: userId,
      action_url: '/admin/payouts',
      action_label: 'Review Payout',
      data: {
        user_id: userId,
        username,
        amount,
        currency,
        country_code: countryCode
      }
    });
  }

  /**
   * Create high value sale notification
   */
  async notifyHighValueSale(
    sellerId: string,
    buyerId: string,
    amount: number,
    currency: string,
    productTitle: string,
    countryCode: string
  ): Promise<void> {
    if (amount >= 500) { // Only notify for sales >= 500 currency units
      await this.createNotification({
        type: 'high_value_sale',
        title: 'High Value Sale',
        message: `High value sale of ${new Intl.NumberFormat('en-GB', { 
          style: 'currency', 
          currency 
        }).format(amount)} for "${productTitle}"`,
        priority: amount >= 2000 ? 'high' : 'normal',
        country_code: countryCode,
        user_id: sellerId,
        action_url: `/admin/transactions`,
        action_label: 'View Transaction',
        data: {
          seller_id: sellerId,
          buyer_id: buyerId,
          amount,
          currency,
          product_title: productTitle,
          country_code: countryCode
        }
      });
    }
  }

  /**
   * Create suspicious activity notification
   */
  async notifySuspiciousActivity(
    userId: string,
    activityType: string,
    details: string,
    countryCode?: string
  ): Promise<void> {
    await this.createNotification({
      type: 'suspicious_activity',
      title: 'Suspicious Activity Detected',
      message: `${activityType}: ${details}`,
      priority: 'urgent',
      country_code: countryCode,
      user_id: userId,
      action_url: `/admin/users?search=${userId}`,
      action_label: 'Investigate User',
      data: {
        user_id: userId,
        activity_type: activityType,
        details,
        country_code: countryCode,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create new user signup notification
   */
  async notifyNewUserSignup(
    userId: string,
    username: string,
    email: string,
    countryCode: string
  ): Promise<void> {
    await this.createNotification({
      type: 'user_signup',
      title: 'New User Registration',
      message: `${username} (${email}) joined from ${countryCode}`,
      priority: 'low',
      country_code: countryCode,
      user_id: userId,
      action_url: `/admin/users?search=${userId}`,
      action_label: 'View Profile',
      data: {
        user_id: userId,
        username,
        email,
        country_code: countryCode,
        signup_timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create payment failed notification
   */
  async notifyPaymentFailed(
    userId: string,
    orderId: string,
    amount: number,
    currency: string,
    errorMessage: string,
    countryCode?: string
  ): Promise<void> {
    await this.createNotification({
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Payment of ${new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency 
      }).format(amount)} failed: ${errorMessage}`,
      priority: 'high',
      country_code: countryCode,
      user_id: userId,
      action_url: `/admin/orders?search=${orderId}`,
      action_label: 'View Order',
      data: {
        user_id: userId,
        order_id: orderId,
        amount,
        currency,
        error_message: errorMessage,
        country_code: countryCode,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Trigger real-time notification via webhook or other service
   */
  private async triggerRealTimeNotification(notification: AdminNotification): Promise<void> {
    try {
      // Here you would integrate with your webhook system, Slack, email, etc.
      // For now, we'll just log it
      
      if (notification.priority === 'urgent') {
        console.log('🚨 URGENT NOTIFICATION:', notification.title, '-', notification.message);
        
        // Example: Send to Slack webhook
        // await this.sendSlackNotification(notification);
        
        // Example: Send email to admins
        // await this.sendEmailNotification(notification);
      }
      
      // You could also trigger browser notifications for real-time updates
      // await this.sendBrowserNotification(notification);
      
    } catch (error) {
    }
  }

  /**
   * Example: Send notification to Slack webhook
   */
  private async _sendSlackNotification(notification: AdminNotification): Promise<void> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) return;

      const payload = {
        text: `🚨 ${notification.title}`,
        attachments: [
          {
            color: notification.priority === 'urgent' ? 'danger' : 'warning',
            fields: [
              {
                title: 'Message',
                value: notification.message,
                short: false
              },
              {
                title: 'Country',
                value: notification.country_code || 'Unknown',
                short: true
              },
              {
                title: 'Priority',
                value: notification.priority.toUpperCase(),
                short: true
              }
            ],
            footer: 'Driplo Admin',
            ts: Math.floor(new Date(notification.created_at).getTime() / 1000)
          }
        ]
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
    }
  }
}