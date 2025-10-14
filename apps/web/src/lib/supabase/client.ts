import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '@repo/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dev } from '$app/environment';

/**
 * PRODUCTION-READY BROWSER SUPABASE CLIENT
 * =========================================
 * Create a Supabase client for use in the browser with proper:
 * - Singleton pattern to prevent multiple client instances
 * - Cookie-based authentication via SSR package
 * - PKCE flow for enhanced security
 * - Automatic token refresh
 * - Error handling and validation
 * 
 * This client should ONLY be used in browser contexts (client components, actions, etc)
 * For server-side code, use the client from event.locals.supabase
 */

// Singleton memoization to avoid creating multiple clients
// Multiple clients cause repeated listeners, memory leaks, and redundant network requests
let __supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Create or return existing browser Supabase client
 * @throws {Error} If environment variables are missing
 */
export const createBrowserSupabaseClient = (): SupabaseClient<Database> => {
  // Return existing client if already created (singleton pattern)
  if (__supabaseClient) {
    return __supabaseClient;
  }

  // Validate environment variables - NEVER use fallback hardcoded values in production
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    const error = '[Supabase Client] CRITICAL: Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY environment variables';
    console.error(error);
    throw new Error(error);
  }

  // Validate URL format
  try {
    new URL(PUBLIC_SUPABASE_URL);
  } catch {
    throw new Error(`[Supabase Client] Invalid PUBLIC_SUPABASE_URL format: ${PUBLIC_SUPABASE_URL}`);
  }

  // Log only in development for debugging
  if (dev) {
    console.log('[Supabase Client] Initializing browser client with URL:', PUBLIC_SUPABASE_URL);
  }

  /**
   * Create browser client with production-ready configuration
   * See: https://supabase.com/docs/reference/javascript/initializing
   */
  __supabaseClient = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        /**
         * PKCE (Proof Key for Code Exchange) flow
         * More secure than implicit flow, required for SSR
         * See: https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr
         */
        flowType: 'pkce',
        
        /**
         * Detect session from URL parameters
         * Required for OAuth and magic link flows
         */
        detectSessionInUrl: true,
        
        /**
         * Persist session across page reloads
         * Stores session in localStorage/cookies
         */
        persistSession: true,
        
        /**
         * Automatically refresh expired tokens
         * Prevents users from being logged out unexpectedly
         */
        autoRefreshToken: true,
        
        /**
         * Debug mode - only enable in development
         * Logs auth state changes for debugging
         */
        debug: dev
      },
      
      /**
       * Global fetch options
       * Can add custom headers, retry logic, etc.
       */
      global: {
        headers: {
          'X-Client-Info': 'driplo-web-app'
        }
      }
    }
  );

  // Set up auth state change listener for debugging in development
  if (dev) {
    __supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Client] Auth state changed:', event, session?.user?.email);
    });
  }

  return __supabaseClient;
};

/**
 * Get the existing Supabase client without creating a new one
 * Useful for checking if client exists before operations
 */
export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  return __supabaseClient;
};

/**
 * Reset the Supabase client singleton
 * Useful for testing or when you need to recreate the client
 * WARNING: Only use in tests or very specific scenarios
 */
export const resetSupabaseClient = (): void => {
  if (__supabaseClient) {
    // Clean up any listeners before resetting
    __supabaseClient.removeAllChannels();
    __supabaseClient = null;
  }
};