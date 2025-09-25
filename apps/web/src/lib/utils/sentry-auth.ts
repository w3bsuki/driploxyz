/**
 * Sentry Authentication Integration
 * 
 * This module provides utilities to integrate Sentry error monitoring
 * with user authentication events and context.
 */

import { browser } from '$app/environment';
import type { User } from '@supabase/supabase-js';
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
  } catch {
    // Intentionally empty - Sentry errors are non-critical
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
  } catch {
    // Intentionally empty - Sentry errors are non-critical
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
  } catch {
    // Intentionally empty - Sentry errors are non-critical
  }
}

/**
 * Track session state changes
 * Uses validated user object for secure monitoring
 */
export function trackSessionChange(
  user: User | null,
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
): void {
  if (!browser) return;

  try {
    if (user) {
      setSentryUser({
        id: user.id,
        email: user.email,
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
        hasUser: !!user,
        userId: user?.id
      }
    );
  } catch {
    // Intentionally empty - Sentry errors are non-critical
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
  } catch {
    // Intentionally empty - Sentry errors are non-critical
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
  } catch {
    // Intentionally empty - Sentry errors are non-critical
  }
}