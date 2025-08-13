import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { AuthState } from '$lib/auth';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Core auth stores
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const profile = writable<Profile | null>(null);
export const authLoading = writable<boolean>(true);
export const supabaseClient = writable<SupabaseClient<Database> | null>(null);

// Enhanced auth state with supabase client
export const authState: Readable<AuthState & { supabase: SupabaseClient<Database> | null }> = derived(
  [user, session, profile, authLoading, supabaseClient],
  ([$user, $session, $profile, $authLoading, $supabaseClient]) => ({
    user: $user,
    session: $session,
    profile: $profile,
    loading: $authLoading,
    supabase: $supabaseClient
  })
);

// Derived computed values
export const isAuthenticated = derived(user, ($user) => !!$user);

export const isAdmin = derived(profile, ($profile) => $profile?.role === 'admin');

export const isSeller = derived(profile, ($profile) => 
  $profile?.role === 'seller' || $profile?.role === 'admin'
);

export const canSell = derived(profile, ($profile) => {
  if (!$profile) return false;
  return (
    ($profile.role === 'seller' || $profile.role === 'admin') &&
    !!$profile.full_name &&
    !!$profile.username &&
    !!$profile.location
  );
});

export const displayName = derived(profile, ($profile) => {
  if (!$profile) return 'Anonymous';
  return $profile.username || $profile.full_name || 'User';
});

export const userInitials = derived(profile, ($profile) => {
  if (!$profile?.full_name) return '?';
  return $profile.full_name
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
});

// Auth actions
export function setAuthState(newUser: User | null, newSession: Session | null) {
  user.set(newUser);
  session.set(newSession);
}

export function setProfile(newProfile: Profile | null) {
  profile.set(newProfile);
}

export function setAuthLoading(loading: boolean) {
  authLoading.set(loading);
}

export function setSupabaseClient(client: SupabaseClient<Database> | null) {
  supabaseClient.set(client);
}

export function clearAuth() {
  user.set(null);
  session.set(null);
  profile.set(null);
  authLoading.set(false);
  supabaseClient.set(null);
}

// Local storage helpers (browser only)
export const authStorage = {
  setRememberMe(remember: boolean) {
    if (browser) {
      localStorage.setItem('driplo_remember_me', remember.toString());
    }
  },
  
  getRememberMe(): boolean {
    if (browser) {
      return localStorage.getItem('driplo_remember_me') === 'true';
    }
    return false;
  },
  
  clearRememberMe() {
    if (browser) {
      localStorage.removeItem('driplo_remember_me');
    }
  }
};