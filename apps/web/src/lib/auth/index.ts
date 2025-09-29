import { dev } from '$app/environment';
import { redirect, type Cookies, type RequestEvent } from '@sveltejs/kit';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { validatePublicEnv, validateServerEnv } from '$lib/env/validation';

export type AuthUser = User;
export type AuthSession = Session;
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SupabaseAuthClient = SupabaseClient<Database>;

const publicEnv = validatePublicEnv();
const SUPABASE_URL = publicEnv.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = publicEnv.PUBLIC_SUPABASE_ANON_KEY;

function resolveServiceRoleKey(): string | undefined {
  if (typeof window !== 'undefined') {
    return undefined;
  }

  const serverEnv = validateServerEnv();
  return serverEnv.SUPABASE_SERVICE_ROLE_KEY || undefined;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
}

export function createServerSupabase(
  cookies: Cookies,
  fetch: typeof globalThis.fetch = globalThis.fetch
): SupabaseAuthClient {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            httpOnly: true,
            sameSite: 'lax',
            secure: !dev,
            path: '/',
            ...options
          });
        });
      }
    },
    global: { fetch }
  });
}

export function createBrowserSupabase(): SupabaseAuthClient {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: {
      sameSite: 'lax',
      secure: !dev
    }
  });
}

export function createServiceSupabase(): SupabaseAuthClient {
  const serviceRoleKey = resolveServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }

  return createServerClient<Database>(SUPABASE_URL, serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
      remove: () => {}
    }
  });
}

export async function getServerSession(
  event: RequestEvent
): Promise<{ session: AuthSession | null; user: AuthUser | null }> {
  const supabase = createServerSupabase(event.cookies, event.fetch);

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { session: null, user: null };
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    return { session, user };
  } catch (error) {
    console.warn('[Auth] Session validation failed:', error);
    return { session: null, user: null };
  }
}

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

export function requireAuth(user: AuthUser | null, redirectTo = '/login') {
  if (!user) {
    redirect(303, redirectTo);
  }
}

export function requireNoAuth(user: AuthUser | null, redirectTo = '/') {
  if (user) {
    redirect(303, redirectTo);
  }
}

export function hasCompletedOnboarding(profile: Profile | null): boolean {
  return profile?.onboarding_completed === true;
}

export function needsOnboardingRedirect(
  user: AuthUser | null,
  profile: Profile | null,
  currentPath: string
): boolean {
  if (!user) return false;

  const skipPaths = ['/onboarding', '/logout', '/api/'];
  if (skipPaths.some((path) => currentPath.startsWith(path))) {
    return false;
  }

  return !hasCompletedOnboarding(profile);
}

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

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin';
}

export function getDisplayName(profile: Profile | null): string {
  if (!profile) return 'User';
  return profile.username || profile.full_name || 'User';
}

export function getUserInitials(profile: Profile | null): string {
  if (!profile) return '?';

  if (profile.full_name) {
    return profile.full_name
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  if (profile.username) {
    return profile.username.charAt(0).toUpperCase();
  }

  return '?';
}

export async function signOut(supabase: SupabaseAuthClient) {
  if (typeof window === 'undefined') {
    throw new Error('signOut can only be called on the client side');
  }

  await supabase.auth.signOut();
  window.location.href = '/';
}

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
