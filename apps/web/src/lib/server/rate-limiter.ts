import { RateLimiter } from 'sveltekit-rate-limiter/server';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const RATE_LIMIT_SECRET = env.RATE_LIMIT_SECRET;

// Validate RATE_LIMIT_SECRET in production
if (!RATE_LIMIT_SECRET && !dev) {
	throw new Error('RATE_LIMIT_SECRET environment variable is required in production. Please set it in your deployment environment.');
}

// Auth rate limiter - strict limits to prevent brute force
export const authLimiter = new RateLimiter({
	// Identifier (IP address by default)
	IP: [5, '10m'], // 5 requests per 10 minutes per IP
	IPUA: [10, '30m'], // 10 requests per 30 minutes per IP+User-Agent
	cookie: {
		name: 'auth_rl', // Cookie name for tracking
		secret: RATE_LIMIT_SECRET || (dev ? 'fallback-dev-secret-change-in-prod' : 'missing-production-secret'),
		rate: [3, '5m'], // 3 attempts per 5 minutes per cookie
		preflight: true // Check rate limit before processing
	}
});

// API rate limiter - more lenient for general API calls
export const apiLimiter = new RateLimiter({
	IP: [100, 'm'], // 100 requests per minute per IP
	IPUA: [100, '5m'], // 100 requests per 5 minutes per IP+User-Agent
});

// Upload rate limiter - for file uploads
export const uploadLimiter = new RateLimiter({
	IP: [10, 'h'], // 10 uploads per hour per IP
	IPUA: [20, 'h'], // 20 uploads per hour per IP+User-Agent
	cookie: {
		name: 'upload_rl',
		secret: RATE_LIMIT_SECRET || (dev ? 'fallback-dev-secret-change-in-prod' : 'missing-production-secret'),
		rate: [5, '30m'], // 5 uploads per 30 minutes per cookie
		preflight: true
	}
});

// Message rate limiter - prevent spam
export const messageLimiter = new RateLimiter({
	IP: [30, 'h'], // 30 messages per hour per IP
	IPUA: [50, 'h'], // 50 messages per hour per IP+User-Agent
	cookie: {
		name: 'msg_rl',
		secret: RATE_LIMIT_SECRET || (dev ? 'fallback-dev-secret-change-in-prod' : 'missing-production-secret'),
		rate: [20, '30m'], // 20 messages per 30 minutes per cookie
		preflight: true
	}
});

// Development mode - relaxed limits
if (dev) {
	// Running in development mode - relaxed limits
}