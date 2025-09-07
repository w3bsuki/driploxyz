<script lang="ts">
  interface Props {
    open?: boolean;
    onClose?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOutsideClick?: boolean;
    class?: string;
    // Advanced snippet patterns - multiple named content areas
    header?: import('svelte').Snippet;
    body?: import('svelte').Snippet<[{ close: () => void }]>;
    footer?: import('svelte').Snippet<[{ close: () => void }]>;
    children?: import('svelte').Snippet;
  }

  let {
    open = false,
    onClose,
    size = 'md',
    closeOnOutsideClick = true,
    class: className = '',
    header,
    body,
    footer,
    children
  }: Props = $props();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  function handleClose() {
    onClose?.();
  }

  function handleOutsideClick(event: MouseEvent) {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    } else if (event.key === 'Tab') {
      // Focus trap logic
      const modal = event.currentTarget as HTMLElement;
      const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift+Tab - move to last element if on first
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab - move to first element if on last
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }

  // Focus management
  let previouslyFocused: HTMLElement | null = null;

  $effect(() => {
    if (open) {
      // Store currently focused element
      previouslyFocused = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal after a tick
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement;
        if (modal) {
          const focusableElement = modal.querySelector(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
          ) as HTMLElement;
          focusableElement?.focus();
        }
      }, 0);
    } else if (previouslyFocused) {
      // Return focus to previously focused element
      previouslyFocused.focus();
      previouslyFocused = null;
    }
  });

  // Close context object for snippets
  const closeContext = { close: handleClose };
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color:var(--surface-inverse)] bg-opacity-50"
    onclick={handleOutsideClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="bg-[color:var(--surface-base)] rounded-lg shadow-sm md:shadow-xl w-full {sizeClasses[size]} {className}">
      <!-- Header Section -->
      {#if header}
        <div class="px-6 py-4 border-b border-[color:var(--border-subtle)]">
          {@render header()}
          <button
            onclick={handleClose}
            class="absolute top-4 right-4 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
            aria-label="Close modal"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      {/if}

      <!-- Body Section - with context passing -->
      {#if body}
        <div class="p-6">
          {@render body(closeContext)}
        </div>
      {:else if children}
        <div class="p-6">
          {@render children()}
        </div>
      {/if}

      <!-- Footer Section - with context passing -->
      {#if footer}
        <div class="px-6 py-4 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-base)] rounded-b-lg">
          {@render footer(closeContext)}
        </div>
      {/if}
    </div>
  </div>
{/if}