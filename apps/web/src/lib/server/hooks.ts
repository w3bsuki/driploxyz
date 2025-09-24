import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleServerError } from '@sveltejs/kit';

import { setupEnvironment } from './env';
import { setupAuth } from './supabase-hooks';
import { setupI18n, transformPageChunk } from './i18n';
import { setupCountry } from './country';
// import { handleCountryRedirect } from './country-redirect'; // Currently disabled for performance
import { handleUnknownLocales } from './locale-redirect';
import { setupAuthGuard } from './auth-guard';
import { createErrorHandler } from './error-handler';
import { CSRFProtection } from './csrf';

/**
 * Supabase authentication handler
 */
const supabaseHandler: Handle = async ({ event, resolve }) => {
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
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const path = event.url.pathname;
  if (!safeMethods.includes(event.request.method) && path.startsWith('/api')) {
    const ok = await CSRFProtection.check(event);
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
export const handle: Handle = sequence(
  localeRedirectHandler,
  csrfGuard,
  supabaseHandler,
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
