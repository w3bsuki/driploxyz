import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Try to get Sentry DSN - optional in some environments
let SENTRY_DSN: string | undefined;
try {
  SENTRY_DSN = process.env.SENTRY_DSN;
} catch {
  // DSN not available - Sentry won't be initialized
}

/**
 * Initialize Sentry error monitoring
 * Only initializes if DSN is present
 */
export function initializeSentry(): void {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: dev ? 'development' : 'production',
      tracesSampleRate: dev ? 1.0 : 0.1,
      debug: dev,
      integrations: [
        // Basic integrations - avoid deprecated ones that might not be available
      ],
      beforeSend(event) {
        // Don't send errors in development
        if (dev) return null;
        
        // Filter sensitive data
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('password') || error?.value?.includes('token')) {
            return null; // Don't send sensitive auth errors
          }
        }
        
        return event;
      }
    });
  }
}

/**
 * Setup Sentry for the request event
 * This is a no-op function since Sentry initialization happens at module load
 */
export function setupSentry(event: RequestEvent): void {
  // Sentry initialization happens at module load time
  // This function exists for consistency with other setup functions
}

/**
 * Check if Sentry is available
 */
export function isSentryAvailable(): boolean {
  return !!SENTRY_DSN;
}

// Initialize Sentry when module is imported
initializeSentry();