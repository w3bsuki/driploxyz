<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { type ErrorDetails } from '$lib/utils/error-handling.svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import ErrorBoundary from './ErrorBoundary.svelte';

  interface Props {
    children: Snippet;
    onPaymentError?: (error: ErrorDetails) => void;
    showSecurityInfo?: boolean;
    productId?: string;
    orderId?: string;
  }

  let {
    children,
    onPaymentError,
    showSecurityInfo = true,
    productId,
    orderId
  }: Props = $props();

  // Payment error state
  let paymentError = $state<ErrorDetails | null>(null);
  let isProcessingPayment = $state(false);
  let paymentAttempts = $state(0);
  const maxPaymentAttempts = 3;

  // Common payment error patterns
  const paymentErrorPatterns = {
    'card_declined': {
      userMessage: 'Your card was declined. Please try a different payment method or contact your bank.',
      retryable: true,
      suggestions: [
        'Check your card details are correct',
        'Ensure you have sufficient funds',
        'Try a different payment method',
        'Contact your bank if the problem persists'
      ]
    },
    'insufficient_funds': {
      userMessage: 'Insufficient funds available on your card.',
      retryable: true,
      suggestions: [
        'Check your account balance',
        'Try a different payment method',
        'Add funds to your account'
      ]
    },
    'expired_card': {
      userMessage: 'Your card has expired. Please use a different payment method.',
      retryable: true,
      suggestions: [
        'Check your card expiry date',
        'Use a different card',
        'Contact your bank for a new card'
      ]
    },
    'incorrect_cvc': {
      userMessage: 'The CVC code is incorrect. Please check and try again.',
      retryable: true,
      suggestions: [
        'Check the 3-digit code on the back of your card',
        'For American Express, check the 4-digit code on the front'
      ]
    },
    'processing_error': {
      userMessage: 'There was an error processing your payment. Please try again.',
      retryable: true,
      suggestions: [
        'Wait a moment and try again',
        'Check your internet connection',
        'Try a different payment method'
      ]
    },
    'authentication_required': {
      userMessage: 'Additional authentication is required. Please complete the verification.',
      retryable: true,
      suggestions: [
        'Complete the verification with your bank',
        'Check for SMS or app notifications',
        'Contact your bank if you don\'t receive verification'
      ]
    },
    'rate_limited': {
      userMessage: 'Too many payment attempts. Please wait before trying again.',
      retryable: true,
      suggestions: [
        'Wait 15 minutes before trying again',
        'Use a different payment method',
        'Contact support if urgent'
      ]
    },
    'service_unavailable': {
      userMessage: 'Payment processing is temporarily unavailable. Please try again later.',
      retryable: true,
      suggestions: [
        'Try again in a few minutes',
        'Check our status page for updates',
        'Contact support if urgent'
      ]
    }
  };

  // Handle payment-specific errors
  function handlePaymentError(error: ErrorDetails) {
    // Categorize payment errors
    const message = error.message.toLowerCase();
    let enhancedError = { ...error };

    // Check for known payment error patterns
    for (const [pattern, info] of Object.entries(paymentErrorPatterns)) {
      if (message.includes(pattern) || message.includes(pattern.replace('_', ' '))) {
        enhancedError = {
          ...error,
          userMessage: info.userMessage,
          retryable: info.retryable,
          context: {
            ...error.context,
            paymentError: pattern,
            suggestions: info.suggestions
          }
        };
        break;
      }
    }

    // Special handling for Stripe errors
    if (message.includes('stripe')) {
      enhancedError.type = 'EXTERNAL_SERVICE';
      if (!enhancedError.context?.paymentError) {
        enhancedError.userMessage = 'Payment processing error. Please try again or use a different payment method.';
      }
    }

    paymentError = enhancedError;
    paymentAttempts++;

    // Show appropriate toast
    if (enhancedError.severity === 'HIGH' || paymentAttempts >= maxPaymentAttempts) {
      toast.error(enhancedError.userMessage, {
        persistent: true,
        action: {
          label: 'Contact Support',
          onClick: () => handleContactSupport()
        }
      });
    } else {
      toast.error(enhancedError.userMessage);
    }

    onPaymentError?.(enhancedError);
  }

  // Handle payment retry
  async function handlePaymentRetry() {
    if (paymentAttempts >= maxPaymentAttempts) {
      toast.error('Maximum payment attempts reached. Please contact support or try again later.');
      return;
    }

    isProcessingPayment = true;

    try {
      // Emit payment retry event
      if (browser) {
        window.dispatchEvent(new CustomEvent('payment-retry', {
          detail: {
            attempt: paymentAttempts + 1,
            productId,
            orderId,
            previousError: paymentError
          }
        }));
      }

      // Clear previous error
      paymentError = null;

      // Actual retry logic would be handled by the payment component
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch {
      handlePaymentError({
        type: 'EXTERNAL_SERVICE',
        severity: 'HIGH',
        message: 'Payment retry failed',
        userMessage: 'Unable to retry payment. Please try again later.',
        retryable: false,
        timestamp: new Date().toISOString()
      });
    } finally {
      isProcessingPayment = false;
    }
  }

  // Handle different payment methods
  function handleTryDifferentPayment() {
    paymentError = null;
    paymentAttempts = 0;

    // Emit event to show payment method selector
    if (browser) {
      window.dispatchEvent(new CustomEvent('payment-method-change', {
        detail: { reason: 'payment_error' }
      }));
    }

    toast.info('Try selecting a different payment method');
  }

  // Contact support with payment context
  function handleContactSupport() {
    const supportContext = {
      type: 'payment_error',
      productId,
      orderId,
      error: paymentError,
      attempts: paymentAttempts,
      timestamp: new Date().toISOString(),
      userAgent: browser ? navigator.userAgent : 'unknown'
    };

    const mailtoLink = `mailto:support@driplo.com?subject=Payment Error - Order ${orderId || 'Unknown'}&body=Payment Error Details:%0A${encodeURIComponent(JSON.stringify(supportContext, null, 2))}`;

    if (browser) {
      window.location.href = mailtoLink;
    }
  }

  // Handle navigation back to product
  function handleBackToProduct() {
    if (productId) {
      // Navigate back to the product page
      goto(`/product/${productId}`);
    } else {
      goto('/');
    }
  }

  // Custom fallback for payment errors
  // PaymentErrorFallback function removed as it's not used - inline fallback is used instead
</script>

<ErrorBoundary
  onError={handlePaymentError}
  showToastOnError={false}
  name="PaymentErrorBoundary"
>
  {#snippet fallback(error)}
    <div class="payment-error-container p-6 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
      <div class="payment-error-content text-center">
        <!-- Payment failed icon -->
        <div class="payment-error-icon mb-4 flex justify-center">
          <div class="w-16 h-16 p-3 bg-red-100 rounded-full text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h3 class="error-title text-xl font-semibold text-red-800 mb-3">
          Payment Failed
        </h3>

        <!-- Message -->
        <p class="error-message text-red-700 mb-4 leading-relaxed">
          {error.userMessage}
        </p>

        <!-- Payment context -->
        <div class="payment-context mb-4 p-3 bg-red-100 rounded-lg text-sm text-red-800">
          {#if productId}
            <p class="context-item mb-1">
              <span class="font-medium">Product:</span> {productId}
            </p>
          {/if}
          {#if orderId}
            <p class="context-item mb-1">
              <span class="font-medium">Order:</span> {orderId}
            </p>
          {/if}
          <p class="context-item">
            <span class="font-medium">Attempt:</span> {paymentAttempts}/{maxPaymentAttempts}
          </p>
        </div>

        <!-- Suggestions -->
        {#if error.context?.suggestions}
          <div class="payment-suggestions mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h4 class="text-sm font-medium text-yellow-800 mb-2">What you can try:</h4>
            <ul class="space-y-1 text-sm text-yellow-700">
              {#each error.context.suggestions as suggestion}
                <li class="flex items-start gap-2">
                  <span class="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  {suggestion}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Security info -->
        {#if showSecurityInfo}
          <div class="security-info mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p class="text-sm text-gray-600 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Your payment information is secure and encrypted. No charges have been made to your account.
            </p>
          </div>
        {/if}

        <!-- Actions -->
        <div class="payment-actions space-y-3">
          {#if error.retryable && paymentAttempts < maxPaymentAttempts}
            <button
              class="retry-payment-button w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              onclick={handlePaymentRetry}
              disabled={isProcessingPayment}
            >
              {#if isProcessingPayment}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Retrying Payment...
              {:else}
                Try Again
              {/if}
            </button>
          {/if}

          <div class="flex flex-col sm:flex-row gap-2">
            <button
              class="different-payment-button flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              onclick={handleTryDifferentPayment}
            >
              Use Different Payment Method
            </button>

            <button
              class="support-button flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onclick={handleContactSupport}
            >
              Contact Support
            </button>
          </div>

          <button
            class="back-button w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            onclick={handleBackToProduct}
          >
            {productId ? 'Back to Product' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  {/snippet}

  {@render children()}
</ErrorBoundary>

<style>
  /* Custom styling for payment error states */
  :global(.payment-processing) {
    pointer-events: none;
    opacity: 0.6;
  }

  :global(.payment-form-error input, .payment-form-error select) {
    border-color: #ef4444;
    background-color: #fef2f2;
  }

  :global(.payment-form-error input:focus, .payment-form-error select:focus) {
    box-shadow: 0 0 0 2px #ef4444;
  }
</style>