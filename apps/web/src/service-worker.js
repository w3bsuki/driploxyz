import { build, files, version } from '$service-worker';

// Create unique cache name for this version
const CACHE_NAME = `driplo-cache-${version}`;
const STATIC_CACHE = `static-${version}`;
const RUNTIME_CACHE = `runtime-${version}`;

// Files to cache on install
const CACHE_FILES = [
  ...build, // SvelteKit build files
  ...files  // Static files from /static
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[ServiceWorker] Caching static files');
        return cache.addAll(CACHE_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('driplo-cache-') && cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - optimized for performance
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip API and auth requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;
  
  // Let browser handle navigation normally to prevent delays
  if (request.mode === 'navigate') return;
  
  // Only handle static assets that are actually cached
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Network First for API calls
    if (isApiCall(url)) {
      return await networkFirst(request, RUNTIME_CACHE);
    }
    
    // Strategy 3: Stale While Revalidate for images
    if (isImage(url)) {
      return await staleWhileRevalidate(request, RUNTIME_CACHE);
    }
    
    // Strategy 4: Network First for pages with offline fallback
    return await networkFirstWithOfflineFallback(request, RUNTIME_CACHE);
    
  } catch (error) {
    console.error('[ServiceWorker] Fetch error:', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/offline') || new Response('Offline', { status: 503 });
    }
    
    // Return error response
    return new Response('Network error', { status: 503 });
  }
}

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch in background regardless of cache hit
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignore fetch errors for stale-while-revalidate
  });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // Otherwise wait for network
  return fetchPromise;
}

async function networkFirstWithOfflineFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful page responses
      if (request.destination === 'document') {
        cache.put(request, response.clone());
      }
    }
    
    return response;
  } catch (error) {
    // Try cache first
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // For navigation requests, return offline page
    if (request.destination === 'document') {
      const staticCache = await caches.open(STATIC_CACHE);
      const offlinePage = await staticCache.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Helper functions
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_app/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico')
  );
}

function isApiCall(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.') ||
    url.hostname.includes('stripe.')
  );
}

function isImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i.test(url.pathname);
}

// Background sync for failed requests (experimental)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[ServiceWorker] Background sync');
    event.waitUntil(retryFailedRequests());
  }
});

async function retryFailedRequests() {
  // Implementation for retrying failed requests
  // This would integrate with IndexedDB to store failed requests
  console.log('[ServiceWorker] Retrying failed requests...');
}

// Push notifications (for future implementation)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});

// Update available notification
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[ServiceWorker] Service Worker loaded');