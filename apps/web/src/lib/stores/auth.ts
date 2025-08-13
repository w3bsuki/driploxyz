import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { AuthState } from '$lib/auth';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Core auth stores
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const profile = writable<Profile | null>(null);
export const authLoading = writable<boolean>(true);

// Derived auth state
export const authState: Readable<AuthState> = derived(
  [user, session, profile, authLoading],
  ([$user, $session, $profile, $authLoading]) => ({
    user: $user,
    session: $session,
    profile: $profile,
    loading: $authLoading
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
  return $profile.full_name || $profile.username || 'User';
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

export function clearAuth() {
  user.set(null);
  session.set(null);
  profile.set(null);
  authLoading.set(false);
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