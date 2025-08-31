<!--
  ToastContainer - Enhanced Global Toast System
  Svelte 5 component that replaces the old ToastContainer
  Integrates ToastProvider with the toast store
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { setToastProvider } from './store';
  import ToastProvider from './ToastProvider.svelte';
  import type { ToastProviderProps } from './types';
  
  interface Props extends ToastProviderProps {
    children?: import('svelte').Snippet;
  }
  
  let {
    limit = 5,
    duration = 5000,
    position = 'bottom-right',
    gap = 8,
    class: className = '',
    children
  }: Props = $props();
  
  let provider: any = $state(null);
  
  // Connect the provider to the toast store on mount
  onMount(() => {
    if (provider) {
      setToastProvider(provider);
    }
  });
</script>

<ToastProvider
  bind:this={provider}
  {limit}
  {duration}
  {position}
  {gap}
  class={className}
>
  {#if children}
    {@render children()}
  {/if}
</ToastProvider>

<style>
  /* Global toast container styles for mobile optimization */
  :global(body:has([data-melt-toast-viewport])) {
    /* Prevent content shift when toasts appear */
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  
  /* Ensure toasts don't interfere with navigation */
  @media (max-width: 640px) {
    :global([data-melt-toast-viewport]) {
      /* Position above bottom navigation if present */
      bottom: calc(env(safe-area-inset-bottom, 0) + var(--bottom-nav-height, 0px));
    }
    
    /* Adjust z-index to be above most UI elements but below modals */
    :global([data-melt-toast-viewport]) {
      z-index: 45;
    }
  }
</style>