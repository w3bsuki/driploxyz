import type { SupabaseClient } from '@supabase/supabase-js';

export interface BoostOptions {
  productId: string;
  boostType?: 'standard' | 'premium';
  duration?: number; // hours, default 24
}

export interface BoostHistory {
  id: string;
  user_id: string;
  product_id: string;
  boost_type: string;
  credits_used: number;
  boosted_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}

export interface BoostStatus {
  canBoost: boolean;
  remainingCredits: number;
  usedThisMonth: number;
  nextResetDate: string;
  reason?: string;
}

export class BoostService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Check if user can boost a product
   */
  async canUserBoost(userId: string): Promise<BoostStatus> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('premium_boosts_remaining, boost_credits_used_this_month, last_boost_reset_date, subscription_tier')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        canBoost: false,
        remainingCredits: 0,
        usedThisMonth: 0,
        nextResetDate: new Date().toISOString(),
        reason: 'Failed to fetch user profile'
      };
    }

    // Check if user has a pro/premium subscription
    const hasValidSubscription = ['pro', 'premium', 'brand'].includes(profile.subscription_tier);
    if (!hasValidSubscription) {
      return {
        canBoost: false,
        remainingCredits: 0,
        usedThisMonth: profile.boost_credits_used_this_month || 0,
        nextResetDate: this.getNextResetDate(),
        reason: 'Requires pro, premium, or brand subscription'
      };
    }

    // Check monthly reset
    const needsReset = this.shouldResetMonthlyCredits(profile.last_boost_reset_date);
    let remainingCredits = profile.premium_boosts_remaining || 0;

    if (needsReset) {
      // Reset credits to 10 for the new month
      remainingCredits = 10;
      await this.resetMonthlyCredits(userId);
    }

    return {
      canBoost: remainingCredits > 0,
      remainingCredits,
      usedThisMonth: needsReset ? 0 : (profile.boost_credits_used_this_month || 0),
      nextResetDate: this.getNextResetDate(),
      reason: remainingCredits === 0 ? 'No boost credits remaining this month' : undefined
    };
  }

  /**
   * Boost a product
   */
  async boostProduct(userId: string, options: BoostOptions): Promise<{ success: boolean; error?: string; boostId?: string }> {
    // Check if user can boost
    const boostStatus = await this.canUserBoost(userId);
    if (!boostStatus.canBoost) {
      return { success: false, error: boostStatus.reason || 'Cannot boost product' };
    }

    // Check if product is already boosted
    const { data: existingBoost } = await this.supabase
      .from('products')
      .select('is_boosted, boosted_until')
      .eq('id', options.productId)
      .eq('seller_id', userId)
      .single();

    if (existingBoost?.is_boosted && existingBoost.boosted_until && new Date(existingBoost.boosted_until) > new Date()) {
      return { success: false, error: 'Product is already boosted' };
    }

    const duration = options.duration || 168; // 1 week default
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    const boostPriority = options.boostType === 'premium' ? 100 : 75;

    try {
      // Create boost history record
      const { data: boostHistory, error: boostError } = await this.supabase
        .from('boost_history')
        .insert({
          user_id: userId,
          product_id: options.productId,
          boost_type: options.boostType || 'standard',
          credits_used: 1,
          expires_at: expiresAt.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (boostError) throw boostError;

      // Update product with boost information
      const { error: productError } = await this.supabase
        .from('products')
        .update({
          is_boosted: true,
          boosted_until: expiresAt.toISOString(),
          boost_priority: boostPriority,
          boost_history_id: boostHistory.id
        })
        .eq('id', options.productId)
        .eq('seller_id', userId);

      if (productError) throw productError;

      // Deduct credit from user
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({
          premium_boosts_remaining: boostStatus.remainingCredits - 1,
          boost_credits_used_this_month: boostStatus.usedThisMonth + 1,
          // Note: total_boosts_used increment handled by database trigger
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { success: true, boostId: boostHistory.id };
    } catch (error) {
      
      return { success: false, error: 'Failed to boost product' };
    }
  }

  /**
   * Remove boost from a product
   */
  async removeBoost(userId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update product to remove boost
      const { error: productError } = await this.supabase
        .from('products')
        .update({
          is_boosted: false,
          boosted_until: null,
          boost_priority: 0,
          boost_history_id: null
        })
        .eq('id', productId)
        .eq('seller_id', userId);

      if (productError) throw productError;

      // Update boost history to cancelled
      const { error: historyError } = await this.supabase
        .from('boost_history')
        .update({ status: 'cancelled' })
        .eq('product_id', productId)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (historyError) throw historyError;

      return { success: true };
    } catch (error) {
      
      return { success: false, error: 'Failed to remove boost' };
    }
  }

  /**
   * Get user's boost history
   */
  async getUserBoostHistory(userId: string, limit: number = 20): Promise<BoostHistory[]> {
    const { data, error } = await this.supabase
      .from('boost_history')
      .select(`
        id,
        user_id,
        product_id,
        boost_type,
        credits_used,
        boosted_at,
        expires_at,
        status,
        created_at,
        products!inner (
          title,
          price,
          product_images (image_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      
      return [];
    }

    return data || [];
  }

  /**
   * Get all boosted products for homepage
   */
  async getBoostedProducts(countryCode: string = 'BG', limit: number = 20) {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        condition,
        size,
        brand,
        location,
        created_at,
        seller_id,
        is_boosted,
        boosted_until,
        boost_priority,
        favorite_count,
        slug,
        product_images!inner (image_url),
        profiles!products_seller_id_fkey (
          username,
          avatar_url,
          account_type,
          subscription_tier,
          verified
        ),
        categories (slug, name)
      `)
      .eq('is_active', true)
      .eq('is_sold', false)
      .eq('is_boosted', true)
      .eq('country_code', countryCode)
      .gt('boosted_until', new Date().toISOString())
      .order('boost_priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      
      return [];
    }

    return data || [];
  }

  /**
   * Clean up expired boosts (should be run as a cron job)
   */
  async cleanupExpiredBoosts(): Promise<{ cleaned: number }> {
    const now = new Date().toISOString();

    try {
      // Update products to remove expired boosts
      const { error: productError, count: productCount } = await this.supabase
        .from('products')
        .update({
          is_boosted: false,
          boosted_until: null,
          boost_priority: 0
        })
        .eq('is_boosted', true)
        .lt('boosted_until', now);

      if (productError) throw productError;

      // Update boost history status
      const { error: historyError } = await this.supabase
        .from('boost_history')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now);

      if (historyError) throw historyError;

      return { cleaned: productCount || 0 };
    } catch (error) {
      
      return { cleaned: 0 };
    }
  }

  private shouldResetMonthlyCredits(lastResetDate: string | null): boolean {
    if (!lastResetDate) return true;

    const lastReset = new Date(lastResetDate);
    const now = new Date();

    // Reset if it's a new month
    return now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
  }

  private async resetMonthlyCredits(userId: string): Promise<void> {
    await this.supabase
      .from('profiles')
      .update({
        premium_boosts_remaining: 10,
        boost_credits_used_this_month: 0,
        last_boost_reset_date: new Date().toISOString()
      })
      .eq('id', userId);
  }

  private getNextResetDate(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }
}

// Helper function to create service instance
export function createBoostService(supabase: SupabaseClient) {
  return new BoostService(supabase);
}