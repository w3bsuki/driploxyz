import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import type { Database } from '@repo/database';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { dev } from '$app/environment';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '@repo/i18n/server';

/**
 * PRODUCTION-READY SUPABASE SSR HOOK
 * ===================================
 * Implements best practices from Supabase SSR documentation:
 * - Proper JWT validation with getUser() not getSession()
 * - Secure cookie handling with proper path and options
 * - Error boundaries and logging
 * - Security headers
 * - PKCE flow support
 */

const supabaseHandle: Handle = async ({ event, resolve }) => {
  // Validate environment variables at runtime
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    const error = '[Supabase] CRITICAL: Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. Configure apps/web/.env or deployment env vars.';
    console.error(error);
    throw new Error(error);
  }

  // Initialize SSR-aware Supabase client per request
  // This client automatically handles cookie-based authentication
  event.locals.supabase = createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          /**
           * IMPORTANT: SvelteKit requires 'path' to be explicitly set
           * Setting path to '/' ensures cookies work across the entire app
           * See: https://kit.svelte.dev/docs/types#public-types-cookies
           */
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { 
              ...(options as CookieOptions), 
              path: '/',
              // Production security settings
              sameSite: 'lax',
              httpOnly: true,
              secure: !dev
            });
          });
        }
      }
    }
  );

  /**
   * CRITICAL: Safe session getter that validates JWT
   * ================================================
   * NEVER trust event.locals.supabase.auth.getSession() in server code!
   * It doesn't validate the JWT and can be tampered with by the client.
   * 
   * Always use getUser() which validates the JWT by making a request to Supabase Auth.
   * This is the ONLY safe way to get user data server-side.
   */
  event.locals.safeGetSession = async () => {
    try {
      // First, get the user to validate the JWT
      const {
        data: { user },
        error: userError
      } = await event.locals.supabase.auth.getUser();

      // If there's no user or an error, the session is invalid
      if (userError || !user) {
        if (dev && userError) {
          console.warn('[Auth] Session validation failed:', userError.message);
        }
        return { session: null, user: null } as const;
      }

      // Only after JWT validation, get the session
      const {
        data: { session }
      } = await event.locals.supabase.auth.getSession();

      if (!session) {
        if (dev) {
          console.warn('[Auth] User exists but no session found');
        }
        return { session: null, user: null } as const;
      }

      return { session, user } as const;
    } catch (error) {
      // Log unexpected errors but don't expose them to client
      console.error('[Auth] Unexpected error in safeGetSession:', error);
      return { session: null, user: null } as const;
    }
  };

  // Resolve the request with proper headers
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Allow Supabase-specific headers to be sent to the client
       * These are needed for proper pagination and API versioning
       */
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

/**
 * Paraglide i18n middleware
 * Must run BEFORE Supabase/auth so the locale is available in locals and HTML lang is set
 */
const i18nHandle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    // set the de-localized request back onto the event
    event.request = request;
    // expose the resolved locale to downstream loaders/actions
    (event.locals as App.Locals & { locale?: string }).locale = locale;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale)
    });
  });

/**
 * Security headers middleware
 * Add production-grade security headers to all responses
 */
const securityHeadersHandle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  if (!dev) {
    // Production security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Hardened CSP - removed unsafe-eval, kept unsafe-inline for Svelte hydration
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    );
  }

  return response;
};

/**
 * Export handlers in sequence
 * Supabase must run first to set up auth, then security headers
 */
export const handle = sequence(i18nHandle, supabaseHandle, securityHeadersHandle);
