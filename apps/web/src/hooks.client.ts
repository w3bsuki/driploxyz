import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';

import { PUBLIC_SENTRY_DSN } from '$env/static/public';

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
  : (async ({ error, event }) => {
      console.error('Client error:', error);
      return {
        message: 'An error occurred'
      };
    });