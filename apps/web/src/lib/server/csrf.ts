import { dev } from '$app/environment';

// CSRF token generation and validation
export class CSRFProtection {
	private static SECRET = 'fallback-dev-secret-change-in-prod';
	
	// Generate a CSRF token using crypto
	static generateToken(sessionId: string): string {
		const timestamp = Date.now();
		const randomPart = crypto.randomUUID().replace(/-/g, '');
		const token = `${timestamp}:${sessionId}:${randomPart}`;
		
		// Token includes timestamp for expiration checking
		return btoa(token);
	}
	
	// Validate a CSRF token
	static validateToken(token: string, sessionId: string, maxAge = 3600000): boolean {
		try {
			const decoded = atob(token);
			const [timestampStr, tokenSessionId] = decoded.split(':');
			const timestamp = parseInt(timestampStr || '0', 10);
			
			// Check if token has expired (default 1 hour)
			if (Date.now() - timestamp > maxAge) {
				return false;
			}
			
			// Simple validation for now
			return tokenSessionId === sessionId;
		} catch (error) {
			return false;
		}
	}
	
	// Get or create CSRF token for a request
	static async getToken(event: any): Promise<string> {
		const session = await event.locals.safeGetSession();
		const sessionId = session?.session?.access_token || event.clientAddress;
		
		// Check if token exists in cookies
		let token = event.cookies.get('csrf_token');
		
		// Validate existing token
		if (token && this.validateToken(token, sessionId)) {
			return token;
		}
		
		// Generate new token
		token = this.generateToken(sessionId);
		
		// Set cookie with security options
		event.cookies.set('csrf_token', token, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict',
			maxAge: 60 * 60 // 1 hour
		});
		
		return token;
	}
	
	// Middleware to check CSRF token
	static async check(event: any): Promise<boolean> {
		// Skip CSRF check for GET requests and API routes
		if (event.request.method === 'GET' || event.url.pathname.startsWith('/api/')) {
			return true;
		}
		
		const session = await event.locals.safeGetSession();
		const sessionId = session?.session?.access_token || event.clientAddress;
		
		// Get token from headers or cookies only (don't consume request body)
		const token = event.request.headers.get('x-csrf-token') ||
			event.cookies.get('csrf_token');
		
		if (!token) {
			// Always reject missing tokens for security
			return false;
		}
		
		return this.validateToken(token, sessionId);
	}
}