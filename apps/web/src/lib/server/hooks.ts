import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleServerError, HandleFetch } from '@sveltejs/kit';
import { dev } from '$app/environment';

import { setupEnvironment } from './env';
import { setupAuth, authGuard } from '$lib/auth/hooks';
import { setupI18n, transformPageChunk } from './i18n';
import { setupCountry } from './country';
// import { handleCountryRedirect } from './country-redirect'; // Currently disabled for performance
import { handleUnknownLocales } from './locale-redirect';
// Removed: import { setupAuthGuard } from './auth-guard'; // Using consolidated auth system
import { createErrorHandler } from './error-handler';
import { CSRFProtection } from './csrf';

/**
 * Authentication handler - sets up Supabase client and session handling
 */
const authHandler: Handle = async ({ event, resolve }) => {
  setupEnvironment();
  await setupAuth(event);

  return await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

/**
 * Language and internationalization handler
 */
const languageHandler: Handle = async ({ event, resolve }) => {
  await setupI18n(event);
  await setupCountry(event);

  // Keep page transforms for i18n, avoid custom CSP management here
  return await resolve(event, {
    transformPageChunk: transformPageChunk(event),
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

/**
 * Country redirect handler
 * Must come after auth setup to access user data
 * Currently disabled for performance reasons
 */
// const _countryRedirectHandler: Handle = async ({ event, resolve }) => {
//   await handleCountryRedirect(event);
//   return resolve(event);
// };

/**
 * Unknown locale redirect handler
 * Handles paths with unknown locale prefixes and redirects to default
 */
const localeRedirectHandler: Handle = async ({ event, resolve }) => {
  await handleUnknownLocales(event);
  return resolve(event);
};
/**
 * Global CSRF guard for mutating requests
 */
const csrfGuard: Handle = async ({ event, resolve }) => {
  // Bypass guards for debug endpoints
  if (event.url.pathname.startsWith('/api/_debug')) return resolve(event);

  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const path = event.url.pathname;
  if (!safeMethods.includes(event.request.method) && path.startsWith('/api')) {
    const ok = await CSRFProtection.check(event);
    if (!ok) return new Response('Forbidden', { status: 403 });
  }
  return resolve(event);
};

/**
 * Route protection handler - validates sessions for protected routes
 */
const authGuardHandler: Handle = async ({ event, resolve }) => {
  await authGuard(event);
  return resolve(event);
};

/**
 * HandleFetch optimization for internal API calls
 * Routes internal API calls directly to handlers, avoiding HTTP overhead
 */
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  const url = new URL(request.url);
  const eventUrl = new URL(event.url);

  // Only optimize requests to the same origin
  if (url.origin !== eventUrl.origin) {
    return fetch(request);
  }

  // Only optimize internal API routes
  if (!url.pathname.startsWith('/api/')) {
    return fetch(request);
  }

  // For internal API calls, ensure cookies are properly forwarded
  const cookieHeader = event.request.headers.get('cookie');
  if (cookieHeader && !request.headers.get('cookie')) {
    const clonedRequest = new Request(request, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        cookie: cookieHeader,
        // Forward auth headers for API calls
        authorization: event.request.headers.get('authorization') || '',
        'x-forwarded-for': (() => {
          try {
            return event.getClientAddress();
          } catch {
            return 'localhost';
          }
        })(),
        'x-forwarded-proto': url.protocol.slice(0, -1),
        'x-forwarded-host': url.host
      }
    });

    if (dev) {
      // Log internal API calls in development
      console.log(`[HandleFetch] Internal API call: ${request.method} ${url.pathname}`);
    }

    return fetch(clonedRequest);
  }

  return fetch(request);
};

/**
 * Debug endpoint bypass handler - runs first to allow debug endpoints
 * Completely bypasses all other middleware for debug endpoints
 */
const debugBypassHandler: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  // Short-circuit all middleware for debug endpoints
  if (pathname.startsWith('/api/_debug')) {
    // Skip auth setup, locale handling, CSRF, etc. for debug endpoints
    return resolve(event);
  }

  return resolve(event);
};

/**
 * Main handle sequence with optional Sentry integration
 * CRITICAL: supabaseHandler MUST run first to set up auth before other handlers
 * localeRedirectHandler runs early to handle unknown locale prefixes
 */
export const handle: Handle = sequence(
  debugBypassHandler,
  localeRedirectHandler,
  authHandler,
  csrfGuard,
  languageHandler,
  // countryRedirectHandler, // intentionally disabled for perf
  authGuardHandler
);

/**
 * Error handler with optional Sentry integration
 */
export const handleError: HandleServerError = async (input) => {
  const errHandler = createErrorHandler();
  return errHandler(input);
};
