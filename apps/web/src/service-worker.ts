/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = `driplo-v${version}`;

// Assets to cache
const ASSETS = [
	...build, // JS/CSS bundles
	...files  // Static files
];

// Install event - cache assets
sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

// Activate event - clean old caches
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			// Delete old caches
			for (const key of keys) {
				if (key !== CACHE_NAME) await caches.delete(key);
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
	
	// Skip API requests
	if (url.pathname.startsWith('/api/')) return;
	
	// Skip auth requests
	if (url.pathname.startsWith('/auth/')) return;
	
	// Handle navigation requests (HTML pages)
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.catch(() => {
					// Return offline page for navigation failures
					return caches.match('/offline') || 
						new Response('Offline - Please check your connection', {
							status: 503,
							headers: { 'Content-Type': 'text/html' }
						});
				})
		);
		return;
	}
	
	// Handle asset requests
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.match(request).then((cached) => cached || fetch(request))
		);
		return;
	}
	
	// Handle image requests with cache-first strategy
	if (request.destination === 'image') {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				
				return fetch(request).then((response) => {
					// Cache successful image responses
					if (response.ok) {
						const responseClone = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return response;
				}).catch(() => {
					// Return placeholder image on failure
					return new Response(
						`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
							<rect width="100%" height="100%" fill="#f3f4f6"/>
							<text x="50%" y="50%" font-family="system-ui" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">Image unavailable offline</text>
						</svg>`,
						{
							headers: { 'Content-Type': 'image/svg+xml' }
						}
					);
				});
			})
		);
		return;
	}
	
	// Default strategy: network first, cache fallback
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Cache successful responses
				if (response.ok) {
					const responseClone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseClone);
					});
				}
				return response;
			})
			.catch(() => caches.match(request))
	);
});

// Background sync for offline actions
sw.addEventListener('sync', (event: any) => {
	if (event.tag === 'sync-favorites') {
		event.waitUntil(syncFavorites());
	}
});

async function syncFavorites() {
	// Sync favorited items when back online
	// This would sync with your Supabase backend
	console.log('Syncing favorites...');
}