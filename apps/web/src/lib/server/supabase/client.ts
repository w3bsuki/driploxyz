import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '@repo/database';

/**
 * Create a Supabase client for use in the browser
 * This uses SSR package for proper cookie handling in SvelteKit
 */
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = PUBLIC_SUPABASE_URL || 'https://koowfhsaqmarfdkwsfiz.supabase.co';
  const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3dmaHNhcW1hcmZka3dzZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTczNDAsImV4cCI6MjA3MTA5MzM0MH0.-lbQpF21xixgkdFtjx8Slqbe0go9h5ojN8GCGYDBDHo';

  console.log('Creating Supabase client with URL:', supabaseUrl);

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  });
};