import { createServerClient } from '@supabase/ssr';
import {
  getServiceRoleConfig,
  hasServiceRoleKey,
  requireServiceRoleConfig
} from './supabase-service-role';

type CookieAdapter = {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  remove: (name: string, options?: Record<string, unknown>) => void;
  getAll?: () => Array<{ name: string; value: string }>;
  setAll?: (cookies: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => void;
};

/**
 * Create a Supabase client for server-side use with service role key
 * WARNING: This bypasses RLS and should only be used in secure server contexts
 * NEVER import this in client-side code or expose to users
 * Only use for admin operations where RLS bypass is explicitly required
 * 
 * This file uses .server.js naming convention to ensure it's never bundled in client code
 */
export const createServiceClient = (options?: { cookies?: Partial<CookieAdapter> }) => {
  const { supabaseUrl, serviceRoleKey } = requireServiceRoleConfig();

  const fallbackCookies: CookieAdapter = {
    get: () => undefined,
    set: () => {},
    remove: () => {},
    getAll: options?.cookies?.getAll,
    setAll: options?.cookies?.setAll
  };

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get: options?.cookies?.get ?? fallbackCookies.get,
      set: options?.cookies?.set ?? fallbackCookies.set,
      remove: options?.cookies?.remove ?? fallbackCookies.remove
    }
  });
};

export const supabaseServiceRole = {
  createClient: createServiceClient,
  getConfig: getServiceRoleConfig,
  hasKey: hasServiceRoleKey
};
