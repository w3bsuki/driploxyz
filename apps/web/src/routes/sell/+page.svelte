<script lang="ts">
  import { Button } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  
  let currentStep = $state(1);
  const totalSteps = 5;
  
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
  
  // Categories data
  const categories = {
    'Women': ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'],
    'Men': ['Shirts', 'Pants', 'Jackets', 'Shoes', 'Accessories'],
    'Kids': ['Boys', 'Girls', 'Baby', 'Shoes', 'Toys'],
    'Home': ['Decor', 'Furniture', 'Kitchen', 'Bedding'],
    'Electronics': ['Phones', 'Tablets', 'Audio', 'Gaming'],
    'Beauty': ['Makeup', 'Skincare', 'Hair', 'Fragrance']
  };
  
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
      case 1: return photos.length > 0;
      case 2: return title && category && subcategory;
      case 3: return brand && size && condition;
      case 4: return price && shippingPrice;
      case 5: return true;
      default: return false;
    }
  }
  
  function handleSubmit() {
    console.log('Submitting listing:', {
      photos, title, description, category, subcategory,
      brand, size, condition, color, material,
      price, shippingPrice, tags
    });
  }
  
  function getStepTitle(step: number) {
    switch(step) {
      case 1: return 'Photos';
      case 2: return 'Details';
      case 3: return 'Info';
      case 4: return 'Price';
      case 5: return 'Review';
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
    {#if currentStep === 1}
      <!-- Step 1: Photos -->
      <div class="bg-white rounded-lg p-4 sm:p-6">
        <h2 class="text-xl font-semibold mb-2">Add Photos</h2>
        <p class="text-sm text-gray-600 mb-6">Add up to 10 photos. First photo will be the cover.</p>
        
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          {#each photoUrls as url, i}
            <div class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img src={url} alt="Upload {i + 1}" class="w-full h-full object-cover" />
              <button 
                onclick={() => removePhoto(i)}
                class="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {#if i === 0}
                <span class="absolute bottom-1 left-1 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  Cover
                </span>
              {/if}
            </div>
          {/each}
          
          {#if photos.length < 10}
            <label class="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="text-xs text-gray-500">Add Photo</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                class="hidden"
                onchange={handlePhotoUpload}
              />
            </label>
          {/if}
        </div>
        
        <div class="bg-blue-50 p-3 rounded-lg">
          <p class="text-sm text-blue-800">
            💡 Tips: Use natural lighting, show all angles, include any flaws
          </p>
        </div>
      </div>

    {:else if currentStep === 2}
      <!-- Step 2: Basic Details -->
      <div class="bg-white rounded-lg p-4 sm:p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title*</label>
          <input 
            type="text"
            bind:value={title}
            placeholder="e.g. Vintage Levi's Denim Jacket"
            maxlength="50"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">{title.length}/50 characters</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={description}
            rows="4"
            placeholder="Describe your item: condition, measurements, material..."
            maxlength="500"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category*</label>
            <select 
              bind:value={category}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select category</option>
              {#each Object.keys(categories) as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
          
          {#if category}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subcategory*</label>
              <select 
                bind:value={subcategory}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select subcategory</option>
                {#each categories[category] as subcat}
                  <option value={subcat}>{subcat}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
      </div>

    {:else if currentStep === 3}
      <!-- Step 3: Item Info -->
      <div class="bg-white rounded-lg p-4 sm:p-6 space-y-4">
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

    {:else if currentStep === 4}
      <!-- Step 4: Pricing -->
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

    {:else if currentStep === 5}
      <!-- Step 5: Review -->
      <div class="bg-white rounded-lg p-4 sm:p-6">
        <h2 class="text-xl font-semibold mb-4">Review Your Listing</h2>
        
        <!-- Preview Card -->
        <div class="border rounded-lg p-4 mb-6">
          <div class="flex space-x-4">
            {#if photoUrls.length > 0}
              <img src={photoUrls[0]} alt={title} class="w-24 h-24 object-cover rounded-lg" />
            {/if}
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{title || 'No title'}</h3>
              <p class="text-gray-600 text-sm mt-1">{description || 'No description'}</p>
              <div class="flex items-center space-x-4 mt-2">
                <span class="font-bold text-xl">${price || '0'}</span>
                <span class="text-sm text-gray-500">{size} • {condition}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Details Summary -->
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Category</span>
            <span class="font-medium">{category} / {subcategory}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Brand</span>
            <span class="font-medium">{brand}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Condition</span>
            <span class="font-medium capitalize">{condition.replace('-', ' ')}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Shipping</span>
            <span class="font-medium">${shippingPrice}</span>
          </div>
          {#if tags.length > 0}
            <div class="flex justify-between">
              <span class="text-gray-600">Tags</span>
              <span class="font-medium">{tags.length} tags</span>
            </div>
          {/if}
        </div>
        
        <div class="bg-green-50 p-3 rounded-lg mt-6">
          <p class="text-sm text-green-800">
            ✅ Your listing is ready to go live!
          </p>
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
          class="flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Publish Listing
        </Button>
      {/if}
    </div>
  </div>
</div>