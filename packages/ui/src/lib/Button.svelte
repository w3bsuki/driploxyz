<script lang="ts">
  import type { ButtonVariant, ButtonSize } from '../types';
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

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-[var(--btn-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors duration-[var(--duration-fast)] relative select-none';

  const variantClasses = {
    primary: 'bg-black text-white focus-visible:ring-[color:var(--state-focus)] hover:bg-gray-800 active:bg-gray-900',
    secondary: 'bg-white text-gray-900 focus-visible:ring-gray-900 hover:bg-gray-50 active:bg-gray-100',
    outline: 'border-2 border-gray-200 bg-white text-gray-900 focus-visible:ring-gray-900 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-gray-900 focus-visible:ring-gray-900 hover:bg-gray-50 active:bg-gray-100',
    danger: 'bg-red-500 text-white focus-visible:ring-red-500 hover:bg-red-700 active:bg-red-800'
  };

  const sizeClasses = {
    sm: 'px-[var(--btn-padding-sm)] text-[var(--btn-font-sm)] min-h-[var(--btn-height-sm)]',    // Compact for dense UI (32px)
    md: 'px-[var(--btn-padding-md)] text-[var(--btn-font-md)] min-h-[var(--btn-height-md)]',      // Standard - most buttons (36px)
    lg: 'px-[var(--btn-padding-lg)] text-[var(--btn-font-lg)] min-h-[var(--btn-height-lg)]'    // Primary CTAs (buy, sell) - MOBILE FIRST (44px)
  };

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'pointer-events-none opacity-70' : ''} ${className}`);
  
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
</script>

{#if href}
  <a {href} class={classes} aria-busy={loading} use:melt={use?.[1]}>
    {#if loading}
      <svg class="{spinnerSizes[size]} mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children?.()}
  </a>
{:else}
  <button {type} {disabled} {onclick} {form} class={classes} aria-busy={loading} use:melt={use?.[1]}>
    {#if loading}
      <svg class="{spinnerSizes[size]} mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children?.()}
  </button>
{/if}

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin var(--duration-slower) linear infinite;
  }
</style>