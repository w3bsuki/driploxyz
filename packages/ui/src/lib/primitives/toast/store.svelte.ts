/**
 * Modern Toast Store - Svelte 5 with Melt UI Integration
 * Compatible with existing toasts.success() pattern
 * Mobile-first with enhanced accessibility
 */

import type { Toast, ToastType, ToastStore, ToastStoreOptions } from './types';

// Global toast provider instance
let toastProvider: {
  addToastData?: (toast: Toast) => string;
  removeToastData?: (id: string) => void;
  clearAllToasts?: () => void;
} | null = null;

// Deduplication cache to prevent duplicate toasts
const activeToasts = new Map<string, { id: string; timeout: ReturnType<typeof setTimeout> }>();
const toastIdLookup = new Map<string, string>();
const TOAST_DEDUP_WINDOW = 100; // ms - prevent rapid duplicates

export function setToastProvider(provider: typeof toastProvider) {
  toastProvider = provider;
}

// Generate unique content hash for deduplication
function getToastHash(description: string, type: ToastType): string {
  return `${type}:${description.trim()}`;
}

function createToastStore(): ToastStore {
  // Reactive toasts state using Svelte 5 runes
  let toasts = $state<Toast[]>([]);
  
  // Generate unique toast ID
  function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Add toast to provider if available, otherwise fallback to store
  function addToast(toast: Toast): string {
    // Deduplication check
    const toastHash = getToastHash(toast.description, toast.type);
    
    const existingToast = activeToasts.get(toastHash);

    if (existingToast) {
      // Duplicate detected - return existing ID without creating new toast
      return existingToast.id;
    }

    let mountedToastId = toast.id;

    if (toastProvider && typeof toastProvider.addToastData === 'function') {
      mountedToastId = toastProvider.addToastData(toast);
    } else {
      // Fallback: add to store (for compatibility)
      const filtered = toasts.filter(t => t.id !== toast.id);
      toasts = [...filtered, toast];
    }

    // Mark as active and schedule cleanup
    const timeout = setTimeout(() => {
      const entry = activeToasts.get(toastHash);

      if (entry && entry.id === mountedToastId) {
        activeToasts.delete(toastHash);
      }

      toastIdLookup.delete(mountedToastId);
    }, TOAST_DEDUP_WINDOW);

    activeToasts.set(toastHash, { id: mountedToastId, timeout });
    toastIdLookup.set(mountedToastId, toastHash);

    return mountedToastId;
  }

  // Remove toast from provider or store
  function removeToast(id: string): void {
    const toastHash = toastIdLookup.get(id);

    if (toastHash) {
      const entry = activeToasts.get(toastHash);

      if (entry) {
        clearTimeout(entry.timeout);

        if (entry.id === id) {
          activeToasts.delete(toastHash);
        }
      }

      toastIdLookup.delete(id);
    }

    if (toastProvider && typeof toastProvider.removeToastData === 'function') {
      toastProvider.removeToastData(id);
      return;
    }
    
    // Fallback: remove from store
    toasts = toasts.filter(t => t.id !== id);
  }
  
  const store: ToastStore = {
    show(description: string, type: ToastType = 'info', options: ToastStoreOptions = {}): string {
      const id = generateId();
      const toast: Toast = {
        id,
        type,
        description,
        duration: options.duration ?? 5000,
        dismissible: options.dismissible ?? true,
        persistent: options.persistent ?? false,
        action: options.action
      };
      
      return addToast(toast);
    },
    
    success(description: string, options: ToastStoreOptions = {}): string {
      return store.show(description, 'success', {
        duration: 4000,
        ...options
      });
    },
    
    error(description: string, options: ToastStoreOptions = {}): string {
      return store.show(description, 'error', {
        duration: 6000,
        dismissible: true,
        ...options
      });
    },
    
    warning(description: string, options: ToastStoreOptions = {}): string {
      return store.show(description, 'warning', {
        duration: 5000,
        ...options
      });
    },
    
    info(description: string, options: ToastStoreOptions = {}): string {
      return store.show(description, 'info', {
        duration: 4000,
        ...options
      });
    },
    
    dismiss(id: string): void {
      removeToast(id);
    },
    
    dismissAll(): void {
      if (toastProvider && typeof toastProvider.clearAllToasts === 'function') {
        toastProvider.clearAllToasts();
        activeToasts.clear();
        toastIdLookup.clear();
        return;
      }

      // Fallback: clear store
      toasts = [];
      activeToasts.clear();
      toastIdLookup.clear();
    }
  };
  
  return store;
}

// Export the toast store instance
export const toasts = createToastStore();

// Helper functions for advanced toast patterns
export const toastHelpers = {
  /**
   * Show loading toast that can be updated
   */
  loading(description: string, options: ToastStoreOptions = {}) {
    return toasts.info(description, {
      persistent: true,
      dismissible: false,
      ...options
    });
  },
  
  /**
   * Update existing toast (useful for loading -> success/error)
   */
  update(id: string, updates: Partial<Omit<Toast, 'id'>>) {
    // Dismiss old toast and show new one
    toasts.dismiss(id);
    
    if (updates.type && updates.description) {
      return toasts.show(updates.description, updates.type, {
        duration: updates.duration,
        dismissible: updates.dismissible,
        persistent: updates.persistent,
        action: updates.action
      });
    }
    
    return id;
  },
  
  /**
   * Show toast with action button
   */
  withAction(
    description: string, 
    type: ToastType,
    actionLabel: string, 
    actionCallback: () => void,
    options: ToastStoreOptions = {}
  ) {
    return toasts.show(description, type, {
      ...options,
      action: {
        label: actionLabel,
        onclick: actionCallback,
        variant: type === 'error' ? 'secondary' : 'primary'
      }
    });
  },
  
  /**
   * Show promise-based toast (loading -> success/error)
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options: ToastStoreOptions = {}
  ): Promise<T> {
    const loadingId = toastHelpers.loading(messages.loading, options);
    
    return promise
      .then((data) => {
        toasts.dismiss(loadingId);
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        toasts.success(successMessage, options);
        return data;
      })
      .catch((error) => {
        toasts.dismiss(loadingId);
        const errorMessage = typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error;
        toasts.error(errorMessage, options);
        throw error;
      });
  }
};

// Legacy compatibility - extend window object for existing components
if (typeof window !== 'undefined') {
  // @ts-expect-error - Legacy global support
  window.showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    return toasts.show(message, type, { duration });
  };
}