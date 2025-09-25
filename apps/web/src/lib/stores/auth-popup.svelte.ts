/**
 * Auth Popup Store - Svelte 5 Implementation
 */

import { goto } from '$app/navigation';

interface AuthPopupState {
  isOpen: boolean;
  action: string; // "favorite this product", "purchase", "add to wishlist", etc.
  redirectAfterAuth?: string;
}

const initialState: AuthPopupState = {
  isOpen: false,
  action: '',
  redirectAfterAuth: undefined
};

function createAuthPopupStore() {
  let state = $state<AuthPopupState>({ ...initialState });

  // Actions object
  const actions = {
    /**
     * Show auth popup with specific action message
     */
    show(action: string, redirectAfterAuth?: string): void {
      state = {
        isOpen: true,
        action,
        redirectAfterAuth
      };
    },

    /**
     * Close the auth popup
     */
    close(): void {
      state = {
        ...state,
        isOpen: false
      };
    },

    /**
     * Handle sign in action
     */
    signIn(): void {
      // Prepare redirect URL if needed
      const redirectUrl = state.redirectAfterAuth
        ? `/login?next=${encodeURIComponent(state.redirectAfterAuth)}`
        : '/login';

      goto(redirectUrl);

      state = { ...initialState }; // Reset state
    },

    /**
     * Handle sign up action
     */
    signUp(): void {
      // Prepare redirect URL if needed
      const redirectUrl = state.redirectAfterAuth
        ? `/signup?next=${encodeURIComponent(state.redirectAfterAuth)}`
        : '/signup';

      goto(redirectUrl);

      state = { ...initialState }; // Reset state
    },

    /**
     * Quick helpers for common actions
     */
    showForFavorite(): void {
      actions.show('add this item to your wishlist');
    },

    showForPurchase(): void {
      actions.show('purchase this item');
    },

    showForSelling(): void {
      actions.show('start selling');
    },

    showForMessaging(): void {
      actions.show('message sellers');
    },

    showForSignUp(): void {
      actions.show('get started');
    }
  };

  return {
    get state() { return state; },
    set state(newState) { state = newState; },
    actions
  };
}

// Create global instance
const authPopupStoreInstance = createAuthPopupStore();

// Export the reactive store directly - this maintains proper Svelte 5 reactivity
export const authPopupStore = authPopupStoreInstance;
export const authPopupActions = authPopupStoreInstance.actions;
