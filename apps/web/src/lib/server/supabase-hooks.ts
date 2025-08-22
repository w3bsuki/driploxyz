import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { building, dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { Database } from '@repo/database';
import type { RequestEvent } from '@sveltejs/kit';
import { validateJWT, detectMobile } from './utils.js';

// Debug flag for controlled logging - use dev mode as default
const isDebug = dev;

/**
 * Setup Supabase client with auth handling for hooks
 */
export async function setupAuth(event: RequestEvent): Promise<void> {
  // Skip during build time
  if (building) {
    return;
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
        error: authError,
      } = await event.locals.supabase.auth.getUser();

      if (authError || !user) {
        if (isDebug && authError) console.warn('⚠️ Auth validation error:', authError.message);
        return { session: null, user: null };
      }

      return { session, user };
    } catch (err) {
      if (isDebug) console.warn('⚠️ Session validation failed:', err);
      return { session: null, user: null };
    }
  };
}