import { toasts, toastHelpers } from '@repo/ui/primitives/toast';
import type { ToastStoreOptions, ToastType } from '@repo/ui/primitives/toast';
import type { Toast as UiToast } from '@repo/ui/primitives/toast';
import type { ErrorDetails } from '../utils/error-handling.svelte';

export type Toast = UiToast;

function normalizeOptions(options: ToastStoreOptions | undefined): ToastStoreOptions | undefined {
  if (!options) {
    return undefined;
  }

  return {
    duration: options.duration,
    dismissible: options.dismissible,
    persistent: options.persistent,
    action: options.action
  } satisfies ToastStoreOptions;
}

function show(message: string, type: ToastType, options?: ToastStoreOptions) {
  return toasts.show(message, type, normalizeOptions(options));
}

function withRetryAction(
  errorDetails: ErrorDetails,
  options?: ToastStoreOptions
): ToastStoreOptions | undefined {
  if (!errorDetails.retryable) {
    return normalizeOptions(options);
  }

  const action = {
    label: 'Retry',
    onclick: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toast-retry', {
            detail: { errorDetails }
          })
        );
      }
    }
  } as const;

  return {
    ...normalizeOptions(options),
    action
  } satisfies ToastStoreOptions;
}

function fromError(errorDetails: ErrorDetails, options?: ToastStoreOptions): string {
  const severity = errorDetails.severity;
  const type: ToastType = severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warning';

  return show(errorDetails.userMessage, type, withRetryAction(errorDetails, options));
}

export const toast = {
  show(message: string, type: ToastType = 'info', options?: ToastStoreOptions) {
    return show(message, type, options);
  },
  success(message: string, options?: ToastStoreOptions) {
    return toasts.success(message, normalizeOptions(options));
  },
  error(message: string, options?: ToastStoreOptions) {
    return toasts.error(message, normalizeOptions(options));
  },
  warning(message: string, options?: ToastStoreOptions) {
    return toasts.warning(message, normalizeOptions(options));
  },
  info(message: string, options?: ToastStoreOptions) {
    return toasts.info(message, normalizeOptions(options));
  },
  dismiss(id: string) {
    toasts.dismiss(id);
  },
  dismissAll() {
    toasts.dismissAll();
  },
  fromError,
  helpers: toastHelpers
};

export type { ToastType };
