<script lang="ts">
  interface Props {
    open?: boolean;
    onClose?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    labelledBy?: string;
    descriptionId?: string;
    class?: string;
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
    closeOnEscape = true,
    labelledBy,
    descriptionId,
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
  } as const;

  let overlayRef: HTMLDivElement | null = $state(null);
  let dialogRef: HTMLDivElement | null = $state(null);
  let previouslyFocused: HTMLElement | null = null;
  let bodyScrollDepth = 0;

  const focusSelectors =
    'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusFirstElement() {
    if (!dialogRef) return;
    const focusable = dialogRef.querySelectorAll<HTMLElement>(focusSelectors);
    (focusable[0] ?? dialogRef).focus();
  }

  function handleClose() {
    onClose?.();
  }

  function handleOutsideClick(event: MouseEvent) {
    if (closeOnOutsideClick && event.target === overlayRef) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      handleClose();
      return;
    }

    if (event.key === 'Tab') {
      if (!dialogRef) return;
      const focusable = dialogRef.querySelectorAll<HTMLElement>(focusSelectors);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  $effect(() => {
    if (!open || typeof document === 'undefined') return;

    previouslyFocused = document.activeElement as HTMLElement;
    focusFirstElement();

    const scrollbarWidth =
      typeof window === 'undefined'
        ? 0
        : window.innerWidth - document.documentElement.clientWidth;
    bodyScrollDepth += 1;
    const bodyStyle = document.body.style;
    const originalOverflow = bodyStyle.overflow;
    const originalPadding = bodyStyle.paddingRight;
    bodyStyle.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      bodyStyle.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      bodyScrollDepth = Math.max(0, bodyScrollDepth - 1);
      if (bodyScrollDepth === 0) {
        bodyStyle.overflow = originalOverflow;
        bodyStyle.paddingRight = originalPadding;
      }
      previouslyFocused?.focus();
      previouslyFocused = null;
    };
  });

  $effect(() => {
    if (!open || !dialogRef || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      if (dialogRef && dialogRef.contains(document.activeElement)) return;
      focusFirstElement();
    });
    observer.observe(dialogRef, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  const closeContext = { close: handleClose };
</script>

{#if open}
  <div
    bind:this={overlayRef}
    class="fixed inset-0 z-[var(--z-90)] flex items-center justify-center p-[var(--space-6)] sm:p-[var(--space-8)] bg-[color:color-mix(in oklch, var(--surface-inverse) 65%, transparent)] backdrop-blur-[8px]"
    onclick={handleOutsideClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={labelledBy}
    aria-describedby={descriptionId}
    tabindex="0"
  >
    <div
      bind:this={dialogRef}
      class={`w-full ${sizeClasses[size]} rounded-[length:var(--modal-radius)] bg-[color:var(--modal-bg)] shadow-[var(--modal-shadow)] border border-[color:var(--border-subtle)] focus:outline-none ${className}`}
    >
      <!-- Header Section -->
      {#if header}
        <div class="relative flex items-start gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)] border-b border-[color:var(--border-subtle)]">
          {@render header()}
          <button
            onclick={handleClose}
            class="ml-auto inline-flex size-9 items-center justify-center rounded-full text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--state-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--modal-bg)]"
            aria-label="Close modal"
          >
            <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      {/if}

      <!-- Body Section - with context passing -->
      {#if body}
        <div class="px-[var(--space-6)] py-[var(--space-5)]">
          {@render body(closeContext)}
        </div>
      {:else if children}
        <div class="px-[var(--space-6)] py-[var(--space-5)]">
          {@render children()}
        </div>
      {/if}

      <!-- Footer Section - with context passing -->
      {#if footer}
        <div class="flex flex-col gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)] border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-subtle)] rounded-b-[length:var(--modal-radius)]">
          {@render footer(closeContext)}
        </div>
      {/if}
    </div>
  </div>
{/if}