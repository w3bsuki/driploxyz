<script lang="ts">
  import type { Category } from '$lib/types/product';
  
  interface UploadedImage {
    url: string;
    path: string;
  }
  
  interface Props {
    formData: {
      title: string;
      category_id: string;
      brand: string;
      size: string;
      condition: string;
      price: number;
      shipping_cost: number;
      use_premium_boost: boolean;
    };
    uploadedImages: UploadedImage[];
    categories: Category[];
  }
  
  let { 
    formData,
    uploadedImages,
    categories
  }: Props = $props();
  
  const selectedCategory = $derived(
    categories?.find(c => c.id === formData.category_id)
  );
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold">Review Your Listing</h2>
  
  <!-- Photos Preview -->
  <div>
    <h3 class="text-sm font-medium text-gray-700 mb-2">Photos</h3>
    <div class="grid grid-cols-3 gap-2">
      {#each uploadedImages.slice(0, 3) as image}
        <img 
          src={image.url} 
          alt="Product" 
          class="aspect-square object-cover rounded-lg"
        />
      {/each}
      {#if uploadedImages.length > 3}
        <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span class="text-gray-600 text-sm">+{uploadedImages.length - 3} more</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Details -->
  <div class="space-y-2">
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Title</span>
      <span class="text-sm font-medium">{formData.title}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Category</span>
      <span class="text-sm font-medium">
        {selectedCategory?.name || 'N/A'}
      </span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Brand</span>
      <span class="text-sm font-medium">{formData.brand}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Size</span>
      <span class="text-sm font-medium">{formData.size}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Condition</span>
      <span class="text-sm font-medium capitalize">{formData.condition?.replace('-', ' ')}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Price</span>
      <span class="text-sm font-medium">${Number(formData.price).toFixed(2)}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">Shipping</span>
      <span class="text-sm font-medium">${Number(formData.shipping_cost).toFixed(2)}</span>
    </div>
    {#if formData.use_premium_boost}
      <div class="flex justify-between py-2 border-b">
        <span class="text-sm text-gray-600">Premium Boost</span>
        <span class="text-sm font-medium text-purple-600">Active</span>
      </div>
    {/if}
  </div>
</div>