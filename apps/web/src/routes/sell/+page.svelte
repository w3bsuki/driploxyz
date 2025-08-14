<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import { createClient } from '$lib/supabase/client';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Initialize Supabase client
  const supabase = createClient();
  
  let currentStep = $state(1);
  const totalSteps = 3;
  
  // Form data
  let photos = $state<File[]>([]);
  let photoUrls = $state<string[]>([]);
  let title = $state('');
  let description = $state('');
  let category = $state('');
  let subcategory = $state('');
  let brand = $state('');
  let size = $state('');
  let condition = $state('new');
  let color = $state('');
  let material = $state('');
  let price = $state('');
  let shippingPrice = $state('8.99');
  let tags = $state<string[]>([]);
  let currentTag = $state('');
  
  // Get categories from server data
  const mainCategories = $derived(data.categories.filter(c => !c.parent_id));
  const getSubcategories = (parentId: string) => 
    data.categories.filter(c => c.parent_id === parentId);
  
  const sizes = {
    'clothing': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    'shoes': ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    'kids': ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14']
  };
  
  const popularBrands = [
    'Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Gap', 'Uniqlo', 
    'Forever 21', 'Urban Outfitters', 'Mango', 'COS', 'Other'
  ];
  
  function handlePhotoUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const newPhotos = Array.from(input.files);
      photos = [...photos, ...newPhotos].slice(0, 10); // Max 10 photos
      
      // Create preview URLs
      newPhotos.forEach(file => {
        const url = URL.createObjectURL(file);
        photoUrls = [...photoUrls, url];
      });
    }
  }
  
  function removePhoto(index: number) {
    photos = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoUrls[index]);
    photoUrls = photoUrls.filter((_, i) => i !== index);
  }
  
  function addTag() {
    if (currentTag.trim() && tags.length < 10) {
      tags = [...tags, currentTag.trim()];
      currentTag = '';
    }
  }
  
  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }
  
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
  
  function canProceed() {
    switch(currentStep) {
      case 1: return photos.length > 0 && title && category;
      case 2: return brand && size && condition;
      case 3: return price && shippingPrice;
      default: return false;
    }
  }
  
  let submitting = $state(false);
  let submitError = $state('');
  
  async function handleSubmit() {
    if (!data.user) {
      goto('/login');
      return;
    }

    submitting = true;
    submitError = '';

    try {
      // Debug: Check Supabase client
      console.log('Supabase client:', supabase);
      console.log('User:', data.user);
      console.log('Photos to upload:', photos.length);
      
      // Test Supabase connection
      const { data: testData, error: testError } = await supabase.from('products').select('count').limit(1);
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      console.log('Supabase connection test passed');
      
      if (photos.length === 0) {
        throw new Error('Please add at least one photo');
      }
      // Upload images to Supabase Storage
      const uploadedUrls: string[] = [];
      
      for (const [index, photo] of photos.entries()) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${data.user.id}/${Date.now()}_${index}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      // Create product in database
      console.log('Creating product with data:', {
        title,
        price: parseFloat(price),
        category_id: subcategory || category,
        condition,
        seller_id: data.user.id
      });
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title,
          description: description || null,
          price: parseFloat(price),
          category_id: subcategory || category,
          condition,
          brand: brand !== 'Other' ? brand : null,
          size: size || null,
          location: null,
          seller_id: data.user.id,
          status: 'active',
          shipping_price: parseFloat(shippingPrice || '0'),
          tags: tags.length > 0 ? tags : null
        })
        .select()
        .single();

      if (productError) throw productError;

      // Add product images
      const imageInserts = uploadedUrls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        display_order: index,
        is_primary: index === 0
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageInserts);

      if (imagesError) throw imagesError;

      // Navigate to success page with product ID
      goto(`/sell/success?id=${product.id}`);
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint
      });
      
      // More specific error messages
      let errorMessage = 'Failed to upload product. Please try again.';
      if (err?.message) {
        if (err.message.includes('storage')) {
          errorMessage = 'Failed to upload images. Check your connection.';
        } else if (err.message.includes('products')) {
          errorMessage = 'Failed to save product details. Check required fields.';
        } else if (err.message.includes('product_images')) {
          errorMessage = 'Product saved but images failed. Try editing to add images.';
        } else if (err.message.includes('authentication')) {
          errorMessage = 'Please log in again and try.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      submitError = errorMessage;
      submitting = false;
    }
  }
  
  function getStepTitle(step: number) {
    switch(step) {
      case 1: return 'Photos & Details';
      case 2: return 'Product Info';
      case 3: return 'Price & Publish';
      default: return '';
    }
  }
