import { z } from 'zod';
import { env as dynamicPublicEnv } from '$env/dynamic/public';
// Avoid $env/static/public imports for optional keys to prevent build-time errors
import { building, dev } from '$app/environment';

// Public environment variables (available to client and server)
const publicEnvSchema = z.object({
	PUBLIC_SUPABASE_URL: z.string().url().min(1, 'PUBLIC_SUPABASE_URL is required'),
	PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'PUBLIC_SUPABASE_ANON_KEY is required'),
	PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
});

// Server-only environment variables
const serverEnvSchema = z.object({
        // Supabase
        SUPABASE_SERVICE_ROLE_KEY: z
                .string()
                .min(1, 'SUPABASE_SERVICE_ROLE_KEY must not be empty')
                .optional(),
	
	// Stripe (required for production)
	STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
	STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
	
	// Security
	RATE_LIMIT_SECRET: z.string().min(32).optional(),
	CSRF_SECRET: z.string().min(32).optional(),
	
	// Email (optional)
	RESEND_API_KEY: z.string().optional(),
	SENDGRID_API_KEY: z.string().optional(),
	
	// Monitoring (optional but recommended)
	SENTRY_DSN: z.string().url().optional(),
	SENTRY_AUTH_TOKEN: z.string().optional(),
	
	// Analytics (optional)
	GOOGLE_ANALYTICS_ID: z.string().startsWith('G-').optional(),
	MIXPANEL_TOKEN: z.string().optional(),
	
	// Storage (optional)
	CLOUDINARY_URL: z.string().url().optional(),
	AWS_S3_BUCKET: z.string().optional(),
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
	
	// Environment
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = PublicEnv & ServerEnv;

/**
 * Validates public environment variables
 * These are available in both client and server contexts
 */
export function validatePublicEnv(): PublicEnv {
	// Skip validation during build
	if (building) {
		return {
			PUBLIC_SUPABASE_URL: '',
			PUBLIC_SUPABASE_ANON_KEY: '',
			PUBLIC_STRIPE_PUBLISHABLE_KEY: '',
		};
	}
	
    try {
                // Resolve from multiple sources to avoid false negatives in dev:
                // 1) $env/dynamic/public (runtime process.env)
                // 2) import.meta.env (Vite-loaded .env.*)
                // 3) $env/static/public (compile-time static values)
                const firstNonEmpty = (...vals: Array<string | undefined>) => {
                        for (const v of vals) {
                                if (typeof v === 'string' && v.trim().length > 0) return v.trim();
                        }
                        return undefined;
                };

                const resolved = {
                        PUBLIC_SUPABASE_URL: firstNonEmpty(
                                dynamicPublicEnv.PUBLIC_SUPABASE_URL,
                                typeof import.meta !== 'undefined' ? (import.meta as any).env?.PUBLIC_SUPABASE_URL : undefined,
                                process.env.PUBLIC_SUPABASE_URL
                        ),
                        PUBLIC_SUPABASE_ANON_KEY: firstNonEmpty(
                                dynamicPublicEnv.PUBLIC_SUPABASE_ANON_KEY,
                                typeof import.meta !== 'undefined' ? (import.meta as any).env?.PUBLIC_SUPABASE_ANON_KEY : undefined,
                                process.env.PUBLIC_SUPABASE_ANON_KEY
                        ),
                        PUBLIC_STRIPE_PUBLISHABLE_KEY: firstNonEmpty(
                                dynamicPublicEnv.PUBLIC_STRIPE_PUBLISHABLE_KEY,
                                typeof import.meta !== 'undefined' ? (import.meta as any).env?.PUBLIC_STRIPE_PUBLISHABLE_KEY : undefined,
                                process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY
                        )
                };

                return publicEnvSchema.parse(resolved);
    } catch (error) {
                if (error instanceof z.ZodError) {
                        if (dev) {
                                console.warn('[env] Invalid public environment configuration. Using empty defaults in dev to avoid hard-fail.');
                                return {
                                        PUBLIC_SUPABASE_URL: '',
                                        PUBLIC_SUPABASE_ANON_KEY: '',
                                        PUBLIC_STRIPE_PUBLISHABLE_KEY: ''
                                } as PublicEnv;
                        }
                        throw new Error('Invalid public environment configuration');
                }
                throw error;
    }
}

/**
 * Validates server-only environment variables
 * Only available in server context (+page.server.ts, +server.ts, hooks.server.ts)
 */
export function validateServerEnv(): ServerEnv {
        // Skip validation during build
        if (building) {
                return {
                        NODE_ENV: 'development',
                } as ServerEnv;
        }
	
	try {
		return serverEnvSchema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			error.errors.forEach(() => {
				// Log validation errors if needed
			});

			// In development, provide helpful hints
			if (process.env.NODE_ENV === 'development') {
				// Could add development-specific error handling here
			}

			throw new Error('Invalid server environment configuration');
		}
		throw error;
	}
}

/**
 * Validates all environment variables
 * Call this once at application startup
 */
export function validateEnv(): Env {
        const publicEnv = validatePublicEnv();
        const serverEnv = validateServerEnv();

        // Additional cross-validation
        if (serverEnv.NODE_ENV === 'production') {
                // Enforce required variables in production
                if (!serverEnv.STRIPE_SECRET_KEY) {
                        throw new Error('STRIPE_SECRET_KEY is required in production');
                }
		if (!serverEnv.SENTRY_DSN) {
			// Sentry DSN is optional - monitoring will be disabled
		}
		if (!serverEnv.RATE_LIMIT_SECRET) {
			// Rate limit secret is optional - using default fallback
		}
	}
	
        return {
                ...publicEnv,
                ...serverEnv,
        };
}

// Helper function to check if we're in production
export function isProduction(): boolean {
	return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
	return process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
}

// Helper function to get safe environment variables for client
export function getClientEnv(): PublicEnv {
        return validatePublicEnv();
}

// Export validated environment (server-side only)
// This will be available in server contexts
export const env = building ? ({} as Env) : validateEnv();

type ServiceRoleSource = Partial<Pick<ServerEnv, 'SUPABASE_SERVICE_ROLE_KEY'>> | Record<string, string | undefined>;

export function hasServiceRoleKey(source?: ServiceRoleSource): boolean {
        const context = source ?? process.env;
        const value = context.SUPABASE_SERVICE_ROLE_KEY ?? context['SUPABASE_SERVICE_ROLE_KEY'];
        return typeof value === 'string' && value.length > 0;
}
