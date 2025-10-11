<script lang="ts">
  import { isBrowser } from '../../utils/runtime.js';
  import { onMount, untrack } from 'svelte';

  interface Translations {
    title?: string;
    description?: string;
    signUp?: string;
    later?: string;
    dismiss?: string;
  }

  interface Props {
    isAuthenticated?: boolean;
    onSignUp?: () => void;
    onDismiss?: () => void;
    showAfterViews?: number;
    hideAfterMs?: number;
    translations?: Translations;
  }

  let {
    isAuthenticated = false,
    onSignUp,
    onDismiss,
    showAfterViews = 3,
    hideAfterMs = 10000,
    translations = {}
  }: Props = $props();

  let showBanner = $state(false);
  let viewCount = $state(0);
  let isDismissed = $state(false);
  let initialized = $state(false);

  // Initialize view count and dismissal state once on mount
  $effect(() => {
    if (!isBrowser || isAuthenticated || initialized) return;

    // Get stored data
    const stored = localStorage.getItem('driplo_view_count');
    const storedCount = stored ? parseInt(stored, 10) : 0;
    const dismissed = localStorage.getItem('driplo_engagement_dismissed');

    let shouldDismiss = false;
    let newViewCount = storedCount;
    let shouldShow = false;

    // Check dismissal status
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        shouldDismiss = true;
      }
    }

    // Calculate new view count and show logic
    if (!shouldDismiss) {
      newViewCount = storedCount + 1;
      shouldShow = newViewCount >= showAfterViews;
    }

    // Use untrack to avoid reactive cycles when setting state
    untrack(() => {
      viewCount = newViewCount;
      isDismissed = shouldDismiss;
      initialized = true;

      localStorage.setItem('driplo_view_count', newViewCount.toString());
    });

    // Handle banner showing with timers (side effects only)
    if (shouldShow) {
      const showTimer = setTimeout(() => {
        untrack(() => {
          if (!isDismissed) {
            showBanner = true;
          }
        });
      }, 1000);

      const hideTimer = setTimeout(() => {
        untrack(() => {
          showBanner = false;
        });
      }, 1000 + hideAfterMs);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  });

  function handleSignUp() {
    onSignUp?.();
    dismiss();
  }

  function dismiss() {
    showBanner = false;
    isDismissed = true;
    
    // Store dismissal time
    localStorage.setItem('driplo_engagement_dismissed', Date.now().toString());
    onDismiss?.();
  }
</script>

{#if !isAuthenticated && showBanner && !isDismissed}
  <!-- Floating engagement banner -->
  <div 
    class="fixed top-4 left-4 right-4 z-40 mx-auto max-w-md
           bg-[color:var(--surface-base)] border border-[color:var(--border-primary)] 
           rounded-xl shadow-lg backdrop-blur-sm
           animate-in slide-in-from-top-4 duration-500"
    role="banner"
    aria-live="polite"
  >
    <div class="p-4">
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-[color:var(--surface-brand-subtle)] rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-[color:var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-[color:var(--text-primary)] mb-1">
            {translations.title || 'Join the Driplo Community'}
          </h3>
          <p class="text-xs text-[color:var(--text-secondary)] mb-3">
            {translations.description || 'Save favorites, start selling, and connect with fashion lovers'}
          </p>
          
          <!-- Actions -->
          <div class="flex gap-2">
            <button
              onclick={handleSignUp}
              class="flex-1 px-3 py-1.5 bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] 
                     text-xs font-medium rounded-lg hover:bg-[color:var(--brand-primary)]/90 transition-colors"
            >
              {translations.signUp || 'Sign Up'}
            </button>
            <button
              onclick={dismiss}
              class="px-3 py-1.5 text-[color:var(--text-secondary)] text-xs font-medium 
                     hover:text-[color:var(--text-primary)] transition-colors"
            >
              {translations.later || 'Later'}
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button
          onclick={dismiss}
          class="flex-shrink-0 p-1 hover:bg-[color:var(--surface-secondary)] rounded-lg transition-colors"
          aria-label={translations.dismiss || 'Dismiss'}
        >
          <svg class="w-4 h-4 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in-from-top {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
  
  .slide-in-from-top-4 {
    animation: slide-in-from-top 0.5s ease-out;
  }
</style>