<script lang="ts">
  import Input from '../../primitives/input/Input.svelte';

  interface PayoutMethod {
    type: 'revolut' | 'paypal' | 'card';
    name: string;
    description: string;
    icon: string;
    svgIcon?: string;
    placeholder: string;
    hint: string;
    recommended?: boolean;
    color: string;
  }

  interface Props {
    selectedMethod?: 'revolut' | 'paypal' | 'card';
    payoutDetails?: string;
    payoutName?: string;
    onMethodChange?: (method: 'revolut' | 'paypal' | 'card') => void;
    onDetailsChange?: (details: string) => void;
    onNameChange?: (name: string) => void;
    class?: string;
  }

  let { 
    selectedMethod = $bindable('revolut'),
    payoutDetails = $bindable(''),
    payoutName = $bindable(''),
    onMethodChange,
    onDetailsChange: _onDetailsChange,
    onNameChange: _onNameChange,
    class: className = ''
  }: Props = $props();

  const payoutMethods: PayoutMethod[] = [
    {
      type: 'revolut',
      name: 'Revolut',
      description: 'Fast & secure transfers',
      icon: 'R',
      svgIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.376 0H2.624A2.625 2.625 0 000 2.624v18.752A2.625 2.625 0 002.624 24h18.752A2.625 2.625 0 0024 21.376V2.624A2.625 2.625 0 0021.376 0zm-9.245 18.35a2.634 2.634 0 01-2.475-1.742H8.071v5.267H5.935V7.982h5.23c3.115 0 4.573 1.388 4.573 3.593 0 2.082-1.318 3.324-3.13 3.596l2.83 6.704h-2.459a2.634 2.634 0 01-2.848-3.525zm-.965-6.823c1.45 0 2.185-.68 2.185-1.703 0-1.024-.735-1.704-2.185-1.704H8.071v3.407z"/></svg>`,
      placeholder: '@your_revolut_tag',
      hint: 'Your Revolut tag should start with @ (e.g., @username)',
      recommended: true,
      color: 'bg-gradient-to-br from-blue-600 to-indigo-700'
    },
    {
      type: 'paypal',
      name: 'PayPal',
      description: 'Global payments',
      icon: 'P',
      svgIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.419a.641.641 0 01.633-.542h7.26c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19a.641.641 0 00-.633.542l-1.259 6.934a.641.641 0 01-.633.542zm7.392-17.15h-4.79L7.69 15.123h2.022c3.359 0 5.632-1.469 6.276-4.715.32-1.61.094-2.81-.65-3.478-.665-.596-1.732-.91-3.08-.91l.21-1.833z"/></svg>`,
      placeholder: 'your-email@example.com',
      hint: 'Use the email address associated with your PayPal account',
      color: 'bg-gradient-to-br from-blue-500 to-sky-600'
    },
    {
      type: 'card',
      name: 'Bank Card',
      description: 'Bank transfer',
      icon: '💳',
      svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
      placeholder: 'Bank account or card details',
      hint: 'Include bank name, account number, or card details for transfers',
      color: 'bg-gradient-to-br from-gray-700 to-gray-900'
    }
  ];

  let expandedMethod = $state<'revolut' | 'paypal' | 'card' | null>(null);

  function handleMethodSelect(method: 'revolut' | 'paypal' | 'card') {
    if (selectedMethod === method && expandedMethod === method) {
      // If clicking the already selected and expanded method, just collapse
      expandedMethod = null;
    } else {
      selectedMethod = method;
      expandedMethod = method;
      onMethodChange?.(method);
      // Don't clear details when re-selecting same method
      if (selectedMethod !== method) {
        payoutDetails = '';
      }
    }
  }

  const currentMethod = $derived(payoutMethods.find(m => m.type === selectedMethod) || payoutMethods[0]);
</script>

