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

  // Size configurations - Modern 2025 touch targets (Vinted/Apple style: 36-44px)
  const sizeConfig = {
    sm: {
      base: 'px-3 py-1.5 text-xs min-h-[var(--touch-compact)]',
      icon: 'w-3 h-3',
      gap: 'gap-0.5'
    },
    md: {
      base: 'px-4 py-2 text-sm min-h-[var(--touch-standard)]',
      icon: 'w-4 h-4',
      gap: 'gap-0.5'
    },
    lg: {
      base: 'px-5 py-2.5 text-base min-h-[var(--touch-primary)]',
      icon: 'w-5 h-5',
      gap: 'gap-0.5'
    }
  };

  // Variant styles using design tokens
  const variantStyles = {
    primary: 'bg-(--brand-primary) text-(--text-inverse) hover:bg-(--brand-primary)/90 border-(--brand-primary)',
    secondary: 'bg-(--surface-subtle) text-(--text-secondary) hover:bg-(--surface-muted) hover:text-(--text-primary) border-(--border-subtle) hover:border-(--border-default)',
    outline: 'bg-transparent text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-subtle) border-(--border-default) hover:border-(--border-hover)',
    // Muted variant aligned to semantic tokens (no raw grays)
    muted: 'bg-(--surface-subtle) text-(--text-secondary) hover:bg-(--surface-muted) hover:text-(--text-primary) border-(--border-subtle) hover:border-(--border-default)'
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantStyles[variant];
  
  // Base classes
  const baseClasses = `
    category-pill shrink-0 rounded-(--radius-lg) font-medium flex items-center justify-between
    transition-all duration-200 whitespace-nowrap border
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--state-focus) focus-visible:ring-offset-1
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
    /* Modern 2025 touch target (Vinted/Apple style: 40px standard) */
    min-height: var(--touch-standard, 40px);
    
    /* Smooth transitions */
    transition-property: background-color, border-color, color, box-shadow;
  }
  
  /* Better focus visible styling */
  .category-pill:focus-visible {
    box-shadow: 0 0 0 2px var(--state-focus);
  }
  
  /* Hover effects */
  @media (hover: hover) {
    .category-pill:hover:not(:disabled) {
      /* Removed lift and shadow for flat Vinted style */
      /* transform: translateY(-1px); */
      /* box-shadow: var(--shadow-sm); */
    }
  }
  
  /* Active state */
  .category-pill:active:not(:disabled) {
    /* transform: translateY(0); */
  }
</style>