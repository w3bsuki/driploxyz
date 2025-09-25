/**
 * Real-time service for live updates of likes, follows, and other metrics
 * Uses Supabase Realtime to provide instant updates across all connected clients
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

interface RealtimeMetrics {
  productMetrics: Record<string, {
    favorite_count: number;
    view_count: number;
  }>;
  userMetrics: Record<string, {
    follower_count: number;
    following_count: number;
  }>;
}

interface RealtimeState {
  connected: boolean;
  metrics: RealtimeMetrics;
}

const initialState: RealtimeState = {
  connected: false,
  metrics: {
    productMetrics: {},
    userMetrics: {}
  }
};

// Create reactive store using Svelte 5 runes
let realtimeState = $state<RealtimeState>(initialState);

export const realtimeStore = {
  get state() {
    return realtimeState;
  },

  // For backward compatibility with existing code
  subscribe(run: (value: RealtimeState) => void) {
    $effect(() => {
      run(realtimeState);
    });
    return () => {}; // Cleanup handled by effect
  },

  update(fn: (state: RealtimeState) => RealtimeState) {
    realtimeState = fn(realtimeState);
  },

  set(value: RealtimeState) {
    realtimeState = value;
  }
};

export class RealtimeService {
  private supabase: SupabaseClient<Database>;
  private channels: RealtimeChannel[] = [];
  private subscribedProducts = new Set<string>();
  private subscribedUsers = new Set<string>();

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * Subscribe to real-time product metrics (favorite_count, view_count)
   */
  subscribeToProduct(productId: string) {
    if (this.subscribedProducts.has(productId)) return;

    const channel = this.supabase
      .channel(`product-metrics:${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          realtimeStore.update(state => ({
            ...state,
            metrics: {
              ...state.metrics,
              productMetrics: {
                ...state.metrics.productMetrics,
                [productId]: {
                  favorite_count: payload.new.favorite_count || 0,
                  view_count: payload.new.view_count || 0
                }
              }
            }
          }));
        }
      )
      .subscribe((status) => {
        realtimeStore.update(state => ({
          ...state,
          connected: status === 'SUBSCRIBED'
        }));
      });

    this.channels.push(channel);
    this.subscribedProducts.add(productId);
  }

  /**
   * Subscribe to real-time user metrics (follower_count, following_count)
   */
  subscribeToUser(userId: string) {
    if (this.subscribedUsers.has(userId)) return;

    const channel = this.supabase
      .channel(`user-metrics:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          realtimeStore.update(state => ({
            ...state,
            metrics: {
              ...state.metrics,
              userMetrics: {
                ...state.metrics.userMetrics,
                [userId]: {
                  follower_count: payload.new.follower_count || 0,
                  following_count: payload.new.following_count || 0
                }
              }
            }
          }));
        }
      )
      .subscribe((status) => {
        realtimeStore.update(state => ({
          ...state,
          connected: status === 'SUBSCRIBED'
        }));
      });

    this.channels.push(channel);
    this.subscribedUsers.add(userId);
  }

  /**
   * Subscribe to multiple products at once (for product grids)
   */
  subscribeToProducts(productIds: string[]) {
    productIds.forEach(id => this.subscribeToProduct(id));
  }

  /**
   * Subscribe to multiple users at once
   */
  subscribeToUsers(userIds: string[]) {
    userIds.forEach(id => this.subscribeToUser(id));
  }

  /**
   * Unsubscribe from a specific product
   */
  unsubscribeFromProduct(productId: string) {
    const channelIndex = this.channels.findIndex(
      ch => ch.topic === `product-metrics:${productId}`
    );

    if (channelIndex > -1 && this.channels[channelIndex]) {
      this.channels[channelIndex].unsubscribe();
      this.channels.splice(channelIndex, 1);
      this.subscribedProducts.delete(productId);
    }
  }

  /**
   * Unsubscribe from a specific user
   */
  unsubscribeFromUser(userId: string) {
    const channelIndex = this.channels.findIndex(
      ch => ch.topic === `user-metrics:${userId}`
    );

    if (channelIndex > -1 && this.channels[channelIndex]) {
      this.channels[channelIndex].unsubscribe();
      this.channels.splice(channelIndex, 1);
      this.subscribedUsers.delete(userId);
    }
  }

  /**
   * Unsubscribe from all channels and cleanup
   */
  cleanup() {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels = [];
    this.subscribedProducts.clear();
    this.subscribedUsers.clear();

    realtimeStore.set(initialState);
  }

  /**
   * Get current metrics for a product from store
   */
  getProductMetrics(productId: string) {
    const state = realtimeStore.state;
    return state.metrics.productMetrics[productId] || { favorite_count: 0, view_count: 0 };
  }

  /**
   * Get current metrics for a user from store
   */
  getUserMetrics(userId: string) {
    const state = realtimeStore.state;
    return state.metrics.userMetrics[userId] || { follower_count: 0, following_count: 0 };
  }
}

// Global realtime service instance (will be initialized in layout)
let realtimeServiceInstance: RealtimeService | null = null;

export const realtimeService = {
  get instance() {
    return realtimeServiceInstance;
  },
  set instance(service: RealtimeService | null) {
    realtimeServiceInstance = service;
  }
};

export function initRealtimeService(supabase: SupabaseClient<Database>) {
  realtimeService.instance = new RealtimeService(supabase);
  return realtimeService.instance;
}