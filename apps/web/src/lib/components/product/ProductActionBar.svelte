<script lang="ts">
  interface Props {
    product: any;
    user: any;
    onMakeOffer: () => void;
    onBuyNow: () => void;
  }

  let { product, user, onMakeOffer, onBuyNow }: Props = $props();

  function handleMakeOffer() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    onMakeOffer();
  }

  function handleBuyNow() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    onBuyNow();
  }
</script>

<!-- Action Bar -->
<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
  <div class="max-w-md mx-auto px-4 py-3">
    {#if !product.is_sold && product.seller_id !== user?.id}
      <div class="flex gap-3">
        <button 
          onclick={handleMakeOffer}
          class="flex-1 h-11 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-medium hover:bg-gray-50"
        >
          Make Offer
        </button>
        <button 
          onclick={handleBuyNow}
          class="flex-[2] h-11 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
        >
          Buy Now
        </button>
      </div>
    {:else if product.is_sold}
      <button 
        disabled
        class="w-full h-11 bg-gray-200 text-gray-500 rounded-xl font-medium cursor-not-allowed"
      >
        SOLD OUT
      </button>
    {:else if product.seller_id === user?.id}
      <div class="flex gap-3">
        <button class="flex-1 h-11 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200">
          Edit Listing
        </button>
        <button class="flex-1 h-11 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800">
          Analytics
        </button>
      </div>
    {/if}
  </div>
</div>