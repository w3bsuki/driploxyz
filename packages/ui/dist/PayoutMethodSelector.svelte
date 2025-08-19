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

<div class="space-y-6 {className}">
  <div class="text-center mb-6">
    <h3 class="text-2xl font-bold text-gray-900 mb-2">Choose Payout Method</h3>
    <p class="text-gray-600">Select how you'd like to receive payments when you sell items</p>
  </div>

  <!-- Method Selection - Copy exact upgrade card styling -->
  <div class="grid grid-cols-1 gap-4">
    {#each payoutMethods as method}
      <button
        onclick={() => handleMethodSelect(method.type)}
        class="w-full text-left"
      >
        <div class="bg-white rounded-xl border p-1.5 shadow-xs backdrop-blur-xl transition-all {selectedMethod === method.type ? 'border-gray-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}">
          <!-- Header with glass effect -->
          <div class="bg-gray-50/80 relative mb-4 rounded-xl border p-4">
            <div 
              aria-hidden="true"
              class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
              style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
            ></div>
            
            <div class="mb-6 flex items-center justify-between">
              <div class="text-gray-600 flex items-center gap-2 text-sm font-medium">
                <span class="text-lg">{method.icon}</span>
                <span>{method.name}</span>
                {#if method.recommended}
                  <span class="bg-linear-to-r from-green-600 to-green-700 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
                    Recommended
                  </span>
                {/if}
              </div>
              <span class="border-gray-200 text-gray-600 rounded-full border px-2 py-0.5 text-xs transition-all {selectedMethod === method.type ? 'bg-gray-900 text-white border-gray-900' : 'hover:border-gray-300'}">
                {selectedMethod === method.type ? 'Selected' : 'Select'}
              </span>
            </div>
            
            <p class="text-gray-600 text-sm mb-3">{method.description}</p>
          </div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Details Input -->
  {#if selectedMethod}
    <div class="space-y-4 pt-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {currentMethod.name} Details
        </label>
        <Input
          bind:value={payoutDetails}
          placeholder={currentMethod.placeholder}
          required
          class="bg-white"
        />
        <p class="text-xs text-gray-500 mt-2">💡 {currentMethod.hint}</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Display Name (Optional)
        </label>
        <Input
          bind:value={payoutName}
          placeholder="Optional display name"
          class="bg-white"
        />
        <p class="text-xs text-gray-500 mt-1">This name will be shown in your payout history</p>
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