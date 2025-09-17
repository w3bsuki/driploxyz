/**
 * Framework-Agnostic Runtime Utilities
 *
 * Provides runtime detection and environment utilities without
 * depending on SvelteKit's $app/environment or other framework-specific APIs.
 */

/**
 * Detect if running in browser environment
 */
export const isBrowser = (() => {
  try {
    return typeof window !== 'undefined' &&
           typeof document !== 'undefined' &&
           typeof navigator !== 'undefined';
  } catch {
    return false;
  }
})();

/**
 * Detect if running in server environment
 */
export const isServer = !isBrowser;

/**
 * Get current timestamp - works in both browser and server
 */
export function now(): number {
  return Date.now();
}

/**
 * Safe window access with fallback
 */
export function getWindow(): Window | null {
  return isBrowser ? window : null;
}

/**
 * Safe document access with fallback
 */
export function getDocument(): Document | null {
  return isBrowser ? document : null;
}

/**
 * Safe navigator access with fallback
 */
export function getNavigator(): Navigator | null {
  return isBrowser ? navigator : null;
}

/**
 * Safe localStorage access with fallback
 */
export function getLocalStorage(): Storage | null {
  try {
    return isBrowser && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Safe sessionStorage access with fallback
 */
export function getSessionStorage(): Storage | null {
  try {
    return isBrowser && window.sessionStorage ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/**
 * Detect if running in development mode
 * Uses common environment indicators
 */
export function isDev(): boolean {
  if (!isBrowser) {
    // Server-side detection
    return typeof process !== 'undefined' &&
           (process.env?.NODE_ENV === 'development' ||
            process.env?.NODE_ENV === 'dev');
  }

  // Browser-side detection
  const hostname = window.location?.hostname;
  return hostname === 'localhost' ||
         hostname === '127.0.0.1' ||
         hostname?.endsWith('.local') ||
         hostname?.startsWith('192.168.') ||
         hostname?.startsWith('10.') ||
         (hostname?.startsWith('172.') &&
          parseInt(hostname.split('.')[1]) >= 16 &&
          parseInt(hostname.split('.')[1]) <= 31);
}

/**
 * Detect if running in production mode
 */
export function isProd(): boolean {
  if (!isBrowser) {
    return typeof process !== 'undefined' &&
           (process.env?.NODE_ENV === 'production' ||
            process.env?.NODE_ENV === 'prod');
  }

  return !isDev();
}

/**
 * Get current URL safely
 */
export function getCurrentUrl(): string | null {
  try {
    return isBrowser ? window.location.href : null;
  } catch {
    return null;
  }
}

/**
 * Get user agent safely
 */
export function getUserAgent(): string | null {
  try {
    return isBrowser ? navigator.userAgent : null;
  } catch {
    return null;
  }
}

/**
 * Detect mobile device
 */
export function isMobile(): boolean {
  if (!isBrowser) return false;

  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

/**
 * Detect touch device
 */
export function isTouchDevice(): boolean {
  if (!isBrowser) return false;

  try {
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0;
  } catch {
    return false;
  }
}

/**
 * Get viewport dimensions safely
 */
export function getViewportSize(): { width: number; height: number } | null {
  if (!isBrowser) return null;

  try {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  } catch {
    return null;
  }
}

/**
 * Safe setTimeout that works in all environments
 */
export function safeSetTimeout(callback: () => void, delay: number): any {
  if (typeof setTimeout !== 'undefined') {
    return setTimeout(callback, delay);
  }

  // Fallback for environments without setTimeout
  return null;
}

/**
 * Safe setInterval that works in all environments
 */
export function safeSetInterval(callback: () => void, delay: number): any {
  if (typeof setInterval !== 'undefined') {
    return setInterval(callback, delay);
  }

  return null;
}

/**
 * Safe clearTimeout
 */
export function safeClearTimeout(id: any): void {
  if (typeof clearTimeout !== 'undefined' && id) {
    clearTimeout(id);
  }
}

/**
 * Safe clearInterval
 */
export function safeClearInterval(id: any): void {
  if (typeof clearInterval !== 'undefined' && id) {
    clearInterval(id);
  }
}

/**
 * Check if a specific API is available
 */
export function hasAPI(apiName: string): boolean {
  if (!isBrowser) return false;

  try {
    return apiName in window && window[apiName as keyof Window] != null;
  } catch {
    return false;
  }
}

/**
 * Feature detection for common browser APIs
 */
export const features = {
  intersectionObserver: isBrowser && 'IntersectionObserver' in window,
  resizeObserver: isBrowser && 'ResizeObserver' in window,
  mutationObserver: isBrowser && 'MutationObserver' in window,
  webAnimations: isBrowser && 'animate' in document.createElement('div'),
  cssCustomProperties: isBrowser && CSS?.supports?.('color', 'var(--test)'),
  cssGrid: isBrowser && CSS?.supports?.('display', 'grid'),
  webWorkers: isBrowser && 'Worker' in window,
  serviceWorkers: isBrowser && 'serviceWorker' in navigator,
  webgl: (() => {
    if (!isBrowser) return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  })(),
  webrtc: isBrowser && 'RTCPeerConnection' in window,
  geolocation: isBrowser && 'geolocation' in navigator,
  clipboard: isBrowser && 'clipboard' in navigator,
  share: isBrowser && 'share' in navigator,
  wakeLock: isBrowser && 'wakeLock' in navigator,
};

/**
 * Runtime environment info
 */
export const runtime = {
  isBrowser,
  isServer,
  isDev: isDev(),
  isProd: isProd(),
  isMobile: isMobile(),
  isTouch: isTouchDevice(),
  userAgent: getUserAgent(),
  url: getCurrentUrl(),
  viewport: getViewportSize(),
  features,
};