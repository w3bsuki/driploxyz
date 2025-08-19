<script lang="ts">
  interface Props {
    show?: boolean;
    product: {
      id: string;
      title: string;
      image: string;
      price: number;
    };
    buyer?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    onViewOrder?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
  }

  let { 
    show = false,
    product,
    buyer,
    onViewOrder,
    onDismiss,
    autoHide = true,
    duration = 8000
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
    <div class="w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl 
      ring-1 ring-black/5 border border-white/20 overflow-hidden">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-gray-100/50">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-xs font-medium text-gray-600">Item sold!</span>
        </div>
        <button 
          onclick={onDismiss}
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/50"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4">
        <div class="flex items-start space-x-3">
          <!-- Success Icon -->
          <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-gray-900 text-sm mb-1">
              Congratulations! Your item has been sold
            </h4>
            
            <!-- Product Info -->
            <div class="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg mb-3">
              <img 
                src={product.image} 
                alt={product.title}
                class="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {product.title}
                </p>
                <p class="text-lg font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>

            <!-- Buyer Info if Available -->
            {#if buyer}
              <p class="text-sm text-gray-600 mb-3">
                Sold to <span class="font-medium">{buyer.username}</span>
              </p>
            {/if}

            <!-- Actions -->
            <div class="flex space-x-2">
              {#if onViewOrder}
                <button
                  onclick={onViewOrder}
                  class="flex-1 px-3 py-2 bg-black text-white text-xs font-medium rounded-lg 
                    hover:bg-gray-800 transition-colors"
                >
                  View Order
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
    </div>
  </div>
{/if}

<style>
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