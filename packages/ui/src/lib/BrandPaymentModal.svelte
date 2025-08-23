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
  let validatingDiscount = $state(false);
  let discountError = $state('');

  // We'll get the actual plan ID from the subscription plans table
  const basePrice = accountType === 'premium' ? 25 : 50;
  // Use hardcoded plan ID for brand subscription
  let actualPlanId = $state('0a3470f1-8d21-45e7-aecc-d193521adfc7'); // Brand Pro plan ID
  
  // Set initial price
  $effect(() => {
    finalPrice = basePrice;
  });

  // Validate discount code when it changes
  $effect(() => {
    if (discountCode && discountCode.trim() && actualPlanId) {
      validateDiscountCode(discountCode.trim());
    } else {
      discountAmount = 0;
      finalPrice = basePrice;
      discountError = '';
    }
  });

  async function validateDiscountCode(code: string) {
    if (!code || !actualPlanId) return;
    
    validatingDiscount = true;
    discountError = '';
    
    try {
      const response = await fetch('/api/subscriptions/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          planId: actualPlanId
        })
      });
      
      const result = await response.json();
      
      if (result.valid) {
        discountAmount = result.discount_amount || 0;
        finalPrice = result.final_amount || basePrice;
      } else {
        discountAmount = 0;
        finalPrice = basePrice;
        discountError = result.error || 'Invalid discount code';
      }
    } catch (err) {
      console.error('Discount validation failed:', err);
      discountAmount = 0;
      finalPrice = basePrice;
      discountError = 'Failed to validate discount code';
    } finally {
      validatingDiscount = false;
    }
  }

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
          planId: actualPlanId,
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
              <span class="line-through">{basePrice.toFixed(2)} BGN</span>
              <span class="text-green-600 font-semibold ml-2">{finalPrice.toFixed(2)} BGN/month</span>
            </p>
            <p class="text-xs text-green-600 font-medium">
              {discountAmount.toFixed(2)} BGN discount applied
              {#if discountCode === 'INDECISIVE'}
                (Test discount)
              {/if}
            </p>
          {:else}
            <p class="text-sm text-gray-600">{basePrice.toFixed(2)} BGN/month subscription</p>
          {/if}
        </div>
      </div>

      <!-- Discount Code Input -->
      <div class="mb-4">
        <label for="discount-code" class="block text-sm font-medium text-gray-700 mb-1">
          Discount Code (optional)
        </label>
        <div class="relative">
          <input
            id="discount-code"
            type="text"
            placeholder="Enter discount code"
            bind:value={discountCode}
            disabled={loading}
            class="w-full p-2.5 border border-gray-300 rounded-sm text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          {#if validatingDiscount}
            <div class="absolute right-2 top-1/2 -translate-y-1/2">
              <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          {/if}
        </div>
        {#if discountError}
          <p class="mt-1 text-xs text-red-600">{discountError}</p>
        {:else if discountAmount > 0}
          <p class="mt-1 text-xs text-green-600">
            ✓ {discountAmount.toFixed(2)} BGN discount applied
          </p>
        {/if}
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