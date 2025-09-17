/**
 * View Tracking Utility
 *
 * Provides IntersectionObserver-based view tracking for components.
 * Decoupled from Supabase - uses callback pattern for analytics.
 */

export interface ViewTrackingOptions {
  threshold?: number;
  rootMargin?: string;
  debounceMs?: number;
}

export interface ViewTrackingData {
  productId: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ViewTrackingConfig {
  productId: string;
  userId?: string;
  onView?: (data: ViewTrackingData) => void;
  options?: ViewTrackingOptions;
}

// Default configuration
const DEFAULT_OPTIONS: ViewTrackingOptions = {
  threshold: 0.5, // Element must be 50% visible
  rootMargin: '0px',
  debounceMs: 1000 // Minimum time between view events
};

// Track viewed items to avoid duplicate events
const viewedItems = new Set<string>();

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
}

/**
 * Svelte action for tracking when elements come into view
 */
export function trackView(node: Element, config: ViewTrackingConfig) {
  const options = { ...DEFAULT_OPTIONS, ...config.options };

  // Create debounced view handler
  const handleView = debounce((data: ViewTrackingData) => {
    const viewKey = `${data.productId}-${data.userId || 'anonymous'}`;

    // Skip if already viewed recently
    if (viewedItems.has(viewKey)) {
      return;
    }

    // Mark as viewed
    viewedItems.add(viewKey);

    // Clear from set after a longer period to allow re-tracking
    setTimeout(() => {
      viewedItems.delete(viewKey);
    }, 300000); // 5 minutes

    // Trigger callback
    config.onView?.(data);
  }, options.debounceMs || DEFAULT_OPTIONS.debounceMs!);

  // Intersection observer callback
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const viewData: ViewTrackingData = {
          productId: config.productId,
          userId: config.userId,
          sessionId: generateSessionId(),
          metadata: {
            timestamp: Date.now(),
            intersectionRatio: entry.intersectionRatio,
            boundingRect: {
              width: entry.boundingClientRect.width,
              height: entry.boundingClientRect.height,
              top: entry.boundingClientRect.top,
              left: entry.boundingClientRect.left
            },
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          }
        };

        handleView(viewData);
      }
    });
  };

  // Create intersection observer
  const observer = new IntersectionObserver(handleIntersection, {
    threshold: options.threshold,
    rootMargin: options.rootMargin
  });

  // Start observing
  observer.observe(node);

  // Return cleanup function
  return {
    destroy() {
      observer.disconnect();
    },

    update(newConfig: ViewTrackingConfig) {
      // Update config - observer will use new config on next intersection
      Object.assign(config, newConfig);
    }
  };
}

/**
 * Generate a simple session ID for tracking
 */
function generateSessionId(): string {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let sessionId = window.sessionStorage.getItem('view-tracking-session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      window.sessionStorage.setItem('view-tracking-session', sessionId);
    }
    return sessionId;
  }

  // Fallback for non-browser environments
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Manual view tracking function (for cases where IntersectionObserver isn't suitable)
 */
export function trackViewManually(data: ViewTrackingData, onView?: (data: ViewTrackingData) => void) {
  const viewKey = `${data.productId}-${data.userId || 'anonymous'}`;

  if (viewedItems.has(viewKey)) {
    return;
  }

  viewedItems.add(viewKey);
  setTimeout(() => viewedItems.delete(viewKey), 300000);

  onView?.(data);
}

/**
 * Clear all tracked views (useful for testing or session resets)
 */
export function clearViewTracking() {
  viewedItems.clear();

  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem('view-tracking-session');
  }
}

/**
 * Get current view tracking statistics
 */
export function getViewTrackingStats() {
  return {
    totalViewed: viewedItems.size,
    sessionId: generateSessionId()
  };
}