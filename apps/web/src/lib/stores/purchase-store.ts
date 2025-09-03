import { writable } from 'svelte/store';
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

export const purchaseStore = writable<PurchaseState>(initialState);

export const purchaseActions = {
  /**
   * Initialize purchase flow with Stripe checkout
   */
  async initiatePurchase(
    productId: string, 
    selectedSize?: string
  ): Promise<void> {
    purchaseStore.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

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

      purchaseStore.update(state => ({
        ...state,
        currentPaymentIntent: data.paymentIntentId,
        currentProduct: data.product,
        isLoading: false
      }));

      // Redirect to the existing checkout page
      goto(`/checkout/${productId}`);

    } catch (error) {
      purchaseStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      }));
    }
  },

  /**
   * Confirm payment after successful Stripe payment
   */
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    purchaseStore.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

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

      purchaseStore.update(() => ({
        ...initialState // Reset state on success
      }));

      return true;

    } catch (error) {
      purchaseStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      }));
      return false;
    }
  },

  /**
   * Clear purchase state
   */
  clearState(): void {
    purchaseStore.set(initialState);
  },

  /**
   * Clear error
   */
  clearError(): void {
    purchaseStore.update(state => ({
      ...state,
      error: null
    }));
  }
};