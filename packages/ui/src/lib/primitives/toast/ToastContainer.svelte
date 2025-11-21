<!--
  ToastContainer - Enhanced Global Toast System
  Svelte 5 component that replaces the old ToastContainer
  Integrates ToastProvider with the toast store
-->
<script lang="ts">
  // No lifecycle imports needed - using $effect
  import ToastProvider from './ToastProvider.svelte';
  import { setToastProvider } from './store';
  import type { ToastProviderProps, ToastProviderHandle } from './types';
  
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
  
  let provider = $state<ToastProviderHandle | null>(null);
  
  // Connect the provider to the toast store on mount
  $effect(() => {
    if (provider) {
      setToastProvider(provider);
    } else {
      setToastProvider(null);
    }
  });
</script>

<ToastProvider
  bind:this={provider as any}
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

