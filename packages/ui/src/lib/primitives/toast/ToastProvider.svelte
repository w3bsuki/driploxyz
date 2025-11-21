<!--
  ToastProvider Component - Svelte 5 Global Toast Container
  Mobile-first toast container with positioning and limits
-->
<script lang="ts">
  // Removed Melt UI dependency - using simple portal implementation
  import { fly } from 'svelte/transition';
  import * as ToastComponent from './Toast.svelte';
  import type { ToastProviderProps, Toast as ToastData, ToastInput } from './types';
  
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
  
  // Simple portal action since we removed Melt UI
  function portal(node: HTMLElement) {
    // Move node to body for proper z-index stacking
    if (typeof document !== 'undefined' && document.body && node.parentNode !== document.body) {
      document.body.appendChild(node);
    }
    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    };
  }
  
  // Internal toast state
  let activeToasts = $state<ToastData[]>([]);
  
  // Position classes for the container
  const containerClasses = $derived.by(() => {
    const baseClasses = 'fixed z-50 flex flex-col pointer-events-none';
    
    const positionClasses = {
      'top': 'toast-position-top items-center',
      'bottom': 'toast-position-bottom items-center',
      'top-left': 'toast-position-top-left items-start',
      'top-right': 'toast-position-top-right items-end',
      'bottom-left': 'toast-position-bottom-left items-start',
      'bottom-right': 'toast-position-bottom-right items-end'
    };
    
    return `${baseClasses} ${positionClasses[position]} ${className}`;
  });
  
  // Container padding based on position
  const containerPadding = $derived.by(() => {
    // Mobile-first: smaller padding on mobile, larger on desktop
    const mobilePadding = 'p-4';
    const desktopPadding = 'sm:p-6';
    return `${mobilePadding} ${desktopPadding}`;
  });
  
  // Animation direction based on position
  const transitionParams = $derived.by(() => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    
    if (isTop && isLeft) return { y: -100, x: -100 };
    if (isTop && isRight) return { y: -100, x: 100 };
    if (isTop) return { y: -100, x: 0 };
    if (isLeft) return { y: 100, x: -100 };
    if (isRight) return { y: 100, x: 100 };
    return { y: 100, x: 0 };
  });
  
  // Public API for adding toasts
  export function addToastData(toast: ToastInput) {
    const resolvedId = toast.id ?? `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastData = {
      id: resolvedId,
      duration: toast.duration ?? duration,
      dismissible: toast.dismissible ?? true,
      persistent: toast.persistent ?? false,
      ...toast
    };
    
    // Enforce limit
    if (activeToasts.length >= limit) {
      // Remove oldest toast
      const oldestId = activeToasts[0]?.id;
      if (oldestId) {
        removeToastData(oldestId);
      }
    }
    
    activeToasts = [...activeToasts, newToast];
    return resolvedId;
  }
  
  export function removeToastData(id: string) {
    activeToasts = activeToasts.filter(toast => toast.id !== id);
  }
  
  export function clearAllToasts() {
    activeToasts = [];
  }
  
  function handleToastDismiss(id: string) {
    removeToastData(id);
  }

  // Provide a default export compatibility by exporting the component instance signature
</script>

<!-- Main content -->
{#if children}
  {@render children()}
{/if}

<!-- Toast Container -->
<div
  use:portal
  class={containerClasses}
  style="gap: {gap}px"
  aria-live="polite"
  aria-label="Notifications"
>
  {#each activeToasts as toast (toast.id)}
    <div
  class={`pointer-events-auto ${containerPadding}`}
      in:fly={{ 
        ...transitionParams, 
        duration: 300, 
        delay: 0 
      }}
      out:fly={{ 
        ...transitionParams, 
        duration: 200, 
        delay: 0 
      }}
    >
      <ToastComponent.default 
        {toast} 
        onDismiss={handleToastDismiss}
      />
    </div>
  {/each}
</div>

<style>
  /* Toast positioning classes */
  .toast-position-top {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .toast-position-bottom {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .toast-position-top-left {
    top: 1rem;
    left: 1rem;
  }
  
  .toast-position-top-right {
    top: 1rem;
    right: 1rem;
  }
  
  .toast-position-bottom-left {
    bottom: 1rem;
    left: 1rem;
  }
  
  .toast-position-bottom-right {
    bottom: 1rem;
    right: 1rem;
  }

  /* Container optimizations for mobile */
  :global([data-melt-toast-viewport]) {
    /* Ensure toasts don't interfere with touch scrolling */
    touch-action: pan-y;
  }
  
  /* Mobile-specific positioning adjustments */
  @media (max-width: 640px) {
    :global([data-melt-toast-viewport]) {
      /* Account for mobile browser chrome */
      padding-bottom: env(safe-area-inset-bottom, 1rem);
      max-width: 100vw;
    }
    
    /* Full width on mobile for better readability */
    :global([data-melt-toast-viewport] .toast) {
      width: calc(100vw - 2rem);
      max-width: none;
    }
  }
  
  /* Stack toasts properly with visual hierarchy */
  :global([data-melt-toast-viewport] > div:nth-child(n+4)) {
    /* Fade out older toasts to indicate they'll be removed */
    opacity: 0.8;
    transform: scale(0.95);
  }
  
  :global([data-melt-toast-viewport] > div:nth-child(n+5)) {
    opacity: 0.6;
    transform: scale(0.9);
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :global([data-melt-toast-viewport] .toast) {
      border-width: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    :global([data-melt-toast-viewport] > div) {
      transition: none !important;
    }
  }
</style>