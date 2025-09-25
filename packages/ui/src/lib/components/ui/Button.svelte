<script lang="ts">
  import type { ButtonVariant, ButtonSize } from '../../types';
  import { melt } from '@melt-ui/svelte';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    form?: string;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
    use?: Array<any>;  // For Melt UI actions and other use directives
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    href,
    type = 'button',
    form,
    onclick,
    class: className = '',
    children,
    use
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors duration-200 relative select-none touch-manipulation';

  const variantClasses = {
    primary: 'bg-[color:var(--primary)] text-[color:var(--primary-fg)] focus-visible:ring-[color:var(--primary)] hover:bg-[color:var(--primary-600)] active:bg-[color:var(--primary-700)]',
    secondary: 'bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] border border-[color:var(--border-default)] focus-visible:ring-[color:var(--primary)] hover:bg-[color:var(--surface-emphasis)] hover:border-[color:var(--border-emphasis)] active:bg-[color:var(--surface-subtle)]',
    outline: 'border border-[color:var(--border-default)] bg-[color:var(--surface-base)] text-[color:var(--text-primary)] focus-visible:ring-[color:var(--primary)] hover:bg-[color:var(--surface-subtle)] hover:border-[color:var(--border-emphasis)] active:bg-[color:var(--surface-muted)]',
    ghost: 'text-[color:var(--text-primary)] focus-visible:ring-[color:var(--primary)] hover:bg-[color:var(--state-hover)] active:bg-[color:var(--surface-muted)]',
    danger: 'bg-[color:var(--error)] text-[color:var(--error-fg)] focus-visible:ring-[color:var(--error)] hover:bg-[color:var(--status-error-solid)] active:bg-[color:var(--status-error-text)]'
  };

  const sizeClasses = {
    sm: 'px-3 text-xs min-h-8',      // Compact for dense UI (32px)
    md: 'px-4 text-sm min-h-9',      // Standard buttons (36px)
    lg: 'px-6 text-base min-h-11'    // Primary CTAs - accessible touch target (44px)
  };

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'pointer-events-none opacity-70' : ''} ${className}`);
  
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
</script>

{#if href}
  <a {href} class={classes} aria-busy={loading} use:melt={use && use[1] ? use[1] : undefined}>
    {#if loading}
      <svg class="{spinnerSizes[size]} mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children?.()}
  </a>
{:else}
  <button {type} {disabled} {onclick} {form} class={classes} aria-busy={loading} use:melt={use && use[1] ? use[1] : undefined}>
    {#if loading}
      <svg class="{spinnerSizes[size]} mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children?.()}
  </button>
{/if}

