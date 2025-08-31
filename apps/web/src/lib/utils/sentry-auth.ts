/**
 * Sentry Authentication Integration
 * 
 * This module provides utilities to integrate Sentry error monitoring
 * with user authentication events and context.
 */

import { browser } from '$app/environment';
import type { User, Session } from '@supabase/supabase-js';
import { setSentryUser, addSentryBreadcrumb, captureSentryError } from '$lib/server/sentry-config';

/**
 * Track user login for Sentry context
 */
export function trackUserLogin(user: User): void {
  if (!browser) return;
  
  try {
    // Set user context
    setSentryUser({
      id: user.id,
      email: user.email,
    });
    
    // Add breadcrumb
    addSentryBreadcrumb(
      `User logged in: ${user.email}`,
      'auth',
      'info',
      {
        userId: user.id,
        provider: user.app_metadata?.provider || 'unknown'
      }
    );
  } catch (error) {
    console.warn('Failed to track user login in Sentry:', error);
  }
}

/**
 * Track user logout for Sentry context
 */
export function trackUserLogout(): void {
  if (!browser) return;
  
  try {
    // Add breadcrumb before clearing user
    addSentryBreadcrumb('User logged out', 'auth', 'info');
    
    // Clear user context
    setSentryUser(null);
  } catch (error) {
    console.warn('Failed to track user logout in Sentry:', error);
  }
}

/**
 * Track authentication errors
 */
export function trackAuthError(
  error: Error | string,
  context?: {
    action?: 'login' | 'signup' | 'logout' | 'refresh' | 'reset_password';
    provider?: string;
    email?: string;
  }
): void {
  try {
    const errorMessage = error instanceof Error ? error.message : error;
    
    // Don't track sensitive errors
    const sensitiveKeywords = ['password', 'token', 'secret', 'key'];
    if (sensitiveKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword)
    )) {
      console.warn('Skipping sensitive auth error from Sentry tracking');
      return;
    }
    
    captureSentryError(error, {
      tags: {
        category: 'authentication',
        action: context?.action || 'unknown',
        provider: context?.provider || 'unknown'
      },
      extra: {
        userEmail: context?.email ? context.email.substring(0, 3) + '***' : undefined,
        timestamp: new Date().toISOString()
      },
      level: 'error',
      fingerprint: ['auth-error', context?.action || 'unknown']
    });
    
    // Add breadcrumb
    addSentryBreadcrumb(
      `Auth error: ${context?.action || 'unknown'}`,
      'auth',
      'error',
      {
        action: context?.action,
        provider: context?.provider,
        errorType: error instanceof Error ? error.constructor.name : 'string'
      }
    );
  } catch (sentryError) {
    console.warn('Failed to track auth error in Sentry:', sentryError);
  }
}

/**
 * Track session state changes
 */
export function trackSessionChange(
  session: Session | null,
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
): void {
  if (!browser) return;
  
  try {
    if (session?.user) {
      setSentryUser({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      setSentryUser(null);
    }
    
    addSentryBreadcrumb(
      `Session ${event.toLowerCase()}`,
      'auth',
      'info',
      {
        event,
        hasSession: !!session,
        userId: session?.user?.id
      }
    );
  } catch (error) {
    console.warn('Failed to track session change in Sentry:', error);
  }
}

/**
 * Track profile-related errors
 */
export function trackProfileError(
  error: Error | string,
  context?: {
    action?: 'load' | 'update' | 'create' | 'delete';
    userId?: string;
  }
): void {
  try {
    captureSentryError(error, {
      tags: {
        category: 'profile',
        action: context?.action || 'unknown'
      },
      extra: {
        userId: context?.userId,
        timestamp: new Date().toISOString()
      },
      level: 'error',
      fingerprint: ['profile-error', context?.action || 'unknown']
    });
  } catch (sentryError) {
    console.warn('Failed to track profile error in Sentry:', sentryError);
  }
}

/**
 * Track permission/authorization errors
 */
export function trackPermissionError(
  error: Error | string,
  context?: {
    resource?: string;
    action?: string;
    userId?: string;
  }
): void {
  try {
    captureSentryError(error, {
      tags: {
        category: 'permission',
        resource: context?.resource || 'unknown',
        action: context?.action || 'unknown'
      },
      extra: {
        userId: context?.userId,
        timestamp: new Date().toISOString()
      },
      level: 'warning',
      fingerprint: ['permission-error', context?.resource || 'unknown']
    });
  } catch (sentryError) {
    console.warn('Failed to track permission error in Sentry:', sentryError);
  }
}