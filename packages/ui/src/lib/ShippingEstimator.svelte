<script lang="ts">
  import { createDialog, melt } from '@melt-ui/svelte';
  import { Button, Select } from '.';

  interface ShippingOption {
    id: string;
    name: string;
    cost: number;
    estimatedDays: string;
    description?: string;
  }

  interface Props {
    productLocation: string;
    productPrice: number;
    currency: string;
    open?: boolean;
    onClose?: () => void;
    onEstimateSelected?: (option: ShippingOption) => void;
    className?: string;
  }

  let { 
    productLocation,
    productPrice,
    currency = 'EUR',
    open = false,
    onClose,
    onEstimateSelected,
    className = ''
  }: Props = $props();

  // Dialog setup
  const {
    elements: { trigger, portalled, overlay, content, close, title, description },
    states: { open: dialogOpen }
  } = createDialog({
    preventScroll: true,
    closeOnOutsideClick: true,
    onOpenChange: ({ next }) => {
      if (!next) {
        onClose?.();
      }
      return next;
    }
  });

  // State
  let selectedCountry = $state('BG'); // Default to Bulgaria
  let isCalculating = $state(false);
  let shippingOptions = $state<ShippingOption[]>([]);
  let selectedOption = $state<ShippingOption | null>(null);

  // Countries list (simplified for demo - would come from API)
  const countries = [
    { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
  ];

  // Sync external open state
  $effect(() => {
    if (open !== $dialogOpen) {
      if (open) {
        dialogOpen.set(true);
      } else {
        dialogOpen.set(false);
      }
    }
  });

  // Calculate shipping when country changes
  $effect(() => {
    if (selectedCountry) {
      calculateShipping();
    }
  });

  // Shipping calculation (simplified logic - would be API call)
  async function calculateShipping() {
    isCalculating = true;
    shippingOptions = [];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const isInternational = selectedCountry !== 'BG';
    const isFreeShippingEligible = productPrice >= 50;

    const options: ShippingOption[] = [];

    if (!isInternational) {
      // Domestic (Bulgaria) shipping
      if (isFreeShippingEligible) {
        options.push({
          id: 'bg-free',
          name: 'Free Standard Shipping',
          cost: 0,
          estimatedDays: '2-3 business days',
          description: 'Free shipping on orders over €50'
        });
      } else {
        options.push({
          id: 'bg-standard',
          name: 'Standard Shipping',
          cost: 5,
          estimatedDays: '2-3 business days'
        });
      }

      options.push({
        id: 'bg-express',
        name: 'Express Shipping',
        cost: 12,
        estimatedDays: '1-2 business days'
      });
    } else {
      // International shipping
      const baseShippingCost = (['US', 'UK'].includes(selectedCountry)) ? 25 : 15;
      
      options.push({
        id: 'intl-standard',
        name: 'International Standard',
        cost: baseShippingCost,
        estimatedDays: '7-14 business days',
        description: 'Tracked shipping with customs handling'
      });

      options.push({
        id: 'intl-express',
        name: 'International Express',
        cost: baseShippingCost + 20,
        estimatedDays: '3-7 business days',
        description: 'Expedited with priority customs processing'
      });
    }

    shippingOptions = options;
    selectedOption = options[0]; // Auto-select first option
    isCalculating = false;
  }

  function handleSelectShipping() {
    if (selectedOption) {
      onEstimateSelected?.(selectedOption);
      dialogOpen.set(false);
    }
  }

  function formatCurrency(amount: number) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  }

  const selectedCountryName = $derived(
    countries.find(c => c.code === selectedCountry)?.name || 'Unknown'
  );
</script>

