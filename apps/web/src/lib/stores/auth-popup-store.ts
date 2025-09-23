/**
 * Auth Popup Store - Clean Svelte 5 Implementation
 */

import { authPopupStoreInstance } from './auth-popup.svelte';

// Direct exports from the Svelte 5 store
export const {
  isOpen,
  action,
  redirectAfterAuth,
  show,
  close,
  signIn,
  signUp,
  showForFavorite,
  showForPurchase,
  showForSelling,
  showForMessaging
} = authPopupStoreInstance;

interface LegacyAuthPopupState {
  isOpen: boolean;
  action: string;
  redirectAfterAuth?: string;
}

// Maintain legacy API compatibility
export const authPopupStore = {
  subscribe: (fn: (state: LegacyAuthPopupState) => void) => {
    // Legacy subscribe compatibility - not recommended for new code
    return fn({
      isOpen: authPopupStoreInstance.isOpen,
      action: authPopupStoreInstance.action,
      redirectAfterAuth: authPopupStoreInstance.redirectAfterAuth
    });
  }
};

export const authPopupActions = {
  show,
  close,
  signIn,
  signUp,
  showForFavorite,
  showForPurchase,
  showForSelling,
  showForMessaging
};