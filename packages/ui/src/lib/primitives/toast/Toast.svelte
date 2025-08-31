<!--
  Toast Component - Svelte 5 Individual Toast
  Simple toast component that receives props and renders
-->
<script lang="ts">
  import type { ToastProps, ToastAction } from './types';
  
  interface Props extends ToastProps {}
  
  let { 
    toast,
    onDismiss,
    class: className = ''
  }: Props = $props();
  
  // Auto-dismiss logic if not persistent
  let dismissTimer = $state<number | null>(null);
  
  $effect(() => {
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      dismissTimer = window.setTimeout(() => {
        handleDismiss();
      }, toast.duration);
    }
    
    return () => {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
    };
  });
  
  function handleDismiss() {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    onDismiss?.(toast.id);
  }
  
  function handleAction(action: ToastAction) {
    action.onclick();
    handleDismiss();
  }
  
  // Get toast styles based on type
  const toastStyles = $derived(() => {
    const baseClass = 'toast';
    const typeClass = `toast-${toast.type}`;
    return [baseClass, typeClass, className].filter(Boolean).join(' ');
  });
  
  // Get close button styles
  const closeButtonStyles = $derived(() => {
    return [
      'absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity',
      'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-2',
      'disabled:pointer-events-none',
      'min-h-[var(--touch-standard)] min-w-[var(--touch-standard)]',
      'flex items-center justify-center'
    ].join(' ');
  });
</script>

<div
  class={toastStyles()}
  role="alert"
  aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
  aria-labelledby={toast.title ? `toast-title-${toast.id}` : undefined}
  aria-describedby={`toast-description-${toast.id}`}
>
  <div class="flex flex-1 flex-col gap-1">
    {#if toast.title}
      <div
        id="toast-title-{toast.id}"
        class="text-sm font-semibold leading-none tracking-tight"
      >
        {toast.title}
      </div>
    {/if}
    
    <div
      id="toast-description-{toast.id}"
      class="text-sm opacity-90"
    >
      {toast.description}
    </div>
    
    {#if toast.action}
      <div class="flex gap-2 mt-2">
        <button
          onclick={() => handleAction(toast.action)}
          class="btn btn-{toast.action.variant || 'ghost'} btn-sm"
          type="button"
        >
          {toast.action.label}
        </button>
      </div>
    {/if}
  </div>
  
  {#if toast.dismissible !== false}
    <button
      onclick={handleDismiss}
      class={closeButtonStyles()}
      type="button"
      aria-label="Close notification"
    >
      <!-- Close icon -->
      <svg 
        class="h-4 w-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  {/if}
</div>

<style>
  /* Component-specific styles for better mobile touch targets */
  :global(.toast) {
    /* Ensure minimum touch target on mobile */
    min-height: var(--touch-standard);
    
    /* Mobile-first: full width on small screens */
    width: 100%;
    max-width: 24rem; /* 384px - equivalent to max-w-sm */
  }
  
  /* Add swipe-to-dismiss gesture hint on mobile */
  @media (max-width: 640px) {
    :global(.toast) {
      position: relative;
    }
    
    :global(.toast::before) {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 0.25rem;
      height: 1.5rem;
      background-color: currentColor;
      opacity: 0.2;
      border-top-right-radius: 0.125rem;
      border-bottom-right-radius: 0.125rem;
      transform: translateY(-50%);
    }
  }
  
  /* Enhanced button styles for mobile */
  :global(.toast .btn-sm) {
    min-height: var(--touch-compact);
    padding: 0.25rem 0.75rem;
    font-size: 14px;
  }
  
  /* Animation improvements for mobile */
  @media (prefers-reduced-motion: no-preference) {
    :global(.toast) {
      transition-property: transform;
      transition-duration: 300ms;
      transition-timing-function: cubic-bezier(0, 0, 0.2, 1); /* ease-out equivalent */
    }
    
    :global(.toast:hover) {
      transform: scale(1.02);
    }
  }
</style>