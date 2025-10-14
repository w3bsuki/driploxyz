import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

/**
 * Supabase configuration - uses the same instance as the web app
 * URL and keys should match apps/web/.env
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://koowfhsaqmarfdkwsfiz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3dmaHNhcW1hcmZka3dzZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTczNDAsImV4cCI6MjA3MTA5MzM0MH0.-lbQpF21xixgkdFtjx8Slqbe0go9h5ojN8GCGYDBDHo';

/**
 * Supabase client for React Native
 * - Uses AsyncStorage for session persistence (encrypted on device)
 * - Auto-refreshes tokens
 * - Same database as web app (shared users, products, etc.)
 * - PKCE flow for secure OAuth
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Handled by deep linking in mobile
    flowType: 'pkce', // Same as web for security
  },
});