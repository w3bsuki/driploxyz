<script lang="ts">
  import Button from '../ui/Button.svelte';

  interface ShippingEstimate {
    cost: number;
    currency: string;
    estimatedDays: string;
    method: string;
  }

  interface Product {
    id: string;
    price: number;
    originalPrice?: number;
    currency: string;
    title: string;
    isSold: boolean;
    viewCount?: number;
    location?: string;
  }

  interface Props {
    product: Product;
    isOwner: boolean;
    hasUser: boolean;
    shippingEstimate?: ShippingEstimate;
    serviceFee?: number;
    processing?: boolean;
    scarcityCount?: number;
    onMakeOffer?: () => void;
    onBuyNow?: () => void;
    onMessage?: () => void;
    onShippingChange?: () => void;
    onShippingEstimate?: () => void;
    className?: string;
  }

  let { 
    product, 
    isOwner = false,
    hasUser = false,
    shippingEstimate,
    serviceFee = 0,
    processing = false,
    scarcityCount,
    onMakeOffer,
    onBuyNow,
    onMessage,
    onShippingChange,
    onShippingEstimate,
    className = ''
  }: Props = $props();

  // Protection info modal
  const {
    elements: { trigger: protectionTrigger, portalled, overlay, content, close, title, description },
    states: { open: protectionOpen }
  } = createDialog({
    preventScroll: true,
    closeOnOutsideClick: true
  });

  // Computed values
  const hasDiscount = $derived(product.originalPrice && product.originalPrice > product.price);
  const discountPercentage = $derived(
    hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0
  );

  const estimatedTotal = $derived(() => {
    let total = product.price;
    if (shippingEstimate) total += shippingEstimate.cost;
    if (serviceFee) total += serviceFee;
    return total;
  });

  const formattedPrice = $derived(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(product.price);
  });

  const formattedOriginalPrice = $derived(() => {
    if (!hasDiscount) return null;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(product.originalPrice!);
  });

  const formattedShipping = $derived(() => {
    if (!shippingEstimate) return null;
    if (shippingEstimate.cost === 0) return 'Free shipping';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: shippingEstimate.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(shippingEstimate.cost);
  });

  const formattedTotal = $derived(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(estimatedTotal());
  });

  // CTA handlers
  function handleMakeOffer() {
    if (!hasUser) {
      window.location.href = '/login';
      return;
    }
    onMakeOffer?.();
  }

  function handleBuyNow() {
    if (!hasUser) {
      window.location.href = '/login';
      return;
    }
    onBuyNow?.();
  }

  function handleMessage() {
    if (!hasUser) {
      window.location.href = '/login';
      return;
    }
    onMessage?.();
  }
</script>

