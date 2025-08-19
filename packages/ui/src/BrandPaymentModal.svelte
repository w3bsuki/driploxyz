<script lang="ts">
  const browser = typeof window !== 'undefined';

  interface Props {
    show: boolean;
    stripePublishableKey?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  }

  let { show, stripePublishableKey, onSuccess, onCancel, onClose }: Props = $props();

  let loading = $state(false);
  let error = $state('');
  let stripe: any = $state(null);
  let elements: any = $state(null);
  let cardElement: any = $state(null);
  let cardContainer: HTMLDivElement | undefined = $state();

  // Brand plan ID
  const BRAND_PLAN_ID = 'd3735d51-cbba-4b77-9e21-e50bdf9e53e8';

  // Initialize Stripe when modal shows
  $effect(() => {
    if (show && browser && !stripe) {
      initializeStripe();
    }
  });

  async function initializeStripe() {
    try {
      if (!stripePublishableKey) {
        throw new Error('Stripe publishable key is required');
      }
      const { loadStripe } = await import('@stripe/stripe-js');
      stripe = await loadStripe(stripePublishableKey);
      
      if (stripe && cardContainer) {
        elements = stripe.elements();
        cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            },
          },
        });
        cardElement.mount(cardContainer);
      }
    } catch (err) {
      error = 'Failed to load payment form';
    }
  }

  async function handlePayment() {
    if (!stripe || !cardElement) {
      error = 'Payment form not ready';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      
      // Create subscription on server
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: BRAND_PLAN_ID,
          discountPercent: 0
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const { clientSecret } = result;
      
      if (!clientSecret) {
        throw new Error('No payment client secret received from server');
      }

      // Confirm payment with card element
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (paymentError) {
        error = paymentError.message || 'Payment failed';
      } else {
        onSuccess?.();
      }
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Payment failed';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    onCancel?.();
    onClose?.();
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-5">
      <!-- Header -->
      <div class="text-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Brand Account</h3>
        <p class="text-sm text-gray-600">50 BGN/month subscription</p>
      </div>

      <!-- Card Input -->
      <div class="mb-4" role="group" aria-labelledby="payment-details-label">
        <div id="payment-details-label" class="block text-sm font-medium text-gray-700 mb-1">
          Payment Details
        </div>
        <div bind:this={cardContainer} class="p-2.5 border border-gray-300 rounded-sm bg-white text-sm"></div>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="mb-3 p-2 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
          {error}
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          onclick={handleCancel}
          disabled={loading}
          class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onclick={handlePayment}
          disabled={loading || !stripe}
          class="flex-1 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if loading}
            <div class="flex items-center justify-center gap-1">
              <div class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          {:else}
            Pay 50 BGN
          {/if}
        </button>
      </div>

      <!-- Security Note -->
      <div class="mt-3 text-center text-xs text-gray-500">
        Secured by Stripe
      </div>
    </div>
  </div>
{/if}