/**
 * Purchase Store - Svelte 5 Implementation
 */

import { goto } from '$app/navigation';

interface PurchaseState {
  isLoading: boolean;
  error: string | null;
  currentPaymentIntent: string | null;
  currentProduct: {
    id: string;
    title: string;
    price: number;
    image: string;
    seller: string;
    selectedSize?: string;
  } | null;
}

const initialState: PurchaseState = {
  isLoading: false,
  error: null,
  currentPaymentIntent: null,
  currentProduct: null
};

export function createPurchaseStore() {
  let state = $state<PurchaseState>({ ...initialState });


  // Actions
  const actions = {
    /**
     * Initialize purchase flow with Stripe checkout
     */
    async initiatePurchase(
      productId: string,
      selectedSize?: string
    ): Promise<void> {
      state = {
        ...state,
        isLoading: true,
        error: null
      };

      try {
        // Create checkout session
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId,
            selectedSize
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create checkout session');
        }

        state = {
          ...state,
          currentPaymentIntent: data.paymentIntentId,
          currentProduct: data.product,
          isLoading: false
        };

        // Redirect to the existing checkout page
        goto(`/checkout/${productId}`);

      } catch (error) {
        state = {
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Purchase failed'
        };
      }
    },

    /**
     * Confirm payment after successful Stripe payment
     */
    async confirmPayment(paymentIntentId: string): Promise<boolean> {
      state = {
        ...state,
        isLoading: true,
        error: null
      };

      try {
        const response = await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentIntentId
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Payment confirmation failed');
        }

        state = { ...initialState }; // Reset state on success

        return true;

      } catch (error) {
        state = {
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Payment confirmation failed'
        };
        return false;
      }
    },

    /**
     * Clear purchase state
     */
    clearState(): void {
      state = { ...initialState };
    },

    /**
     * Clear error
     */
    clearError(): void {
      state = {
        ...state,
        error: null
      };
    }
  };

  return {
    // State getters that access reactive state
    get isLoading() { return state.isLoading; },
    get error() { return state.error; },
    get currentPaymentIntent() { return state.currentPaymentIntent; },
    get currentProduct() { return state.currentProduct; },
    // Actions
    ...actions
  };
}

// Create global instance
export const purchaseStoreInstance = createPurchaseStore();