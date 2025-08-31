import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleServerError } from '@sveltejs/kit';

import { setupEnvironment } from './env';
import { setupAuth } from './supabase-hooks';
import { setupI18n, transformPageChunk } from './i18n';
import { setupCountry } from './country';
import { handleCountryRedirect } from './country-redirect';
import { handleUnknownLocales } from './locale-redirect';
import { setupAuthGuard } from './auth-guard';
import { setupSentry, isSentryAvailable } from './sentry';
import { createErrorHandler } from './error-handler';

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
export const handle: Handle = async (args) => {
  const base = sequence(
    localeRedirectHandler,
    supabaseHandler,
    languageHandler,
    countryRedirectHandler,
    authGuardHandler
  );

  if (isSentryAvailable()) {
    await setupSentry();
    const { sentryHandle } = await import('@sentry/sveltekit');
    const withSentry = sequence(
      sentryHandle(),
      localeRedirectHandler,
      supabaseHandler,
      languageHandler,
      countryRedirectHandler,
      authGuardHandler
    );
    // @ts-expect-error - sequence returns a Handle-compatible fn
    return withSentry(args);
  }

  // @ts-expect-error - sequence returns a Handle-compatible fn
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
