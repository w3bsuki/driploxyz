import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import type { Handle, HandleServerError } from '@sveltejs/kit';

import { setupEnvironment } from './env.js';
import { setupAuth } from './supabase-hooks.js';
import { setupI18n, transformPageChunk } from './i18n.js';
import { setupCountry } from './country.js';
import { handleCountryRedirect } from './country-redirect.js';
import { handleUnknownLocales } from './locale-redirect.js';
import { setupAuthGuard } from './auth-guard.js';
import { setupSentry, isSentryAvailable } from './sentry.js';
import { createErrorHandler } from './error-handler.js';

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

  return resolve(event, {
    transformPageChunk: transformPageChunk(event)
  });
};

/**
 * Country redirect handler
 * Must come after auth setup to access user data
 */
const countryRedirectHandler: Handle = async ({ event, resolve }) => {
  await handleCountryRedirect(event);
  return resolve(event);
};

/**
 * Unknown locale redirect handler
 * Handles paths with unknown locale prefixes and redirects to default
 */
const localeRedirectHandler: Handle = async ({ event, resolve }) => {
  await handleUnknownLocales(event);
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
export const handle: Handle = isSentryAvailable() 
  ? sequence(sentryHandle(), localeRedirectHandler, supabaseHandler, languageHandler, countryRedirectHandler, authGuardHandler)
  : sequence(localeRedirectHandler, supabaseHandler, languageHandler, countryRedirectHandler, authGuardHandler);

/**
 * Error handler with optional Sentry integration
 */
export const handleError: HandleServerError = isSentryAvailable() 
  ? handleErrorWithSentry() 
  : createErrorHandler();