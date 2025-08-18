import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { invalidate } from '$app/navigation';
import type { Database } from '$lib/types/database.types';

// Get Sentry DSN from environment (may be undefined)
const PUBLIC_SENTRY_DSN = env.PUBLIC_SENTRY_DSN;

// Only initialize Sentry if DSN is present
if (PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    environment: dev ? 'development' : 'production',
    tracesSampleRate: dev ? 1.0 : 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration(),
    ],
  });
}

// Initialize Supabase client for auth state synchronization
const supabase = createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// CRITICAL: Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    // Invalidate all data when auth state changes to refetch with new session
    invalidate('supabase:auth');
  }
});

// Export error handler (Sentry-enabled or fallback)
export const handleError = PUBLIC_SENTRY_DSN 
  ? handleErrorWithSentry() 
  : (async ({ error, event }: { error: unknown; event: any }) => {
      console.error('Client error:', error);
      return {
        message: 'An error occurred'
      };
    });