import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { Reroute } from '@sveltejs/kit';

// Get Sentry DSN from environment (may be undefined)
const PUBLIC_SENTRY_DSN = env.PUBLIC_SENTRY_DSN;

// Only initialize Sentry if DSN is present
if (PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    environment: dev ? 'development' : 'production',
    tracesSampleRate: dev ? 1.0 : 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration(),
    ],
  });
}

// Export error handler (Sentry-enabled or fallback)
export const handleError = PUBLIC_SENTRY_DSN 
  ? handleErrorWithSentry() 
  : (async ({ error, event }: { error: unknown; event: any }) => {
      console.error('Client error:', error);
      return {
        message: 'An error occurred'
      };
    });

// Export reroute for client-side navigation to honor locale prefixes
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Match /uk or /bg prefix and strip it for internal routing
  const match = pathname.match(/^\/(uk|bg)(\/.*)?$/);
  if (match) {
    const localePrefix = match[1];
    const rest = match[2] || '/';
    
    // Return the path without locale prefix
    return rest;
  }
  
  // No locale prefix found, return as-is
  return pathname;
};
