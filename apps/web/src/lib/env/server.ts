import { z } from 'zod';

const serverEnvSchema = z.object({
	// Supabase
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
	
	// Security
	RATE_LIMIT_SECRET: z.string().min(32),
	CSRF_SECRET: z.string().optional(),
	
	// Stripe (optional for now)
	STRIPE_SECRET_KEY: z.string().optional(),
	STRIPE_WEBHOOK_SECRET: z.string().optional(),
	
	// Email (optional)
	RESEND_API_KEY: z.string().optional(),
	
	// Sentry (optional)
	SENTRY_DSN: z.string().url().optional(),
	
	// Environment
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function validateServerEnv(): ServerEnv {
	try {
		return serverEnvSchema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
			throw new Error(
				`❌ Invalid server environment variables:\n${error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}`
			);
		}
		throw error;
	}
}

export const env = validateServerEnv();