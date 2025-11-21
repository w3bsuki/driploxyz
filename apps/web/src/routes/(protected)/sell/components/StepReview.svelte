<script lang="ts">
  import type { Category } from '$lib/types/product';
  import * as i18n from '@repo/i18n';
  
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
  <h2 class="text-lg font-semibold">{i18n.sell_reviewYourListing()}</h2>
  
  <!-- Photos Preview -->
  <div>
    <h3 class="text-sm font-medium text-gray-700 mb-2">{i18n.sell_photosSection()}</h3>
    <div class="grid grid-cols-3 gap-2">
      {#each uploadedImages.slice(0, 3) as image}
        <img 
          src={image.url} 
          alt="{i18n.sell_productAlt()}" 
          class="aspect-square object-cover rounded-lg"
        />
      {/each}
      {#if uploadedImages.length > 3}
        <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span class="text-gray-600 text-sm">{i18n.sell_morePhotos({count: uploadedImages.length - 3})}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Details -->
  <div class="space-y-2">
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_titleLabel()}</span>
      <span class="text-sm font-medium">{formData.title}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_categoryLabel()}</span>
      <span class="text-sm font-medium">
        {selectedCategory?.name || i18n.sell_notAvailable()}
      </span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_brandLabel()}</span>
      <span class="text-sm font-medium">{formData.brand}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_sizeLabel()}</span>
      <span class="text-sm font-medium">{formData.size}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_conditionLabel()}</span>
      <span class="text-sm font-medium capitalize">{formData.condition?.replace('-', ' ')}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_priceLabel2()}</span>
      <span class="text-sm font-medium">${Number(formData.price).toFixed(2)}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-sm text-gray-600">{i18n.sell_shippingLabel()}</span>
      <span class="text-sm font-medium">${Number(formData.shipping_cost).toFixed(2)}</span>
    </div>
    {#if formData.use_premium_boost}
      <div class="flex justify-between py-2 border-b">
        <span class="text-sm text-gray-600">Premium Boost</span>
        <span class="text-sm font-medium text-zinc-600">{i18n.sell_premiumBoostActive()}</span>
      </div>
    {/if}
  </div>
</div>