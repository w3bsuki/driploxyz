/**
 * Toast Primitives - Svelte 5 with Melt UI
 * Comprehensive toast system for mobile-first applications
 */

// Components
export { default as Toast } from './Toast.svelte';
export { default as ToastProvider } from './ToastProvider.svelte';
export { default as ToastContainer } from './ToastContainer.svelte';

// Store and helpers
export { toasts, toastHelpers, setToastProvider } from './store.svelte';

// Modern alias for the toast store
export { toasts as modernToasts } from './store.svelte';

// Types
export type {
  Toast as ToastData,
  ToastType,
  ToastPosition,
  ToastAction,
  ToastProps,
  ToastProviderProps,
  ToastStoreOptions,
  ToastStore
} from './types';

// Import the toast store for use in the legacy compatibility layer
import { toasts, toastHelpers } from './store.svelte';

// Re-export for backwards compatibility with existing code
export const toastStore = {
  // Legacy methods that map to new toast store
  success: (message: string, duration = 5000) => toasts.success(message, { duration }),
  error: (message: string, duration = 5000) => toasts.error(message, { duration }),
  warning: (message: string, duration = 5000) => toasts.warning(message, { duration }),
  info: (message: string, duration = 5000) => toasts.info(message, { duration }),
  show: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => 
    toasts.show(message, type, { duration }),
  remove: (id: string) => toasts.dismiss(id),
  clear: () => toasts.dismissAll()
};

// Advanced patterns for common use cases
export const toastPatterns = {
  /**
   * Form submission feedback
   */
  formSuccess: (message = 'Changes saved successfully') => 
    toasts.success(message, { duration: 3000 }),
    
  formError: (message = 'Please check your input and try again') => 
    toasts.error(message, { duration: 5000 }),
  
  /**
   * Network operation feedback
   */
  networkError: (action = 'perform this action') => 
    toasts.error(`Unable to ${action}. Check your connection and try again.`, {
      duration: 6000,
      action: {
        label: 'Retry',
        onclick: () => window.location.reload(),
        variant: 'secondary'
      }
    }),
  
  /**
   * Copy to clipboard feedback
   */
  copied: (item = 'Item') => 
    toasts.success(`${item} copied to clipboard`, { duration: 2000 }),
  
  /**
   * File upload feedback
   */
  uploadProgress: (filename: string) => 
    toastHelpers.loading(`Uploading ${filename}...`),
    
  uploadSuccess: (filename: string) => 
    toasts.success(`${filename} uploaded successfully`, { duration: 3000 }),
    
  uploadError: (filename: string, retry?: () => void) => 
    toasts.error(`Failed to upload ${filename}`, {
      duration: 6000,
      action: retry ? {
        label: 'Retry',
        onclick: retry,
        variant: 'secondary'
      } : undefined
    }),
  
  /**
   * Authentication feedback
   */
  loginSuccess: (username?: string) => 
    toasts.success(`Welcome${username ? ` back, ${username}` : ''}!`, { duration: 3000 }),
    
  logoutSuccess: () => 
    toasts.info('You have been signed out', { duration: 3000 }),
    
  sessionExpired: () => 
    toasts.warning('Your session has expired. Please sign in again.', {
      duration: 8000,
      action: {
        label: 'Sign In',
        onclick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        },
        variant: 'primary'
      }
    }),
  
  /**
   * Permission denied
   */
  permissionDenied: (action = 'perform this action') => 
    toasts.error(`You don't have permission to ${action}.`, { duration: 5000 }),
  
  /**
   * Feature not available
   */
  featureUnavailable: (feature = 'This feature') => 
    toasts.info(`${feature} is coming soon!`, { duration: 4000 })
};

// Utility functions
export const toastUtils = {
  /**
   * Check if toast system is ready
   */
  isReady: () => typeof window !== 'undefined',
  
  /**
   * Get optimal toast duration based on message length
   */
  getOptimalDuration: (message: string, minDuration = 3000, maxDuration = 8000) => {
    // Rough reading speed: 200 words per minute = 3.3 words per second
    const wordCount = message.split(' ').length;
    const readingTime = (wordCount / 3.3) * 1000;
    const duration = Math.max(minDuration, Math.min(maxDuration, readingTime + 2000));
    return Math.round(duration);
  },
  
  /**
   * Validate toast message for accessibility
   */
  validateMessage: (message: string) => {
    const warnings: string[] = [];
    
    if (message.length < 3) {
      warnings.push('Message too short for screen readers');
    }
    
    if (message.length > 150) {
      warnings.push('Message may be too long for mobile displays');
    }
    
    if (!/[.!?]$/.test(message.trim())) {
      warnings.push('Consider ending message with punctuation for screen readers');
    }
    
    return warnings;
  }
};