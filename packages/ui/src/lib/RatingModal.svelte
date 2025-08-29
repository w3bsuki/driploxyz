<script lang="ts">
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  interface Props {
    open: boolean;
    orderId: string;
    sellerName: string;
    productTitle: string;
    onsuccess?: () => void;
  }

  let { open = $bindable(), orderId, sellerName, productTitle, onsuccess }: Props = $props();
  
  let rating = $state(0);
  let communicationRating = $state(0);
  let shippingRating = $state(0);
  let productQualityRating = $state(0);
  let comment = $state('');
  let submitting = $state(false);
  
  function setRating(value: number) {
    rating = value;
  }
  
  function setCommunicationRating(value: number) {
    communicationRating = value;
  }
  
  function setShippingRating(value: number) {
    shippingRating = value;
  }
  
  function setProductQualityRating(value: number) {
    productQualityRating = value;
  }
  
  async function submitRating() {
    if (rating === 0) {
      alert('Please select an overall rating');
      return;
    }
    
    submitting = true;
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rating,
          communicationRating: communicationRating || null,
          shippingRating: shippingRating || null,
          productQualityRating: productQualityRating || null,
          comment: comment.trim() || null
        })
      });
      
      if (response.ok) {
        onsuccess?.();
        open = false;
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      alert('An error occurred while submitting your review');
    } finally {
      submitting = false;
    }
  }
  
  function resetForm() {
    rating = 0;
    communicationRating = 0;
    shippingRating = 0;
    productQualityRating = 0;
    comment = '';
  }
</script>

<Modal bind:open>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-4">Rate Your Purchase</h2>
    
    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-2">
        How was your experience with <span class="font-medium">{sellerName}</span>?
      </p>
      <p class="text-xs text-gray-500">
        Product: {productTitle}
      </p>
    </div>
    
    <!-- Overall Rating -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Overall Rating <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-2">
        {#each [1, 2, 3, 4, 5] as star}
          <button
            type="button"
            onclick={() => setRating(star)}
            class="w-10 h-10 rounded-lg border-2 transition-colors {rating >= star ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}"
            aria-label="{star} stars"
          >
            <svg class="w-6 h-6 mx-auto {rating >= star ? 'text-white' : 'text-gray-400'}" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Detailed Ratings (Optional) -->
    <div class="space-y-4 mb-6">
      <!-- Communication -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Communication
        </label>
        <div class="flex gap-1">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              type="button"
              onclick={() => setCommunicationRating(star)}
              class="w-8 h-8 rounded border transition-colors {communicationRating >= star ? 'bg-blue-400 border-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
              aria-label="{star} stars for communication"
            >
              <svg class="w-4 h-4 mx-auto {communicationRating >= star ? 'text-white' : 'text-gray-400'}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Shipping Speed -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Shipping Speed
        </label>
        <div class="flex gap-1">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              type="button"
              onclick={() => setShippingRating(star)}
              class="w-8 h-8 rounded border transition-colors {shippingRating >= star ? 'bg-green-400 border-green-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
              aria-label="{star} stars for shipping"
            >
              <svg class="w-4 h-4 mx-auto {shippingRating >= star ? 'text-white' : 'text-gray-400'}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Product Quality -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Product as Described
        </label>
        <div class="flex gap-1">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              type="button"
              onclick={() => setProductQualityRating(star)}
              class="w-8 h-8 rounded border transition-colors {productQualityRating >= star ? 'bg-purple-400 border-purple-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
              aria-label="{star} stars for product quality"
            >
              <svg class="w-4 h-4 mx-auto {productQualityRating >= star ? 'text-white' : 'text-gray-400'}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Comment -->
    <div class="mb-6">
      <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
        Add a Comment (Optional)
      </label>
      <textarea
        id="comment"
        bind:value={comment}
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Share your experience with other buyers..."
      ></textarea>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-3">
      <Button
        onclick={() => open = false}
        variant="outline"
        class="flex-1"
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button
        onclick={submitRating}
        variant="primary"
        class="flex-1"
        disabled={submitting || rating === 0}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  </div>
</Modal>