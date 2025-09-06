import type { Cookies, Handle, RequestEvent } from '@sveltejs/kit';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

// Public API types
export interface AuthHelpers<Database> {
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

export function createAuthHelpers<Database>(options: CreateClientOptions): AuthHelpers<Database> {
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
    return client as unknown as SupabaseClient<Database>;
  }

  async function safeGetSession(event: RequestEvent) {
    if ((event.locals as any).__sessionCache !== undefined) {
      return (event.locals as any).__sessionCache as { session: Session | null; user: User | null };
    }
    let result: { session: Session | null; user: User | null } = { session: null, user: null };
    try {
      const { data: { session } } = await event.locals.supabase.auth.getSession();
      if (!session) {
        (event.locals as any).__sessionCache = result;
        return result;
      }
      const { data: { user }, error } = await event.locals.supabase.auth.getUser();
      if (error || !user) {
        (event.locals as any).__sessionCache = result;
        return result;
      }
      result = { session, user };
    } catch {
      result = { session: null, user: null };
    }
    (event.locals as any).__sessionCache = result;
    return result;
  }

  return { createSupabaseServerClient, safeGetSession };
}

// Utility guard for admin; simple placeholder to avoid duplication across apps
export async function assertAdmin(event: RequestEvent, predicate: (user: User) => Promise<boolean> | boolean) {
  const { user } = await (event.locals as any).safeGetSession();
  if (!user) return false;
  return await predicate(user);
}


