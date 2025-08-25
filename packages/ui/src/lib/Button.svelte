<script lang="ts">
  import type { ButtonVariant, ButtonSize } from './types.js';

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
    children
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 relative';

  const variantClasses = {
    primary: 'bg-blue-600 text-white focus-visible:ring-blue-500 hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 focus-visible:ring-gray-500 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 hover:bg-gray-50',
    ghost: 'text-gray-700 focus-visible:ring-gray-500 hover:bg-gray-100',
    danger: 'bg-red-600 text-white focus-visible:ring-red-500 hover:bg-red-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'pointer-events-none opacity-70' : ''} ${className}`);
  
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
</script>

{#if href}
  <a {href} class={classes} role="button" aria-busy={loading}>
    {#if loading}
      <svg class="{spinnerSizes[size]} mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children?.()}
  </a>
{:else}
  <button {type} {disabled} {onclick} {form} class={classes} aria-busy={loading}>
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
    animation: spin 0.6s linear infinite;
  }
</style>