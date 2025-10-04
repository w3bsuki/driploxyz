import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

// Public API types
export interface AuthHelpers {
  createSupabaseServerClient: (
    cookies: Cookies,
    fetchFn?: typeof globalThis.fetch
  ) => SupabaseClient<Database>;
  safeGetSession: (event: RequestEvent) => Promise<{ session: Session | null; user: User | null }>;
}

export interface CreateClientOptions {
  url: string;
  anonKey: string;
  cookieDefaults?: Partial<CookieOptions>;
}

interface AppLocals {
  supabase?: SupabaseClient<Database>;
  __sessionCache?: { session: Session | null; user: User | null };
  safeGetSession?: () => Promise<{ session: Session | null; user: User | null }>;
  [key: string]: unknown;
}

export function createAuthHelpers(options: CreateClientOptions): AuthHelpers {
  const { url, anonKey, cookieDefaults } = options;

  function createSupabaseServerClient(cookies: Cookies, fetchFn?: typeof globalThis.fetch) {
    const client = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll: () => cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, { path: '/', sameSite: 'lax', ...cookieDefaults, ...options });
          });
        }
      },
      global: {
        fetch: fetchFn
      }
    });
    return client;
  }

  async function safeGetSession(event: RequestEvent) {
    const locals = event.locals as unknown as AppLocals;
    if (locals.__sessionCache !== undefined) {
      return locals.__sessionCache as { session: Session | null; user: User | null };
    }
    let result: { session: Session | null; user: User | null } = { session: null, user: null };
    try {
      if (!locals.supabase) {
        locals.__sessionCache = result;
        return result;
      }

      // Get session first - this is fast and cached by Supabase
      const { data: { session } } = await locals.supabase.auth.getSession();

      if (!session) {
        locals.__sessionCache = result;
        return result;
      }

      // Validate session expiry first
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at <= now) {
        console.warn('[Auth] Session expired', {
          expiresAt: session.expires_at,
          now,
          pathname: event.url.pathname
        });
        locals.__sessionCache = result;
        return result;
      }

      // Use getUser() to validate the session securely
      const { data: { user }, error: userError } = await locals.supabase.auth.getUser();

      if (userError || !user) {
        console.warn('[Auth] Session validation failed', {
          error: userError?.message,
          pathname: event.url.pathname
        });
        locals.__sessionCache = result;
        return result;
      }

      result = { session, user };
    } catch (error) {
      // Log rate limiting specifically for monitoring
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        console.warn('[Auth] Rate limit exceeded, using fallback', {
          pathname: event.url.pathname,
          timestamp: new Date().toISOString()
        });
      } else if (error instanceof Error) {
        console.warn('[Auth] Unexpected error during session validation', {
          error: error.message,
          pathname: event.url.pathname
        });
      }
      result = { session: null, user: null };
    }
    locals.__sessionCache = result;
    return result;
  }

  return { createSupabaseServerClient, safeGetSession };
}

// Utility guard for admin; simple placeholder to avoid duplication across apps
export async function assertAdmin(event: RequestEvent, predicate: (user: User) => Promise<boolean> | boolean) {
  const locals = event.locals as unknown as AppLocals;
  if (!locals.safeGetSession) return false;
  const { user } = await locals.safeGetSession();
  if (!user) return false;
  return await predicate(user);
}