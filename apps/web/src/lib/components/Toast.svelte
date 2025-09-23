<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast.svelte';
  import { fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Get toast data
  const toasts = $derived(toast.all);

  // Toast icons
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`
  };

  // Toast styling classes
  const toastClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  function handleDismiss(toastItem: Toast) {
    if (toastItem.dismissible !== false) {
      toast.remove(toastItem.id);
    }
  }

  function handleAction(toastItem: Toast) {
    if (toastItem.action) {
      toastItem.action.onClick();
      toast.remove(toastItem.id);
    }
  }

</script>

<!-- Toast Container -->
<div
  class="toast-container fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {#each toasts as toastItem (toastItem.id)}
    <div
      class="toast-item pointer-events-auto max-w-sm w-full shadow-lg rounded-lg border {toastClasses[toastItem.type]}"
      in:fly={{ x: 300, duration: 300, easing: quintOut }}
      out:scale={{ duration: 200, easing: quintOut }}
      role="alert"
      aria-labelledby="toast-{toastItem.id}-title"
      aria-describedby="toast-{toastItem.id}-description"
    >
      <div class="p-4">
        <div class="flex items-start">
          <!-- Icon -->
          <div class="flex-shrink-0 {iconClasses[toastItem.type]}">
            <div class="w-5 h-5">
              <!-- svelte-ignore svelte/no-at-html-tags -->
              {@html icons[toastItem.type]}
            </div>
          </div>

          <!-- Content -->
          <div class="ml-3 flex-1 min-w-0">
            {#if toastItem.title}
              <p id="toast-{toastItem.id}-title" class="text-sm font-medium">
                {toastItem.title}
              </p>
            {/if}

            <p
              id="toast-{toastItem.id}-description"
              class="text-sm {toastItem.title ? 'mt-1' : ''}"
            >
              {toastItem.message}
            </p>

            {#if toastItem.description}
              <p class="text-xs mt-1 opacity-75">
                {toastItem.description}
              </p>
            {/if}

            <!-- Action Button -->
            {#if toastItem.action}
              <div class="mt-3">
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
                  onclick={() => handleAction(toastItem)}
                >
                  {toastItem.action.label}
                </button>
              </div>
            {/if}
          </div>

          <!-- Dismiss Button -->
          {#if toastItem.dismissible !== false}
            <div class="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                class="inline-flex rounded-md bg-transparent hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors p-1"
                onclick={() => handleDismiss(toastItem)}
                aria-label="Dismiss notification"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Progress bar for timed toasts -->
      {#if toastItem.duration && toastItem.duration > 0 && !toastItem.persistent}
        <div class="h-1 bg-black bg-opacity-10">
          <div
            class="h-full bg-current opacity-50 toast-progress"
            style="animation: toast-progress {toastItem.duration}ms linear"
          ></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  @keyframes toast-progress {
    from { width: 100%; }
    to { width: 0%; }
  }

  .toast-progress {
    animation-fill-mode: forwards;
  }

  .toast-container {
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .toast-item {
    /* Ensure proper stacking and animations */
    transform-origin: top right;
  }

  /* Focus styles for accessibility */
  .toast-item:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .toast-item {
      transition: none;
    }

    .toast-progress {
      animation: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .toast-item {
      border-width: 2px;
    }
  }

  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .toast-item {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
  }
</style>