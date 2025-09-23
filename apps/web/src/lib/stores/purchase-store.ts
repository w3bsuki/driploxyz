/**
 * Purchase Store - Clean Svelte 5 Implementation
 */

import { purchaseStoreInstance } from './purchase.svelte';

// Direct exports from the Svelte 5 store
export const {
  isLoading,
  error,
  currentPaymentIntent,
  currentProduct,
  initiatePurchase,
  confirmPayment,
  clearState,
  clearError
} = purchaseStoreInstance;

interface LegacyPurchaseState {
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

// Maintain legacy API compatibility
export const purchaseStore = {
  subscribe: (fn: (state: LegacyPurchaseState) => void) => {
    // Legacy subscribe compatibility - not recommended for new code
    return fn({
      isLoading: purchaseStoreInstance.isLoading,
      error: purchaseStoreInstance.error,
      currentPaymentIntent: purchaseStoreInstance.currentPaymentIntent,
      currentProduct: purchaseStoreInstance.currentProduct
    });
  }
};

export const purchaseActions = {
  initiatePurchase,
  confirmPayment,
  clearState,
  clearError
};