</script>

<svelte:head>
  <title>Sell an Item - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <!-- Page Header -->
  <div class="bg-white shadow-sm sticky top-14 sm:top-16 z-30">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center py-3">
        <div class="flex items-center space-x-3">
          <a href="/dashboard" class="text-gray-600 hover:text-gray-900 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 class="text-lg sm:text-xl font-bold text-gray-900">List an Item</h1>
        </div>
        <button class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Save Draft</button>
      </div>
    </div>
  </div>

  <!-- Progress Bar -->
  <div class="bg-white border-b">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center justify-between mb-2">
        {#each Array(totalSteps) as _, i}
          <div class="flex items-center flex-1 {i < totalSteps - 1 ? 'pr-2' : ''}">
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full 
              {currentStep > i + 1 ? 'bg-green-500' : currentStep === i + 1 ? 'bg-black' : 'bg-gray-300'}
              text-white text-xs font-medium">
              {#if currentStep > i + 1}
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              {:else}
                {i + 1}
              {/if}
            </div>
            {#if i < totalSteps - 1}
              <div class="flex-1 h-0.5 mx-2 {currentStep > i + 1 ? 'bg-green-500' : 'bg-gray-300'}"></div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex justify-between text-xs text-gray-600">
        {#each Array(totalSteps) as _, i}
          <span class="text-center {currentStep === i + 1 ? 'font-medium text-gray-900' : ''}">
            {getStepTitle(i + 1)}
          </span>
        {/each}
      </div>
    </div>
  </div>

  <!-- Form Content -->
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6">
    {#if submitError}
      <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {submitError}
      </div>
    {/if}
    {#if currentStep === 1}
      <!-- Step 1: Photos & Details -->
      <div class="bg-white rounded-lg p-4 space-y-6">
        <!-- Photos -->
        <div>
          <h2 class="text-lg font-semibold mb-2">Photos</h2>
          <div class="grid grid-cols-3 gap-2 mb-3">
            {#each photoUrls as url, i}
              <div class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src={url} alt="Upload {i + 1}" class="w-full h-full object-cover" />
                <button 
                  onclick={() => removePhoto(i)}
                  class="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {#if i === 0}
                  <span class="absolute bottom-1 left-1 px-1 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">Cover</span>
                {/if}
              </div>
            {/each}
            
            {#if photos.length < 10}
              <label class="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer">
                <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-xs text-gray-500">Add</span>
                <input type="file" accept="image/*" multiple class="hidden" onchange={handlePhotoUpload} />
              </label>
            {/if}
          </div>
        </div>

        <!-- Basic Details -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Title*</label>
            <input 
              type="text"
              bind:value={title}
              placeholder="e.g. Vintage Levi's Denim Jacket"
              maxlength="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea 
              bind:value={description}
              rows="3"
              placeholder="Describe your item..."
              maxlength="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Category*</label>
            <select 
              bind:value={category}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select category</option>
              {#each mainCategories as cat}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>
          
          {#if category}
            {@const subcategories = getSubcategories(category)}
            {#if subcategories.length > 0}
              <div>
                <label class="block text-sm font-medium mb-1">Subcategory</label>
                <select 
                  bind:value={subcategory}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select subcategory</option>
                  {#each subcategories as subcat}
                    <option value={subcat.id}>{subcat.name}</option>
                  {/each}
                </select>
              </div>
            {/if}
          {/if}
        </div>
      </div>

    {:else if currentStep === 2}
      <!-- Step 2: Product Info -->
      <div class="bg-white rounded-lg p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Brand*</label>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {#each popularBrands as b}
              <button
                onclick={() => brand = b}
                class="py-2 px-3 text-sm rounded-lg border transition-colors
                  {brand === b 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
              >
                {b}
              </button>
            {/each}
          </div>
          {#if brand === 'Other'}
            <input 
              type="text"
              placeholder="Enter brand name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          {/if}
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Size*</label>
          <select 
            bind:value={size}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Select size</option>
            {#each sizes.clothing as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
          <div class="grid grid-cols-2 gap-2">
            {#each ['new', 'like-new', 'good', 'fair'] as c}
              <button
                onclick={() => condition = c}
                class="py-3 px-4 rounded-lg border transition-colors text-left
                  {condition === c 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
              >
                <div class="font-medium capitalize text-sm">{c.replace('-', ' ')}</div>
                <div class="text-xs mt-1 {condition === c ? 'text-gray-300' : 'text-gray-500'}">
                  {#if c === 'new'}
                    Never worn, with tags
                  {:else if c === 'like-new'}
                    Worn once or twice
                  {:else if c === 'good'}
                    Minor signs of wear
                  {:else}
                    Visible wear, still good
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input 
              type="text"
              bind:value={color}
              placeholder="e.g. Blue, Red, Multi"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <input 
              type="text"
              bind:value={material}
              placeholder="e.g. Cotton, Polyester"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

    {:else if currentStep === 3}
      <!-- Step 3: Price & Publish -->
      <div class="bg-white rounded-lg p-4 sm:p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Price*</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input 
              type="number"
              bind:value={price}
              placeholder="0.00"
              step="0.01"
              min="0"
              class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Platform fee (10%): ${price ? (parseFloat(price) * 0.1).toFixed(2) : '0.00'}
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Shipping Price*</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input 
              type="number"
              bind:value={shippingPrice}
              placeholder="0.00"
              step="0.01"
              min="0"
              class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">Buyer pays shipping</p>
        </div>
        
        {#if price}
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Item Price</span>
              <span class="text-sm font-medium">${parseFloat(price).toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Shipping</span>
              <span class="text-sm font-medium">${parseFloat(shippingPrice || '0').toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Platform Fee (10%)</span>
              <span class="text-sm font-medium">-${(parseFloat(price) * 0.1).toFixed(2)}</span>
            </div>
            <div class="border-t pt-2 flex justify-between">
              <span class="font-medium">You'll Earn</span>
              <span class="font-bold text-lg">${(parseFloat(price) * 0.9).toFixed(2)}</span>
            </div>
          </div>
        {/if}
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div class="flex space-x-2 mb-2">
            <input 
              type="text"
              bind:value={currentTag}
              placeholder="Add tags to help buyers find your item"
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <Button onclick={addTag} variant="outline">Add</Button>
          </div>
          {#if tags.length > 0}
            <div class="flex flex-wrap gap-2">
              {#each tags as tag, i}
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                  #{tag}
                  <button onclick={() => removeTag(i)} class="ml-2 text-gray-500 hover:text-gray-700">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <Button 
        onclick={prevStep}
        variant="outline"
        disabled={currentStep === 1}
        class="flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Button>
      
      {#if currentStep < totalSteps}
        <Button 
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex items-center"
        >
          Next
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      {:else}
        <Button 
          onclick={handleSubmit}
          disabled={submitting}
          class="flex items-center flex-1"
        >
          {#if submitting}
            <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Publishing...
          {:else}
            Publish Listing
          {/if}
        </Button>
      {/if}
    </div>
  </div>
</div>