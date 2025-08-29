<script lang="ts">
  import Avatar from './Avatar.svelte';
  
  interface Translations {
    newMessage?: string;
    reply?: string;
    dismiss?: string;
    now?: string;
  }

  interface Props {
    show?: boolean;
    sender: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    message: string;
    product?: {
      id: string;
      title: string;
      image: string;
    };
    onReply?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
    translations?: Translations;
  }

  let { 
    show = false,
    sender,
    message,
    product,
    onReply,
    onDismiss,
    autoHide = true,
    duration = 5000,
    translations = {}
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
    <div class="w-80 max-w-[calc(100vw-2rem)] bg-white/95 md:backdrop-blur-xl rounded-2xl shadow-sm md:shadow-2xl 
      ring-1 ring-black/5 border border-white/20 overflow-hidden">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-gray-100/50">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-xs font-medium text-gray-600">{translations.newMessage || 'New message'}</span>
        </div>
        <button 
          onclick={onDismiss}
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/50"
          aria-label="Dismiss notification"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4">
        <div class="flex items-start space-x-3">
          <Avatar 
            src={sender.avatar_url} 
            name={sender.username} 
            size="md" 
          />
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <h4 class="font-medium text-gray-900 text-sm">
                {sender.username}
              </h4>
              <span class="text-xs text-gray-500">{translations.now || 'now'}</span>
            </div>
            
            <p class="text-sm text-gray-700 mb-3 line-clamp-3">
              {message}
            </p>

            <!-- Product Context if Available -->
            {#if product}
              <div class="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg mb-3">
                <img 
                  src={product.image} 
                  alt={product.title}
                  class="w-6 h-6 rounded-sm object-cover"
                />
                <span class="text-xs text-gray-600 truncate">
                  {product.title}
                </span>
              </div>
            {/if}

            <!-- Actions -->
            <div class="flex space-x-2">
              {#if onReply}
                <button
                  onclick={onReply}
                  class="flex-1 px-3 py-2 bg-black text-white text-xs font-medium rounded-lg 
                    hover:bg-gray-800 transition-colors"
                >
{translations.reply || 'Reply'}
                </button>
              {/if}
              <button
                onclick={onDismiss}
                class="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg 
                  hover:bg-gray-200 transition-colors"
              >
{translations.dismiss || 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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