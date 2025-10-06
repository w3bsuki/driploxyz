<script lang="ts">
  import { lockScroll, unlockScroll } from '../../utils/scrollLock';

  interface Props {
    isOpen: boolean;
    action: string; // "favorite", "purchase", "add to wishlist", etc.
    onClose: () => void;
    onSignIn: () => void;
    onSignUp: () => void;
  }

  let { isOpen, action, onClose, onSignIn, onSignUp }: Props = $props();

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle scroll locking when modal opens/closes
  $effect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    // Cleanup on unmount
    return () => {
      unlockScroll();
    };
  });
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-[color:var(--modal-overlay)] z-[var(--z-modal-backdrop)] flex items-center justify-center p-4"
    style="padding-top: max(var(--safe-area-top), 1rem); padding-bottom: max(var(--safe-area-bottom), 1rem); padding-left: max(var(--safe-area-left), 1rem); padding-right: max(var(--safe-area-right), 1rem);"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-popup-title"
    tabindex="-1"
  >
    <!-- Modal Content -->
    <div class="bg-[color:var(--modal-bg)] rounded-[var(--modal-radius)] w-full max-w-sm p-[var(--modal-padding)] shadow-[var(--modal-shadow)] relative max-h-[90vh] overflow-y-auto z-[var(--z-modal)] animate-in fade-in-0 scale-in-95 duration-200">
      <!-- Close button -->
      <button
        onclick={onClose}
        class="absolute top-4 right-4 p-1 min-h-[var(--touch-standard)] min-w-[var(--touch-standard)] text-[color:var(--text-disabled)] hover:text-[color:var(--text-muted)] rounded-full hover:bg-[color:var(--state-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--brand-primary-strong)]"
        aria-label="Close dialog"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 {action === 'favorite' ? 'bg-[color:var(--status-error-bg)]' : action === 'purchase' ? 'bg-[color:var(--status-success-bg)]' : 'bg-[color:var(--status-info-bg)]'} rounded-full flex items-center justify-center">
          {#if action === 'favorite'}
            <svg class="w-8 h-8 text-[color:var(--status-error-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          {:else if action === 'purchase'}
            <svg class="w-8 h-8 text-[color:var(--status-success-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
            </svg>
          {:else}
            <svg class="w-8 h-8 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          {/if}
        </div>
      </div>

      <!-- Content -->
      <div class="text-center mb-6">
        <h3 class="text-lg font-semibold text-[color:var(--text-primary)] mb-2">
          {#if action === 'favorite'}
            Save your favorites
          {:else if action === 'purchase'}
            Complete your purchase
          {:else if action === 'sign-up'}
            Join Driplo
          {:else}
            Sign in required
          {/if}
        </h3>
        <p class="text-[color:var(--text-muted)] text-sm">
          {#if action === 'favorite'}
            Create an account to save items you love and get notified of price drops
          {:else if action === 'purchase'}
            Sign up to securely complete your purchase and track your orders
          {:else if action === 'sign-up'}
            Discover amazing second-hand fashion and connect with thousands of sellers
          {:else}
            Please sign in to {action}. It's quick and free!
          {/if}
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          onclick={onSignIn}
          class="w-full min-h-[var(--touch-primary)] bg-[color:var(--surface-brand-strong)] text-[color:var(--text-inverse)] py-3 px-4 rounded-[var(--btn-radius)] font-[var(--btn-font-weight)] hover:bg-[color:var(--surface-brand)] transition-colors duration-[var(--duration-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]"
        >
          Sign In
        </button>
        <button
          onclick={onSignUp}
          class="w-full min-h-[var(--touch-primary)] border border-[color:var(--border-default)] text-[color:var(--text-primary)] py-3 px-4 rounded-[var(--btn-radius)] font-[var(--btn-font-weight)] hover:bg-[color:var(--state-hover)] transition-colors duration-[var(--duration-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]"
        >
          Create Account
        </button>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-[color:var(--text-muted)] mt-4">
        Join thousands of users buying and selling on Driplo
      </p>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in-0 {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scale-in-95 {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }

  .animate-in {
    animation-duration: 200ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }

  .fade-in-0 {
    animation-name: fade-in-0;
  }

  .scale-in-95 {
    animation-name: scale-in-95;
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .animate-in {
      animation: none;
    }
  }
</style>