/**
 * CONSOLIDATED AUTH SYSTEM
 * Single source of truth for all authentication in the web app.
 *
 * Modern SvelteKit 2 + Supabase SSR + Svelte 5 runes implementation.
 * Replaces the fragmented auth system with a clean, production-ready solution.
 */

import { redirect } from '@sveltejs/kit';
import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
// Avoid importing from $env/static/public to prevent build-time failures
import { dev } from '$app/environment';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

// Type exports
export type AuthUser = User;
export type AuthSession = Session;
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SupabaseAuthClient = SupabaseClient<Database>;

// Auth state interface
export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
}

const SUPABASE_CONFIG_ERROR_MESSAGE =
  'Missing Supabase configuration. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY. See apps/web/.env.example.';

export class SupabaseConfigError extends Error {
  constructor(message = SUPABASE_CONFIG_ERROR_MESSAGE) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedSupabaseConfig: SupabaseConfig | null = null;
let cachedSupabaseConfigError: SupabaseConfigError | null = null;

function resolveSupabaseConfig(): SupabaseConfig {
  if (cachedSupabaseConfig) {
    return cachedSupabaseConfig;
  }

  if (cachedSupabaseConfigError) {
    throw cachedSupabaseConfigError;
  }

  // Use static environment variables from SvelteKit
  const supabaseUrl = PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    cachedSupabaseConfig = { url: supabaseUrl, anonKey: supabaseAnonKey } satisfies SupabaseConfig;
    return cachedSupabaseConfig;
  }

  const error = new SupabaseConfigError();
  cachedSupabaseConfigError = error;

  if (dev) {
    console.warn(
      '[Auth] Supabase environment variables missing – check .env file in apps/web.'
    );
  }

  throw error;
}

/**
 * SERVER-SIDE AUTH HELPERS
 */

/**
 * Create Supabase server client with proper SSR cookie handling
 */
export function createServerSupabase(cookies: Cookies, fetch?: typeof globalThis.fetch): SupabaseAuthClient {
  const { url, anonKey } = resolveSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            path: '/',
            // Use httpOnly for SSR auth cookies; Supabase client reads/writes these
            httpOnly: true,
            sameSite: 'lax',
            secure: !import.meta.env.DEV,
            maxAge: 60 * 60 * 24 * 365, // 1 year
            ...options
          });
        });
      }
    },
    global: { fetch }
  });
}

/**
 * Get session with validation - single source of truth
 * Uses simple, efficient validation without over-caching
 */
export async function getServerSession(
  event: RequestEvent
): Promise<{ session: AuthSession | null; user: AuthUser | null }> {
  try {
    // Use the existing Supabase client if available
    const supabase = event.locals.supabase || createServerSupabase(event.cookies, event.fetch);

    // Use getUser() for secure authentication (contacts Supabase Auth server)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { session: null, user: null };
    }

    // Get the session for the authenticated user
    const { data: { session } } = await supabase.auth.getSession();

    return { session, user };
  } catch (error) {
    console.warn('[Auth] Session validation failed:', error);
    return { session: null, user: null };
  }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(
  supabase: SupabaseAuthClient,
  userId: string
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return error ? null : data;
  } catch {
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  supabase: SupabaseAuthClient,
  userId: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
}

/**
 * CLIENT-SIDE AUTH HELPERS
 */

/**
 * Create Supabase browser client for client-side operations
 */
export function createBrowserSupabase(): SupabaseAuthClient {
  const { url, anonKey } = resolveSupabaseConfig();

  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions: {
      sameSite: 'lax',
      secure: !import.meta.env.DEV
    }
  });
}

/**
 * AUTH GUARDS AND UTILITIES
 */

/**
 * Require authentication - throw redirect if not authenticated
 */
export function requireAuth(user: AuthUser | null, redirectTo = '/login') {
  if (!user) {
    redirect(303, redirectTo);
  }
}

/**
 * Require no auth - redirect if already authenticated
 */
export function requireNoAuth(user: AuthUser | null, redirectTo = '/') {
  if (user) {
    redirect(303, redirectTo);
  }
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(profile: Profile | null): boolean {
  return profile?.onboarding_completed === true;
}

/**
 * Check if user needs onboarding redirect
 */
export function needsOnboardingRedirect(
  user: AuthUser | null,
  profile: Profile | null,
  currentPath: string
): boolean {
  if (!user) return false;

  // Skip onboarding check for auth-related paths - must match layout skip paths
  const skipPaths = ['/onboarding', '/api', '/login', '/signup', '/logout', '/auth'];
  if (skipPaths.some(path => currentPath.startsWith(path))) {
    return false;
  }

  return !hasCompletedOnboarding(profile);
}

/**
 * Check if user can perform seller actions
 */
export function canSell(profile: Profile | null): boolean {
  if (!profile || !hasCompletedOnboarding(profile)) {
    return false;
  }

  return !!(
    profile.username &&
    profile.full_name &&
    profile.payout_method
  );
}

/**
 * Check if user is admin
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin';
}

/**
 * Get user display name
 */
export function getDisplayName(profile: Profile | null): string {
  if (!profile) return 'User';
  return profile.username || profile.full_name || 'User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(profile: Profile | null): string {
  if (!profile) return '?';

  if (profile.full_name) {
    return profile.full_name
      .split(' ')
      .map((name: string) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  if (profile.username) {
    return profile.username.charAt(0).toUpperCase();
  }

  return '?';
}

/**
 * Sign out user (client-side only)
 */
export async function signOut(supabase: SupabaseAuthClient) {
  if (typeof window === 'undefined') {
    throw new Error('signOut can only be called on the client side');
  }

  await supabase.auth.signOut();
  window.location.href = '/';
}

/**
 * ROUTE PROTECTION HELPERS
 */

/**
 * Create auth guard for page load functions
 */
export function createAuthGuard(options: {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: string;
} = {}) {
  return (user: AuthUser | null, profile: Profile | null) => {
    if (options.requireAuth && !user) {
      redirect(303, options.redirectTo || '/login');
    }

    if (options.requireAdmin && !isAdmin(profile)) {
      redirect(303, '/unauthorized');
    }

    if (options.requireOnboarding && !hasCompletedOnboarding(profile)) {
      redirect(303, '/onboarding');
    }

    return { user, profile };
  };
}
