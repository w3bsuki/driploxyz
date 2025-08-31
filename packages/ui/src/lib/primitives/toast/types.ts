/**
 * Toast component types and interfaces for Svelte 5
 * Mobile-first toast system using Melt UI
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ToastAction {
  label: string;
  onclick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  description: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  persistent?: boolean;
}

export interface ToastProps {
  /**
   * The toast data
   */
  toast: Toast;
  
  /**
   * Callback when toast is dismissed
   */
  onDismiss?: (id: string) => void;
  
  /**
   * Additional CSS classes
   */
  class?: string;
}

export interface ToastProviderProps {
  /**
   * Maximum number of toasts to show at once
   * @default 5
   */
  limit?: number;
  
  /**
   * Default duration for toasts (milliseconds)
   * @default 5000
   */
  duration?: number;
  
  /**
   * Position where toasts appear
   * @default 'bottom-right'
   */
  position?: ToastPosition;
  
  /**
   * Gap between toasts in pixels
   * @default 8
   */
  gap?: number;
  
  /**
   * Additional CSS classes for container
   */
  class?: string;
}

export interface ToastStoreOptions {
  duration?: number;
  dismissible?: boolean;
  persistent?: boolean;
  action?: ToastAction;
}

export interface ToastStore {
  /**
   * Show a toast with custom type
   */
  show: (description: string, type: ToastType, options?: ToastStoreOptions) => string;
  
  /**
   * Show success toast
   */
  success: (description: string, options?: ToastStoreOptions) => string;
  
  /**
   * Show error toast
   */
  error: (description: string, options?: ToastStoreOptions) => string;
  
  /**
   * Show warning toast
   */
  warning: (description: string, options?: ToastStoreOptions) => string;
  
  /**
   * Show info toast
   */
  info: (description: string, options?: ToastStoreOptions) => string;
  
  /**
   * Dismiss a specific toast
   */
  dismiss: (id: string) => void;
  
  /**
   * Dismiss all toasts
   */
  dismissAll: () => void;
}