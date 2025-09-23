/**
 * Legacy Toast Store - Backward Compatible
 * 
 * This implementation maintains 100% backward compatibility with existing code
 * while internally using the new Melt UI toast system for enhanced UX.
 * 
 * Usage patterns that continue to work:
 * - toasts.success('Operation completed')
 * - toasts.error('Something went wrong')
 * - toasts.show('Custom message', 'info', 3000)
 * 
 * For new code, consider using the modern API:
 * import { toasts as modernToasts } from '@repo/ui/primitives'
 */

import { writable } from 'svelte/store';
import { toasts as modernToasts } from '../primitives/toast/store';

// Legacy interface - kept for backward compatibility
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);

  // Bridge between legacy and modern toast systems - FIXED to prevent duplicates
  function addLegacyToast(message: string, type: ToastMessage['type'] = 'info', duration = 5000): string {
    // Use modern toast system ONLY - no more legacy store updates
    return modernToasts.show(message, type, { duration });
  }

  return {
    subscribe,
    show(message: string, type: ToastMessage['type'] = 'info', duration = 5000) {
      return addLegacyToast(message, type, duration);
    },
    success(message: string, duration = 5000) {
      return addLegacyToast(message, 'success', duration);
    },
    error(message: string, duration = 5000) {
      return addLegacyToast(message, 'error', duration);
    },
    warning(message: string, duration = 5000) {
      return addLegacyToast(message, 'warning', duration);
    },
    info(message: string, duration = 5000) {
      return addLegacyToast(message, 'info', duration);
    },
    remove(id: string) {
      // Remove from both systems
      modernToasts.dismiss(id);
      update(toasts => toasts.filter(t => t.id !== id));
    },
    clear() {
      // Clear both systems
      modernToasts.dismissAll();
      update(() => []);
    }
  };
}

export const toasts = createToastStore();