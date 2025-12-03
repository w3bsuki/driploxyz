/**
 * Realtime Service - Svelte 5 Implementation
 * 
 * Provides real-time subscriptions for:
 * - Product metrics (favorites, views)
 * - User metrics (followers, following)
 * - Notifications
 * - Presence (online/offline status)
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { favoritesActions } from '$lib/stores/favorites.svelte';
import { followStoreInstance } from '$lib/stores/follow.svelte';
import { browser } from '$app/environment';

interface ProductMetrics {
  favorite_count: number;
  view_count: number;
}

interface UserMetrics {
  follower_count: number;
  following_count: number;
}

interface RealtimeState {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  productMetrics: Record<string, ProductMetrics>;
  userMetrics: Record<string, UserMetrics>;
  onlineUsers: Set<string>;
  lastError: string | null;
}

const initialState: RealtimeState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  productMetrics: {},
  userMetrics: {},
  onlineUsers: new Set(),
  lastError: null
};

class RealtimeService {
  private supabase: SupabaseClient<Database> | null = null;
  private userId: string | null = null;
  private channels: Map<string, RealtimeChannel> = new Map();
  private state = $state<RealtimeState>({ ...initialState });
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize the realtime service with Supabase client and user ID
   */
  initialize(supabase: SupabaseClient<Database>, userId?: string): void {
    if (!browser) return;

    this.supabase = supabase;
    this.userId = userId || null;

    console.log('[RealtimeService] Initializing...', { userId });
    this.setupSubscriptions();
  }

  /**
   * Set up all realtime subscriptions
   */
  private setupSubscriptions(): void {
    if (!this.supabase) return;

    this.state = {
      ...this.state,
      connectionStatus: 'connecting'
    };

    // Subscribe to product favorites changes (broadcast channel)
    this.subscribeToProductMetrics();

    // Subscribe to user follow changes (broadcast channel)
    this.subscribeToUserMetrics();

    // If user is logged in, subscribe to user-specific channels
    if (this.userId) {
      this.subscribeToUserNotifications();
      this.subscribeToPresence();
    }
  }

  /**
   * Subscribe to product metrics changes via database changes
   */
  private subscribeToProductMetrics(): void {
    if (!this.supabase) return;

    const channel = this.supabase
      .channel('product-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites'
        },
        (payload) => {
          // Handle favorite changes
          const productId = (payload.new as any)?.product_id || (payload.old as any)?.product_id;
          if (productId) {
            // Increment or decrement based on event type
            const currentCount = this.state.productMetrics[productId]?.favorite_count || 0;
            const newCount = payload.eventType === 'DELETE' 
              ? Math.max(0, currentCount - 1) 
              : currentCount + 1;

            this.state = {
              ...this.state,
              productMetrics: {
                ...this.state.productMetrics,
                [productId]: {
                  ...this.state.productMetrics[productId],
                  favorite_count: newCount
                }
              }
            };

            // Update favorites store
            favoritesActions.updateCounts(productId, newCount);
          }
        }
      )
      .subscribe((status) => {
        this.handleChannelStatus('product-metrics', status);
      });

    this.channels.set('product-metrics', channel);
  }

  /**
   * Subscribe to user metrics (followers) changes
   */
  private subscribeToUserMetrics(): void {
    if (!this.supabase) return;

    const channel = this.supabase
      .channel('user-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers'
        },
        (payload) => {
          // Handle follow changes
          const followingId = (payload.new as any)?.following_id || (payload.old as any)?.following_id;
          if (followingId) {
            // Update follower count for the followed user
            const currentCount = this.state.userMetrics[followingId]?.follower_count || 0;
            const newCount = payload.eventType === 'DELETE'
              ? Math.max(0, currentCount - 1)
              : currentCount + 1;

            this.state = {
              ...this.state,
              userMetrics: {
                ...this.state.userMetrics,
                [followingId]: {
                  ...this.state.userMetrics[followingId],
                  follower_count: newCount,
                  following_count: this.state.userMetrics[followingId]?.following_count || 0
                }
              }
            };

            // Update follow store
            followStoreInstance.updateCounts(
              followingId,
              newCount,
              this.state.userMetrics[followingId]?.following_count || 0
            );
          }
        }
      )
      .subscribe((status) => {
        this.handleChannelStatus('user-metrics', status);
      });

    this.channels.set('user-metrics', channel);
  }

  /**
   * Subscribe to user-specific notifications
   */
  private subscribeToUserNotifications(): void {
    if (!this.supabase || !this.userId) return;

    const channel = this.supabase
      .channel(`user-notifications-${this.userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          // Emit notification event
          console.log('[RealtimeService] New notification:', payload.new);
          // Notifications are handled by the RealtimeNotificationService
        }
      )
      .on('broadcast', { event: 'message_received' }, (payload) => {
        // Handle incoming messages broadcast from Edge Function
        console.log('[RealtimeService] Message received broadcast:', payload);
      })
      .subscribe((status) => {
        this.handleChannelStatus(`user-notifications-${this.userId}`, status);
      });

    this.channels.set(`user-notifications-${this.userId}`, channel);
  }

  /**
   * Subscribe to presence channel for online/offline status
   */
  private subscribeToPresence(): void {
    if (!this.supabase || !this.userId) return;

    const channel = this.supabase
      .channel('presence')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = new Set<string>();
        
        Object.values(state).forEach((presences) => {
          (presences as any[]).forEach((presence) => {
            if (presence.user_id) {
              onlineUsers.add(presence.user_id);
            }
          });
        });

        this.state = {
          ...this.state,
          onlineUsers
        };
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[RealtimeService] User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[RealtimeService] User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        this.handleChannelStatus('presence', status);
        
        if (status === 'SUBSCRIBED' && this.userId) {
          // Track our own presence
          await channel.track({
            user_id: this.userId,
            online_at: new Date().toISOString()
          });
        }
      });

    this.channels.set('presence', channel);
  }

  /**
   * Handle channel subscription status changes
   */
  private handleChannelStatus(channelName: string, status: string): void {
    console.log(`[RealtimeService] Channel ${channelName} status:`, status);

    switch (status) {
      case 'SUBSCRIBED':
        this.state = {
          ...this.state,
          isConnected: true,
          connectionStatus: 'connected',
          lastError: null
        };
        this.reconnectAttempts = 0;
        break;

      case 'CHANNEL_ERROR':
        this.state = {
          ...this.state,
          connectionStatus: 'error',
          lastError: `Channel ${channelName} error`
        };
        this.scheduleReconnect();
        break;

      case 'TIMED_OUT':
        this.state = {
          ...this.state,
          connectionStatus: 'error',
          lastError: `Channel ${channelName} timed out`
        };
        this.scheduleReconnect();
        break;

      case 'CLOSED':
        this.state = {
          ...this.state,
          isConnected: false,
          connectionStatus: 'disconnected'
        };
        break;
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('[RealtimeService] Max reconnect attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[RealtimeService] Scheduling reconnect in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.cleanup();
      this.setupSubscriptions();
    }, delay);
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.state.onlineUsers.has(userId);
  }

  /**
   * Get product metrics from state
   */
  getProductMetrics(productId: string): ProductMetrics | undefined {
    return this.state.productMetrics[productId];
  }

  /**
   * Get user metrics from state
   */
  getUserMetrics(userId: string): UserMetrics | undefined {
    return this.state.userMetrics[userId];
  }

  /**
   * Get the reactive state (for use in components)
   */
  get state$() {
    return this.state;
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    console.log('[RealtimeService] Cleaning up...');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.supabase) {
      for (const [name, channel] of this.channels) {
        console.log(`[RealtimeService] Removing channel: ${name}`);
        this.supabase.removeChannel(channel);
      }
    }

    this.channels.clear();
    this.state = { ...initialState };
  }

  /**
   * Destroy the service completely
   */
  destroy(): void {
    this.cleanup();
    this.supabase = null;
    this.userId = null;
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

/**
 * Initialize the realtime service
 */
export function initRealtimeService(
  supabase: SupabaseClient<Database>,
  userId?: string
): RealtimeService {
  realtimeService.initialize(supabase, userId);
  return realtimeService;
}

/**
 * Get the realtime service instance
 */
export function getRealtimeService(): RealtimeService {
  return realtimeService;
}

/**
 * Export the reactive store for component use
 */
export const realtimeStore = {
  get state() {
    return realtimeService.state$;
  },
  isUserOnline: (userId: string) => realtimeService.isUserOnline(userId),
  getProductMetrics: (productId: string) => realtimeService.getProductMetrics(productId),
  getUserMetrics: (userId: string) => realtimeService.getUserMetrics(userId)
};

export { realtimeService };
