<script lang="ts">
  import { Avatar } from '@repo/ui';
  import { getRelativeTime } from './product-utils';

  interface Props {
    product: any;
    onDoubleTap?: () => void;
  }

  let { product, onDoubleTap }: Props = $props();

  const productImages = $derived(product.images || []);

  function handleDoubleTap(event: Event) {
    event.preventDefault();
    onDoubleTap?.(event);
  }
</script>

<!-- User Strip -->
<div class="px-4 py-3 border-b border-gray-100">
  <div class="flex items-center gap-3">
    <Avatar 
      src={product.seller_avatar} 
      alt={product.seller_name}
      size="sm"
      fallback={product.seller_name?.[0]?.toUpperCase() || 'S'}
    />
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-gray-900">{product.seller_name}</span>
        {#if product.seller_rating >= 4.5}
          <div class="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        {/if}
      </div>
      <span class="text-xs text-gray-500">{getRelativeTime(product.created_at)}</span>
    </div>
  </div>
</div>

<!-- Product Image -->
<div class="bg-gray-100 relative" ondblclick={handleDoubleTap}>
  <div class="aspect-square relative">
    {#if productImages.length > 0}
      <img 
        src={productImages[0] || '/placeholder-product.svg'} 
        alt={product.title}
        class="w-full h-full object-cover"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-gray-400">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
    {/if}
    
    {#if product.is_sold}
      <div class="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
        SOLD
      </div>
    {/if}
  </div>
</div>