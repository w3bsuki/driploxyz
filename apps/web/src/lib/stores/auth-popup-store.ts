import { writable } from 'svelte/store';
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

export const authPopupStore = writable<AuthPopupState>(initialState);

export const authPopupActions = {
  /**
   * Show auth popup with specific action message
   */
  show(action: string, redirectAfterAuth?: string): void {
    authPopupStore.set({
      isOpen: true,
      action,
      redirectAfterAuth
    });
  },

  /**
   * Close the auth popup
   */
  close(): void {
    authPopupStore.update(state => ({
      ...state,
      isOpen: false
    }));
  },

  /**
   * Handle sign in action
   */
  signIn(): void {
    authPopupStore.update(state => {
      // Prepare redirect URL if needed
      const redirectUrl = state.redirectAfterAuth 
        ? `/login?next=${encodeURIComponent(state.redirectAfterAuth)}`
        : '/login';
      
      goto(redirectUrl);
      
      return {
        ...initialState // Reset state
      };
    });
  },

  /**
   * Handle sign up action
   */
  signUp(): void {
    authPopupStore.update(state => {
      // Prepare redirect URL if needed
      const redirectUrl = state.redirectAfterAuth 
        ? `/signup?next=${encodeURIComponent(state.redirectAfterAuth)}`
        : '/signup';
      
      goto(redirectUrl);
      
      return {
        ...initialState // Reset state
      };
    });
  },

  /**
   * Quick helpers for common actions
   */
  showForFavorite(): void {
    this.show('add this item to your wishlist');
  },

  showForPurchase(): void {
    this.show('purchase this item');
  },

  showForSelling(): void {
    this.show('start selling');
  },

  showForMessaging(): void {
    this.show('message sellers');
  }
};