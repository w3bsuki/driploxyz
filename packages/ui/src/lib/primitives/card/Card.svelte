<script lang="ts">
  import type { HTMLAttributes, ClassValue } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  /**
   * Card component with luxury variants for product displays.
   * 
   * @example
   * ```svelte
   * <Card variant="luxury" padding="lg" class={{ 'border-2': highlighted }}>
   *   Content
   * </Card>
   * ```
   */
  export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    variant?: 'default' | 'interactive' | 'luxury' | 'premium' | 'elegant';
    padding?: 'sm' | 'md' | 'lg' | 'xl';
    class?: ClassValue;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
  }

  let {
    variant = 'default',
    padding = 'md',
    class: className = '',
    children,
    onclick,
    ...rest
  }: CardProps = $props();
</script>

{#if onclick}
  <button
    type="button"
    class={[
      'bg-[var(--card-bg)] border rounded-[var(--card-radius)] transition-all',
      {
        'border-[var(--card-border)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] hover:-translate-y-0.5 cursor-pointer': variant === 'interactive',
        'bg-[var(--card-luxury-bg)] border-[var(--card-luxury-border)] shadow-[var(--card-luxury-shadow)]': variant === 'luxury',
        'bg-[var(--card-premium-bg)] border-[var(--card-premium-border)] shadow-[var(--card-premium-shadow)]': variant === 'premium',
        'bg-[var(--card-elegant-bg)] border-[var(--card-elegant-border)] shadow-[var(--card-elegant-shadow)]': variant === 'elegant',
        'border-[var(--card-border)] shadow-[var(--card-shadow)]': variant === 'default',
      },
      {
        'p-[var(--card-padding-sm)]': padding === 'sm',
        'p-[var(--card-padding-md)]': padding === 'md',
        'p-[var(--card-padding-lg)]': padding === 'lg',
        'p-[var(--card-padding-xl)]': padding === 'xl',
      },
      className
    ]}
    {onclick}
    {...rest}
  >
    {@render children?.()}
  </button>
{:else}
  <div
    class={[
      'bg-[var(--card-bg)] border rounded-[var(--card-radius)] transition-all',
      {
        'border-[var(--card-border)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] hover:-translate-y-0.5 cursor-pointer': variant === 'interactive',
        'bg-[var(--card-luxury-bg)] border-[var(--card-luxury-border)] shadow-[var(--card-luxury-shadow)]': variant === 'luxury',
        'bg-[var(--card-premium-bg)] border-[var(--card-premium-border)] shadow-[var(--card-premium-shadow)]': variant === 'premium',
        'bg-[var(--card-elegant-bg)] border-[var(--card-elegant-border)] shadow-[var(--card-elegant-shadow)]': variant === 'elegant',
        'border-[var(--card-border)] shadow-[var(--card-shadow)]': variant === 'default',
      },
      {
        'p-[var(--card-padding-sm)]': padding === 'sm',
        'p-[var(--card-padding-md)]': padding === 'md',
        'p-[var(--card-padding-lg)]': padding === 'lg',
        'p-[var(--card-padding-xl)]': padding === 'xl',
      },
      className
    ]}
    {...rest}
  >
    {@render children?.()}
  </div>
{/if}
