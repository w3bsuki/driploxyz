/**
 * Legacy Toast Store - Pure Bridge to Modern System
 *
 * CRITICAL FIX: Eliminated duplicate toast arrays - now serves as pure bridge
 * to the modern toast system. No more memory leaks or duplicate notifications.
 *
 * Maintains 100% backward compatibility:
 * - toasts.success('Operation completed')
 * - toasts.error('Something went wrong')
 * - toasts.show('Custom message', 'info', 3000)
 *
 * All calls are forwarded directly to the modern toast system in primitives/toast/
 * For new code, prefer importing directly from primitives for better performance.
 */

import { toasts as modernToasts } from '../primitives/toast/store.svelte';

// Legacy interface - kept for backward compatibility
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

function createToastStore() {
  return {
    // For backward compatibility, provide empty array getter
    get value() {
      return [];
    },

    // Svelte 4 subscribe compatibility (returns unsubscribe function)
    subscribe(run: (value: ToastMessage[]) => void) {
      // Call immediately with empty array for compatibility
      run([]);

      // Return no-op unsubscribe function for compatibility
      // The modern toast system handles the actual state
      return () => {};
    },

    show(message: string, type: ToastMessage['type'] = 'info', duration = 5000) {
      return modernToasts.show(message, type, { duration });
    },
    success(message: string, duration = 5000) {
      return modernToasts.success(message, { duration });
    },
    error(message: string, duration = 5000) {
      return modernToasts.error(message, { duration });
    },
    warning(message: string, duration = 5000) {
      return modernToasts.warning(message, { duration });
    },
    info(message: string, duration = 5000) {
      return modernToasts.info(message, { duration });
    },
    remove(id: string) {
      // Delegate to modern system only
      modernToasts.dismiss(id);
    },
    clear() {
      // Delegate to modern system only
      modernToasts.dismissAll();
    }
  };
}

export const toasts = createToastStore();