<!-- Trigger Button (if used as standalone) -->
{#if !open}
  <Button
    variant="ghost"
    size="sm"
    use={[melt, $trigger]}
    class="text-[color:var(--brand-primary)] hover:text-[color:var(--primary-600)] font-medium {className}"
  >
    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z"/>
    </svg>
    Calculate shipping
  </Button>
{/if}

<!-- Modal -->
<div use:melt={$portalled}>
  {#if $dialogOpen}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50"></div>
    <div
      use:melt={$content}
      class="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[--radius-xl] bg-[color:var(--surface-base)] shadow-[--shadow-2xl]"
    >
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 use:melt={$title} class="text-lg font-semibold text-[color:var(--text-primary)]">
              Shipping Calculator
            </h2>
            <p use:melt={$description} class="text-sm text-[color:var(--text-secondary)]">
              Get shipping estimates for your location
            </p>
          </div>
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

        <!-- Ship From/To -->
        <div class="mb-6 p-4 bg-[color:var(--surface-subtle)] rounded-[--radius-lg]">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-[color:var(--text-secondary)]">Ships from:</span>
              <span class="font-medium text-[color:var(--text-primary)]">{productLocation}</span>
            </div>
          </div>
        </div>

        <!-- Country Selection -->
        <div class="mb-6">
          <label for="country-select" class="block text-sm font-medium text-[color:var(--text-primary)] mb-2">
            Ship to
          </label>
          <select
            id="country-select"
            bind:value={selectedCountry}
            class="w-full h-[--input-height] px-[--input-padding] border border-[color:var(--input-border)] rounded-[--input-radius] bg-[color:var(--input-bg)] text-[color:var(--text-primary)] focus:border-[color:var(--input-focus-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)]"
          >
            {#each countries as country}
              <option value={country.code}>
                {country.flag} {country.name}
              </option>
            {/each}
          </select>
        </div>

        <!-- Shipping Options -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-[color:var(--text-primary)] mb-3">
            Shipping options to {selectedCountryName}
          </h3>

          {#if isCalculating}
            <div class="flex items-center justify-center py-8">
              <div class="flex items-center gap-3 text-sm text-[color:var(--text-secondary)]">
                <div class="w-4 h-4 border-2 border-[color:var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
                Calculating shipping...
              </div>
            </div>
          {:else if shippingOptions.length > 0}
            <div class="space-y-3">
              {#each shippingOptions as option}
                <label class="flex items-start gap-3 p-3 border border-[color:var(--border-default)] rounded-[--radius-lg] hover:border-[color:var(--brand-primary)] transition-colors cursor-pointer {selectedOption?.id === option.id ? 'border-[color:var(--brand-primary)] bg-[color:var(--surface-subtle)]' : ''}">
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    bind:group={selectedOption}
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-medium text-[color:var(--text-primary)]">
                        {option.name}
                      </span>
                      <span class="font-semibold text-[color:var(--text-primary)]">
                        {option.cost === 0 ? 'Free' : formatCurrency(option.cost)}
                      </span>
                    </div>
                    <div class="text-sm text-[color:var(--text-secondary)]">
                      {option.estimatedDays}
                    </div>
                    {#if option.description}
                      <div class="text-xs text-[color:var(--text-tertiary)] mt-1">
                        {option.description}
                      </div>
                    {/if}
                  </div>
                </label>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-sm text-[color:var(--text-muted)]">
              No shipping options available for this location
            </div>
          {/if}
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <Button
            variant="outline"
            size="md"
            onclick={() => dialogOpen.set(false)}
            class="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onclick={handleSelectShipping}
            disabled={!selectedOption || isCalculating}
            class="flex-1"
          >
            Use This Option
          </Button>
        </div>

        {#if selectedOption}
          <div class="mt-4 p-3 bg-[color:var(--status-info-bg)] border border-[color:var(--status-info-border)] rounded-[--radius-lg]">
            <div class="text-sm text-[color:var(--status-info-text)]">
              <strong>Selected:</strong> {selectedOption.name} - 
              {selectedOption.cost === 0 ? 'Free' : formatCurrency(selectedOption.cost)} 
              ({selectedOption.estimatedDays})
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  input[type="radio"] {
    color: var(--brand-primary);
  }

  input[type="radio"]:checked {
    background-color: var(--brand-primary);
    border-color: var(--brand-primary);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>