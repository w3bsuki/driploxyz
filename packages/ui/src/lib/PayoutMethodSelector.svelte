<script lang="ts">
  import Input from './Input.svelte';

  interface PayoutMethod {
    type: 'revolut' | 'paypal' | 'card';
    name: string;
    description: string;
    icon: string;
    placeholder: string;
    hint: string;
    recommended?: boolean;
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
    onDetailsChange,
    onNameChange,
    class: className = ''
  }: Props = $props();

  const payoutMethods: PayoutMethod[] = [
    {
      type: 'revolut',
      name: 'Revolut',
      description: 'Fast & secure transfers in BGN/EUR',
      icon: '💳',
      placeholder: '@your_revolut_tag',
      hint: 'Your Revolut tag should start with @ (e.g., @username)',
      recommended: true
    },
    {
      type: 'paypal',
      name: 'PayPal',
      description: 'Global payment solution',
      icon: '🌐',
      placeholder: 'your-email@example.com',
      hint: 'Use the email address associated with your PayPal account'
    },
    {
      type: 'card',
      name: 'Bank Card',
      description: 'Traditional bank transfer',
      icon: '🏦',
      placeholder: 'Bank account or card details',
      hint: 'Include bank name, account number, or card details for transfers'
    }
  ];

  function handleMethodSelect(method: 'revolut' | 'paypal' | 'card') {
    selectedMethod = method;
    onMethodChange?.(method);
    // Clear details when switching methods
    payoutDetails = '';
  }

  const currentMethod = $derived(payoutMethods.find(m => m.type === selectedMethod) || payoutMethods[0]);
</script>

<div class="space-y-4 {className}">
  <!-- Method Selection - Compact Grid -->
  <div class="grid grid-cols-3 gap-3">
    {#each payoutMethods as method}
      <button
        onclick={() => handleMethodSelect(method.type)}
        class="relative group"
      >
        <div class="bg-white/80 backdrop-blur-md rounded-lg border p-4 transition-all duration-200 shadow-sm {selectedMethod === method.type ? 'border-gray-300 shadow-md ring-1 ring-gray-300' : 'border-gray-200/60 hover:border-gray-300/80 hover:shadow-md'}">
          <!-- Icon and Name -->
          <div class="text-center">
            <div class="text-2xl mb-2">{method.icon}</div>
            <div class="font-medium text-sm text-gray-900 mb-1">{method.name}</div>
            <div class="text-xs text-gray-500 leading-tight">{method.description}</div>
            
            {#if method.recommended}
              <div class="mt-2">
                <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  Recommended
                </span>
              </div>
            {/if}
          </div>

          <!-- Selected Indicator -->
          {#if selectedMethod === method.type}
            <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <!-- Inline Details Input for Selected Method -->
  {#if selectedMethod}
    <div class="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60 shadow-sm">
      <div class="space-y-4">
        <div>
          <label for="payout-details" class="block text-sm font-medium text-gray-700 mb-2">
            {currentMethod.name} Details
          </label>
          <Input
            id="payout-details"
            bind:value={payoutDetails}
            placeholder={currentMethod.placeholder}
            required
            class="bg-white"
          />
          <p class="text-xs text-gray-500 mt-1">💡 {currentMethod.hint}</p>
        </div>

        <div>
          <label for="payout-name" class="block text-sm font-medium text-gray-700 mb-2">
            Display Name <span class="text-gray-400 font-normal">(Optional)</span>
          </label>
          <Input
            id="payout-name"
            bind:value={payoutName}
            placeholder="How this method appears in your settings"
            class="bg-white"
          />
        </div>
      </div>
    </div>
  {/if}

  <!-- Security Note -->
  <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
    <div class="flex items-start space-x-3">
      <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-gray-900 mb-1">Secure & Private</p>
        <p class="text-sm text-gray-600">Your payout information is encrypted and only used for processing payments to you.</p>
      </div>
    </div>
  </div>
</div>