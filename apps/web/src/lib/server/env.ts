import { building, dev } from '$app/environment';
import { validateEnv, hasServiceRoleKey } from '$lib/env/validation';

let validated = false;

export function validateEnvironment(): void {
  if (building || validated) {
    return;
  }

  try {
    const env = validateEnv();
    
    if (dev) {
      console.log('[Env] Environment validation successful');
      console.log('[Env] Supabase URL configured:', !!env.PUBLIC_SUPABASE_URL);
      console.log('[Env] Supabase Anon Key configured:', !!env.PUBLIC_SUPABASE_ANON_KEY);
      console.log('[Env] Auth redirect URL:', process.env.PUBLIC_AUTH_REDIRECT_URL || 'Not set');
      console.log('[Env] Auth site URL:', process.env.PUBLIC_AUTH_SITE_URL || 'Not set');

      // Warn if Supabase config is missing
      if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
        console.error('[Env] CRITICAL: Supabase configuration is missing. The app will not function properly.');
      }
    }

    if (!dev && !hasServiceRoleKey(env)) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is not configured; service role features are disabled.');
    }

    validated = true;
  } catch (error) {
    console.error('[Env] Environment validation failed:', error);
    // Don't throw in development, just log the error
    if (!dev) {
      throw error;
    }
    validated = true; // Mark as validated to avoid repeated errors
  }
}

export function setupEnvironment(): void {
  validateEnvironment();
}

// Only validate immediately in production
if (!dev) {
  validateEnvironment();
}
