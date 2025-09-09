import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import type { Handle, HandleServerError } from '@sveltejs/kit';

import { setupEnvironment } from './env';
import { setupAuth } from './supabase-hooks';
import { setupI18n, transformPageChunk } from './i18n';
import { setupCountry } from './country';
// import { handleCountryRedirect } from './country-redirect'; // Currently disabled for performance
import { handleUnknownLocales } from './locale-redirect';
import { setupAuthGuard } from './auth-guard';
import { setupSentry, isSentryAvailable, createCspNonce } from './sentry';
import { createErrorHandler } from './error-handler';
import { CSRFProtection } from './csrf';

/**
 * Supabase authentication handler
 */
const supabaseHandler: Handle = async ({ event, resolve }) => {
  setupEnvironment(event);
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

  // Add CSP with per-request nonce
  const nonce = createCspNonce();
  (event.locals as any).cspNonce = nonce;

  const response = await resolve(event, {
    transformPageChunk: transformPageChunk(event),
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version' || name === 'content-security-policy';
    }
  });

  // In development, relax CSP to support Vite HMR and inline tooling
  if (dev) {
    const devCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https:",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self' http: https: ws: wss:",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    response.headers.set('content-security-policy', devCsp);
  } else {
    const prodCsp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://connect.facebook.net https://vercel.live`,
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    response.headers.set('content-security-policy', prodCsp);
  }
  return response;
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
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const path = event.url.pathname;
  if (!safeMethods.includes(event.request.method) && path.startsWith('/api')) {
    const ok = await CSRFProtection.check(event as any);
    if (!ok) return new Response('Forbidden', { status: 403 });
  }
  return resolve(event);
};

/**
 * Authentication guard handler
 */
const authGuardHandler: Handle = async ({ event, resolve }) => {
  await setupAuthGuard(event);
  return resolve(event);
};

/**
 * Main handle sequence with optional Sentry integration
 * CRITICAL: supabaseHandler MUST run first to set up auth before other handlers
 * localeRedirectHandler runs early to handle unknown locale prefixes
 */
export const handle: Handle = async (args) => {
  const base = sequence(
    localeRedirectHandler,
    csrfGuard,
    supabaseHandler,
    languageHandler,
    // Temporarily disable country redirect handler - it's causing performance issues
    // countryRedirectHandler,
    authGuardHandler
  );

  if (isSentryAvailable()) {
    await setupSentry();
    const { sentryHandle } = await import('@sentry/sveltekit');
    const withSentry = sequence(
      sentryHandle(),
      localeRedirectHandler,
      csrfGuard,
      supabaseHandler,
      languageHandler,
      // Temporarily disable country redirect handler - it's causing performance issues
      // countryRedirectHandler,
      authGuardHandler
    );
    return withSentry(args);
  }

  return base(args);
};

/**
 * Error handler with optional Sentry integration
 */
export const handleError: HandleServerError = async (input) => {
  if (isSentryAvailable()) {
    await setupSentry();
    const { handleErrorWithSentry } = await import('@sentry/sveltekit');
    const sentryErrHandler = handleErrorWithSentry();
    return sentryErrHandler(input);
  }
  const errHandler = createErrorHandler();
  return errHandler(input);
};
