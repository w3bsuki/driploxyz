import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

/**
 * Create a Supabase client that uses Clerk session tokens
 * This allows us to use Clerk for auth while keeping Supabase for everything else
 */
export function createSupabaseClientWithClerk(getToken: () => Promise<string | null>) {
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          // Clerk tokens will be passed as Bearer tokens
          Authorization: async () => {
            const token = await getToken();
            return token ? `Bearer ${token}` : '';
          }
        }
      },
      auth: {
        // Disable Supabase Auth since we're using Clerk
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}