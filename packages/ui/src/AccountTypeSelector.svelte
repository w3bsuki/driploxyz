<script lang="ts">
  interface AccountType {
    value: 'personal' | 'brand';
    title: string;
    description: string;
    features: string[];
    price?: string;
    icon: string;
    popular?: boolean;
  }

  interface Props {
    selected?: 'personal' | 'brand';
    onSelect?: (type: 'personal' | 'brand') => void;
    class?: string;
    translations?: {
      personalTitle?: string;
      personalDescription?: string;
      personalFeatures?: string[];
      brandTitle?: string;
      brandDescription?: string;
      brandFeatures?: string[];
      free?: string;
      perMonth?: string;
      popular?: string;
      selected?: string;
      select?: string;
    };
  }

  let { 
    selected = 'personal',
    onSelect,
    class: className = '',
    translations = {}
  }: Props = $props();

  const accountTypes: AccountType[] = [
    {
      value: 'personal',
      title: translations.personalTitle || 'Personal Account',
      description: translations.personalDescription || 'Perfect for individuals selling from their personal wardrobe',
      features: translations.personalFeatures || [
        'List unlimited items',
        'Basic seller tools',
        'Community access',
        'Secure payments'
      ],
      price: translations.free || 'Free',
      icon: '👤',
      popular: true
    },
    {
      value: 'brand',
      title: translations.brandTitle || 'Brand Account',
      description: translations.brandDescription || 'Designed for businesses and professional sellers',
      features: translations.brandFeatures || [
        'Advanced analytics',
        'Bulk upload tools',
        'Priority support',
        'Custom branding'
      ],
      price: `50 BGN`,
      icon: '🏪'
    }
  ];

  function handleSelect(type: 'personal' | 'brand') {
    selected = type;
    onSelect?.(type);
  }
</script>

<!-- Copy exact upgrade cards layout -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center {className}">
  {#each accountTypes as accountType}
    <button
      onclick={() => handleSelect(accountType.value)}
      class="w-full text-left max-w-xs relative"
    >
      <div class="bg-white rounded-xl border p-1.5 shadow-sm backdrop-blur-xl transition-all {selected === accountType.value ? 'border-gray-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}">
        <!-- Popular badge -->
        {#if accountType.popular}
          <div class="absolute -top-2 left-4 z-10">
            <div class="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">
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