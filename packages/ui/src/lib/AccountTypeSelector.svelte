<script lang="ts">
  interface AccountType {
    value: 'personal' | 'premium' | 'brand';
    title: string;
    description: string;
    features: string[];
    price?: string;
    icon: string;
    popular?: boolean;
  }

  interface Props {
    selected?: 'personal' | 'premium' | 'brand';
    onSelect?: (type: 'personal' | 'premium' | 'brand') => void;
    class?: string;
    showDiscountCode?: boolean;
    onDiscountCodeChange?: (code: string) => void;
    discountCode?: string;
    translations?: {
      personalTitle?: string;
      personalDescription?: string;
      personalFeatures?: string[];
      premiumTitle?: string;
      premiumDescription?: string;
      premiumFeatures?: string[];
      brandTitle?: string;
      brandDescription?: string;
      brandFeatures?: string[];
      free?: string;
      perMonth?: string;
      popular?: string;
      selected?: string;
      select?: string;
      haveDiscountCode?: string;
      enterCode?: string;
    };
  }

  let { 
    selected = 'personal',
    onSelect,
    class: className = '',
    showDiscountCode = false,
    onDiscountCodeChange,
    discountCode = '',
    translations = {}
  }: Props = $props();
  
  let localDiscountCode = $state(discountCode);

  const accountTypes: AccountType[] = [
    {
      value: 'personal',
      title: translations.personalTitle || 'Personal Account',
      description: translations.personalDescription || 'Perfect for individuals selling from their personal wardrobe',
      features: translations.personalFeatures || [
        'List up to 20 items',
        'Basic seller tools',
        'Community access',
        'Secure payments'
      ],
      price: translations.free || 'Free',
      icon: '👤'
    },
    {
      value: 'premium',
      title: translations.premiumTitle || 'Premium Account',
      description: translations.premiumDescription || 'Boost your visibility and sales',
      features: translations.premiumFeatures || [
        '10 boosted ads per month',
        '3-7 days homepage visibility',
        'Priority customer support',
        'Advanced analytics',
        'No ads in your listings'
      ],
      price: `25 BGN`,
      icon: '⭐',
      popular: true
    },
    {
      value: 'brand',
      title: translations.brandTitle || 'Brand Account',
      description: translations.brandDescription || 'Designed for businesses and professional sellers',
      features: translations.brandFeatures || [
        'List unlimited products',
        'Brand verification badge',
        'Bulk upload tools',
        'Priority support',
        'Advanced analytics dashboard'
      ],
      price: `50 BGN`,
      icon: '🏢'
    }
  ];

  function handleSelect(type: 'personal' | 'premium' | 'brand') {
    selected = type;
    onSelect?.(type);
  }
  
  function handleDiscountCodeChange() {
    onDiscountCodeChange?.(localDiscountCode);
  }
</script>

<!-- Copy exact upgrade cards layout -->
<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center {className}">
    {#each accountTypes as accountType}
      <button
        onclick={() => handleSelect(accountType.value)}
        class="w-full text-left max-w-xs relative"
      >
        <div class="bg-white rounded-xl border p-1.5 shadow-xs backdrop-blur-xl transition-all {selected === accountType.value ? 'border-gray-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}">
        <!-- Popular badge -->
        {#if accountType.popular}
          <div class="absolute -top-2 left-4 z-10">
            <div class="bg-linear-to-r from-green-600 to-green-700 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
              {translations.popular || 'Popular'}
            </div>
          </div>
        {/if}

        <!-- Header with glass effect - exact copy from upgrade -->
        <div class="bg-gray-50/80 relative mb-4 rounded-xl border p-4">
          <div 
            aria-hidden="true"
            class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
            style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
          ></div>
          
          <div class="mb-8 flex items-center justify-between">
            <div class="text-gray-600 flex items-center gap-2 text-sm font-medium">
              <span class="text-lg">{accountType.icon}</span>
              <span>{accountType.title}</span>
            </div>
            <span class="border-gray-200 text-gray-600 rounded-full border px-2 py-0.5 text-xs transition-all {selected === accountType.value ? 'bg-gray-900 text-white border-gray-900' : 'hover:border-gray-300'}">
              {selected === accountType.value ? (translations.selected || 'Selected') : (translations.select || 'Select')}
            </span>
          </div>
          
          <div class="mb-3 flex items-end gap-1">
            <span class="text-3xl font-extrabold tracking-tight">{accountType.price}</span>
            <span class="text-gray-700 pb-1 text-sm">{accountType.value === 'brand' ? (translations.perMonth || '/ month') : ''}</span>
          </div>
          
          <p class="text-gray-600 text-sm mb-4">{accountType.description}</p>
        </div>
        
        <!-- Features -->
        <div class="space-y-6 p-3">
          <ul class="space-y-3">
            {#each accountType.features as feature}
              <li class="text-gray-600 flex items-start gap-3 text-sm">
                <span class="mt-0.5">
                  <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
                </span>
                <span>{feature}</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </button>
  {/each}
  </div>
  
  {#if showDiscountCode && selected === 'brand'}
    <div class="max-w-md mx-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {translations.haveDiscountCode || 'Have a discount code?'}
      </label>
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={localDiscountCode}
          placeholder={translations.enterCode || 'Enter code'}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onblur={handleDiscountCodeChange}
        />
        <button
          type="button"
          onclick={handleDiscountCodeChange}
          class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Apply
        </button>
      </div>
      {#if localDiscountCode === 'Indecisive'}
        <p class="text-green-600 text-sm mt-2">✅ 90% discount will be applied!</p>
      {/if}
    </div>
  {/if}
</div>