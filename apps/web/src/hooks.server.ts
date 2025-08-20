import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';
import { building } from '$app/environment';
import type { Database } from '@repo/database';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import * as i18n from '@repo/i18n';
// import { authLimiter, apiLimiter } from '$lib/server/rate-limiter';
// import { CSRFProtection } from '$lib/server/csrf';

// Environment variable validation - critical for production
const requiredEnvVars = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const;

// Only validate in production or when explicitly testing
if (!building && !dev) {
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
  console.log('✅ All required environment variables are present');
}

// Debug flag for controlled logging - use dev mode as default
const isDebug = dev;

// Try to get Sentry DSN - optional in some environments
let SENTRY_DSN: string | undefined;
try {
  // Use static import instead of dynamic import at top level
  SENTRY_DSN = process.env.SENTRY_DSN;
} catch {
  // DSN not available - Sentry won't be initialized
}

// Only initialize Sentry if DSN is present
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: dev ? 'development' : 'production',
    tracesSampleRate: dev ? 1.0 : 0.1,
    debug: dev,
    integrations: [
      // Basic integrations - avoid deprecated ones that might not be available
    ],
    beforeSend(event) {
      // Don't send errors in development
      if (dev) return null;
      
      // Filter sensitive data
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('password') || error?.value?.includes('token')) {
          return null; // Don't send sensitive auth errors
        }
      }
      
      return event;
    }
  });
}

// JWT validation utility
const validateJWT = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now; // Check if token hasn't expired
  } catch {
    return false; // Invalid token format
  }
};

