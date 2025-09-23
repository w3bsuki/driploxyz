import { building, dev } from '$app/environment';

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
        
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });
    // Optional server-only variables (warn if missing in production)
    if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) {
      // Service role key is optional - some features will be limited
    }
    
  }
}

/**
 * Setup environment validation for the request event
 * This is a no-op function that runs validation at module load
 */
export function setupEnvironment(): void {
  // Environment validation happens at module load time
  // This function exists for consistency with other setup functions
}

// Validate environment when module is imported
validateEnvironment();
