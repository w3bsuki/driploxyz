<script lang="ts">
  import Avatar from './Avatar.svelte';

  interface Props {
    show?: boolean;
    followerName: string;
    followerUsername: string;
    followerAvatar?: string;
    onViewProfile?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
  }

  let { 
    show = false,
    followerName,
    followerUsername,
    followerAvatar,
    onViewProfile,
    onDismiss,
    autoHide = true,
    duration = 4000
  }: Props = $props();

  let timeoutId: NodeJS.Timeout | null = null;

  $effect(() => {
    if (show && autoHide) {
      timeoutId = setTimeout(() => {
        onDismiss?.();
      }, duration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
</script>

{#if show}
  <div class="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
    <div class="w-72 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl 
      ring-1 ring-black/5 border border-white/20 overflow-hidden">
      
      <!-- Progress bar -->
      <div class="h-0.5 bg-gray-100 relative overflow-hidden">
        <div class="absolute inset-0 bg-blue-500 animate-[shrink_4s_linear_forwards] origin-left"></div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <div class="flex items-start space-x-3">
          <div class="relative shrink-0">
            <Avatar 
              src={followerAvatar} 
              name={followerName} 
              size="md" 
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1">
                <span class="text-lg">👥</span>
                <span class="text-xs font-medium text-gray-600">New follower</span>
              </div>
              <span class="text-xs text-gray-500">now</span>
            </div>
            
            <div class="mb-3">
              <h4 class="font-semibold text-gray-900 text-sm">
                {followerName}
              </h4>
              <p class="text-xs text-gray-600">
                @{followerUsername} started following you
              </p>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              {#if onViewProfile}
                <button
                  onclick={onViewProfile}
                  class="flex-1 px-3 py-2 bg-black text-white text-xs font-medium rounded-lg 
                    hover:bg-gray-800 transition-colors"
                >
                  View Profile
                </button>
              {/if}
              <button
                onclick={onDismiss}
                class="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg 
                  hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Close button -->
      <button 
        onclick={onDismiss}
        class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes shrink {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }

  @keyframes slide-in-from-right-full {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .slide-in-from-right-full {
    animation-name: slide-in-from-right-full;
  }

  .duration-300 {
    animation-duration: 300ms;
  }
</style>