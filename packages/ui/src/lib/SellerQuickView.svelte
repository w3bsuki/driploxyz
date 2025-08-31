<script lang="ts">
  import Avatar from './Avatar.svelte';
  // Seller quick preview component - supports both interfaces for compatibility
  interface SellerDataNew {
    id: string;
    username: string;
    avatar_url: string;
    itemCount: number;
    created_at?: string;
    bio?: string;
    location?: string;
    totalSales?: number;
    rating?: number;
    recentProducts?: Array<{
      id: string;
      title: string;
      price: number;
      image: string;
    }>;
  }

  // Legacy interface from QuickViewDialog
  interface SellerDataLegacy {
    id: number;
    name: string;
    avatar: string | null;
    premium: boolean;
    rating?: number;
    itemCount?: number;
    followers?: number;
    description?: string;
  }
  
  type SellerData = SellerDataNew | SellerDataLegacy;
  
  interface Props {
    seller: SellerData | null;
    isOpen?: boolean; // Optional for backward compatibility
    onClose?: () => void;
    onclose?: () => void; // Legacy prop name
    onViewProfile?: (sellerId: string) => void;
    onFollow?: (sellerId: string) => void;
    isFollowing?: boolean;
  }
  
  let { 
    seller = null, 
    isOpen = $bindable(false), 
    onClose,
    onclose, // Legacy prop
    onViewProfile,
    onFollow,
    isFollowing = false
  }: Props = $props();

  // Handle backward compatibility for callback props
  const handleClose = () => {
    onClose?.();
    onclose?.(); // Support legacy prop name
  };

  const handleViewProfile = (sellerId: string) => {
    if (onViewProfile) {
      onViewProfile(sellerId);
    } else {
      // Fallback to basic navigation
      console.warn('No onViewProfile handler provided');
    }
  };

  // Normalize seller data for backward compatibility
  const normalizedSeller = $derived.by(() => {
    if (!seller) return null;
    
    // Check if it's legacy interface (has 'name' and number id)
    const isLegacy = 'name' in seller && typeof seller.id === 'number';
    
    if (isLegacy) {
      const legacy = seller as SellerDataLegacy;
      return {
        id: legacy.id.toString(),
        username: legacy.name,
        avatar_url: legacy.avatar || '',
        itemCount: legacy.itemCount || 0,
        created_at: undefined,
        bio: legacy.description,
        location: undefined,
        totalSales: legacy.premium ? 6 : 0, // Assume premium = 5+ sales
        rating: legacy.rating || 0,
        recentProducts: [] // No recent products in legacy
      } satisfies SellerDataNew;
    }
    
    return seller as SellerDataNew;
  });

  // Auto-manage isOpen when seller changes (for legacy compatibility)
  $effect(() => {
    if (seller && isOpen === false) {
      isOpen = true;
    } else if (!seller && isOpen === true) {
      isOpen = false;
    }
  });
  
  // Show real products or empty array if none (using normalized seller)
  const displayProducts = $derived(normalizedSeller?.recentProducts || []);
  
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }
  
  function viewProfile() {
    if (normalizedSeller) {
      handleClose();
      handleViewProfile(normalizedSeller.id);
    }
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      handleClose();
    }
  }
  
  // Calculate member since (using normalized seller)
  const memberSince = $derived.by(() => {
    if (!normalizedSeller?.created_at) return 'New seller';
    const date = new Date(normalizedSeller.created_at);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  });
</script>

{#if normalizedSeller && isOpen}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 md:backdrop-blur-xs z-50 flex items-center justify-center p-4 pb-24 sm:pb-4"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Dialog -->
    <div class="bg-white rounded-2xl max-w-md w-full max-h-[65vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="relative shrink-0">
        <!-- Cover Image -->
        <div class="h-20 sm:h-28 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-400"></div>
        
        <!-- Close Button -->
        <button
          onclick={handleClose}
          class="absolute top-3 right-3 p-2 bg-white/90 md:backdrop-blur-sm rounded-full"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Seller Info -->
        <div class="px-4 sm:px-6 -mt-10 sm:-mt-12">
          <div class="flex items-end space-x-3">
            <div class="relative">
              <Avatar 
                src={normalizedSeller.avatar_url} 
                name={normalizedSeller.username} 
                size="lg" 
                premium={normalizedSeller.totalSales && normalizedSeller.totalSales > 5}
              />
              {#if normalizedSeller.totalSales && normalizedSeller.totalSales > 5}
                <span class="absolute -top-1 left-1/2 -translate-x-1/2 text-sm bg-white rounded-full p-0.5 shadow-sm">👑</span>
              {/if}
            </div>
            <div class="flex-1 pb-1">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900">{normalizedSeller.username}</h2>
              <div class="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="ml-1">{normalizedSeller.rating || 0}</span>
                </div>
                {#if normalizedSeller.itemCount}<span>{normalizedSeller.itemCount} items</span>{/if}
                <span>Since {memberSince}</span>
              </div>
            </div>
          </div>
          
          {#if normalizedSeller.bio}
            <p class="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2">{normalizedSeller.bio}</p>
          {/if}
          
          <!-- Action Buttons -->
          <div class="flex space-x-2 mt-3">
            <button onclick={viewProfile} class="flex-1 py-1.5 bg-black text-white text-sm rounded-lg">
              View Profile
            </button>
            {#if onFollow}
              <button 
                onclick={() => onFollow?.(normalizedSeller.id)}
                class="flex-1 py-1.5 border border-gray-300 text-sm rounded-lg"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Products Section -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
        <h3 class="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Featured Items</h3>
        {#if displayProducts.length > 0}
          <div class="grid grid-cols-2 gap-2 sm:gap-3">
            {#each displayProducts.slice(0, 4) as product}
              <div class="cursor-pointer w-full text-left">
                <div class="relative">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    class="w-full aspect-square object-cover rounded-lg"
                  />
                  <button 
                    onclick={(e: MouseEvent) => {
                      e.stopPropagation();
                      console.log('Add to wishlist:', product.id);
                    }}
                    class="absolute top-2 right-2 p-1.5 bg-white/90 md:backdrop-blur-sm rounded-full"
                    aria-label="Add to wishlist"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div class="mt-1.5">
                  <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.title}</p>
                  <p class="text-xs sm:text-sm font-bold">${product.price}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-500">
            <p class="text-sm">No items available</p>
          </div>
        {/if}
        
        <!-- View All Link -->
        <div class="mt-3 text-center">
          {#if normalizedSeller.itemCount && normalizedSeller.itemCount > 0}
            <button 
              onclick={viewProfile}
              class="text-xs sm:text-sm text-gray-500 font-medium"
            >
              View all {normalizedSeller.itemCount}+ items →
            </button>
          {/if}
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t px-4 py-2 bg-gray-50 shrink-0">
        <p class="text-xs sm:text-xs text-center text-gray-500">
          {#if normalizedSeller.totalSales && normalizedSeller.totalSales > 5}
            <span class="inline-flex items-center">
              <span class="text-yellow-500 mr-1">👑</span>
              Premium Seller
            </span>
          {:else}
            Active Seller
          {/if}
        </p>
      </div>
    </div>
  </div>
{/if}

