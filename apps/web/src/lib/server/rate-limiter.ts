import { RateLimiter } from 'sveltekit-rate-limiter/server';
import { dev } from '$app/environment';
import { RATE_LIMIT_SECRET } from '$env/static/private';

// Auth rate limiter - strict limits to prevent brute force
export const authLimiter = new RateLimiter({
	// Identifier (IP address by default)
	IP: [5, '600s'], // 5 requests per 10 minutes per IP
	IPUA: [10, '1800s'], // 10 requests per 30 minutes per IP+User-Agent
	cookie: {
		name: 'auth_rl', // Cookie name for tracking
		secret: RATE_LIMIT_SECRET || 'fallback-dev-secret-change-in-prod',
		rate: [3, '300s'], // 3 attempts per 5 minutes per cookie
		preflight: true // Check rate limit before processing
	}
});

// API rate limiter - more lenient for general API calls
export const apiLimiter = new RateLimiter({
	IP: [100, '60s'], // 100 requests per minute per IP
	IPUA: [100, '300s'], // 100 requests per 5 minutes per IP+User-Agent
});

// Upload rate limiter - for file uploads
export const uploadLimiter = new RateLimiter({
	IP: [10, '3600s'], // 10 uploads per hour per IP
	IPUA: [20, '3600s'], // 20 uploads per hour per IP+User-Agent
	cookie: {
		name: 'upload_rl',
		secret: RATE_LIMIT_SECRET || 'fallback-dev-secret-change-in-prod',
		rate: [5, '1800s'], // 5 uploads per 30 minutes per cookie
		preflight: true
	}
});

// Message rate limiter - prevent spam
export const messageLimiter = new RateLimiter({
	IP: [30, '3600s'], // 30 messages per hour per IP
	IPUA: [50, '3600s'], // 50 messages per hour per IP+User-Agent
	cookie: {
		name: 'msg_rl',
		secret: RATE_LIMIT_SECRET || 'fallback-dev-secret-change-in-prod',
		rate: [20, '1800s'], // 20 messages per 30 minutes per cookie
		preflight: true
	}
});

// Development mode - relaxed limits
if (dev) {
	console.log('[RATE_LIMITER] Running in development mode - relaxed limits');
}