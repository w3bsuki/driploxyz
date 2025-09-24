import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { createLogger } from '$lib/utils/log';
import { parseError, setupGlobalErrorHandling } from '$lib/utils/error-handling.svelte';

const log = createLogger('hooks-client');

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
    beforeSend(event, hint) {
      // Enhanced error context for Sentry
      const originalException = hint.originalException;
      if (originalException) {
        const errorDetails = parseError(originalException);
        event.extra = {
          ...event.extra,
          errorCategory: errorDetails.type,
          errorSeverity: errorDetails.severity,
          retryable: errorDetails.retryable,
          userMessage: errorDetails.userMessage
        };

        // Tag for easier filtering
        event.tags = {
          ...event.tags,
          errorType: errorDetails.type,
          severity: errorDetails.severity
        };
      }

      return event;
    }
  });
}

// Setup global error handling
setupGlobalErrorHandling();

/**
 * Enhanced client error handler
 */
const fallbackErrorHandler = async ({ error, event }: { error: unknown; event: { url?: { pathname: string } } }) => {
  const errorDetails = parseError(error, {
    url: event?.url?.pathname,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    timestamp: new Date().toISOString()
  });

  // Log error with appropriate level
  if (errorDetails.severity === 'CRITICAL' || errorDetails.severity === 'HIGH') {
    log.error('Client error occurred', {
      message: errorDetails.message,
      type: errorDetails.type,
      severity: errorDetails.severity,
      stack: error instanceof Error ? error.stack : undefined
    });
  } else {
    log.warn('Client error occurred', {
      message: errorDetails.message,
      type: errorDetails.type,
      severity: errorDetails.severity
    });
  }

  // Return user-friendly message
  return {
    message: errorDetails.userMessage,
    id: `client-${Date.now()}`
  };
};

// Export error handler (Sentry-enabled or fallback)
export const handleError = PUBLIC_SENTRY_DSN
  ? handleErrorWithSentry()
  : fallbackErrorHandler;

// Reroute is handled in hooks.ts (universal hooks file)
