<script lang="ts">
  import { cn } from '../lib/utils';
  
  interface Props {
    class?: string;
    planName: string;
    planIcon?: string;
    badge?: string;
    price: number;
    period?: string;
    originalPrice?: number;
    buttonText?: string;
    features: string[];
    lockedFeatures?: string[];
    onSelect?: () => void;
    glassEffect?: boolean;
  }
  
  let { 
    class: className = '',
    planName,
    planIcon = '👤',
    badge,
    price,
    period = '/ month',
    originalPrice,
    buttonText = 'Get Started',
    features = [],
    lockedFeatures = [],
    onSelect,
    glassEffect = true
  }: Props = $props();
  
  function handleClick() {
    onSelect?.();
  }
</script>

<!-- Card Container -->
<div
  class={cn(
    'bg-white relative w-full max-w-xs rounded-xl dark:bg-transparent',
    'p-1.5 shadow-xl backdrop-blur-xl',
    'dark:border-gray-200/20 border',
    className
  )}
>
  <!-- Header -->
  <div
    class={cn(
      'bg-gray-50/80 dark:bg-gray-800/50 relative mb-4 rounded-xl border p-4'
    )}
  >
    <!-- Glass Effect -->
    {#if glassEffect}
      <div
        aria-hidden="true"
        class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
        style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
      />
    {/if}
    
    <!-- Plan Info -->
    <div class="mb-8 flex items-center justify-between">
      <div class="text-gray-600 flex items-center gap-2 text-sm font-medium">
        <span class="text-lg">{planIcon}</span>
        <span>{planName}</span>
      </div>
      {#if badge}
        <span class="border-gray-300 text-gray-700 rounded-full border px-2 py-0.5 text-xs">
          {badge}
        </span>
      {/if}
    </div>
    
    <!-- Price -->
    <div class="mb-3 flex items-end gap-1">
      <span class="text-3xl font-extrabold tracking-tight">${price}</span>
      <span class="text-gray-700 pb-1 text-sm">{period}</span>
      {#if originalPrice}
        <span class="text-gray-500 mr-1 ml-auto text-lg line-through">
          ${originalPrice}
        </span>
      {/if}
    </div>
    
    <!-- CTA Button -->
    <button
      onclick={handleClick}
      class="w-full font-semibold text-white bg-black hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors"
    >
      {buttonText}
    </button>
  </div>
  
  <!-- Body -->
  <div class="space-y-6 p-3">
    <!-- Features List -->
    <ul class="space-y-3">
      {#each features as feature}
        <li class="text-gray-600 flex items-start gap-3 text-sm">
          <span class="mt-0.5">
            <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
          </span>
          <span>{feature}</span>
        </li>
      {/each}
    </ul>
    
    <!-- Separator for locked features -->
    {#if lockedFeatures && lockedFeatures.length > 0}
      <div class="text-gray-500 flex items-center gap-3 text-sm">
        <span class="bg-gray-400 h-[1px] flex-1"></span>
        <span class="text-gray-500 shrink-0">Upgrade to access</span>
        <span class="bg-gray-400 h-[1px] flex-1"></span>
      </div>
      
      <!-- Locked Features -->
      <ul class="space-y-3">
        {#each lockedFeatures as feature}
          <li class="text-gray-600 flex items-start gap-3 text-sm opacity-75">
            <span class="mt-0.5">
              <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-gray-400 rounded-full text-xs">✕</span>
            </span>
            <span>{feature}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>