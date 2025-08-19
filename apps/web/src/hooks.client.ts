import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { initializeClerkClient } from 'clerk-sveltekit/client';

// Initialize Clerk
const PUBLIC_CLERK_PUBLISHABLE_KEY = env.PUBLIC_CLERK_PUBLISHABLE_KEY;
if (PUBLIC_CLERK_PUBLISHABLE_KEY) {
  initializeClerkClient(PUBLIC_CLERK_PUBLISHABLE_KEY, {
    afterSignInUrl: '/dashboard',
    afterSignUpUrl: '/onboarding'
  });
}

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
