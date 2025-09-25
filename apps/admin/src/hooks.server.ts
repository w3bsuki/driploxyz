import { createAuthHelpers } from '@repo/core/auth';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { Database } from '@repo/database';

/**
 * CRITICAL SECURITY MIDDLEWARE FOR ADMIN APP
 * Multiple layers of protection:
 * 1. IP Whitelist check
 * 2. Supabase auth verification
 * 3. Admin role verification in database
 * 4. Email whitelist check
 * 5. Session timeout enforcement
 */

// Parse allowed emails and IPs from environment (with defaults for dev)
const ALLOWED_ADMIN_EMAILS = env.ADMIN_ALLOWED_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || ['test@example.com'];
const ALLOWED_IPS = env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()) || [];

// IP Whitelist Check
const ipCheckHandler: Handle = async ({ event, resolve }) => {
	// Get client IP (works with Vercel, Cloudflare, etc.)
	const clientIp = 
		event.request.headers.get('x-real-ip') ||
		event.request.headers.get('x-forwarded-for')?.split(',')[0] ||
		event.request.headers.get('cf-connecting-ip') ||
		'unknown';

	event.locals.ipAddress = clientIp;

	// Skip IP check in development
	if (process.env.NODE_ENV === 'development') {
		
		return resolve(event);
	}

	// Enforce IP whitelist in production
	if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIp)) {
		
		error(403, {
			message: 'Access denied from this location'
		});
	}

	return resolve(event);
};

// Supabase Auth Handler
const authHandler: Handle = async ({ event, resolve }) => {
	// Create Supabase client via shared helper
	const { createSupabaseServerClient, safeGetSession } = createAuthHelpers<Database>({
		url: PUBLIC_SUPABASE_URL,
		anonKey: PUBLIC_SUPABASE_ANON_KEY,
		cookieDefaults: { sameSite: 'lax' }
	});
	event.locals.supabase = createSupabaseServerClient(event.cookies, event.fetch);
	event.locals.safeGetSession = () => safeGetSession(event);

	// Get session for this request
	const { session, user } = await event.locals.safeGetSession();

	// Check if user is authenticated
	if (!user) {
		// Redirect to login if trying to access protected page
		if (event.url.pathname !== '/login') {
			redirect(303, '/login');
		}
		event.locals.isAdmin = false;
		return resolve(event);
	}

	// CRITICAL: Verify admin status from database
	const { data: profile } = await event.locals.supabase
		.from('profiles')
		.select('role, username')
		.eq('id', user.id)
		.single();

	const isAdmin = profile?.role === 'admin';
	const emailIsAllowed = ALLOWED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

	// Triple verification: must have admin role, be in email whitelist, and have valid session
	if (!isAdmin || !emailIsAllowed) {
		
		await event.locals.supabase.auth.signOut();
		error(403, {
			message: 'You do not have admin privileges'
		});
	}

	// Set admin status in locals
	event.locals.isAdmin = true;
	event.locals.adminUser = {
		...user,
		isAdmin: true,
		adminLevel: 'super', // You can implement different levels
		lastVerified: new Date()
	};

	// Log admin access for audit trail
	

	// Optional: Record admin access in database (commented out until table exists)
	// try {
	// 	await event.locals.supabase
	// 		.from('admin_audit_log')
	// 		.insert({
	// 			admin_id: user.id,
	// 			action: 'admin_panel_access',
	// 			ip_address: event.locals.ipAddress,
	// 			user_agent: event.request.headers.get('user-agent'),
	// 			target_resource: event.url.pathname
	// 		});
	// } catch (err) {
	// 	// Don't fail request if audit log fails
	// 	
	// }

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

// Session timeout handler (30 minutes by default)
const sessionTimeoutHandler: Handle = async ({ event, resolve }) => {
	if (event.locals.isAdmin && event.locals.adminUser) {
		const lastActivity = event.cookies.get('admin_last_activity');
		const now = Date.now();
		const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

		if (lastActivity && now - parseInt(lastActivity) > TIMEOUT_MS) {
			// Session expired
			await event.locals.supabase.auth.signOut();
			redirect(303, '/login?expired=true');
		}


		// Update last activity with stricter cookie policy
		event.cookies.set('admin_last_activity', now.toString(), {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24
		});
	}

	return resolve(event);
};

// Combine all handlers in sequence
export const handle = sequence(
	ipCheckHandler,
	authHandler,
	sessionTimeoutHandler
);

// Global error handler for admin app
export const handleError = ({ error, event }) => {
	// Log all errors with context
	console.error('Admin app error:', {
		error,
		url: event.url.pathname,
		user: event.locals.adminUser?.email,
		ip: event.locals.ipAddress
	});

	// Return sanitized error to client
	return {
		message: error instanceof Error ? error.message : 'An error occurred',
		code: (error as any)?.code || 'UNKNOWN_ERROR'
	};
};