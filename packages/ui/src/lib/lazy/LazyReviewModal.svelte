<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
      rating: number;
      title: string;
      comment: string;
      imageUrls: string[];
    }) => Promise<void>;
    orderDetails?: {
      orderId?: string;
      seller?: string;
      buyer?: string;
      product?: string;
      productImage?: string;
    };
    userType: 'buyer' | 'seller';
    loading?: boolean;
  }

  let { isOpen, onClose, onSubmit, orderDetails, userType, loading = false }: Props = $props();

  // Dynamic import state
  let ReviewModal: any = $state(null);
  let isLoading = $state(false);
  let hasError = $state(false);

  // Load the modal when first needed
  async function loadModal() {
    if (ReviewModal || isLoading) return;
    
    isLoading = true;
    hasError = false;
    
    try {
      const module = await import('../ReviewModal.svelte');
      ReviewModal = module.default;
    } catch (error) {
      console.error('Failed to load ReviewModal:', error);
      hasError = true;
    } finally {
      isLoading = false;
    }
  }

  // Load modal when it becomes open
  $effect(() => {
    if (isOpen && !ReviewModal) {
      loadModal();
    }
  });
</script>

{#if isOpen}
  {#if ReviewModal}
    <ReviewModal 
      {isOpen}
      {onClose}
      {onSubmit}
      {orderDetails}
      {userType}
      {loading}
    />
  {:else if isLoading}
    <!-- Loading skeleton for modal -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="rounded-xl p-6 m-4 max-w-md w-full animate-pulse bg-[color:var(--surface-base)]">
        <div class="h-6 rounded mb-4 bg-[color:var(--surface-subtle)]"></div>
        <div class="space-y-3">
          <div class="h-4 rounded bg-[color:var(--surface-subtle)]"></div>
          <div class="h-4 rounded w-3/4 bg-[color:var(--surface-subtle)]"></div>
          <div class="h-20 rounded bg-[color:var(--surface-subtle)]"></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <div class="h-10 w-20 rounded bg-[color:var(--surface-subtle)]"></div>
          <div class="h-10 w-24 rounded bg-[color:var(--surface-subtle)]"></div>
        </div>
      </div>
    </div>
  {:else if hasError}
    <!-- Error fallback -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="rounded-xl p-6 m-4 max-w-md w-full text-center bg-[color:var(--surface-base)]">
        <p class="mb-4 text-[color:var(--status-error-solid)]">Failed to load review modal</p>
        <button 
          class="px-4 py-2 rounded-lg bg-[color:var(--surface-subtle)]"
          onclick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  {/if}
{/if}
