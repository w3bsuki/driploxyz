<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    show?: boolean;
    onClose?: () => void;
    closeOnBackdrop?: boolean;
    preventBodyScroll?: boolean;
    zIndex?: number;
    children?: Snippet;
    class?: string;
  }

  let {
    show = false,
    onClose,
    closeOnBackdrop = true,
    preventBodyScroll = true,
    zIndex = 100,
    children,
    class: className = ''
  }: Props = $props();

  // Handle body scroll lock
  $effect(() => {
    if (show && preventBodyScroll) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  });

  // Handle escape key
  $effect(() => {
    if (!show) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  function handleBackdropClick() {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 {className}"
    style="z-index: {zIndex};"
  >
    <!-- Backdrop -->
    <button
      class="absolute inset-0 bg-[var(--modal-overlay-bg)] supports-[backdrop-filter]:backdrop-blur-sm border-0 cursor-default"
      onclick={handleBackdropClick}
      aria-label="Close"
      tabindex="-1"
    ></button>

    <!-- Content -->
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}