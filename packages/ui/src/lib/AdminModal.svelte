<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface Props {
    open?: boolean;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'danger' | 'warning' | 'success';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    class?: string;
  }

  let {
    open = false,
    title,
    size = 'md',
    variant = 'default',
    showCloseButton = true,
    closeOnBackdrop = true,
    class: className = ''
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
  }>();

  // Size mappings
  const sizeClasses = {
    sm: 'w-80 max-w-sm',
    md: 'w-96 max-w-md',
    lg: 'w-[500px] max-w-lg',
    xl: 'w-[600px] max-w-xl'
  };

  // Variant mappings for header styling
  const variantClasses = {
    default: 'border-gray-200',
    danger: 'border-red-200',
    warning: 'border-yellow-200',
    success: 'border-green-200'
  };

  const titleVariantClasses = {
    default: 'text-gray-900',
    danger: 'text-red-900',
    warning: 'text-yellow-900',
    success: 'text-green-900'
  };

  function handleBackdropClick(e: MouseEvent) {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleClose() {
    open = false;
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      handleClose();
    }
  }

  $effect(() => {
    if (open) {
      dispatch('open');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on component destroy
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10 sm:pt-20"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <!-- Modal Container -->
    <div
      class="relative mx-auto border shadow-lg rounded-md bg-white {sizeClasses[size]} {variantClasses[variant]} {className}"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b {variantClasses[variant]}">
        <h3
          id="modal-title"
          class="text-lg font-medium {titleVariantClasses[variant]}"
        >
          {title}
        </h3>

        {#if showCloseButton}
          <button
            onclick={handleClose}
            class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Content -->
      <div class="p-4">
        <slot />
      </div>

      <!-- Footer (if provided) -->
      {#if $$slots.footer}
        <div class="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-md">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Ensure modal appears above other content */
  :global(body:has(.modal-open)) {
    overflow: hidden;
  }
</style>