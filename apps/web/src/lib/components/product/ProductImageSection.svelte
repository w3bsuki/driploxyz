<script lang="ts">
  import { ProductGallery, Avatar } from '@repo/ui';
  import { getRelativeTime, getConditionLabel } from './product-utils';
  import { formatPrice } from '$lib/utils/price';
  import { BUTTON_STYLES } from './product-constants';
  import SellerPreview from './SellerPreview.svelte';
  import * as i18n from '@repo/i18n';

  interface Props {
    product: any;
    sellerProducts?: any[];
    onDoubleTap?: () => void;
    onMessageSeller?: () => void;
  }

  let { product, sellerProducts = [], onDoubleTap, onMessageSeller }: Props = $props();

  const productImages = $derived(product.images || []);
  let showSellerPreview = $state(false);

  function handleDoubleTap(event: Event) {
    event.preventDefault();
    onDoubleTap?.(event);
  }

  function handleSellerClick(event: Event) {
    event.preventDefault();
    showSellerPreview = true;
  }

  function handleViewProfile() {
    showSellerPreview = false;
    window.location.href = `/profile/${product.seller_username || product.seller_id}`;
  }

  function handleMessageSeller() {
    showSellerPreview = false;
    onMessageSeller?.();
  }
</script>

<!-- Clean Seller Header -->
<div class="p-4">
  <button 
    onclick={handleSellerClick}
    class="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-xl p-3 -m-3 transition-colors"
    aria-label="View {product.seller_name}'s profile and listings"
  >
    <Avatar 
      src={product.seller_avatar} 
      alt={product.seller_name}
      size="sm"
      fallback={product.seller_name?.[0]?.toUpperCase() || 'S'}
    />
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <p class="text-base font-semibold text-gray-900">{product.seller_name}</p>
        {#if product.seller_rating >= 4.5}
          <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.238.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        {/if}
      </div>
      <p class="text-sm text-gray-600">{product.location || 'Online'} • {getRelativeTime(product.created_at)}</p>
    </div>
    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
    </svg>
  </button>
</div>

<!-- Product Image -->
<div class="bg-white p-4" ondblclick={handleDoubleTap}>
  <div class="aspect-square bg-gray-100 relative rounded-xl overflow-hidden">
    <ProductGallery
      images={productImages}
      title={product.title}
      class="w-full h-full object-cover"
    />
    
    <!-- Price Tag Overlay -->
    <div class="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
      {formatPrice(product.price)}
    </div>
    
    <!-- Status Badge -->
    {#if product.is_sold}
      <div class="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
        {i18n.product_soldOut()}
      </div>
    {:else if product.condition}
      <div class="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
        {getConditionLabel(product.condition)}
      </div>
    {/if}
  </div>
</div>

<!-- Interactive Seller Preview -->
<SellerPreview
  seller={{
    id: product.seller_id,
    name: product.seller_name,
    username: product.seller_username,
    avatar: product.seller_avatar,
    rating: product.seller_rating,
    total_sales: product.seller_total_sales,
    response_rate: product.seller_response_rate,
    avg_ship_time: product.seller_avg_ship_time,
    join_date: product.seller_join_date
  }}
  recentProducts={sellerProducts}
  isOpen={showSellerPreview}
  onClose={() => showSellerPreview = false}
  onViewProfile={handleViewProfile}
  onMessageSeller={handleMessageSeller}
/>