import type { SupabaseClient } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
  payout_method?: {
    type: 'revolut' | 'paypal' | 'card';
    details: string;
    name: string;
  };
  account_type: 'personal' | 'pro' | 'brand';
  is_verified: boolean;
  rating?: number;
  total_sales?: number;
  created_at: string;
  updated_at: string;
}

export interface FollowerInfo {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  sales_count?: number | null;
  followed_at?: string;
}

export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data: data as Profile | null, error };
  }

  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    return { data: data as Profile | null, error };
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    return { data: data as Profile | null, error };
  }

  /**
   * Create a new profile
   */
  async createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data: data as Profile | null, error };
  }

  /**
   * Upload avatar to storage
   */
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: any }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Upload to storage bucket
    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    await this.updateProfile(userId, { avatar_url: urlData.publicUrl });

    return { url: urlData.publicUrl, error: null };
  }

  /**
   * Delete profile (soft delete by marking as inactive)
   */
  async deleteProfile(userId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        username: `deleted_${userId.slice(0, 8)}`,
        full_name: 'Deleted User',
        bio: null,
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { error };
  }

  /**
   * Search profiles by query
   */
  async searchProfiles(query: string, limit: number = 20): Promise<{ data: Profile[]; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(limit);

    return { data: (data as Profile[]) || [], error };
  }

  // ==========================================
  // Following Relationships
  // ==========================================

  /**
   * Follow a user
   */
  async followUser(followerId: string, followeeId: string): Promise<{ error: any }> {
    // Prevent self-follow
    if (followerId === followeeId) {
      return { error: { message: 'Cannot follow yourself' } };
    }

    const { error } = await this.supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        following_id: followeeId
      });

    if (error) {
      // Handle duplicate follow (already following)
      if (error.code === '23505') {
        return { error: { message: 'Already following this user' } };
      }
      return { error };
    }

    // Create notification for the followed user
    await this.supabase
      .from('notifications')
      .insert({
        user_id: followeeId,
        type: 'new_follower',
        title: 'New Follower',
        message: 'Someone started following you!',
        category: 'social',
        priority: 'low',
        data: {
          follower_id: followerId
        }
      });

    return { error: null };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followeeId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followeeId);

    return { error };
  }

  /**
   * Get followers of a user
   */
  async getFollowers(userId: string): Promise<{ data: FollowerInfo[]; error: any }> {
    const { data, error } = await this.supabase
      .from('followers')
      .select(`
        follower_id,
        created_at,
        follower:profiles!follower_id (
          id,
          username,
          full_name,
          avatar_url,
          sales_count
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    // Transform to FollowerInfo format
    const followers: FollowerInfo[] = (data || []).map((row: any) => ({
      id: row.follower?.id || row.follower_id,
      username: row.follower?.username,
      full_name: row.follower?.full_name,
      avatar_url: row.follower?.avatar_url,
      sales_count: row.follower?.sales_count,
      followed_at: row.created_at
    }));

    return { data: followers, error: null };
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string): Promise<{ data: FollowerInfo[]; error: any }> {
    const { data, error } = await this.supabase
      .from('followers')
      .select(`
        following_id,
        created_at,
        following:profiles!following_id (
          id,
          username,
          full_name,
          avatar_url,
          sales_count
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    // Transform to FollowerInfo format
    const following: FollowerInfo[] = (data || []).map((row: any) => ({
      id: row.following?.id || row.following_id,
      username: row.following?.username,
      full_name: row.following?.full_name,
      avatar_url: row.following?.avatar_url,
      sales_count: row.following?.sales_count,
      followed_at: row.created_at
    }));

    return { data: following, error: null };
  }

  /**
   * Check if a user is following another user
   */
  async isFollowing(followerId: string, followeeId: string): Promise<{ data: boolean; error: any }> {
    const { data, error } = await this.supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followeeId)
      .maybeSingle();

    return { data: !!data, error };
  }

  /**
   * Get follower and following counts for a user
   */
  async getFollowCounts(userId: string): Promise<{ 
    data: { followerCount: number; followingCount: number } | null; 
    error: any 
  }> {
    // Get follower count
    const { count: followerCount, error: followerError } = await this.supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followerError) {
      return { data: null, error: followerError };
    }

    // Get following count
    const { count: followingCount, error: followingError } = await this.supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) {
      return { data: null, error: followingError };
    }

    return { 
      data: { 
        followerCount: followerCount || 0, 
        followingCount: followingCount || 0 
      }, 
      error: null 
    };
  }

  /**
   * Toggle follow status (follow if not following, unfollow if following)
   */
  async toggleFollow(followerId: string, followeeId: string): Promise<{ 
    data: { isFollowing: boolean } | null; 
    error: any 
  }> {
    const { data: isCurrentlyFollowing, error: checkError } = await this.isFollowing(followerId, followeeId);
    
    if (checkError) {
      return { data: null, error: checkError };
    }

    if (isCurrentlyFollowing) {
      const { error } = await this.unfollowUser(followerId, followeeId);
      return { data: { isFollowing: false }, error };
    } else {
      const { error } = await this.followUser(followerId, followeeId);
      return { data: { isFollowing: true }, error };
    }
  }
}