<div class="space-y-4 {className}">
  <!-- Method Selection - Mobile Optimized -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {#each payoutMethods as method}
      <button
        onclick={() => handleMethodSelect(method.type)}
        type="button"
        class="relative group transition-colors duration-300 {expandedMethod === method.type ? 'sm:col-span-1' : ''}"
      >
        <!-- Mobile: Horizontal card, Desktop: Vertical card -->
        <div class="{method.color} text-white rounded-xl p-4 sm:p-5 transition-colors duration-300 shadow-lg hover:shadow-xl {selectedMethod === method.type ? 'ring-2 ring-offset-2 ring-white/40 scale-[1.02]' : ''}">
          <div class="flex sm:flex-col sm:items-center sm:text-center gap-4 sm:gap-3">
            <!-- Icon -->
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 md:backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              {#if method.svgIcon}
                <div class="w-8 h-8 sm:w-9 sm:h-9 text-white">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html method.svgIcon}
                </div>
              {:else}
                <span class="text-2xl">{method.icon}</span>
              {/if}
            </div>
            
            <!-- Text Content -->
            <div class="flex-1 text-left sm:text-center">
              <div class="font-semibold text-base sm:text-lg flex items-center gap-2">
                {method.name}
                {#if method.recommended}
                  <span class="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                {/if}
              </div>
              <div class="text-sm text-white/80 mt-0.5">{method.description}</div>
            </div>
            
            <!-- Selected/Expand Indicator -->
            <div class="flex-shrink-0 sm:absolute sm:top-2 sm:right-2">
              {#if selectedMethod === method.type}
                <div class="w-6 h-6 bg-white/25 md:backdrop-blur rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              {:else}
                <div class="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Expandable Details Input -->
  {#if expandedMethod && selectedMethod}
    <div class="animate-in slide-in-from-top-2 duration-300">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div class="space-y-4">
          <!-- Method Header with Collapse Button -->
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span class="w-8 h-8 {currentMethod.color} text-white rounded-lg flex items-center justify-center text-sm">
                {#if currentMethod.svgIcon}
                  <div class="w-5 h-5">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html currentMethod.svgIcon}
                  </div>
                {:else}
                  {currentMethod.icon}
                {/if}
              </span>
              {currentMethod.name} Details
            </h3>
            <button
              type="button"
              onclick={() => expandedMethod = null}
              class="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label={`Close ${currentMethod.name} payout method details`}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div>
            <label for="payout-details" class="block text-sm font-medium text-gray-900 mb-2">
              {currentMethod.name} Account <span class="text-red-500">*</span>
            </label>
            <Input
              id="payout-details"
              bind:value={payoutDetails}
              placeholder={currentMethod.placeholder}
              required
              class="bg-gray-50 border-gray-300 focus:bg-white"
            />
            <p class="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <svg class="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <span>{currentMethod.hint}</span>
            </p>
          </div>

          <div>
            <label for="payout-name" class="block text-sm font-medium text-gray-900 mb-2">
              Account Holder Name <span class="text-red-500">*</span>
            </label>
            <Input
              id="payout-name"
              bind:value={payoutName}
              placeholder="Your full legal name"
              required
              class="bg-gray-50 border-gray-300 focus:bg-white"
            />
            <p class="text-xs text-gray-500 mt-1">Must match the name on your {currentMethod.name} account for payouts</p>
          </div>
        </div>
      </div>
    </div>
  {:else if selectedMethod && !expandedMethod}
    <!-- Collapsed state - show mini indicator -->
    <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <button
        type="button"
        onclick={() => expandedMethod = selectedMethod}
        class="w-full flex items-center justify-between text-left group"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 {currentMethod.color} text-white rounded-lg flex items-center justify-center text-sm">
            {#if currentMethod.svgIcon}
              <div class="w-5 h-5">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html currentMethod.svgIcon}
              </div>
            {:else}
              {currentMethod.icon}
            {/if}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{currentMethod.name} selected</p>
            {#if !payoutDetails || !payoutName}
              <p class="text-xs text-red-500 font-medium">
                ⚠️ Missing: {!payoutDetails ? 'Account details' : ''}{!payoutDetails && !payoutName ? ' & ' : ''}{!payoutName ? 'Account holder name' : ''}
              </p>
            {:else}
              <p class="text-xs text-gray-500 truncate max-w-52">{payoutDetails}</p>
            {/if}
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  {/if}

  <!-- Security Note - More compact on mobile -->
  <div class="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-gray-900">Secure & Private</p>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Your payout information is encrypted and only used for processing payments to you.</p>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes slide-in-from-top-2 {
    from {
      transform: translateY(-0.5rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
  
  .slide-in-from-top-2 {
    animation-name: slide-in-from-top-2;
  }
  
  .duration-300 {
    animation-duration: 300ms;
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .animate-in,
    .slide-in-from-top-2 {
      animation: none;
    }
  }
</style>