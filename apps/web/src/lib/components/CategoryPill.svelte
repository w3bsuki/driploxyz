<script lang="ts">
  import { LoadingSpinner } from '@repo/ui';
  
  // Props in runes mode
  let {
    label,
    emoji = null,
    variant = 'neutral',
    loading = false,
    disabled = false,
    ariaLabel,
    spinnerColor = undefined,
    // Selected passthrough attributes
    type = 'button',
    name,
    value,
    id,
    title,
    'data-prefetch': dataPrefetch,
    // Possible event handlers to forward
    onclick: onClick,
    onkeydown: onKeyDown,
    onmouseenter: onMouseEnter,
    ontouchstart: onTouchStart
  }: any = $props();

  const base = 'category-nav-pill shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center min-h-9 focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] transition-colors whitespace-nowrap';
  const styles = variant === 'primary'
    ? 'bg-[color:var(--primary)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover)] disabled:opacity-75 disabled:cursor-not-allowed'
    : 'bg-[color:var(--surface-subtle)] border border-[color:var(--border-default)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-hover)] disabled:opacity-75 disabled:cursor-not-allowed';

  // Optional override for spinner color; default based on variant
  const resolvedSpinnerColor = spinnerColor || (variant === 'primary' ? 'white' : 'gray');
  const hasIcon = !!emoji || !!loading;
</script>

<button
  class={`${base} ${styles} ${hasIcon ? 'gap-1.5' : ''}`}
  {disabled}
  aria-busy={loading}
  aria-label={ariaLabel}
  type={type}
  name={name}
  value={value}
  id={id}
  title={title}
  data-prefetch={dataPrefetch}
  onclick={onClick}
  onkeydown={onKeyDown}
  onmouseenter={onMouseEnter}
  ontouchstart={onTouchStart}
>
  <!-- Reserve icon space for consistent sizing/alignment (spinner or emoji) -->
  {#if hasIcon}
    <span class="inline-flex w-4 h-4 justify-center items-center" aria-hidden="true">
      {#if loading}
        <LoadingSpinner size="sm" color={resolvedSpinnerColor} />
      {:else if emoji}
        <span class="text-sm leading-none">{emoji}</span>
      {/if}
    </span>
  {/if}
  <span>{label}</span>
</button>
