<script lang="ts">
  import { page } from '$app/state';
  import { Button, Avatar, type Product } from '@repo/ui';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  const sellerId = page.params.sellerId;
  const seller = data.seller;
  
  // Transform products for display
  const sellerProducts: Product[] = data.products.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    price: p.price,
    images: p.images || [],
    brand: p.brand,
    size: p.size,
    condition: p.condition,
    category: 'Clothing', // Category name lookup to be implemented
    sellerId: p.sellerId,
    sellerName: p.sellerName,
    sellerRating: p.sellerRating,
    createdAt: p.created_at,
    location: p.location || ''
  }));
  
  // Bundle state
  let selectedItems = $state<Set<string>>(new Set());
  let offerAmount = $state('');
  let message = $state('');
  let showSuccess = $state(false);
  
  // Calculate totals
  let selectedProducts = $derived(
    sellerProducts.filter(p => selectedItems.has(p.id))
  );
  
  let originalTotal = $derived(
    selectedProducts.reduce((sum, p) => sum + p.price, 0)
  );
  
  let savings = $derived(
    (parseFloat(offerAmount) || 0) > 0 ? originalTotal - (parseFloat(offerAmount) || 0) : 0
  );
  
  let savingsPercent = $derived(
    originalTotal === 0 ? 0 : Math.round((savings / originalTotal) * 100)
  );
  
  function toggleItem(productId: string) {
    const newSet = new Set(selectedItems);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    selectedItems = newSet;
  }
  
  function selectAll() {
    selectedItems = new Set(sellerProducts.map(p => p.id));
  }
  
  function clearSelection() {
    selectedItems = new Set();
  }
  
  function suggestPrice() {
    // Suggest 15% off for bundles
    offerAmount = Math.round(originalTotal * 0.85).toString();
  }
  
  function sendOffer() {
    if (selectedItems.size < 2) {
      alert('Please select at least 2 items for a bundle offer');
      return;
    }
    
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }
    
    console.log('Sending offer:', {
      sellerId,
      items: Array.from(selectedItems),
      amount: offerAmount,
      message
    });
    
    showSuccess = true;
    setTimeout(() => {
      window.location.href = '/messages';
    }, 2000);
  }
</script>

<svelte:head>
  <title>Create Bundle Offer - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  
  <!-- Page Header -->
  <div class="bg-white shadow-xs sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between py-3">
        <div class="flex items-center space-x-3">
          <a href="/profile/{sellerId}" class="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg" aria-label="Go back to seller profile">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 class="text-lg sm:text-xl font-bold text-gray-900">Create Bundle Offer</h1>
        </div>
        <div class="flex items-center space-x-3">
          <Avatar src={seller.avatar} name={seller.name} size="sm" />
          <div class="hidden sm:block">
            <p class="text-sm font-medium text-gray-900">{seller.name}</p>
            <p class="text-xs text-gray-500">Usually responds in {seller.responseTime}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="lg:grid lg:grid-cols-3 lg:gap-6">
      <!-- Products Selection -->
      <div class="lg:col-span-2 mb-6 lg:mb-0">
        <div class="bg-white rounded-lg shadow-xs">
          <div class="p-4 sm:p-6 border-b">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-lg font-semibold">Select Items</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Choose at least 2 items to create a bundle offer
                </p>
              </div>
              <div class="flex space-x-2">
                <Button onclick={selectAll} size="sm" variant="outline">Select All</Button>
                <Button onclick={clearSelection} size="sm" variant="outline">Clear</Button>
              </div>
            </div>
          </div>
          
          <div class="p-4 sm:p-6">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {#each sellerProducts as product}
                <div class="relative">
                  <button
                    onclick={() => toggleItem(product.id)}
                    class="w-full text-left group relative"
                    aria-label="{selectedItems.has(product.id) ? 'Deselect' : 'Select'} {product.title} for ${product.price}"
                  >
                    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        class="w-full h-full object-cover {selectedItems.has(product.id) ? 'opacity-75' : ''}"
                      />
                      {#if selectedItems.has(product.id)}
                        <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <div class="bg-white rounded-full p-2">
                            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      {/if}
                    </div>
                    <p class="text-sm font-medium truncate">{product.title}</p>
                    <p class="text-sm font-bold">${product.price}</p>
                    <p class="text-xs text-gray-500">{product.size} • {product.condition}</p>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Offer Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6 sticky top-24">
          <h2 class="text-lg font-semibold mb-4">Bundle Summary</h2>
          
          {#if selectedItems.size > 0}
            <!-- Selected Items List -->
            <div class="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {#each selectedProducts as item}
                <div class="flex justify-between text-sm">
                  <span class="truncate flex-1">{item.title}</span>
                  <span class="font-medium ml-2">${item.price}</span>
                </div>
              {/each}
            </div>
            
            <div class="border-t pt-4 mb-4">
              <div class="flex justify-between mb-2">
                <span class="text-sm text-gray-600">Items ({selectedItems.size})</span>
                <span class="font-semibold">${originalTotal}</span>
              </div>
            </div>
            
            <!-- Offer Input -->
            <div class="mb-4">
              <label for="offer-amount" class="block text-sm font-medium text-gray-700 mb-1">Your Offer</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="offer-amount"
                  type="number"
                  bind:value={offerAmount}
                  placeholder="0.00"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <button 
                onclick={suggestPrice}
                class="text-xs text-blue-600 hover:text-blue-800 mt-1"
                aria-label="Suggest price with 15% discount"
              >
                Suggest price (15% off)
              </button>
            </div>
            
            {#if offerAmount && parseFloat(offerAmount) > 0}
              <div class="bg-green-50 rounded-lg p-3 mb-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-green-800">You save</span>
                  <div class="text-right">
                    <span class="font-bold text-green-800">${savings().toFixed(2)}</span>
                    <span class="text-xs text-green-600 ml-1">({savingsPercent()}% off)</span>
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Message -->
            <div class="mb-4">
              <label for="offer-message" class="block text-sm font-medium text-gray-700 mb-1">
                Message (optional)
              </label>
              <textarea
                id="offer-message"
                bind:value={message}
                rows="3"
                placeholder="Add a message to the seller..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              ></textarea>
            </div>
            
            <!-- Send Button -->
            <Button 
              onclick={sendOffer}
              size="lg"
              class="w-full"
              disabled={selectedItems.size < 2 || !offerAmount}
            >
              Send Offer
            </Button>
            
            <p class="text-xs text-gray-500 mt-2 text-center">
              The seller will have 72 hours to respond
            </p>
          {:else}
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p class="text-gray-500 text-sm">Select items to create a bundle</p>
              <p class="text-xs text-gray-400 mt-1">Minimum 2 items required</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Success Modal -->
  {#if showSuccess}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">Offer Sent!</h3>
          <p class="text-gray-600 text-sm">Your bundle offer has been sent to {seller.name}. You'll be notified when they respond.</p>
        </div>
      </div>
    </div>
  {/if}
</div>