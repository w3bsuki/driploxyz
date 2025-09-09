import { building, dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Environment variable validation - critical for production
// Only require public Supabase vars for the web app runtime.
// Service role is not required (and should not be used) in the web app.
const requiredEnvVars = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY'
] as const;

/**
 * Validates required environment variables at startup
 * Only validates in production or when explicitly testing
 */
export function validateEnvironment(): void {
  if (!building && !dev) {
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });
    // Optional server-only variables (warn if missing in production)
    if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) {
      console.warn('ℹ️ SUPABASE_SERVICE_ROLE_KEY is not set for web app (OK unless needed server-side).');
    }
    console.log('✅ All required environment variables are present');
  }
}

/**
 * Setup environment validation for the request event
 * This is a no-op function that runs validation at module load
 */
export function setupEnvironment(_event: RequestEvent): void {
  // Environment validation happens at module load time
  // This function exists for consistency with other setup functions
}

// Validate environment when module is imported
validateEnvironment();
