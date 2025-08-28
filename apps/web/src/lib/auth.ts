import { redirect } from '@sveltejs/kit';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
  loading: boolean;
}

/**
 * Redirects to login page if user is not authenticated
 */
export function requireAuth(user: User | null, redirectTo = '/login') {
  if (!user) {
    throw redirect(303, redirectTo);
  }
}

/**
 * Redirects to home page if user is already authenticated
 */
export function requireNoAuth(user: User | null, redirectTo = '/') {
  if (user) {
    throw redirect(303, redirectTo);
  }
}

/**
 * Checks if user has specific role
 */
export function hasRole(profile: Database['public']['Tables']['profiles']['Row'] | null, role: 'seller' | 'admin'): boolean {
  return profile?.role === role || profile?.role === 'admin';
}

/**
 * Checks if user is admin
 */
export function isAdmin(profile: Database['public']['Tables']['profiles']['Row'] | null): boolean {
  return profile?.role === 'admin';
}

/**
 * All authenticated users are regular users who can buy and sell
 */
export function isUser(profile: Database['public']['Tables']['profiles']['Row'] | null): boolean {
  return !!profile && profile.role !== 'admin';
}

/**
 * Checks if user can perform seller actions
 * Requires: onboarding_completed, username, full_name, and payout_method
 */
export function canSell(profile: Database['public']['Tables']['profiles']['Row'] | null): boolean {
  if (!profile) return false;
  
  // Must have completed onboarding
  if (!profile.onboarding_completed) return false;
  
  // Must have all required seller fields (location is NOT required)
  const hasRequiredFields = !!(
    profile.username &&
    profile.full_name &&
    profile.payout_method &&
    typeof profile.payout_method === 'object' &&
    !Array.isArray(profile.payout_method) &&
    (profile.payout_method as Record<string, any>).type &&
    (profile.payout_method as Record<string, any>).details &&
    (profile.payout_method as Record<string, any>).name
  );
  
  return hasRequiredFields;
}

/**
 * Gets the reason why user cannot sell (for user feedback)
 */
export function getCannotSellReason(profile: Database['public']['Tables']['profiles']['Row'] | null): string | null {
  if (!profile) return 'Please create an account to start selling.';
  
  if (!profile.onboarding_completed) {
    return 'Please complete your account setup to start selling.';
  }
  
  // Check specific missing fields
  const missingFields = [];
  if (!profile.username) missingFields.push('username');
  if (!profile.full_name) missingFields.push('full name');
  
  // Check payout method
  if (!profile.payout_method || typeof profile.payout_method !== 'object' || Array.isArray(profile.payout_method)) {
    missingFields.push('payout method');
  } else {
    const payout = profile.payout_method as Record<string, any>;
    if (!payout.type || !payout.details || !payout.name) {
      missingFields.push('complete payout information');
    }
  }
  
  if (missingFields.length > 0) {
    return `Please add your ${missingFields.join(', ')} to start selling.`;
  }
  
  return null; // User can sell
}

/**
 * Gets user profile from Supabase
 */
export async function getUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Signs out user and redirects - bulletproof auth state management
 */
export async function signOut(supabase: SupabaseClient<Database>) {
  // Show toast notification
  if (typeof window !== 'undefined') {
    const { toasts } = await import('@repo/ui');
    toasts.info('Signing you out...');
  }
  
  try {
    // CRITICAL: Call Supabase auth.signOut() directly to trigger auth state listeners
    // This will automatically clear cookies and trigger the SIGNED_OUT event in layout.svelte
    await supabase.auth.signOut();
    
    // Clear client-side auth stores immediately for instant UI feedback
    const { clearAuth } = await import('$lib/stores/auth');
    clearAuth();
    
  } catch (error) {
    console.error('Sign out error:', error);
    
    // Fallback: Force clear everything if Supabase signOut fails
    try {
      const { clearAuth } = await import('$lib/stores/auth');
      clearAuth();
      
      // Clear all Supabase cookies manually as fallback
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          if (name.startsWith('sb-') || name.includes('supabase')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          }
        });
      }
    } catch (fallbackError) {
      console.error('Fallback sign out error:', fallbackError);
    }
  }
  
  // Small delay to show the toast and let auth state propagate
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Use proper SvelteKit navigation with targeted invalidation
  if (typeof window !== 'undefined') {
    const { goto, invalidate } = await import('$app/navigation');
    await invalidate('supabase:auth'); // Only invalidate auth, not everything
    await goto('/', { replaceState: true });
  }
}


/**
 * Checks if profile is complete enough for selling
 */
export function isProfileCompleteForSelling(profile: Database['public']['Tables']['profiles']['Row'] | null): boolean {
  if (!profile) return false;
  
  return !!(
    profile.full_name &&
    profile.username &&
    profile.location &&
    profile.bio
  );
}

/**
 * Auth guard for server load functions
 */
export function createAuthGuard(options: {
  requireAuth?: boolean;
  requireRole?: 'seller' | 'admin';
  redirectTo?: string;
} = {}) {
  return async function authGuard(
    user: User | null,
    profile: Database['public']['Tables']['profiles']['Row'] | null
  ) {
    if (options.requireAuth && !user) {
      throw redirect(303, options.redirectTo || '/login');
    }

    if (options.requireRole && !hasRole(profile, options.requireRole)) {
      throw redirect(303, '/unauthorized');
    }

    return { user, profile };
  };
}