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
    'bg-[color:var(--surface-base)] relative w-full max-w-xs rounded-xl',
    'p-1.5 shadow-xl backdrop-blur-xl',
    'border border-[color:var(--border-subtle)]',
    className
  )}
>
  <!-- Header -->
  <div
    class={cn(
      'bg-[color:var(--surface-subtle)] relative mb-4 rounded-xl border border-[color:var(--border-subtle)] p-4'
    )}
  >
    <!-- Glass Effect -->
    {#if glassEffect}
      <div
        aria-hidden="true"
        class="absolute inset-x-0 top-0 h-48 rounded-[inherit] bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-transparent"
      ></div>
    {/if}
    
    <!-- Plan Info -->
    <div class="mb-8 flex items-center justify-between">
      <div class="text-[color:var(--text-secondary)] flex items-center gap-2 text-sm font-medium">
        <span class="text-lg">{planIcon}</span>
        <span>{planName}</span>
      </div>
      {#if badge}
        <span class="border-[color:var(--border-default)] text-[color:var(--text-primary)] rounded-full border px-2 py-0.5 text-xs">
          {badge}
        </span>
      {/if}
    </div>
    
    <!-- Price -->
    <div class="mb-3 flex items-end gap-1">
      <span class="text-3xl font-extrabold tracking-tight">${price}</span>
      <span class="text-[color:var(--text-primary)] pb-1 text-sm">{period}</span>
      {#if originalPrice}
        <span class="text-[color:var(--text-muted)] mr-1 ml-auto text-lg line-through">
          ${originalPrice}
        </span>
      {/if}
    </div>
    
    <!-- CTA Button -->
    <button
      onclick={handleClick}
      class="w-full font-semibold text-white bg-primary hover:bg-[color:var(--primary-600)] py-3 px-4 rounded-lg transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
    >
      {buttonText}
    </button>
  </div>
  
  <!-- Body -->
  <div class="space-y-6 p-3">
    <!-- Features List -->
    <ul class="space-y-3">
      {#each features as feature}
        <li class="text-[color:var(--text-secondary)] flex items-start gap-3 text-sm">
          <span class="mt-0.5">
            <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-primary rounded-full text-xs">✓</span>
          </span>
          <span>{feature}</span>
        </li>
      {/each}
    </ul>
    
    <!-- Separator for locked features -->
    {#if lockedFeatures && lockedFeatures.length > 0}
      <div class="text-[color:var(--text-secondary)] flex items-center gap-3 text-sm">
        <span class="bg-[color:var(--border-default)] h-px flex-1"></span>
        <span class="text-[color:var(--text-secondary)] shrink-0">Upgrade to access</span>
        <span class="bg-[color:var(--border-default)] h-px flex-1"></span>
      </div>
      
      <!-- Locked Features -->
      <ul class="space-y-3">
        {#each lockedFeatures as feature}
          <li class="text-[color:var(--text-muted)] flex items-start gap-3 text-sm opacity-75">
            <span class="mt-0.5">
              <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-[color:var(--text-muted)] rounded-full text-xs">✕</span>
            </span>
            <span>{feature}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>