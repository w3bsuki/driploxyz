import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { applySecurityConfig, addSecurityHeaders } from '$lib/middleware/security.js';
import { handleError } from '$lib/middleware/error-handler.js';

export const GET: RequestHandler = async ({ request, locals }) => {
	try {
		// Apply security middleware
		const securityResult = await applySecurityConfig(request, 'public');
		if (securityResult instanceof Response) {
			return securityResult;
		}
		const startTime = Date.now();
		const checks = {
			database: false,
			auth: false,
			storage: false,
		};
		
		// Check database connectivity
		try {
			const { error: dbError } = await locals.supabase
				.from('profiles')
				.select('count')
				.limit(1)
				.single();
			
			checks.database = !dbError;
		} catch {
			// Database health check failed
			checks.database = false;
		}
		
		// Check auth service
		try {
			// Try to get session (won't fail if no session, just returns null)
			const { error: authError } = await locals.supabase.auth.getSession();
			checks.auth = !authError;
		} catch {
			// Auth health check failed
			checks.auth = false;
		}
		
		// Check storage service (optional check)
		try {
			const { error: storageError } = await locals.supabase
				.storage
				.listBuckets();
			
			checks.storage = !storageError;
		} catch {
			// Storage might not be configured, so we don't fail the health check
			// Storage health check skipped
			checks.storage = true; // Mark as OK if not configured
		}
		
		const allHealthy = Object.values(checks).every(check => check === true);
		const responseTime = Date.now() - startTime;
		
		// If any critical service is down, return 503
		if (!checks.database || !checks.auth) {
			throw error(503, 'Service degraded');
		}
		
		// Return health status with security headers
		const response = json({
			status: allHealthy ? 'healthy' : 'degraded',
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
			environment: process.env.NODE_ENV || 'development',
			responseTime: `${responseTime}ms`,
			services: {
				database: checks.database ? 'operational' : 'down',
				auth: checks.auth ? 'operational' : 'down',
				storage: checks.storage ? 'operational' : 'unknown',
			},
			checks,
		}, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'X-Response-Time': `${responseTime}ms`,
			}
		});

		return addSecurityHeaders(response);
		
	} catch (err) {
		// Use our error handler for consistent error responses
		return addSecurityHeaders(handleError(err as Error, request));
	}
};

// Optional: Add a simple HEAD method for even lighter health checks
export const HEAD: RequestHandler = async ({ locals }) => {
	try {
		// Quick database connectivity check
		const { error: dbError } = await locals.supabase
			.from('profiles')
			.select('count')
			.limit(1)
			.single();
		
		if (dbError) {
			throw error(503, 'Database unavailable');
		}
		
		return addSecurityHeaders(new Response(null, {
			status: 200,
			headers: {
				'X-Health-Status': 'healthy',
				'Cache-Control': 'no-cache',
			}
		}));
	} catch {
		return addSecurityHeaders(new Response(null, {
			status: 503,
			headers: {
				'X-Health-Status': 'unhealthy',
				'Cache-Control': 'no-cache',
			}
		}));
	}
};
