/**
 * Enhanced Toast Store - @repo/ui
 * Extends modern toast system with app-specific helpers
 * 
 * This module provides backward-compatible API for apps using the legacy toast system.
 * Includes support for error handling integration.
 */

import { toasts as modernToasts, toastHelpers } from './primitives/toast/store.svelte';
import type { ToastType, ToastStoreOptions } from './primitives/toast/types';

/**
 * Error details interface for fromError compatibility
 */
export interface ErrorDetails {
  type: string;
  code?: string;
  userMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryable?: boolean;
}

/**
 * Create enhanced toast store with app-specific helpers
 */
function createEnhancedToast() {
  return {
    // Re-export core methods
    show: (message: string, type: ToastType = 'info', options: ToastStoreOptions = {}) => {
      return modernToasts.show(message, type, options);
    },
    
    success: (message: string, options: ToastStoreOptions = {}) => {
      return modernToasts.success(message, options);
    },
    
    error: (message: string, options: ToastStoreOptions = {}) => {
      return modernToasts.error(message, options);
    },
    
    warning: (message: string, options: ToastStoreOptions = {}) => {
      return modernToasts.warning(message, options);
    },
    
    info: (message: string, options: ToastStoreOptions = {}) => {
      return modernToasts.info(message, options);
    },
    
    dismiss: (id: string) => {
      modernToasts.dismiss(id);
    },
    
    dismissAll: () => {
      modernToasts.dismissAll();
    },
    
    /**
     * Create toast from ErrorDetails object
     * Provides smart toast type selection based on error severity
     */
    fromError: (errorDetails: ErrorDetails, options: ToastStoreOptions = {}): string => {
      const severity = errorDetails.severity;
      const toastType: ToastType = severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warning';
      
      // Build description with optional error code
      const description = errorDetails.code 
        ? `${errorDetails.userMessage} (Code: ${errorDetails.code})`
        : errorDetails.userMessage;
      
      // Add retry action if error is retryable
      const toastOptions: ToastStoreOptions = {
        ...options,
        duration: severity === 'CRITICAL' ? 10000 : severity === 'HIGH' ? 8000 : 6000,
        persistent: severity === 'CRITICAL',
        action: errorDetails.retryable ? {
          label: 'Retry',
          onclick: () => {
            // Emit retry event for app to handle
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('toast-retry', {
                detail: { errorDetails }
              }));
            }
          },
          variant: 'secondary'
        } : undefined
      };
      
      return modernToasts.show(description, toastType, toastOptions);
    },
    
    /**
     * Backward compatibility aliases
     */
    add: (toastData: { message: string; type: ToastType; duration?: number; dismissible?: boolean; persistent?: boolean }) => {
      return modernToasts.show(toastData.message, toastData.type, {
        duration: toastData.duration,
        dismissible: toastData.dismissible,
        persistent: toastData.persistent
      });
    },
    
    remove: (id: string) => {
      modernToasts.dismiss(id);
    },
    
    clear: () => {
      modernToasts.dismissAll();
    },
    
    // Re-export helpers
    helpers: toastHelpers
  };
}

// Export singleton instance
export const toast = createEnhancedToast();

// Also export for different import styles
export const toasts = toast;

// Re-export types
export type { Toast, ToastType, ToastStoreOptions } from './primitives/toast/types';
