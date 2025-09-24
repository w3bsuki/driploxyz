/**
 * Toast Notification Store - Svelte 5 Runes
 * Manages toast notifications for errors and other messages
 */

import { browser } from '$app/environment';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  persistent?: boolean;
}

// Global toast state
let toasts = $state<Toast[]>([]);

// Default configurations for different toast types
const defaultConfigs: Record<ToastType, Partial<Toast>> = {
  success: {
    duration: 4000,
    dismissible: true
  },
  error: {
    duration: 8000,
    dismissible: true
  },
  warning: {
    duration: 6000,
    dismissible: true
  },
  info: {
    duration: 5000,
    dismissible: true
  }
};

/**
 * Generate unique toast ID
 */
function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add a new toast
 */
function addToast(toast: Omit<Toast, 'id'> & { id?: string }): string {
  const id = toast.id || generateToastId();
  const config = defaultConfigs[toast.type];

  const newToast: Toast = {
    ...config,
    ...toast,
    id
  };

  toasts = [...toasts, newToast];

  // Auto-remove toast after duration (unless persistent)
  if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }

  return id;
}

/**
 * Remove a toast by ID
 */
function removeToast(id: string): void {
  toasts = toasts.filter(toast => toast.id !== id);
}

/**
 * Clear all toasts
 */
function clearAllToasts(): void {
  toasts = [];
}

/**
 * Update an existing toast
 */
function updateToast(id: string, updates: Partial<Omit<Toast, 'id'>>): void {
  toasts = toasts.map(toast =>
    toast.id === id ? { ...toast, ...updates } : toast
  );
}

/**
 * Create success toast
 */
function success(message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}): string {
  return addToast({
    type: 'success',
    message,
    ...options
  });
}

/**
 * Create error toast
 */
function error(message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}): string {
  return addToast({
    type: 'error',
    message,
    ...options
  });
}

/**
 * Create warning toast
 */
function warning(message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}): string {
  return addToast({
    type: 'warning',
    message,
    ...options
  });
}

/**
 * Create info toast
 */
function info(message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}): string {
  return addToast({
    type: 'info',
    message,
    ...options
  });
}

/**
 * Create error toast from ErrorDetails
 */
function fromError(errorDetails: import('../utils/error-handling.svelte').ErrorDetails, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}): string {
  const severity = errorDetails.severity;
  const toastType: ToastType = severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warning';

  return addToast({
    type: toastType,
    title: `${errorDetails.type} Error`,
    message: errorDetails.userMessage,
    description: errorDetails.code ? `Error code: ${errorDetails.code}` : undefined,
    action: errorDetails.retryable ? {
      label: 'Retry',
      onClick: () => {
        // Emit retry event
        if (browser) {
          window.dispatchEvent(new CustomEvent('toast-retry', {
            detail: { errorDetails }
          }));
        }
      }
    } : undefined,
    persistent: severity === 'CRITICAL',
    ...options
  });
}

/**
 * Export toast store interface
 */
export const toast = {
  // State accessors
  get all() { return toasts; },
  get count() { return toasts.length; },

  // Methods
  add: addToast,
  remove: removeToast,
  clear: clearAllToasts,
  update: updateToast,

  // Convenience methods
  success,
  error,
  warning,
  info,
  fromError
};

// Auto-clear toasts on page navigation in browser
if (browser) {
  // Clear non-persistent toasts on navigation
  document.addEventListener('sveltekit:navigation-start', () => {
    toasts = toasts.filter(toast => toast.persistent);
  });
}