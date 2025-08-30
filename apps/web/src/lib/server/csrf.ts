import { dev } from '$app/environment';
import { authLogger } from '$lib/utils/log';

/**
 * Production-grade CSRF Protection using HMAC-SHA256 signatures
 * 
 * Security Features:
 * - HMAC-SHA256 signed tokens prevent tampering
 * - Cryptographically secure random nonces
 * - Timing-safe token comparison
 * - Environment-based secret management
 * - Proper token expiration and rotation
 */
export class CSRFProtection {
	// Server-only HMAC secret - must be set in production
	private static getSecret(): string {
		const secret = process.env.CSRF_SECRET || process.env.RATE_LIMIT_SECRET;
		
		if (!secret && !dev) {
			throw new Error('CSRF_SECRET environment variable must be set in production');
		}
		
		// Fallback only in development - never use in production
		return secret || 'dev-csrf-secret-change-in-production';
	}

	/**
	 * Generate a cryptographically secure CSRF token
	 * Token format: timestamp.nonce.signature
	 * Signature = HMAC-SHA256(secret, timestamp:sessionId:nonce)
	 */
	static async generateToken(sessionId: string): Promise<string> {
		const timestamp = Date.now();
		const nonce = crypto.randomUUID();
		const payload = `${timestamp}:${sessionId}:${nonce}`;
		
		try {
			// Create HMAC signature using Web Crypto API
			const secret = this.getSecret();
			const encoder = new TextEncoder();
			const key = await crypto.subtle.importKey(
				'raw',
				encoder.encode(secret),
				{ name: 'HMAC', hash: 'SHA-256' },
				false,
				['sign']
			);

			const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
			const signatureHex = Array.from(new Uint8Array(signature))
				.map(b => b.toString(16).padStart(2, '0'))
				.join('');

			// Return token in format: timestamp.nonce.signature
			const token = `${timestamp}.${nonce}.${signatureHex}`;
			
			authLogger.debug('Generated CSRF token', { 
				sessionId: sessionId.slice(0, 8) + '...', // Log partial for debugging 
				timestamp,
				tokenLength: token.length
			});
			
			return token;
		} catch (error) {
			authLogger.error('Failed to generate CSRF token', error, { sessionId: sessionId.slice(0, 8) + '...' });
			throw new Error('CSRF token generation failed');
		}
	}
	
	/**
	 * Validate CSRF token with timing-safe comparison
	 */
	static async validateToken(token: string, sessionId: string, maxAge = 3600000): Promise<boolean> {
		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				authLogger.warn('Invalid CSRF token format', { tokenParts: parts.length });
				return false;
			}

			const [timestampStr, nonce, providedSignature] = parts;
			if (!timestampStr || !nonce || !providedSignature) {
				authLogger.warn('Invalid CSRF token parts', { 
					partsCount: parts.length,
					hasTimestamp: timestampStr ? 1 : 0,
					hasNonce: nonce ? 1 : 0,
					hasSignature: providedSignature ? 1 : 0
				});
				return false;
			}
			const timestamp = parseInt(timestampStr, 10);

			// Check token expiration (default 1 hour)
			if (Date.now() - timestamp > maxAge) {
				authLogger.warn('CSRF token expired', { 
					age: Date.now() - timestamp, 
					maxAge,
					sessionId: sessionId.slice(0, 8) + '...'
				});
				return false;
			}

			// Recreate the expected signature
			const payload = `${timestamp}:${sessionId}:${nonce}`;
			const secret = this.getSecret();
			const encoder = new TextEncoder();
			
			const key = await crypto.subtle.importKey(
				'raw',
				encoder.encode(secret),
				{ name: 'HMAC', hash: 'SHA-256' },
				false,
				['sign']
			);

			const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
			const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
				.map(b => b.toString(16).padStart(2, '0'))
				.join('');

			// Timing-safe comparison to prevent timing attacks
			const isValid = this.timingSafeEqual(providedSignature, expectedSignatureHex);
			
			if (isValid) {
				authLogger.debug('CSRF token validated successfully', { 
					sessionId: sessionId.slice(0, 8) + '...',
					tokenAge: Date.now() - timestamp
				});
			} else {
				authLogger.warn('CSRF token signature mismatch', { 
					sessionId: sessionId.slice(0, 8) + '...'
				});
			}

			return isValid;
		} catch (error) {
			authLogger.error('CSRF token validation failed', error, { 
				sessionId: sessionId.slice(0, 8) + '...'
			});
			return false;
		}
	}

	/**
	 * Timing-safe string comparison to prevent timing attacks
	 */
	private static timingSafeEqual(a: string, b: string): boolean {
		if (a.length !== b.length) {
			return false;
		}

		let result = 0;
		for (let i = 0; i < a.length; i++) {
			result |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		
		return result === 0;
	}
	
	/**
	 * Get or create CSRF token for a request with proper validation
	 */
	static async getToken(event: any): Promise<string> {
		const session = await event.locals.safeGetSession();
		const sessionId = session?.session?.access_token || event.clientAddress;
		
		// Check if token exists in cookies
		let token = event.cookies.get('csrf_token');
		
		// Validate existing token asynchronously
		if (token && (await this.validateToken(token, sessionId))) {
			return token;
		}
		
		// Generate new token asynchronously
		token = await this.generateToken(sessionId);
		
		// Set cookie with enhanced security options
		event.cookies.set('csrf_token', token, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict',
			maxAge: 60 * 60, // 1 hour
			...(dev ? {} : { 
				// Additional production security
				domain: event.url.hostname 
			})
		});
		
		authLogger.debug('Set new CSRF token cookie', { 
			sessionId: sessionId.slice(0, 8) + '...',
			secure: dev ? 0 : 1,
			domain: event.url.hostname
		});
		
		return token;
	}
	
	/**
	 * Middleware to check CSRF token - production-grade validation
	 */
	static async check(event: any, providedToken?: string): Promise<boolean> {
		const method = event.request.method;
		const pathname = event.url.pathname;

		// Enhanced safe methods check
		const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
		if (safeMethods.includes(method)) {
			return true;
		}

		// Skip CSRF for specific API endpoints (be careful with this)
		const exemptPaths = [
			'/api/webhooks/', // Webhook endpoints use other auth
			'/api/health',    // Health check endpoint
		];
		
		if (exemptPaths.some(path => pathname.startsWith(path))) {
			authLogger.debug('CSRF check skipped for exempt path', { pathname, method });
			return true;
		}
		
		const session = await event.locals.safeGetSession();
		const sessionId = session?.session?.access_token || event.clientAddress;
		
		// Get token from provided value, headers, or cookies
		const token = providedToken ||
			event.request.headers.get('x-csrf-token') ||
			event.request.headers.get('csrf-token') ||
			event.cookies.get('csrf_token');
		
		if (!token) {
			authLogger.warn('CSRF token missing', { 
				method, 
				pathname,
				sessionId: sessionId.slice(0, 8) + '...',
				hasProvidedToken: providedToken ? 1 : 0,
				hasHeaderToken: event.request.headers.get('x-csrf-token') ? 1 : 0,
				hasCookieToken: event.cookies.get('csrf_token') ? 1 : 0
			});
			return false;
		}
		
		const isValid = await this.validateToken(token, sessionId);
		
		if (!isValid) {
			authLogger.warn('CSRF token validation failed', { 
				method, 
				pathname,
				sessionId: sessionId.slice(0, 8) + '...'
			});
		}
		
		return isValid;
	}
}