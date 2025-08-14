import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface ProfileWithStats extends Profile {
  active_listings?: number;
  sold_listings?: number;
  recent_reviews?: any[];
}

export interface SellerStats {
  total_products: number;
  active_products: number;
  sold_products: number;
  total_sales: number;
  recent_sales: number;
  average_order_value: number;
  total_favorites: number;
  response_rate: number;
}

export class ProfileService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getProfile:', error);
      return { data: null, error: 'Failed to fetch profile' };
    }
  }

  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile by username:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getProfileByUsername:', error);
      return { data: null, error: 'Failed to fetch profile' };
    }
  }

  /**
   * Get profile with additional statistics
   */
  async getProfileWithStats(userId: string): Promise<{ data: ProfileWithStats | null; error: string | null }> {
    try {
      const { data: profile, error: profileError } = await this.getProfile(userId);
      
      if (profileError || !profile) {
        return { data: null, error: profileError };
      }

      // Get active listings count
      const { count: activeCount } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('is_active', true)
        .eq('is_sold', false);

      // Get sold listings count
      const { count: soldCount } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('is_sold', true);

      // Get recent reviews
      const { data: reviews } = await this.supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      const profileWithStats: ProfileWithStats = {
        ...profile,
        active_listings: activeCount || 0,
        sold_listings: soldCount || 0,
        recent_reviews: reviews || []
      };

      return { data: profileWithStats, error: null };
    } catch (error) {
      console.error('Error in getProfileWithStats:', error);
      return { data: null, error: 'Failed to fetch profile with stats' };
    }
  }

  /**
   * Update profile
   */
  async updateProfile(
    userId: string,
    updates: Omit<ProfileUpdate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { data: null, error: 'Failed to update profile' };
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<{ 
    available: boolean; 
    error: string | null 
  }> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query.single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return { available: true, error: null };
      }

      if (error) {
        console.error('Error checking username availability:', error);
        return { available: false, error: error.message };
      }

      // Username exists
      return { available: false, error: null };
    } catch (error) {
      console.error('Error in isUsernameAvailable:', error);
      return { available: false, error: 'Failed to check username availability' };
    }
  }

  /**
   * Get seller analytics
   */
  async getSellerAnalytics(sellerId: string, daysBack = 30): Promise<{ 
    data: SellerStats | null; 
    error: string | null 
  }> {
    try {
      const { data, error } = await this.supabase.rpc('get_seller_analytics', {
        seller_id_param: sellerId,
        days_back: daysBack
      });

      if (error) {
        console.error('Error fetching seller analytics:', error);
        return { data: null, error: error.message };
      }

      return { data: data as SellerStats, error: null };
    } catch (error) {
      console.error('Error in getSellerAnalytics:', error);
      return { data: null, error: 'Failed to fetch seller analytics' };
    }
  }

  /**
   * Upgrade to seller role
   */
  async becomeSeller(userId: string): Promise<{ error: string | null }> {
    try {
      // Check if profile is complete enough for selling
      const { data: profile, error: profileError } = await this.getProfile(userId);
      
      if (profileError || !profile) {
        return { error: profileError || 'Profile not found' };
      }

      if (!profile.full_name || !profile.location) {
        return { error: 'Please complete your profile (full name and location) before becoming a seller' };
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', userId);

      if (error) {
        console.error('Error becoming seller:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in becomeSeller:', error);
      return { error: 'Failed to upgrade to seller account' };
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await this.supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { url: null, error: uploadError.message };
      }

      const { data: publicUrl } = this.supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await this.updateProfile(userId, {
        avatar_url: publicUrl.publicUrl
      });

      if (updateError) {
        return { url: null, error: updateError };
      }

      return { url: publicUrl.publicUrl, error: null };
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return { url: null, error: 'Failed to upload avatar' };
    }
  }

  /**
   * Search profiles
   */
  async searchProfiles(query: string, limit = 20): Promise<{ data: Profile[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error searching profiles:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in searchProfiles:', error);
      return { data: [], error: 'Failed to search profiles' };
    }
  }

  /**
   * Get top sellers (for now, just newest registered users)
   */
  async getTopSellers(limit = 10): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, created_at')
        .not('username', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top sellers:', error);
        return { data: [], error: error.message };
      }

      // Add mock ratings for display
      const sellersWithRatings = (data || []).map(profile => ({
        ...profile,
        name: profile.username,
        avatar: profile.avatar_url,
        rating: Math.round((Math.random() * 1 + 4) * 10) / 10 // 4.0-5.0 range, rounded to 1 decimal
      }));

      return { data: sellersWithRatings, error: null };
    } catch (error) {
      console.error('Error in getTopSellers:', error);
      return { data: [], error: 'Failed to fetch top sellers' };
    }
  }

  /**
   * Get user's activity feed
   */
  async getActivityFeed(userId: string, limit = 20): Promise<{ 
    data: any[]; 
    error: string | null 
  }> {
    try {
      // This would combine recent orders, reviews, messages, etc.
      // For now, let's get recent orders as an example
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select(`
          *,
          products (title, images:product_images(image_url))
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (ordersError) {
        console.error('Error fetching activity feed:', ordersError);
        return { data: [], error: ordersError.message };
      }

      return { data: orders || [], error: null };
    } catch (error) {
      console.error('Error in getActivityFeed:', error);
      return { data: [], error: 'Failed to fetch activity feed' };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating last active:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in updateLastActive:', error);
      return { error: 'Failed to update last active timestamp' };
    }
  }
}