// Mobile detection utility
const detectMobile = (userAgent: string): boolean => {
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

const supabase: Handle = async ({ event, resolve }) => {
  // Skip during build time
  if (building) {
    return resolve(event);
  }
  
  // Enhanced mobile detection for cookie compatibility
  const userAgent = event.request.headers.get('user-agent') || '';
  const isMobile = detectMobile(userAgent);
  
  // CRITICAL: Fail fast with clear error message
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    if (isDebug) console.error('❌ Supabase environment variables not configured');
    throw error(500, 'Server configuration error. Please contact support.');
  }

  try {
    // CRITICAL AUTH PATTERN: NEVER remove or modify this auth flow
    event.locals.supabase = createServerClient<Database>(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return event.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options = {} }) => {
              // Enhanced cookie settings for mobile compatibility and security
              const cookieOptions = {
                path: '/',
                // Mobile-specific adjustments
                ...(isMobile ? {
                  secure: !dev, // Allow non-secure cookies in dev for mobile testing
                  sameSite: 'lax' as const, // More permissive for mobile
                } : {
                  secure: true,
                  sameSite: 'strict' as const,
                }),
                // Preserve Supabase's security settings - NEVER override httpOnly
                ...options // Options AFTER path to preserve Supabase's security settings
              };
              
              event.cookies.set(name, value, cookieOptions);
            });
          },
        },
        global: {
          fetch: event.fetch // Critical for Vercel deployment
        }
      }
    );
  } catch (err) {
    if (isDebug) console.error('❌ Failed to initialize Supabase client:', err);
    throw error(500, 'Failed to initialize authentication');
  }

  /**
   * CRITICAL AUTH PATTERN: NEVER remove or modify this auth flow
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session with enhanced JWT validation.
   */
  event.locals.safeGetSession = async () => {
    try {
      const {
        data: { session },
      } = await event.locals.supabase.auth.getSession();

      if (!session) {
        return { session: null, user: null };
      }

      // Enhanced JWT validation before making API call
      if (session.access_token && !validateJWT(session.access_token)) {
        if (isDebug) console.warn('⚠️ Invalid or expired JWT token detected');
        return { session: null, user: null };
      }

      const {
        data: { user },
        error,
      } = await event.locals.supabase.auth.getUser();

      if (error || !user) {
        if (isDebug && error) console.warn('⚠️ Auth validation error:', error.message);
        return { session: null, user: null };
      }

      return { session, user };
    } catch (err) {
      if (isDebug) console.warn('⚠️ Session validation failed:', err);
      return { session: null, user: null };
    }
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

// Temporarily disabled due to rate limiter syntax issues
// const rateLimiter: Handle = async ({ event, resolve }) => {
//   // Apply rate limiting to auth endpoints
//   if (event.url.pathname.includes('/login') || event.url.pathname.includes('/signup')) {
//     const status = await authLimiter.check(event);
//     if (status.limited) {
//       const retryAfter = Math.round(status.retryAfter / 1000);
//       throw error(429, `Too many attempts. Please try again in ${retryAfter} seconds.`);
//     }
//   }
  
//   // Apply rate limiting to API endpoints
//   if (event.url.pathname.startsWith('/api/')) {
//     const status = await apiLimiter.check(event);
//     if (status.limited) {
//       const retryAfter = Math.round(status.retryAfter / 1000);
//       throw error(429, `Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
//     }
//   }
  
//   return resolve(event);
// };

// Temporarily disabled
// const csrfProtection: Handle = async ({ event, resolve }) => {
//   // Skip CSRF for GET requests and public APIs
//   if (event.request.method === 'GET' || 
//       event.url.pathname.startsWith('/api/webhook') ||
//       event.url.pathname.startsWith('/api/health')) {
//     return resolve(event);
//   }
  
//   // Check CSRF token for state-changing requests
//   if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
//     // SuperForms handles CSRF for forms, but we add extra layer for APIs
//     if (event.url.pathname.startsWith('/api/')) {
//       const isValid = await CSRFProtection.check(event);
//       if (!isValid && !dev) {
//         throw error(403, 'Invalid CSRF token');
//       }
//     }
//   }
  
//   // Add CSRF token to locals for forms
//   event.locals.csrfToken = await CSRFProtection.getToken(event);
  
//   return resolve(event);
// };

import { checkServerConsent, COOKIES } from '$lib/cookies/production-cookie-system';

const languageHandler: Handle = async ({ event, resolve }) => {
  // Clean up legacy cookies
  ['driplo_language', 'language', 'lang'].forEach(old => {
    if (event.cookies.get(old)) {
      event.cookies.delete(old, { path: '/' });
    }
  });
  
  // Get locale from URL parameter first (highest priority)
  let locale = event.url.searchParams.get('locale');
  
  // Validate URL locale parameter
  if (locale && !i18n.isAvailableLanguageTag(locale)) {
    locale = null;
  }
  
  // Fallback to cookie if no valid URL locale
  if (!locale) {
    locale = event.cookies.get(COOKIES.LOCALE);
  }
  
  // Detect from headers if no cookie or URL param
  if (!locale) {
    const acceptLang = event.request.headers.get('accept-language');
    if (acceptLang) {
      const browserLang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      locale = i18n.isAvailableLanguageTag(browserLang) ? browserLang : 'en';
    } else {
      locale = 'en';
    }
  }
  
  // Update cookie if locale was set via URL parameter and consent exists
  if (event.url.searchParams.get('locale') && checkServerConsent(event.cookies, 'functional')) {
    event.cookies.set(COOKIES.LOCALE, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: !dev
    });
  } else if (!event.cookies.get(COOKIES.LOCALE) && checkServerConsent(event.cookies, 'functional')) {
    // Set cookie only if functional consent exists and no cookie already set
    event.cookies.set(COOKIES.LOCALE, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: !dev
    });
  }
  
  // Apply locale
  if (locale && i18n.isAvailableLanguageTag(locale)) {
    i18n.setLanguageTag(locale as any);
  } else {
    i18n.setLanguageTag('en');
  }
  
  event.locals.locale = i18n.languageTag();
  
  return resolve(event, {
    transformPageChunk: ({ html }) => 
      html.replace('<html', `<html lang="${event.locals.locale}"`)
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  // CRITICAL AUTH PATTERN: This MUST stay exactly as is
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Performance optimization: Skip auth checks for static assets and public routes
  const pathname = event.url.pathname;
  const publicRoutes = ['/api/health', '/api/debug', '/api/webhooks'];
  const staticPaths = ['/favicon.ico', '/_app/', '/images/', '/assets/'];
  
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      staticPaths.some(path => pathname.startsWith(path))) {
    return resolve(event);
  }

  // Only protect explicitly protected routes - preserving existing logic
  if (!session && event.route.id?.startsWith('/(protected)')) {
    if (isDebug) console.log(`🔒 Redirecting unauthenticated user from ${pathname} to /login`);
    throw redirect(303, '/login');
  }

  // Performance: Add session context for downstream handlers
  if (session && user) {
    // Add performance metadata for monitoring
    const sessionAge = Date.now() - new Date(session.expires_at || 0).getTime();
    if (isDebug && sessionAge > 0) {
      console.log(`⏱️ Session expires in ${Math.floor(sessionAge / 1000 / 60)} minutes`);
    }
  }

  // Let individual page load functions handle their own redirect logic
  // to avoid conflicts and redirect loops
  return resolve(event);
};

export const handle = SENTRY_DSN ? sequence(sentryHandle(), languageHandler, supabase, authGuard) : sequence(languageHandler, supabase, authGuard);

// Enhanced error handler with better debugging and user experience
export const handleError: HandleServerError = SENTRY_DSN ? handleErrorWithSentry() : (async ({ error, event }) => {
  const errorId = Math.random().toString(36).substring(2, 15);
  
  // Enhanced error logging for debugging
  if (isDebug) {
    console.error(`❌ Error [${errorId}] on ${event.url.pathname}:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userAgent: event.request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });
  }

  // Categorize errors for better user experience
  let userMessage = 'Internal Server Error';
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Auth-related errors
    if (message.includes('supabase') || message.includes('auth') || message.includes('session')) {
      userMessage = 'Authentication service error. Please try refreshing the page or logging in again.';
    }
    // Database errors
    else if (message.includes('database') || message.includes('postgres')) {
      userMessage = 'Database service temporarily unavailable. Please try again in a moment.';
    }
    // Network/timeout errors
    else if (message.includes('timeout') || message.includes('fetch') || message.includes('network')) {
      userMessage = 'Network error. Please check your connection and try again.';
    }
    // Rate limiting
    else if (message.includes('rate limit') || message.includes('too many')) {
      userMessage = 'Too many requests. Please wait a moment before trying again.';
    }
  }

  return {
    message: userMessage,
    ...(isDebug && { errorId, details: error instanceof Error ? error.message : String(error) })
  };
});
