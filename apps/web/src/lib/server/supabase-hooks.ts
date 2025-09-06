import { env as publicEnv } from '$env/dynamic/public';
import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { Database } from '@repo/database';
import type { RequestEvent } from '@sveltejs/kit';
import { createAuthHelpers } from '@repo/core-auth';

/**
 * Setup Supabase client with auth handling for hooks
 * Simplified following official Supabase SvelteKit documentation
 */
export async function setupAuth(event: RequestEvent): Promise<void> {
  // Skip during build time
  if (building) {
    return;
  }
  
  // Check for required configuration
  const PUBLIC_SUPABASE_URL = publicEnv.PUBLIC_SUPABASE_URL;
  const PUBLIC_SUPABASE_ANON_KEY = publicEnv.PUBLIC_SUPABASE_ANON_KEY;

  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw error(500, 'Server configuration error. Please contact support.');
  }

  // Create Supabase client via shared helper
  const { createSupabaseServerClient, safeGetSession } = createAuthHelpers<Database>({
    url: PUBLIC_SUPABASE_URL,
    anonKey: PUBLIC_SUPABASE_ANON_KEY,
    cookieDefaults: { sameSite: 'lax' }
  });
  event.locals.supabase = createSupabaseServerClient(event.cookies, event.fetch);

  /**
   * Safe session getter with per-request caching and proper validation order
   * Following Supabase best practices: getSession() first, then validate if needed
   */
  event.locals.safeGetSession = () => safeGetSession(event);
}
