import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import type { Handle, HandleServerError } from '@sveltejs/kit';

import { setupEnvironment } from './env.js';
import { setupAuth } from './supabase-hooks.js';
import { setupI18n, transformPageChunk } from './i18n.js';
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

  return resolve(event, {
    transformPageChunk: transformPageChunk(event)
  });
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
 */
export const handle: Handle = isSentryAvailable() 
  ? sequence(sentryHandle(), languageHandler, supabaseHandler, authGuardHandler)
  : sequence(languageHandler, supabaseHandler, authGuardHandler);

/**
 * Error handler with optional Sentry integration
 */
export const handleError: HandleServerError = isSentryAvailable() 
  ? handleErrorWithSentry() 
  : createErrorHandler();