import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Database } from '$lib/types/database.types';

/**
 * Create a Supabase client for use in the browser
 */
export const createBrowserSupabaseClient = () =>
  createBrowserClient<Database>(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);