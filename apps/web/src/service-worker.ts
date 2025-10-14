/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// This gives `self` the correct types in a Service Worker context
const sw = (self as unknown) as ServiceWorkerGlobalScope;
const CACHE_NAME = `driplo-v${version}`;
const DYNAMIC_CACHE = `driplo-dynamic-v${version}`;
const OFFLINE_CACHE = `driplo-offline-v${version}`;

// Assets to cache immediately
const ASSETS = [
	...build, // JS/CSS bundles
	...files  // Static files
];

// Routes to cache dynamically
const DYNAMIC_ROUTES = [
	'/',
	'/search',
	'/categories',
	'/sellers'
];

// Offline fallback page
const OFFLINE_PAGE = '/offline';

// Install event - cache assets
sw.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		Promise.all([
			caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
			caches.open(OFFLINE_CACHE).then((cache) =>
				cache.add(OFFLINE_PAGE).catch(() => {
					// Continue installation even if offline page fails to cache
					return Promise.resolve();
				})
			)
		]).then(() => sw.skipWaiting())
	);
});

// Activate event - clean old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			// Delete old caches
			const currentCaches = [CACHE_NAME, DYNAMIC_CACHE, OFFLINE_CACHE];
			for (const key of keys) {
				if (!currentCaches.includes(key)) {
					await caches.delete(key);
				}
			}
			await sw.clients.claim();
		})
	);
});

// Fetch event - serve from cache, fallback to network
sw.addEventListener('fetch', (event: FetchEvent) => {
	const { request } = event as FetchEvent;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip external requests
	if (url.origin !== location.origin) return;

	// In development, Vite serves via /@fs and HMR endpoints. Don't intercept those or SW can spam errors.
	// Also skip if this is clearly a Vite client/HMR asset
	if (
		url.pathname.startsWith('/@fs/') ||
		url.pathname.startsWith('/@vite') ||
		url.pathname.includes('vite/client') ||
		url.pathname.includes('node_modules')
	) {
		return;
	}

	// Skip API requests (except for favorites background sync)
	if (url.pathname.startsWith('/api/') && !url.pathname.includes('favorites')) return;

	event.respondWith(handleRequest(request));
});

async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);

		// Check cache first for static assets (guard for paths without leading slash)
		if (ASSETS.includes(url.pathname) || ASSETS.includes(url.pathname.replace(/^\//, ''))) {
		const cached = await caches.match(request);
		if (cached) return cached;
	}

	try {
		// Try network first for dynamic content
		const response = await fetch(request);

		// Cache successful responses for dynamic routes
		if (response.ok && DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route))) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, response.clone());
		}

		return response;
	} catch {
		// Network failed, try cache
		const cached = await caches.match(request);
		if (cached) return cached;

		// Fallback to offline page for navigation requests
		if (request.mode === 'navigate') {
			const offlineResponse = await caches.match(OFFLINE_PAGE);
			if (offlineResponse) return offlineResponse;
		}

		// Final fallback - return a basic offline response
		return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
	}
}

// Background sync for favorites (when available)
sw.addEventListener('sync', (event: Event) => {
	// Background Sync is optional; only handle our tag if present
	const anyEvent = event as unknown as { tag?: string; waitUntil?: (p: Promise<unknown>) => void };
	if (anyEvent.tag === 'sync-favorites' && typeof anyEvent.waitUntil === 'function') {
		anyEvent.waitUntil(syncFavorites());
	}
});

async function syncFavorites() {
	// This would sync offline favorite changes when back online
	// Implementation depends on your favorites storage strategy
	
}
