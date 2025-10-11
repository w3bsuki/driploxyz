<script lang="ts">
  import LoadingSpinner from '../../primitives/spinner/LoadingSpinner.svelte';
  
  // Clean, focused props interface
  interface CategoryPillProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'muted';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    emoji?: string;
    itemCount?: number;
    showItemCount?: boolean;
    
    // Accessibility
    ariaLabel?: string;
    ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
    
    // HTML attributes
    type?: 'button' | 'submit' | 'reset';
    name?: string;
    value?: string;
    id?: string;
    title?: string;
    
    // Data attributes
    'data-prefetch'?: string;
    'data-category'?: string;
    
    // Event handlers
    onclick?: (event: MouseEvent) => void;
    onkeydown?: (event: KeyboardEvent) => void;
    onmouseenter?: (event: MouseEvent) => void;
    ontouchstart?: (event: TouchEvent) => void;
    
    // Style customization
    class?: string;
  }
  
  let {
    label,
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled = false,
    emoji,
    itemCount,
    showItemCount = false,
    ariaLabel,
    ariaCurrent,
    type = 'button',
    name,
    value,
    id,
    title,
    'data-prefetch': dataPrefetch,
    'data-category': dataCategory,
    onclick,
    onkeydown,
    onmouseenter,
    ontouchstart,
    class: className = ''
  }: CategoryPillProps = $props();

  // Size configurations
  const sizeConfig = {
    sm: {
      base: 'px-3 py-1.5 text-xs min-h-8',
      icon: 'w-3 h-3',
      gap: 'gap-0.5'
    },
    md: {
      base: 'px-4 py-2 text-sm min-h-9',
      icon: 'w-4 h-4',
      gap: 'gap-0.5'
    },
    lg: {
      base: 'px-5 py-2.5 text-base min-h-10',
      icon: 'w-5 h-5',
      gap: 'gap-0.5'
    }
  };

  // Variant styles using design tokens
  const variantStyles = {
    primary: 'bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] hover:bg-[color:var(--brand-primary)]/90 border-[color:var(--brand-primary)]',
    secondary: 'bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-primary)] border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)]',
    outline: 'bg-transparent text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] border-[color:var(--border-default)] hover:border-[color:var(--border-hover)]',
    muted: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-gray-300 hover:border-gray-400'
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantStyles[variant];
  
  // Base classes
  const baseClasses = `
    category-pill shrink-0 rounded-full font-medium flex items-center justify-between
    transition-all duration-200 whitespace-nowrap border
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current
    ${currentSize.base}
    ${currentVariant}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Determine if we have any icons/badges
  const hasLeftIcon = !!emoji || loading;
  const hasRightBadge = showItemCount && itemCount !== undefined;
  const hasAnyIcon = hasLeftIcon || hasRightBadge;

  // Format item count for display
  const formatItemCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 10000) return `${Math.floor(count / 100) / 10}k`;
    return `${Math.floor(count / 1000)}k`;
  };

  // Spinner color based on variant
  const spinnerColor = variant === 'primary' ? 'white' : 'gray';
</script>

<button
  class={`${baseClasses} ${hasAnyIcon ? currentSize.gap : ''}`}
  {type}
  {name}
  {value}
  {id}
  {title}
  {disabled}
  aria-label={ariaLabel || (hasRightBadge ? `${label} (${itemCount} items)` : label)}
  aria-current={ariaCurrent}
  aria-busy={loading}
  data-prefetch={dataPrefetch}
  data-category={dataCategory}
  {onclick}
  {onkeydown}
  {onmouseenter}
  {ontouchstart}
>
  <!-- Left icon (emoji or loading spinner) -->
  {#if hasLeftIcon}
    <span class={`inline-flex ${currentSize.icon} justify-center items-center`} aria-hidden="true">
      {#if loading}
        <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} color={spinnerColor} />
      {:else if emoji}
        <span class="leading-none">{emoji}</span>
      {/if}
    </span>
  {/if}

  <!-- Content wrapper for perfect spacing -->
  <div class="flex items-center gap-1 flex-1 justify-between">
    <!-- Label -->
    <span class="truncate">{label}</span>

    <!-- Right badge (item count) -->
    {#if hasRightBadge && itemCount !== undefined}
      <span
        class={`
          inline-flex items-center justify-center rounded-full
          bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]
          font-semibold leading-none
          ${size === 'sm' ? 'text-[10px] px-1 py-0 min-w-4 h-3.5' :
            size === 'md' ? 'text-xs px-1 py-0 min-w-4 h-4' :
            'text-sm px-1.5 py-0 min-w-5 h-5'}
        `}
        aria-hidden="true"
      >
        {formatItemCount(itemCount)}
      </span>
    {/if}
  </div>
</button>

<style>
  .category-pill {
    /* Ensure consistent tap target size for mobile */
    min-height: var(--touch-standard, 36px);
    
    /* Smooth transitions */
    transition-property: background-color, border-color, color, box-shadow;
  }
  
  /* Better focus visible styling */
  .category-pill:focus-visible {
    box-shadow: 0 0 0 2px var(--state-focus, rgb(59 130 246 / 0.5));
  }
  
  /* Hover effects */
  @media (hover: hover) {
    .category-pill:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    }
  }
  
  /* Active state */
  .category-pill:active:not(:disabled) {
    transform: translateY(0);
  }
</style>