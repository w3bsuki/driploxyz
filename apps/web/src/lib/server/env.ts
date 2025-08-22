import { building, dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Environment variable validation - critical for production
const requiredEnvVars = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
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
    console.log('✅ All required environment variables are present');
  }
}

/**
 * Setup environment validation for the request event
 * This is a no-op function that runs validation at module load
 */
export function setupEnvironment(event: RequestEvent): void {
  // Environment validation happens at module load time
  // This function exists for consistency with other setup functions
}

// Validate environment when module is imported
validateEnvironment();