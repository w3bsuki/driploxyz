<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { Seller } from './types/index';
  
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
    account_type?: string;
    is_verified?: boolean;
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
  
  type SellerData = SellerDataNew | SellerDataLegacy | Seller;
  
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
        totalSales: legacy.premium ? 6 : 0,
        rating: legacy.rating || 0,
        account_type: legacy.premium ? 'pro' : 'personal',
        is_verified: legacy.premium || false,
        recentProducts: []
      } satisfies SellerDataNew;
    }
    
    return seller as SellerDataNew;
  });

  // Badge and verification logic
  const hasVerifiedBadge = $derived(normalizedSeller?.is_verified || false);
  
  // Image error state
  let imageError = $state(false);

  // Close dialog when seller is cleared
  $effect(() => {
    if (!seller && isOpen === true) {
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
    <div class="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
      <!-- Header -->
      <div class="relative shrink-0">
        <!-- Cover Image -->
        <div class="h-24 bg-gradient-to-br from-[oklch(0.8_0.15_250)] via-[oklch(0.75_0.12_260)] to-[oklch(0.7_0.1_270)]"></div>
        
        <!-- Close Button -->
        <button
          onclick={handleClose}
          class="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          aria-label="Close"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Seller Info -->
        <div class="px-5 -mt-12">
          <div class="flex flex-col items-center">
            <!-- Avatar with verification badge -->
            <div class="relative mb-3">
              <div class="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-3 border-[color:var(--gray-300)] shadow-lg">
                {#if normalizedSeller.avatar_url && !imageError}
                  <img 
                    src={normalizedSeller.avatar_url} 
                    alt={normalizedSeller.username || 'Seller'}
                    class="w-full h-full object-cover"
                    loading="lazy"
                    onerror={() => {
                      imageError = true;
                    }}
                  />
                {:else}
                  <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-2xl">
                    {(normalizedSeller.username || 'S').charAt(0).toUpperCase()}
                  </div>
                {/if}
              </div>
              {#if hasVerifiedBadge}
                <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-[oklch(0.6_0.25_250)] rounded-full flex items-center justify-center border-3 border-white shadow-sm">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              {/if}
            </div>

            <!-- Account Badge -->
            {#if normalizedSeller.account_type}
              <div class="mb-2">
                {#if normalizedSeller.account_type === 'admin'}
                  <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm bg-[oklch(0.55_0.25_25)] text-[oklch(1_0_0)]">
                    ADMIN
                  </span>
                {:else if normalizedSeller.account_type === 'brand'}
                  <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm bg-[oklch(0.25_0_0)] text-[oklch(1_0_0)]">
                    BRAND
                  </span>
                {:else if normalizedSeller.account_type === 'pro'}
                  <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm bg-[oklch(0.15_0_0)] text-[oklch(1_0_0)]">
                    PRO
                  </span>
                {:else if normalizedSeller.account_type === 'personal'}
                  <span class="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-full shadow-sm bg-[oklch(0.92_0.1_140)] text-[oklch(0.4_0.15_140)] border border-[oklch(0.75_0.12_140)]">
                    NEW SELLER
                  </span>
                {/if}
              </div>
            {/if}

            <!-- Username -->
            <h2 class="text-xl font-semibold text-[color:var(--gray-800)] mb-1 tracking-tight">@{normalizedSeller.username}</h2>
            
            <!-- Stats -->
            <div class="flex items-center gap-3 text-sm text-gray-600 font-medium mb-3">
              {#if normalizedSeller.rating && normalizedSeller.rating > 0}
                <div class="flex items-center gap-1 bg-[oklch(0.96_0.05_80)] px-2.5 py-1 rounded-full">
                  <svg class="w-3.5 h-3.5 text-[oklch(0.7_0.15_80)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-[oklch(0.45_0.15_80)]">{normalizedSeller.rating.toFixed(1)}</span>
                </div>
              {/if}
              
              <div class="bg-gray-100 px-2.5 py-1 rounded-full">
                <span class="text-gray-700">{normalizedSeller.itemCount || 0} items</span>
              </div>
              
              <div class="bg-gray-100 px-2.5 py-1 rounded-full">
                <span class="text-gray-700">{memberSince}</span>
              </div>
            </div>

            {#if normalizedSeller.bio}
              <p class="text-sm text-gray-600 text-center line-clamp-2 mb-4 px-2">{normalizedSeller.bio}</p>
            {/if}
            
            <!-- Action Buttons -->
            <div class="flex space-x-2 w-full">
              <button 
                onclick={viewProfile} 
                class="flex-1 py-2.5 bg-[color:var(--gray-800)] hover:bg-[color:var(--gray-900)] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                View Profile
              </button>
              {#if onFollow}
                <button 
                  onclick={() => onFollow?.(normalizedSeller.id)}
                  class="flex-1 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Products Section -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Recent Items</h3>
        {#if displayProducts.length > 0}
          <div class="grid grid-cols-2 gap-3">
            {#each displayProducts.slice(0, 6) as product}
              <div class="cursor-pointer w-full text-left group">
                <div class="relative">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    class="w-full aspect-square object-cover rounded-xl border border-gray-100 group-hover:border-gray-200 transition-all duration-200"
                  />
                  <button 
                    onclick={(e: MouseEvent) => {
                      e.stopPropagation();
                      console.log('Add to wishlist:', product.id);
                    }}
                    class="absolute top-2 right-2 p-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Add to wishlist"
                  >
                    <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div class="mt-2">
                  <p class="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                  <p class="text-sm font-bold text-gray-900">${product.price}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-sm text-gray-500 font-medium">No items yet</p>
            <p class="text-xs text-gray-400 mt-1">Check back later for new listings</p>
          </div>
        {/if}
        
        <!-- View All Link -->
        {#if normalizedSeller.itemCount && normalizedSeller.itemCount > 0}
          <div class="mt-4 text-center">
            <button 
              onclick={viewProfile}
              class="text-sm text-[oklch(0.6_0.25_250)] font-medium hover:text-[oklch(0.55_0.25_250)] transition-colors"
            >
              View all {normalizedSeller.itemCount} items →
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

