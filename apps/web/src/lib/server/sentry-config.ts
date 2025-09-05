import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import type { User } from '@supabase/supabase-js';

/**
 * Sentry Configuration for Production Error Monitoring
 * 
 * This module provides centralized Sentry configuration for both
 * client and server-side error tracking in production.
 */

interface SentryConfig {
  dsn?: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  debug: boolean;
  beforeSend?: (event: Sentry.ErrorEvent, hint: Sentry.EventHint) => Sentry.ErrorEvent | PromiseLike<Sentry.ErrorEvent | null> | null;
}

/**
 * Get base Sentry configuration
 */
export function getSentryConfig(): SentryConfig {
  const config: SentryConfig = {
    environment: dev ? 'development' : 'production',
    tracesSampleRate: dev ? 1.0 : 0.1, // 100% in dev, 10% in prod
    replaysSessionSampleRate: dev ? 0.1 : 0.01, // 10% in dev, 1% in prod
    replaysOnErrorSampleRate: 1.0, // 100% when errors occur
    debug: dev,
    beforeSend: (event, _hint) => {
      // Skip errors in development
      if (dev) return null;
      
      // Filter sensitive data
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value) {
          const errorMessage = error.value.toLowerCase();
          
          // Skip sensitive authentication errors
          if (errorMessage.includes('password') || 
              errorMessage.includes('token') ||
              errorMessage.includes('secret') ||
              errorMessage.includes('key')) {
            // Filtered sensitive error from being sent
            return null;
          }
          
          // Skip common bot/crawler errors
          if (errorMessage.includes('404') && 
              (errorMessage.includes('favicon') || 
               errorMessage.includes('robots.txt') ||
               errorMessage.includes('.php'))) {
            return null;
          }
        }
      }
      
      // Add additional context
      if (event.request) {
        event.tags = {
          ...event.tags,
          route: event.request.url || 'unknown'
        };
      }
      
      return event;
    }
  };
  
  // Add release info if available
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    config.release = process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7);
  }
  
  return config;
}

/**
 * Server-side Sentry initialization
 */
export function initServerSentry(dsn?: string): boolean {
  if (!dsn) {
    // Sentry: No DSN provided, error monitoring disabled
    return false;
  }
  
  const config = getSentryConfig();
  
  try {
    Sentry.init({
      dsn,
      ...config,
      integrations: [
        // Node.js specific integrations
        Sentry.httpIntegration(),
        Sentry.onUncaughtExceptionIntegration(),
        Sentry.onUnhandledRejectionIntegration(),
      ],
    });
    
    // Sentry: Server-side error monitoring initialized
    return true;
  } catch (error) {
    // Sentry: Failed to initialize server-side monitoring
    return false;
  }
}

/**
 * Client-side Sentry initialization
 */
export function initClientSentry(dsn?: string): boolean {
  if (!dsn) {
    // Sentry: No DSN provided, error monitoring disabled
    return false;
  }
  
  const config = getSentryConfig();
  
  try {
    Sentry.init({
      dsn,
      ...config,
      integrations: [
        // Browser specific integrations
        Sentry.replayIntegration({
          maskAllText: true, // Privacy protection
          blockAllMedia: true,
        }),
        Sentry.captureConsoleIntegration({
          levels: ['error', 'warn'] // Only capture console errors/warnings
        }),
      ],
    });
    
    // Sentry: Client-side error monitoring initialized
    return true;
  } catch (error) {
    // Sentry: Failed to initialize client-side monitoring
    return false;
  }
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: Partial<User> | null): void {
  try {
    Sentry.setUser(user ? {
      id: user.id,
      email: user.email,
      // Don't include sensitive data
    } : null);
  } catch (error) {
    // Sentry: Failed to set user context
  }
}

/**
 * Add breadcrumb for debugging context
 */
export function addSentryBreadcrumb(
  message: string, 
  category: string, 
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void {
  try {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  } catch (error) {
    // Sentry: Failed to add breadcrumb
  }
}

/**
 * Capture custom error with context
 */
export function captureSentryError(
  error: Error | string,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: Sentry.SeverityLevel;
    fingerprint?: string[];
  }
): void {
  try {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      
      if (context?.level) {
        scope.setLevel(context.level);
      }
      
      if (context?.fingerprint) {
        scope.setFingerprint(context.fingerprint);
      }
      
      Sentry.captureException(errorObj);
    });
  } catch (sentryError) {
    console.error('Sentry: Failed to capture error:', sentryError);
    // Fallback to console logging
    console.error('Original error:', error);
  }
}

/**
 * Capture performance transaction
 */
export function startSentryTransaction(
  name: string,
  operation: string,
  description?: string
): Sentry.Span | null {
  try {
    return Sentry.startInactiveSpan({
      name: description || name,
      op: operation,
    });
  } catch (error) {
    // Sentry span failed - continuing without tracing
    return null;
  }
}

/**
 * Check if Sentry is initialized and available
 */
export function isSentryInitialized(): boolean {
  try {
    return Sentry.getClient() !== undefined;
  } catch {
    return false;
  }
}