<div class="bg-[color:var(--surface-base)] border-t border-[color:var(--border-subtle)] p-4 space-y-4 {className}">
  
  <!-- Price Section -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-[color:var(--text-primary)]">{formattedPrice}</span>
        {#if hasDiscount}
          <span class="text-lg text-[color:var(--text-muted)] line-through">{formattedOriginalPrice}</span>
          <span class="text-sm font-medium text-[color:var(--status-success-text)] bg-[color:var(--status-success-bg)] px-2 py-0.5 rounded-[--radius-full]">
            {discountPercentage}% off
          </span>
        {/if}
      </div>
    </div>

    <!-- Scarcity indicator -->
    {#if scarcityCount && scarcityCount > 0 && scarcityCount <= 3}
      <div class="flex items-center gap-1 text-sm text-[color:var(--status-warning-text)]">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Only {scarcityCount} available
      </div>
    {/if}

    {#if product.viewCount && product.viewCount > 5}
      <div class="text-sm text-[color:var(--text-tertiary)]">
        {product.viewCount} people viewed this
      </div>
    {/if}
  </div>

  <!-- Shipping & Fees -->
  {#if shippingEstimate || serviceFee > 0}
    <div class="space-y-2 py-3 border-t border-[color:var(--border-subtle)]">
      
      {#if shippingEstimate}
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center gap-2">
            <span class="text-[color:var(--text-secondary)]">
              Shipping: {shippingEstimate.method} {#if shippingEstimate.estimatedDays}({shippingEstimate.estimatedDays}){/if}
            </span>
            <button 
              class="text-xs text-[color:var(--brand-primary)] hover:text-[color:var(--primary-600)] font-medium underline"
              onclick={() => onShippingChange?.()}
              aria-label="Change shipping option"
            >
              Change
            </button>
          </div>
          <span class="font-medium text-[color:var(--text-primary)]">
            {formattedShipping}
          </span>
        </div>
      {:else}
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center gap-2">
            <span class="text-[color:var(--text-secondary)]">Shipping</span>
            <button 
              class="text-xs text-[color:var(--brand-primary)] hover:text-[color:var(--primary-600)] font-medium underline"
              onclick={() => onShippingEstimate?.()}
              aria-label="Calculate shipping cost"
            >
              Calculate
            </button>
          </div>
          <span class="font-medium text-[color:var(--text-secondary)]">—</span>
        </div>
      {/if}

      {#if serviceFee > 0}
        <div class="flex justify-between items-center text-sm">
          <span class="text-[color:var(--text-secondary)]">Service fee</span>
          <span class="font-medium text-[color:var(--text-primary)]">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'EUR' }).format(serviceFee)}
          </span>
        </div>
      {/if}

      {#if shippingEstimate || serviceFee > 0}
        <div class="flex justify-between items-center text-base font-semibold pt-2 border-t border-[color:var(--border-subtle)]">
          <span class="text-[color:var(--text-primary)]">Total</span>
          <span class="text-[color:var(--text-primary)]">{formattedTotal}</span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Trust Badges -->
  <div class="flex items-center justify-between py-3 px-4 bg-[color:var(--surface-subtle)] rounded-[--radius-lg]">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-[color:var(--status-success-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <span class="text-sm font-medium text-[color:var(--text-primary)]">Driplo Protection</span>
      </div>
    </div>
    <button
      use:melt={$protectionTrigger}
      class="text-sm text-[color:var(--brand-primary)] hover:text-[color:var(--primary-600)] font-medium"
    >
      Learn more
    </button>
  </div>

  <!-- Action Buttons -->
  <div class="space-y-3">
    {#if !product.isSold && !isOwner}
      <div class="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onclick={handleMakeOffer}
          disabled={processing}
          class="flex-1 h-[--touch-primary]"
        >
          Make Offer
        </Button>
        <Button
          variant="primary"
          size="lg"
          onclick={handleBuyNow}
          disabled={processing}
          class="flex-[2] h-[--touch-primary]"
        >
          {processing ? 'Processing...' : 'Buy Now'}
        </Button>
      </div>
      
      <!-- Message seller -->
      <Button
        variant="ghost"
        size="md"
        onclick={handleMessage}
        class="w-full h-[--touch-standard] text-[color:var(--text-secondary)]"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Message Seller
      </Button>
      
    {:else if product.isSold}
      <Button
        disabled
        size="lg"
        class="w-full h-[--touch-primary] bg-[color:var(--surface-emphasis)] text-[color:var(--text-muted)] cursor-not-allowed"
      >
        SOLD OUT
      </Button>
      
    {:else if isOwner}
      <div class="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onclick={() => window.location.href = `/product/${product.id}/edit`}
          class="flex-1 h-[--touch-primary]"
        >
          Edit Listing
        </Button>
        <Button
          variant="secondary"
          size="lg"
          class="flex-1 h-[--touch-primary]"
        >
          View Stats
        </Button>
      </div>
    {/if}
  </div>

  <!-- Location info -->
  {#if product.location}
    <div class="flex items-center gap-2 text-sm text-[color:var(--text-tertiary)] pt-2 border-t border-[color:var(--border-subtle)]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      Ships from {product.location}
    </div>
  {/if}
</div>

<!-- Protection Info Modal -->
<div use:melt={$portalled}>
  {#if $protectionOpen}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50"></div>
    <div
      use:melt={$content}
      class="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[--radius-xl] bg-[color:var(--surface-base)] p-6 shadow-[--shadow-2xl]"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 use:melt={$title} class="text-lg font-semibold text-[color:var(--text-primary)]">
          Driplo Protection
        </h2>
        <button
          use:melt={$close}
          class="w-8 h-8 rounded-[--radius-full] flex items-center justify-center hover:bg-[color:var(--surface-muted)] transition-colors"
          aria-label="Close"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div use:melt={$description} class="space-y-4 text-sm text-[color:var(--text-secondary)]">
        <div class="bg-[color:var(--status-success-bg)] rounded-[--radius-lg] p-4">
          <h3 class="font-medium text-[color:var(--status-success-text)] mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Your Purchase is Protected
          </h3>
          <p class="text-[color:var(--status-success-text)]">All purchases are covered by Driplo Protection. Your money is secure until you confirm receipt.</p>
        </div>
        
        <div>
          <h4 class="font-medium text-[color:var(--text-primary)] mb-2">Secure Payments</h4>
          <p>Your payment information is encrypted and secure. We support all major payment methods including cards and digital wallets.</p>
        </div>
        
        <div>
          <h4 class="font-medium text-[color:var(--text-primary)] mb-2">Money-Back Guarantee</h4>
          <p>If the item doesn't match the description or arrives damaged, you're eligible for a full refund within 3 days of delivery.</p>
        </div>
        
        <div>
          <h4 class="font-medium text-[color:var(--text-primary)] mb-2">Dispute Resolution</h4>
          <p>If there's an issue with your order, our support team will help resolve it quickly and fairly.</p>
        </div>

        <div class="pt-4 border-t border-[color:var(--border-subtle)]">
          <p class="text-xs text-[color:var(--text-tertiary)]">
            Questions? Contact our support team for help with any purchase concerns.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure proper focus styles for accessibility */
  button:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }
</style>