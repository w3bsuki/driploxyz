import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Try to get Sentry DSN - optional in some environments
let SENTRY_DSN: string | undefined;
try {
  SENTRY_DSN = process.env.SENTRY_DSN;
} catch {
  // DSN not available - Sentry won't be initialized
}

let initialized = false;
let initializing: Promise<void> | null = null;

/**
 * Initialize Sentry error monitoring lazily
 * Only initializes if DSN is present and only once
 */
export async function initializeSentry(): Promise<void> {
  if (initialized || !SENTRY_DSN) return;
  if (initializing) return initializing;

  initializing = (async () => {
    const Sentry = await import('@sentry/sveltekit');
    Sentry.init({
      dsn: SENTRY_DSN!,
      environment: dev ? 'development' : 'production',
      tracesSampleRate: dev ? 1.0 : 0.1,
      debug: dev,
      integrations: [],
      beforeSend(event) {
        if (dev) return null;
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('password') || error?.value?.includes('token')) {
            return null;
          }
        }
        return event;
      }
    });
    initialized = true;
    initializing = null;
  })();

  return initializing;
}

/**
 * Setup Sentry for the request event
 * This is a no-op function since Sentry initialization happens at module load
 */
export async function setupSentry(_event?: RequestEvent): Promise<void> {
  await initializeSentry();
}

/**
 * Check if Sentry is available
 */
export function isSentryAvailable(): boolean {
  // In dev on Windows, some transitive deps (glob/minimatch) can mis-resolve.
  // Disable Sentry in dev unless explicitly enabled via env.
  const enableInDev = process.env.SENTRY_ENABLE_DEV === 'true';
  return !!SENTRY_DSN && (enableInDev ? true : !dev);
}

/**
 * Generate a CSP nonce for inline scripts/styles per request
 */
export function createCspNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // Base64-url safe
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}