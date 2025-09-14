/**
 * View Tracking Utility
 * Handles automatic product view tracking with spam prevention
 */

interface ViewTrackingOptions {
  threshold?: number;
  rootMargin?: string;
  debounceMs?: number;
}

interface ViewTracker {
  observe: (element: Element, productId: string) => void;
  unobserve: (element: Element) => void;
  disconnect: () => void;
}

const DEFAULT_OPTIONS: ViewTrackingOptions = {
  threshold: 0.5, // 50% of the product must be visible
  rootMargin: '0px 0px -50px 0px', // Require 50px visibility from bottom
  debounceMs: 1000 // Wait 1 second before tracking view
};

export function createViewTracker(
  supabase: any,
  userId?: string,
  options: ViewTrackingOptions = {}
): ViewTracker {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const trackedViews = new Set<string>();
  const viewTimers = new Map<string, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const productId = entry.target.getAttribute('data-product-id');
        if (!productId) return;

        if (entry.isIntersecting && !trackedViews.has(productId)) {
          // Start debounce timer
          const timerId = window.setTimeout(() => {
            trackView(productId);
            viewTimers.delete(productId);
          }, config.debounceMs);

          // Cancel previous timer if exists
          const existingTimer = viewTimers.get(productId);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          viewTimers.set(productId, timerId);
        } else if (!entry.isIntersecting) {
          // Cancel tracking if element leaves viewport
          const timerId = viewTimers.get(productId);
          if (timerId) {
            clearTimeout(timerId);
            viewTimers.delete(productId);
          }
        }
      });
    },
    {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    }
  );

  async function trackView(productId: string) {
    if (trackedViews.has(productId)) return;

    try {
      // Get client IP and user agent for spam prevention
      const userAgent = navigator.userAgent;
      let clientIP: string | null = null;

      // Try to get client IP (this might not work in all environments)
      try {
        const response = await fetch('/api/client-info');
        if (response.ok) {
          const data = await response.json();
          clientIP = data.ip;
        }
      } catch {
        // Fallback: use null IP
        clientIP = null;
      }

      // Call our database function to track the view with spam prevention
      const { data, error } = await supabase.rpc('track_product_view', {
        p_product_id: productId,
        p_user_id: userId || null,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

      if (!error && data) {
        trackedViews.add(productId);
        console.log(`View tracked for product: ${productId}`);
      } else if (error) {
        console.warn('Failed to track view:', error.message);
      }
    } catch (error) {
      console.error('View tracking error:', error);
    }
  }

  return {
    observe: (element: Element, productId: string) => {
      element.setAttribute('data-product-id', productId);
      observer.observe(element);
    },
    unobserve: (element: Element) => {
      observer.unobserve(element);
    },
    disconnect: () => {
      // Clear all pending timers
      viewTimers.forEach((timerId) => clearTimeout(timerId));
      viewTimers.clear();
      observer.disconnect();
    }
  };
}

/**
 * Svelte action for automatic view tracking
 * Usage: <div use:trackView={{ productId: 'abc-123', supabase, userId }}>
 */
export function trackView(
  element: Element,
  params: {
    productId: string;
    supabase: any;
    userId?: string;
    options?: ViewTrackingOptions;
  }
) {
  const { productId, supabase, userId, options } = params;
  const tracker = createViewTracker(supabase, userId, options);

  tracker.observe(element, productId);

  return {
    destroy() {
      tracker.unobserve(element);
      tracker.disconnect();
    },
    update(newParams: typeof params) {
      // Update if productId changes
      if (newParams.productId !== productId) {
        tracker.unobserve(element);
        tracker.observe(element, newParams.productId);
      }
    }
  };
}