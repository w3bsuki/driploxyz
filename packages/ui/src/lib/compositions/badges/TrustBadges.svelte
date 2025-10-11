<script lang="ts">
  interface Props {
    variant?: 'default' | 'compact' | 'detailed';
    showPayment?: boolean;
    showSecurity?: boolean;
    showReturns?: boolean;
    showShipping?: boolean;
    class?: string;
  }

  let {
    variant = 'default',
    showPayment = true,
    showSecurity = true,
    showReturns = true,
    showShipping = true,
    class: className = ''
  }: Props = $props();

  const badges = [
    {
      id: 'payment',
      icon: 'M3 10h18M7 15h1m4 0h1m-7-4h12a3 3 0 013-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v7a3 3 0 003 3z',
      title: 'Secure Payment',
      description: 'Your payment information is encrypted and secure',
      show: showPayment
    },
    {
      id: 'security',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Buyer Protection',
      description: 'Shop with confidence - we protect your purchase',
      show: showSecurity
    },
    {
      id: 'returns',
      icon: 'M16 15v1a4 4 0 004-4h4a4 4 0 004-4v-1m-4-4l-4-4m4 4V9a4 4 0 00-4-4H5a4 4 0 00-4 4v1m4-4V5a4 4 0 014-4h4a4 4 0 014 4v1',
      title: 'Easy Returns',
      description: '30-day return policy for most items',
      show: showReturns
    },
    {
      id: 'shipping',
      icon: 'M20 7l-8-4-8 4M16 15v1a4 4 0 004-4h4a4 4 0 004-4v-1m-4-4l-4-4m4 4V9a4 4 0 00-4-4H5a4 4 0 00-4 4v1m4-4V5a4 4 0 014-4h4a4 4 0 014 4v1',
      title: 'Fast Shipping',
      description: 'Quick delivery to your doorstep',
      show: showShipping
    }
  ];
</script>

<div class="trust-badges {className}" role="list" aria-label="Trust badges">
  {#if variant === 'compact'}
    <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
      {#each badges.filter(badge => badge.show) as badge}
        <div class="flex items-center gap-1" role="listitem">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{badge.icon}" />
          </svg>
          <span class="font-medium">{badge.title}</span>
        </div>
      {/each}
    </div>
  {:else if variant === 'detailed'}
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6" role="list">
      {#each badges.filter(badge => badge.show) as badge}
        <div class="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 bg-gray-50" role="listitem">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{badge.icon}" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">{badge.title}</h3>
          <p class="text-xs text-gray-600">{badge.description}</p>
        </div>
      {/each}
    </div>
  {:else}
    <div class="flex flex-wrap items-center justify-center gap-6 py-4" role="list">
      {#each badges.filter(badge => badge.show) as badge}
        <div class="flex flex-col items-center text-center group" role="listitem">
          <div class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{badge.icon}" />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{badge.title}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .trust-badges {
    /* Ensure proper spacing and alignment */
  }
  
  /* Enhanced hover effects for default variant */
  .trust-badges .group:hover .group-hover\:bg-blue-100 {
    background-color: oklch(0.94 0.04 240);
  }
  
  .trust-badges .group:hover .group-hover\:text-blue-600 {
    color: oklch(0.52 0.15 240);
  }
  
  /* Ensure proper contrast */
  .text-gray-900 {
    color: oklch(0.15 0.015 270);
  }
  
  .text-gray-700 {
    color: oklch(0.38 0.025 270);
  }
  
  .text-gray-600 {
    color: oklch(0.5 0.025 270);
  }
  
  .text-gray-500 {
    color: oklch(0.62 0.02 270);
  }
  
  .bg-gray-50 {
    background-color: oklch(0.98 0.005 270);
  }
  
  .bg-gray-100 {
    background-color: oklch(0.96 0.005 270);
  }
  
  .border-gray-200 {
    border-color: oklch(0.95 0.005 270);
  }
  
  .text-blue-600 {
    color: oklch(0.52 0.15 240);
  }
  
  .bg-blue-100 {
    background-color: oklch(0.94 0.04 240);
  }
</style>