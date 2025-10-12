/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
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
sw.addEventListener('install', (event) => {
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
sw.addEventListener('activate', (event) => {
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
sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip external requests
	if (url.origin !== location.origin) return;

	// Skip API requests (except for favorites background sync)
	if (url.pathname.startsWith('/api/') && !url.pathname.includes('favorites')) return;

	event.respondWith(handleRequest(request));
});

async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);

	// Check cache first for static assets
	if (ASSETS.includes(url.pathname)) {
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
sw.addEventListener('sync', (event) => {
	if (event.tag === 'sync-favorites') {
		event.waitUntil(syncFavorites());
	}
});

async function syncFavorites() {
	// This would sync offline favorite changes when back online
	// Implementation depends on your favorites storage strategy
	
}
