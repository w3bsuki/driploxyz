<script lang="ts">
  import { onMount } from 'svelte';
  import type { Product } from './types';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import ImageOptimized from './ImageOptimized.svelte';
  import Badge from './Badge.svelte';
  import Avatar from './Avatar.svelte';
  // Cache to prevent repeated fetches
  const sellerProductsCache = new Map<string, { products: Product[], timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  interface Props {
    sellerId: string;
    sellerUsername: string;
    sellerAvatar?: string;
    sellerRating?: number;
    initialItem: Product;
    onConfirm: (items: Product[]) => void;
    onCancel: () => void;
    open?: boolean;
    supabaseClient: any;
    translations: {
      bundle_title: () => string;
      bundle_subtitle: () => string;
      bundle_shipTogether: () => string;
      bundle_savePerItem: () => string;
      bundle_yourBundle: () => string;
      bundle_item: () => string;
      bundle_items: () => string;
      bundle_justThisItem: () => string;
      bundle_addTwoItems: () => string;
      bundle_addThreeItems: () => string;
      bundle_addFiveItems: () => string;
      bundle_saveAmount: () => string;
      bundle_addMoreFrom: () => string;
      bundle_noOtherItems: () => string;
      bundle_showAll: () => string;
      bundle_itemsTotal: () => string;
      bundle_shipping: () => string;
      bundle_serviceFee: () => string;
      bundle_youSave: () => string;
      bundle_total: () => string;
      bundle_continueToCheckout: () => string;
      bundle_checkoutItems: () => string;
      bundle_quickOptions: () => string;
      bundle_loading: () => string;
      bundle_saveOnShipping: () => string;
    };
  }
  
  let { 
    sellerId, 
    sellerUsername,
    sellerAvatar,
    sellerRating = 0,
    initialItem, 
    onConfirm, 
    onCancel,
    open = true,
    supabaseClient,
    translations 
  }: Props = $props();
  
  let selectedItems = $state<Product[]>([initialItem]);
  let sellerProducts = $state<Product[]>([]);
  let loading = $state(true);
  let error = $state('');
  let showAllProducts = $state(false);
  
  // Calculate totals (all prices in BGN) - NO SHIPPING (paid on delivery)
  const itemsTotal = $derived(
    selectedItems.reduce((sum, item) => sum + item.price, 0)
  );
  
  const serviceFee = $derived(Math.round(itemsTotal * 0.05 * 100) / 100 + 1.40); // 5% + 1.40 BGN
  const totalAmount = $derived(itemsTotal + serviceFee);
  
  // Bundle benefit - save time by receiving all items in one delivery
  const bundleBenefit = $derived(selectedItems.length > 1);
  
  // Visible products (limited or all)
  const visibleProducts = $derived(
    showAllProducts ? sellerProducts : sellerProducts.slice(0, 6)
  );
  
  onMount(async () => {
    console.log('BundleBuilder onMount - sellerId:', sellerId);
    console.log('BundleBuilder onMount - initialItem:', initialItem);
    console.log('BundleBuilder onMount - translations.bundle_title():', translations.bundle_title());
    
    // Check cache first
    const cacheKey = sellerId;
    const cached = sellerProductsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached data:', cached.products.length, 'products');
      // Use cached data
      sellerProducts = cached.products.filter((p: Product) => p.id !== initialItem.id);
      loading = false;
      return;
    }
    
    try {
      console.log('Fetching products for seller:', sellerId);
      
      // Fetch real products from Supabase with images
      const { data, error: fetchError } = await supabaseClient
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          size,
          brand,
          seller_id,
          is_sold,
          created_at,
          updated_at,
          product_images (
            image_url,
            sort_order
          )
        `)
        .eq('seller_id', sellerId)
        .eq('is_sold', false)
        .neq('id', initialItem.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      console.log('Supabase response:', { data, dataLength: data?.length, error: fetchError });
      
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }
      
      const rawProducts = data || [];
      
      // Map real data to Product type
      const products: Product[] = rawProducts.map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: 'BGN',
        images: p.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((img: any) => img.image_url) || ['/placeholder-product.svg'],
        condition: p.condition || 'good',
        seller_id: sellerId,
        category_id: '',
        size: p.size || '',
        brand: p.brand || '',
        created_at: p.created_at,
        updated_at: p.updated_at,
        sold: p.is_sold || false,
        favorites_count: 0,
        views_count: 0
      }));
      
      // Update cache
      sellerProductsCache.set(cacheKey, {
        products,
        timestamp: Date.now()
      });
      
      // Set the products
      sellerProducts = products;
      console.log('Successfully loaded', products.length, 'seller products');
    } catch (err) {
      console.error('Error loading seller products:', err);
      error = translations.bundle_noOtherItems();
    } finally {
      loading = false;
      console.log('BundleBuilder loading complete');
    }
  });
  
  function addItem(product: Product) {
    if (!selectedItems.find(item => item.id === product.id)) {
      selectedItems = [...selectedItems, product];
    }
  }
  
  function removeItem(productId: string) {
    selectedItems = selectedItems.filter(item => item.id !== productId);
  }
  
  function toggleItem(product: Product) {
    if (selectedItems.find(item => item.id === product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  }
  
  function handleConfirm() {
    onConfirm(selectedItems);
  }
</script>

<Modal {open} onClose={onCancel} size="large">
  <div class="bundle-builder p-0">
    <!-- Header with Seller Info -->
    <div class="sticky top-0 z-10 bg-white border-b border-[oklch(90%_0.02_250)]">
      <div class="p-4 pb-3">
        <div class="flex items-center gap-3 mb-3">
          <Avatar 
            src={sellerAvatar} 
            alt={sellerUsername}
            size="md"
            class="ring-2 ring-white shadow-lg"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-[oklch(10%_0.02_250)]">@{sellerUsername}</span>
              {#if sellerRating > 0}
                <div class="flex items-center gap-1 text-sm">
                  <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-[oklch(40%_0.02_250)]">{sellerRating.toFixed(1)}</span>
                </div>
              {/if}
            </div>
            <p class="text-xs text-[oklch(40%_0.02_250)]">Купете повече артикули в една доставка</p>
          </div>
        </div>
        
        {#if bundleBenefit}
          <div class="bg-[oklch(45%_0.15_145)]/10 border border-[oklch(45%_0.15_145)]/20 rounded-lg p-2 flex items-center justify-center">
            <span class="text-sm font-medium text-[oklch(45%_0.15_145)]">
              📦 Получете всички артикули в една доставка
            </span>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      
      <!-- Selected Items -->
      <div class="bg-[oklch(98%_0.01_250)] rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-[oklch(10%_0.02_250)]">
            {translations.bundle_yourBundle()} ({selectedItems.length} {selectedItems.length === 1 ? translations.bundle_item() : translations.bundle_items()})
          </h3>
        </div>
        
        <div class="space-y-2">
          {#each selectedItems as item (item.id)}
            <div class="flex items-center gap-3 p-2 bg-white rounded-lg border border-[oklch(90%_0.02_250)]" 
                 class:border-[oklch(60%_0.2_250)]={item.id === initialItem.id}
                 style:background-color={item.id === initialItem.id ? 'oklch(60% 0.2 250 / 0.05)' : undefined}>
              <ImageOptimized
                src={item.images?.[0] || item.first_image || '/placeholder-product.svg'} 
                alt={item.title}
                class="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-[oklch(10%_0.02_250)] truncate">{item.title}</h4>
                <p class="text-sm font-bold text-[oklch(60%_0.2_250)]">лв.{item.price}</p>
              </div>
              {#if item.id !== initialItem.id}
                <button 
                  onclick={() => removeItem(item.id)}
                  class="w-8 h-8 rounded-full bg-[oklch(98%_0.01_250)] border border-[oklch(90%_0.02_250)] 
                         flex items-center justify-center text-[oklch(40%_0.02_250)] 
                         hover:bg-[oklch(10%_0.02_250)] hover:text-white hover:border-[oklch(10%_0.02_250)] transition-colors"
                  aria-label="Remove {item.title}"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    
      <!-- Available Items -->
      {#if loading}
        <div class="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="md" />
          <p class="mt-2 text-sm text-[oklch(40%_0.02_250)]">{translations.bundle_loading()}</p>
        </div>
      {:else if error}
        <div class="text-center py-8 text-[oklch(45%_0.15_25)]">{error}</div>
      {:else if sellerProducts.length > 0}
        <div>
          <h3 class="text-base font-semibold text-[oklch(10%_0.02_250)] mb-3 px-1">
            Още от {sellerUsername}
          </h3>
          
          <!-- Horizontal scrollable products -->
          <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            {#each sellerProducts as product (product.id)}
              {@const isSelected = selectedItems.some(item => item.id === product.id)}
              <button
                onclick={() => toggleItem(product)}
                class="relative bg-white rounded-lg border-2 transition-all overflow-hidden flex-shrink-0 w-32"
                class:border-[oklch(60%_0.2_250)]={isSelected}
                class:border-[oklch(90%_0.02_250)]={!isSelected}
                style:background-color={isSelected ? 'oklch(60% 0.2 250 / 0.05)' : undefined}
              >
                {#if isSelected}
                  <div class="absolute top-2 right-2 z-10 w-6 h-6 bg-[oklch(60%_0.2_250)] rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                {/if}
                
                <ImageOptimized
                  src={product.images?.[0] || product.first_image || '/placeholder-product.svg'}
                  alt={product.title}
                  class="w-full aspect-square object-cover"
                />
                <div class="p-2">
                  <h4 class="text-xs font-medium text-[oklch(10%_0.02_250)] truncate">{product.title}</h4>
                  <p class="text-sm font-bold text-[oklch(60%_0.2_250)] mt-1">лв.{product.price}</p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <div class="text-center py-8 text-[oklch(40%_0.02_250)]">
          {translations.bundle_noOtherItems()}
        </div>
      {/if}
    </div>
    
    <!-- Summary & Actions -->
    <div class="sticky bottom-0 bg-white border-t border-[oklch(90%_0.02_250)] p-4 space-y-3">
      <div class="space-y-1.5">
        <div class="flex justify-between text-sm text-[oklch(40%_0.02_250)]">
          <span>Продукти ({selectedItems.length})</span>
          <span>лв.{itemsTotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm text-[oklch(40%_0.02_250)]">
          <span>Такса услуга</span>
          <span>лв.{serviceFee.toFixed(2)}</span>
        </div>
        <div class="text-xs text-[oklch(60%_0.02_250)] italic">
          * Доставката се плаща при получаване
        </div>
        <div class="flex justify-between text-base font-bold text-[oklch(10%_0.02_250)] pt-2 border-t border-[oklch(90%_0.02_250)]">
          <span>Общо</span>
          <span>лв.{totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <Button
        onclick={handleConfirm}
        variant="primary"
        fullWidth
        size="lg"
        class="min-h-[44px]"
        disabled={selectedItems.length === 0}
      >
        {#if selectedItems.length === 1}
          Продължи към плащане
        {:else}
          Плащане за {selectedItems.length} артикула
        {/if}
      </Button>
    </div>
  </div>
</Modal>

<style>
  .bundle-builder {
    display: flex;
    flex-direction: column;
    max-height: min(90vh, 800px);
    height: 100%;
  }
  
  .no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>