/**
 * Product Analytics Module
 * Centralized analytics tracking for product pages
 */

interface ProductViewEvent {
  productId: string;
  productTitle: string;
  productPrice: number;
  userId?: string;
  timestamp: number;
}

interface FavoriteToggleEvent {
  productId: string;
  favorited: boolean;
  userId?: string;
  timestamp: number;
}

interface ProductActionEvent {
  productId: string;
  action: 'buy_now' | 'make_offer' | 'share' | 'message_seller';
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Event queue for offline support
let eventQueue: Array<ProductViewEvent | FavoriteToggleEvent | ProductActionEvent> = [];
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

// Track online status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    flushEventQueue();
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
  });
}

/**
 * Send analytics event to backend
 */
async function sendEvent(event: any): Promise<void> {
  if (!isOnline) {
    eventQueue.push(event);
    return;
  }

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.warn('Analytics event failed to send:', error);
    // Queue for retry when online
    eventQueue.push(event);
  }
}

/**
 * Flush queued events when back online
 */
async function flushEventQueue(): Promise<void> {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];

  try {
    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });
  } catch (error) {
    console.warn('Failed to flush analytics queue:', error);
    // Re-queue events
    eventQueue = [...events, ...eventQueue];
  }
}

/**
 * Track product page view
 */
export function trackProductView(
  productId: string, 
  productTitle: string, 
  productPrice: number,
  userId?: string
): void {
  const event: ProductViewEvent = {
    productId,
    productTitle,
    productPrice,
    userId,
    timestamp: Date.now(),
  };

  sendEvent({
    event_type: 'product_view',
    ...event,
  });

  // Also report to web vitals for LCP tracking
  if (typeof performance !== 'undefined') {
    performance.mark('product-page-viewed');
  }
}

/**
 * Track favorite toggle action
 */
export function trackFavoriteToggle(
  productId: string,
  favorited: boolean,
  userId?: string
): void {
  const event: FavoriteToggleEvent = {
    productId,
    favorited,
    userId,
    timestamp: Date.now(),
  };

  sendEvent({
    event_type: 'favorite_toggle',
    ...event,
  });
}

/**
 * Track buy now action
 */
export function trackBuyNow(
  productId: string,
  productPrice: number,
  userId?: string
): void {
  const event: ProductActionEvent = {
    productId,
    action: 'buy_now',
    userId,
    timestamp: Date.now(),
    metadata: { productPrice },
  };

  sendEvent({
    event_type: 'product_action',
    ...event,
  });
}

/**
 * Track make offer action
 */
export function trackMakeOffer(
  productId: string,
  userId?: string
): void {
  const event: ProductActionEvent = {
    productId,
    action: 'make_offer',
    userId,
    timestamp: Date.now(),
  };

  sendEvent({
    event_type: 'product_action',
    ...event,
  });
}

/**
 * Track share action
 */
export function trackShare(
  productId: string,
  userId?: string,
  shareMethod?: string
): void {
  const event: ProductActionEvent = {
    productId,
    action: 'share',
    userId,
    timestamp: Date.now(),
    metadata: { shareMethod },
  };

  sendEvent({
    event_type: 'product_action',
    ...event,
  });
}

/**
 * Track message seller action
 */
export function trackMessageSeller(
  productId: string,
  sellerId: string,
  userId?: string
): void {
  const event: ProductActionEvent = {
    productId,
    action: 'message_seller',
    userId,
    timestamp: Date.now(),
    metadata: { sellerId },
  };

  sendEvent({
    event_type: 'product_action',
    ...event,
  });
}

/**
 * Track shipping option selection
 */
export function trackShippingOptionSelected(
  productId: string,
  shippingMethod: string,
  shippingCost: number,
  userId?: string
): void {
  sendEvent({
    event_type: 'shipping_selected',
    productId,
    shippingMethod,
    shippingCost,
    userId,
    timestamp: Date.now(),
  });
}

/**
 * Batch track multiple events (for performance)
 */
export function trackBatch(events: Array<any>): void {
  if (!isOnline) {
    eventQueue.push(...events);
    return;
  }

  fetch('/api/analytics/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ events }),
  }).catch(error => {
    console.warn('Batch analytics failed:', error);
    eventQueue.push(...events);
  });
}