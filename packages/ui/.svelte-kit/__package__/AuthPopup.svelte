<script lang="ts">
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
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    role="button"
    tabindex="-1"
  >
    <div class="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl animate-in fade-in-0 scale-in-95 duration-200">
      <!-- Close button -->
      <button
        onclick={onClose}
        class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="text-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
        <p class="text-gray-600 text-sm">
          Please sign in to {action}. It's quick and free!
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          onclick={onSignIn}
          class="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          Sign In
        </button>
        <button
          onclick={onSignUp}
          class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Create Account
        </button>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-gray-500 mt-4">
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
</style>