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

type OrderRow = Database['public']['Tables']['orders']['Row'];

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
    .on<OrderRow>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `buyer_id=eq.${userId}`
      },
      (payload: RealtimePostgresChangesPayload<OrderRow>) => {
        const update = createOrderUpdate(payload);
        if (!update) {
          return;
        }

        orderSubscriptionStore.addUpdate(update);

        if (update.status === 'shipped' && payload.old && payload.old.status !== 'shipped') {
          const message = update.tracking_number
            ? `Your order has been shipped! Tracking: ${update.tracking_number}`
            : 'Your order has been shipped!';
          showNotification('Order Shipped', message);
        }
      }
    )
    .on<OrderRow>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `seller_id=eq.${userId}`
      },
      (payload: RealtimePostgresChangesPayload<OrderRow>) => {
        const update = createOrderUpdate(payload);
        if (!update) {
          return;
        }

        orderSubscriptionStore.addUpdate(update);

        if (update.status === 'delivered' && payload.old && payload.old.status !== 'delivered') {
          showNotification('Order Delivered', 'Your buyer has confirmed delivery!');
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

function createOrderUpdate(payload: RealtimePostgresChangesPayload<OrderRow>): OrderUpdate | null {
  const newRow = payload.new;
  if (!newRow) {
    return null;
  }

  return {
    id: newRow.id,
    status: newRow.status,
    tracking_number: newRow.tracking_number ?? undefined,
    shipped_at: newRow.shipped_at ?? undefined,
    delivered_at: newRow.delivered_at ?? undefined,
    updated_at: newRow.updated_at ?? newRow.created_at ?? new Date().toISOString()
  };
}