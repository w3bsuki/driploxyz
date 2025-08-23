<script lang="ts">
  const browser = typeof window !== 'undefined';

  interface Props {
    show: boolean;
    stripePublishableKey?: string;
    accountType?: 'premium' | 'brand';
    discountCode?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  }

  let { 
    show, 
    stripePublishableKey, 
    accountType = 'brand',
    discountCode = '',
    onSuccess, 
    onCancel, 
    onClose 
  }: Props = $props();

  let loading = $state(false);
  let error = $state('');
  let stripe: any = $state(null);
  let elements: any = $state(null);
  let cardElement: any = $state(null);
  let cardContainer: HTMLDivElement | undefined = $state();
  let discountAmount = $state(0);
  let finalPrice = $state(0);

  // Plan IDs from database
  const PREMIUM_PLAN_ID = 'c0587696-cbcd-4e6b-b6bc-ba84fb47ddce';
  const BRAND_PLAN_ID = '989b722e-4050-4c63-ac8b-ab105f14027c';
  
  // Get the correct plan ID based on account type
  const planId = accountType === 'premium' ? PREMIUM_PLAN_ID : BRAND_PLAN_ID;
  const basePrice = accountType === 'premium' ? 25 : 50;

  // Calculate discount when code changes
  $effect(() => {
    if (discountCode === 'Indecisive' && accountType === 'brand') {
      discountAmount = 90;
      finalPrice = basePrice * 0.1; // 90% off
    } else if (discountCode === 'LAUNCH50') {
      discountAmount = 50;
      finalPrice = basePrice * 0.5; // 50% off
    } else if (discountCode === 'PREMIUM25' && accountType === 'premium') {
      discountAmount = 25;
      finalPrice = basePrice * 0.75; // 25% off
    } else if (discountCode === 'BRAND20' && accountType === 'brand') {
      discountAmount = 20;
      finalPrice = basePrice * 0.8; // 20% off
    } else {
      discountAmount = 0;
      finalPrice = basePrice;
    }
  });

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
      
      // Create subscription on server with discount
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: planId,
          discountPercent: discountAmount,
          discountCode: discountCode
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
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          {accountType === 'premium' ? 'Premium Account' : 'Brand Account'}
        </h3>
        <div class="space-y-1">
          {#if discountAmount > 0}
            <p class="text-sm text-gray-600">
              <span class="line-through">{basePrice} BGN</span>
              <span class="text-green-600 font-semibold ml-2">{finalPrice.toFixed(2)} BGN/month</span>
            </p>
            <p class="text-xs text-green-600 font-medium">
              {discountAmount}% discount applied
              {#if discountCode === 'Indecisive'}
                (Family discount)
              {/if}
            </p>
          {:else}
            <p class="text-sm text-gray-600">{basePrice} BGN/month subscription</p>
          {/if}
        </div>
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
            Pay {finalPrice.toFixed(2)} BGN
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