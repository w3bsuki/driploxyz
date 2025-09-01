import type { SupabaseClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SoldProductNotification {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_image: string;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string;
  sold_at: string;
  earnings: number;
  order_id: string;
}

export class SoldNotificationService {
  private channel: RealtimeChannel | null = null;
  private callbacks: Map<string, (notification: SoldProductNotification) => void> = new Map();

  constructor(private supabase: SupabaseClient) {}

  /**
   * Subscribe to real-time sold product notifications for a seller
   */
  async subscribeToSoldNotifications(
    sellerId: string,
    onNotification: (notification: SoldProductNotification) => void
  ): Promise<() => void> {
    // Generate a unique callback ID
    const callbackId = Math.random().toString(36);
    this.callbacks.set(callbackId, onNotification);

    // Create or reuse the channel
    if (!this.channel) {
      this.channel = this.supabase
        .channel('sold-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `seller_id=eq.${sellerId}`
          },
          async (payload) => {
            // When a new order is created for this seller
            const order = payload.new;
            
            // Fetch product and buyer details
            const { data: productData } = await this.supabase
              .from('products')
              .select('title, images')
              .eq('id', order.product_id)
              .single();
            
            const { data: buyerData } = await this.supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', order.buyer_id)
              .single();
            
            if (productData && buyerData) {
              const notification: SoldProductNotification = {
                id: `sold-${order.id}`,
                product_id: order.product_id,
                product_title: productData.title,
                product_price: order.total_amount,
                product_image: productData.images?.[0]?.image_url || '/placeholder-product.svg',
                buyer_id: order.buyer_id,
                buyer_name: buyerData.username || buyerData.full_name,
                buyer_avatar: buyerData.avatar_url || '',
                sold_at: order.created_at,
                earnings: order.total_amount * 0.95, // After 5% platform fee
                order_id: order.id
              };
              
              // Call all registered callbacks
              this.callbacks.forEach(callback => callback(notification));
            }
          }
        )
        .subscribe();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callbackId);
      if (this.callbacks.size === 0 && this.channel) {
        this.supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }

  /**
   * Get recent sold products for a seller
   */
  async getRecentSoldProducts(
    sellerId: string,
    limit: number = 5
  ): Promise<SoldProductNotification[]> {
    const { data: orders, error } = await this.supabase
      .from('orders')
      .select(`
        id,
        product_id,
        buyer_id,
        total_amount,
        created_at,
        products!inner(
          title,
          images
        ),
        profiles!buyer_id(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !orders) {
      console.error('Error fetching recent sold products:', error);
      return [];
    }

    return orders.map(order => {
      const product = Array.isArray(order.products) ? order.products[0] : order.products;
      const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
      
      return {
        id: `sold-${order.id}`,
        product_id: order.product_id,
        product_title: product?.title || 'Unknown Product',
        product_price: order.total_amount,
        product_image: product?.images?.[0]?.image_url || '/placeholder-product.svg',
        buyer_id: order.buyer_id,
        buyer_name: profile?.username || profile?.full_name || 'Unknown',
        buyer_avatar: profile?.avatar_url || '',
        sold_at: order.created_at,
        earnings: order.total_amount * 0.95,
        order_id: order.id
      };
    });
  }

  /**
   * Mark a sold notification as read
   */
  async markAsRead(orderId: string): Promise<void> {
    // You could implement a separate notifications table to track read status
    // For now, we'll just log it
    console.log(`Marking order ${orderId} notification as read`);
  }

  /**
   * Get unread sold notifications count
   */
  async getUnreadCount(_sellerId: string): Promise<number> {
    // This would query a notifications table
    // For now, return 0
    return 0;
  }

  /**
   * Send email notification for sold product
   */
  async sendSoldEmailNotification(order: any, locale: string = 'en'): Promise<void> {
    // This would integrate with your email service
    // The email templates are already set up in the internationalization system
    console.log(`Sending sold notification email for order ${order.id} in ${locale}`);
  }

  /**
   * Get sales analytics for a seller
   */
  async getSalesAnalytics(sellerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: orders, error } = await this.supabase
      .from('orders')
      .select(`
        total_amount,
        created_at,
        products!inner(
          category_id,
          categories(name)
        )
      `)
      .eq('seller_id', sellerId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error || !orders) {
      console.error('Error fetching sales analytics:', error);
      return null;
    }

    // Calculate analytics
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalEarnings = totalRevenue * 0.95; // After platform fee
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Group by date for chart data
    const salesByDate = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count++;
      acc[date].revenue += Number(order.total_amount);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Top categories
    const categorySales = orders.reduce((acc, order) => {
      const products = Array.isArray(order.products) ? order.products[0] : order.products;
      const categories = Array.isArray(products?.categories) ? products.categories[0] : products?.categories;
      const category = categories?.name || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, revenue: 0 };
      }
      acc[category].count++;
      acc[category].revenue += Number(order.total_amount);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    return {
      totalSales,
      totalRevenue,
      totalEarnings,
      averageOrderValue,
      salesByDate,
      topCategories,
      period
    };
  }
}