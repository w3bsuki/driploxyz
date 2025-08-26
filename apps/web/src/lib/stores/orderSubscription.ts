import { writable } from 'svelte/store';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface OrderUpdate {
  id: string;
  status: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  updated_at: string;
}

export const orderUpdates = writable<OrderUpdate[]>([]);

let orderChannel: RealtimeChannel | null = null;

export function subscribeToOrderUpdates(supabase: any, userId: string) {
  // Clean up existing subscription
  if (orderChannel) {
    supabase.removeChannel(orderChannel);
    orderChannel = null;
  }

  // Subscribe to order updates for both buyer and seller
  orderChannel = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `buyer_id=eq.${userId}`
      },
      (payload: any) => {
        orderUpdates.update(updates => [...updates, payload.new as OrderUpdate]);
        
        // Show notification if order was shipped
        if (payload.new.status === 'shipped' && payload.old.status !== 'shipped') {
          showNotification('Order Shipped', 
            payload.new.tracking_number 
              ? `Your order has been shipped! Tracking: ${payload.new.tracking_number}`
              : 'Your order has been shipped!');
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
      (payload: any) => {
        orderUpdates.update(updates => [...updates, payload.new as OrderUpdate]);
        
        // Show notification if order was delivered
        if (payload.new.status === 'delivered' && payload.old.status !== 'delivered') {
          showNotification('Order Delivered', 'Your buyer has confirmed delivery!');
        }
      }
    )
    .subscribe();

  return () => {
    if (orderChannel) {
      supabase.removeChannel(orderChannel);
      orderChannel = null;
    }
  };
}

function showNotification(title: string, message: string) {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
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
  orderUpdates.set([]);
}