import type { RealtimeChannel, SupabaseClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

interface OrderUpdate {
  id: string;
  status: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  updated_at: string;
}

interface OrderSubscriptionState {
  updates: OrderUpdate[];
  channel: RealtimeChannel | null;
}

export function createOrderSubscriptionStore() {
  const state = $state<OrderSubscriptionState>({
    updates: [],
    channel: null
  });

  return {
    get updates() { return state.updates; },

    addUpdate: (update: OrderUpdate) => {
      state.updates = [...state.updates, update];
    },

    clearUpdates: () => {
      state.updates = [];
    },

    setChannel: (channel: RealtimeChannel | null) => {
      state.channel = channel;
    },

    getChannel: () => state.channel
  };
}

// Global store instance
export const orderSubscriptionStore = createOrderSubscriptionStore();

export function subscribeToOrderUpdates(supabase: SupabaseClient<Database>, userId: string) {
  // Clean up existing subscription
  const existingChannel = orderSubscriptionStore.getChannel();
  if (existingChannel) {
    supabase.removeChannel(existingChannel);
    orderSubscriptionStore.setChannel(null);
  }

  // Subscribe to order updates for both buyer and seller
  const orderChannel = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `buyer_id=eq.${userId}`
      },
      (payload: RealtimePostgresChangesPayload<OrderUpdate>) => {
        if (payload.new && 'id' in payload.new && 'status' in payload.new) {
          orderSubscriptionStore.addUpdate(payload.new as OrderUpdate);

          // Show notification if order was shipped
          if ((payload.new as OrderUpdate).status === 'shipped' && payload.old && 'status' in payload.old && (payload.old as Partial<OrderUpdate>).status !== 'shipped') {
            showNotification('Order Shipped',
              'tracking_number' in payload.new && (payload.new as OrderUpdate).tracking_number
                ? `Your order has been shipped! Tracking: ${(payload.new as OrderUpdate).tracking_number}`
                : 'Your order has been shipped!');
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `seller_id=eq.${userId}`
      },
      (payload: RealtimePostgresChangesPayload<OrderUpdate>) => {
        if (payload.new && 'id' in payload.new && 'status' in payload.new) {
          orderSubscriptionStore.addUpdate(payload.new as OrderUpdate);

          // Show notification if order was delivered
          if ((payload.new as OrderUpdate).status === 'delivered' && payload.old && 'status' in payload.old && (payload.old as Partial<OrderUpdate>).status !== 'delivered') {
            showNotification('Order Delivered', 'Your buyer has confirmed delivery!');
          }
        }
      }
    )
    .subscribe();

  orderSubscriptionStore.setChannel(orderChannel);

  return () => {
    const channel = orderSubscriptionStore.getChannel();
    if (channel) {
      supabase.removeChannel(channel);
      orderSubscriptionStore.setChannel(null);
    }
  };
}

function showNotification(title: string, message: string) {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    
    return;
  }

  // Check permission
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message, icon: '/favicon.png' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.png' });
      }
    });
  }
}

export function clearOrderUpdates() {
  orderSubscriptionStore.clearUpdates();
}