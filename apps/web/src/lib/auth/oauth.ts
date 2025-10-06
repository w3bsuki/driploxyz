/**
 * OAuth Authentication Utilities
 *
 * Handles OAuth authentication for various providers (Google, Facebook, GitHub)
 * with proper error handling and configuration management.
 */

import { browser } from '$app/environment';
import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_FACEBOOK_CLIENT_ID, PUBLIC_GITHUB_CLIENT_ID } from '$env/static/public';

export interface OAuthProvider {
  id: 'google' | 'facebook' | 'github';
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface OAuthConfig {
  providers: OAuthProvider[];
  redirectTo: string;
}

/**
 * Get available OAuth providers based on environment variables
 */
export function getOAuthProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];

  if (PUBLIC_GOOGLE_CLIENT_ID) {
    providers.push({
      id: 'google',
      name: 'Google',
      icon: '🔍',
      color: 'bg-blue-600 hover:bg-blue-700',
      enabled: true
    });
  }

  if (PUBLIC_FACEBOOK_CLIENT_ID) {
    providers.push({
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-700 hover:bg-blue-800',
      enabled: true
    });
  }

  if (PUBLIC_GITHUB_CLIENT_ID) {
    providers.push({
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      color: 'bg-gray-800 hover:bg-gray-900',
      enabled: true
    });
  }

  return providers;
}

/**
 * Check if any OAuth providers are configured
 */
export function hasOAuthProviders(): boolean {
  return getOAuthProviders().length > 0;
}

/**
 * Initiate OAuth sign in with a specific provider
 */
export async function signInWithOAuth(provider: OAuthProvider['id'], redirectTo?: string): Promise<void> {
  if (!browser) {
    throw new Error('OAuth can only be initiated from the browser');
  }

  try {
    const { createBrowserSupabase } = await import('./index');
    const supabase = createBrowserSupabase();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      throw new Error(`OAuth sign in failed: ${error.message}`);
    }

    // The redirect will happen automatically
  } catch (err) {
    console.error(`[OAuth] Error signing in with ${provider}:`, err);
    throw err;
  }
}

/**
 * Handle OAuth callback errors
 */
export function handleOAuthError(error: string, errorDescription?: string): string {
  switch (error) {
    case 'access_denied':
      return 'You cancelled the sign-in process. Please try again.';
    case 'auth_failed':
      return 'Authentication failed. Please try again.';
    case 'session_exchange_failed':
      return 'Unable to complete sign in. Please try again.';
    case 'auth_callback_failed':
      return 'Authentication callback failed. Please try signing in again.';
    case 'no_auth_code':
      return 'Authentication code missing. Please try signing in again.';
    case 'invalid_provider':
      return 'Invalid authentication provider.';
    case 'provider_not_configured':
      return 'This authentication provider is not configured.';
    default:
      return errorDescription || error || 'An unknown error occurred during authentication.';
  }
}

/**
 * Get OAuth provider from URL search params
 */
export function getOAuthProviderFromUrl(url: URL): OAuthProvider['id'] | null {
  // Try to get provider from various possible URL parameters
  const provider = url.searchParams.get('provider') ||
                   url.searchParams.get('auth_provider') ||
                   url.searchParams.get('oauth_provider');

  if (provider && ['google', 'facebook', 'github'].includes(provider)) {
    return provider as OAuthProvider['id'];
  }

  return null;
}

/**
 * Format OAuth error for display
 */
export function formatOAuthError(url: URL): { message: string; type: 'error' | 'warning' } {
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (!error) {
    return { message: '', type: 'error' as const };
  }

  const message = handleOAuthError(error, errorDescription || undefined);

  // Determine if this is a user-cancellation vs actual error
  if (error === 'access_denied') {
    return { message, type: 'warning' as const };
  }

  return { message, type: 'error' as const };
}

/**
 * OAuth provider configuration for UI components
 */
export const OAUTH_PROVIDER_CONFIG = {
  google: {
    name: 'Continue with Google',
    icon: '/icons/google.svg',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    hoverBg: 'hover:bg-gray-50'
  },
  facebook: {
    name: 'Continue with Facebook',
    icon: '/icons/facebook.svg',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    hoverBg: 'hover:bg-blue-700'
  },
  github: {
    name: 'Continue with GitHub',
    icon: '/icons/github.svg',
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    borderColor: 'border-gray-900',
    hoverBg: 'hover:bg-gray-800'
  }
} as const;

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required Supabase config
  if (!PUBLIC_GOOGLE_CLIENT_ID && !PUBLIC_FACEBOOK_CLIENT_ID && !PUBLIC_GITHUB_CLIENT_ID) {
    errors.push('No OAuth providers configured. Set environment variables for at least one provider.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}