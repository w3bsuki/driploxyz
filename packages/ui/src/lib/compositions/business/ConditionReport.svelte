<script lang="ts">
  import { slide, fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  interface ConditionDetail {
    aspect: string;
    rating: number; // 1-5 scale
    notes?: string;
  }

  interface Props {
    condition: 'new' | 'like-new' | 'good' | 'fair';
    details?: ConditionDetail[];
    images?: string[];
    authenticatedBy?: string;
    description?: string;
    class?: string;
  }

  let { 
    condition, 
    details = [],
    images = [],
    authenticatedBy,
    description,
    class: className = '' 
  }: Props = $props();

  let isExpanded = $state(false);

  const conditionData = $derived({
    'new': {
      label: 'New with tags',
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      borderColor: 'border-emerald-200',
      score: 5,
      icon: '🏷️',
      description: 'Brand new item with original tags and packaging'
    },
    'like-new': {
      label: 'Like new',
      color: 'blue',
      bgColor: 'bg-[var(--surface-brand-strong)]/5',
      textColor: 'text-[color-mix(in_oklch,var(--brand-primary-strong)_70%,black_30%)]',
      borderColor: 'border-[var(--surface-brand-strong)]/20',
      score: 4.5,
      icon: '✨',
      description: 'Excellent condition with minimal to no signs of wear'
    },
    'good': {
      label: 'Good condition',
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-200',
      score: 3.5,
      icon: '👍',
      description: 'Shows some signs of wear but in great wearable condition'
    },
    'fair': {
      label: 'Fair condition',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-900',
      borderColor: 'border-orange-200',
      score: 2.5,
      icon: '⚠️',
      description: 'Visible wear and imperfections but still functional'
    }
  }[condition]);

  const defaultDetails = $derived([
    { aspect: 'Overall condition', rating: conditionData.score },
    { aspect: 'Fabric quality', rating: conditionData.score },
    { aspect: 'Color vibrancy', rating: conditionData.score - 0.5 },
    { aspect: 'Hardware/details', rating: conditionData.score }
  ]);

  const conditionDetails: ConditionDetail[] = $derived(details.length > 0 ? details : defaultDetails);

  function getRatingStars(rating: number) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars
    };
  }

  function getRatingColor(rating: number) {
    if (rating >= 4.5) return 'text-emerald-500';
    if (rating >= 3.5) return 'text-[var(--brand-primary-strong)]';
    if (rating >= 2.5) return 'text-amber-500';
    return 'text-orange-500';
  }
</script>

<div class="space-y-4 {className}">
  <!-- Condition Header -->
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Condition</h3>
    {#if authenticatedBy}
      <span class="text-xs text-[var(--brand-primary-strong)] font-medium">✓ Verified by {authenticatedBy}</span>
    {/if}
  </div>

  <!-- Main Condition Card -->
  <div class="border rounded-xl p-4 {conditionData.bgColor} {conditionData.borderColor}">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <span class="text-2xl">{conditionData.icon}</span>
        <div>
          <h4 class="font-semibold {conditionData.textColor}">{conditionData.label}</h4>
          <p class="text-sm text-gray-500 mt-0.5">{conditionData.description}</p>
        </div>
      </div>
      
      <!-- Overall Score -->
      <div class="text-right">
        <div class="flex items-center gap-1 mb-1">
          {#each Array(getRatingStars(conditionData.score).full) as _}
            <svg class="w-4 h-4 {getRatingColor(conditionData.score)}" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          {/each}
          {#if getRatingStars(conditionData.score).half}
            <svg class="w-4 h-4 {getRatingColor(conditionData.score)}" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-path="polygon(0 0, 50% 0, 50% 100%, 0 100%)"/>
            </svg>
          {/if}
          {#each Array(getRatingStars(conditionData.score).empty) as _}
            <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          {/each}
        </div>
        <span class="text-sm font-semibold {conditionData.textColor}">{conditionData.score}/5</span>
      </div>
    </div>

    <!-- Quick Details Preview -->
    <div class="grid grid-cols-2 gap-2 text-sm">
      {#each conditionDetails.slice(0, 2) as detail, index}
        <div 
          class="flex items-center justify-between"
          in:fly={{ x: -20, duration: 300, delay: index * 100, easing: quintOut }}
        >
          <span class="text-gray-900">{detail.aspect}:</span>
          <div class="flex items-center gap-1">
            {#each Array(getRatingStars(detail.rating).full) as _}
              <svg class="w-3 h-3 {getRatingColor(detail.rating)}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            {/each}
            {#each Array(getRatingStars(detail.rating).empty) as _}
              <svg class="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Expand Button -->
    <button
      onclick={() => isExpanded = !isExpanded}
      class="mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium {conditionData.textColor} hover:opacity-75 transition-opacity"
    >
      <span>{isExpanded ? 'Show less' : 'Full condition report'}</span>
      <svg 
        class="w-4 h-4 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
  </div>

  <!-- Detailed Condition Report -->
  {#if isExpanded}
    <div 
      class="space-y-4 bg-white border rounded-xl p-4"
      in:slide={{ duration: 300, easing: quintOut }}
    >
      <!-- Detailed Ratings -->
      <div class="space-y-3">
        <h5 class="font-semibold text-gray-900">Detailed assessment</h5>
        {#each conditionDetails as detail, index}
          <div 
            class="flex items-center justify-between"
            in:fly={{ x: -20, duration: 300, delay: index * 50, easing: quintOut }}
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{detail.aspect}</span>
              {#if detail.notes}
                <p class="text-xs text-gray-500 mt-0.5">{detail.notes}</p>
              {/if}
            </div>
            <div class="flex items-center gap-1 ml-4">
              {#each Array(getRatingStars(detail.rating).full) as _}
                <svg class="w-4 h-4 {getRatingColor(detail.rating)}" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              {/each}
              {#if getRatingStars(detail.rating).half}
                <svg class="w-4 h-4 {getRatingColor(detail.rating)}" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-path="polygon(0 0, 50% 0, 50% 100%, 0 100%)"/>
                </svg>
              {/if}
              {#each Array(getRatingStars(detail.rating).empty) as _}
                <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              {/each}
              <span class="text-sm font-medium text-gray-500 ml-1">{detail.rating}/5</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Condition Images -->
      {#if images.length > 0}
        <div>
          <h5 class="font-semibold text-gray-900 mb-2">Condition photos</h5>
          <div class="grid grid-cols-3 gap-2">
            {#each images as image, index}
              <div 
                class="aspect-square rounded-lg overflow-hidden"
                in:fade={{ duration: 300, delay: index * 100 }}
              >
                <img src={image} alt="Condition detail {index + 1}" class="w-full h-full object-cover" />
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Additional Description -->
      {#if description}
        <div>
          <h5 class="font-semibold text-gray-900 mb-2">Seller notes</h5>
          <p class="text-sm text-gray-900 leading-relaxed">{description}</p>
        </div>
      {/if}

      <!-- Authenticity Badge -->
      {#if authenticatedBy}
        <div class="bg-[var(--surface-brand-strong)]/5 border border-[var(--surface-brand-strong)]/20 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-[var(--brand-primary-strong)]" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-sm font-semibold text-[color-mix(in_oklch,var(--brand-primary-strong)_70%,black_30%)]">Authenticated by {authenticatedBy}</p>
              <p class="text-xs text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)]">This item has been verified for authenticity and condition</p>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>