<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Use authenticated Supabase client from layout
  const supabase = data.supabase;
  
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
  let usePremiumBoost = $state(false);
  
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

    if (photos.length === 0) {
      submitError = 'Please add at least one photo';
      return;
    }

    submitting = true;
    submitError = '';

    try {
      // Prepare form data for server action
      const formData = new FormData();
      
      // Add product data
      const productData = {
        title,
        description: description || null,
        price,
        category_id: subcategory || category,
        condition,
        brand: brand !== 'Other' ? brand : null,
        size: size || null,
        shipping_cost: shippingPrice || '0',
        tags: tags.length > 0 ? tags : null,
        color: color || null,
        material: material || null
      };
      
      formData.append('productData', JSON.stringify(productData));
      
      // Add files
      for (const photo of photos) {
        formData.append('files', photo);
      }
      
      // Submit to server action
      const response = await fetch('?/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      // For SvelteKit server actions, we expect HTML or form response format
      const responseText = await response.text();
      
      // If response is HTML (form response), the action succeeded
      if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
        // Action succeeded, extract product ID from URL if needed
        // For now, just redirect to dashboard since we don't have the product ID
        goto('/dashboard');
        return;
      }

      // If it's JSON, parse it
      let actionResult;
      try {
        actionResult = JSON.parse(responseText);
      } catch (e) {
        // Action probably succeeded but returned HTML
        goto('/dashboard');
        return;
      }
      
      if (!actionResult || !actionResult.success) {
        throw new Error(actionResult?.error || 'Failed to create product');
      }

      // Handle premium boost if selected and we have actionResult
      if (usePremiumBoost && data.profile?.subscription_tier === 'premium' && actionResult?.productId) {
        // Create premium boost record
        const { error: boostError } = await supabase
          .from('premium_boosts')
          .insert({
            product_id: actionResult.productId,
            seller_id: data.user.id,
            boost_start: new Date().toISOString(),
            boost_end: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)).toISOString(), // 5 days
            boost_type: 'premium_listing'
          });

        if (boostError) {
          console.error('Error creating premium boost:', boostError);
        } else {
          // Decrement user's premium boosts remaining
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              premium_boosts_remaining: Math.max(0, (data.profile.premium_boosts_remaining || 0) - 1)
            })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Error updating premium boosts remaining:', updateError);
          }
        }
      }

      // Navigate to success page with product ID or dashboard
      if (actionResult?.productId) {
        goto(`/sell/success?id=${actionResult.productId}`);
      } else {
        goto('/dashboard');
      }
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
      case 1: return i18n.sell_photosAndDetails();
      case 2: return i18n.sell_productInfo();
      case 3: return i18n.sell_priceAndPublish();
      default: return '';
    }
  }
</script>

<svelte:head>
  <title>{i18n.sell_listItem()} - Driplo</title>
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
          <h1 class="text-lg sm:text-xl font-bold text-gray-900">{i18n.sell_listItem()}</h1>
        </div>
        <button class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg">{i18n.sell_saveDraft()}</button>
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
    {#if data.needsBrandSubscription}
      <!-- Brand Subscription Required -->
      <div class="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="text-center space-y-4">
          <div class="text-4xl">🏢</div>
          <div>
            <h3 class="text-lg font-medium text-blue-800">{i18n.sell_brandSubscriptionRequired()}</h3>
            <p class="text-blue-700 mt-1">{i18n.sell_brandSubscriptionDescription()}</p>
          </div>
          
          {#if data.plans.find(p => p.plan_type === 'brand')}
            {@const brandPlan = data.plans.find(p => p.plan_type === 'brand')}
            <div class="bg-white p-4 rounded-lg border border-blue-200">
              <div class="text-sm text-blue-800 space-y-2">
                <p><strong>{i18n.sell_brandPlanFeatures()}</strong></p>
                <div class="grid grid-cols-2 gap-2 text-left">
                  <div class="flex items-center space-x-1">
                    <span class="text-green-500">✓</span>
                    <span class="text-xs">{i18n.sell_listUnlimitedProducts()}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="text-green-500">✓</span>
                    <span class="text-xs">{i18n.sell_brandVerificationBadge()}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="text-green-500">✓</span>
                    <span class="text-xs">{i18n.sell_businessAccountFeatures()}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="text-green-500">✓</span>
                    <span class="text-xs">{i18n.sell_prioritySupport()}</span>
                  </div>
                </div>
                <div class="text-lg font-bold text-blue-900 mt-3">
                  {brandPlan.price_monthly} {brandPlan.currency}/{i18n.sell_month()}
                </div>
              </div>
            </div>
          {/if}
          
          <div class="space-y-2">
            <Button href="/dashboard/upgrade" class="w-full" size="lg">
              {i18n.sell_subscribeToBrandPlan()}
            </Button>
            <Button href="/profile/edit" variant="outline" class="w-full">
              {i18n.sell_switchToPersonalAccount()}
            </Button>
          </div>
        </div>
      </div>
    {:else}
    
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
          <h2 class="text-lg font-semibold mb-2">{i18n.sell_photos()}</h2>
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
                  <span class="absolute bottom-1 left-1 px-1 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">{i18n.sell_cover()}</span>
                {/if}
              </div>
            {/each}
            
            {#if photos.length < 10}
              <label class="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer">
                <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-xs text-gray-500">{i18n.sell_add()}</span>
                <input type="file" accept="image/*" multiple class="hidden" onchange={handlePhotoUpload} />
              </label>
            {/if}
          </div>
        </div>

        <!-- Basic Details -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">{i18n.sell_title()}*</label>
            <input 
              type="text"
              bind:value={title}
              placeholder={i18n.sell_titlePlaceholder()}
              maxlength="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">{i18n.sell_description()}</label>
            <textarea 
              bind:value={description}
              rows="3"
              placeholder={i18n.sell_descriptionPlaceholder()}
              maxlength="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">{i18n.sell_category()}*</label>
            <select 
              bind:value={category}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">{i18n.sell_selectCategory()}</option>
              {#each mainCategories as cat}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>
          
          {#if category}
            {@const subcategories = getSubcategories(category)}
            {#if subcategories.length > 0}
              <div>
                <label class="block text-sm font-medium mb-1">{i18n.sell_subcategory()}</label>
                <select 
                  bind:value={subcategory}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">{i18n.sell_selectSubcategory()}</option>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">{i18n.sell_brand()}*</label>
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
              placeholder={i18n.sell_enterBrandName()}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          {/if}
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{i18n.sell_size()}*</label>
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
            Platform fee (5%): ${price ? (parseFloat(price) * 0.05).toFixed(2) : '0.00'}
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
              <span class="text-sm text-gray-600">Platform Fee (5%)</span>
              <span class="text-sm font-medium">-${(parseFloat(price) * 0.05).toFixed(2)}</span>
            </div>
            <div class="border-t pt-2 flex justify-between">
              <span class="font-medium">You'll Earn</span>
              <span class="font-bold text-lg">${(parseFloat(price) * 0.95).toFixed(2)}</span>
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
        
        <!-- Premium Boost Selection -->
        {#if data.profile?.subscription_tier === 'premium' && data.profile?.premium_boosts_remaining > 0}
          <div class="border-t pt-6">
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <div class="flex items-start space-x-3">
                <div class="text-2xl">⭐</div>
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-yellow-800">Boost Your Listing</h3>
                  <p class="text-yellow-700 text-sm mt-1">Give your product 3-7 days of homepage visibility to reach more buyers</p>
                  
                  <div class="mt-3">
                    <label class="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        bind:checked={usePremiumBoost}
                        class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span class="text-sm font-medium text-yellow-800">
                        Use Premium Boost ({data.profile.premium_boosts_remaining} remaining)
                      </span>
                    </label>
                  </div>
                  
                  {#if usePremiumBoost}
                    <div class="mt-3 p-3 bg-white rounded border border-yellow-200">
                      <div class="text-xs text-yellow-700 space-y-1">
                        <div class="flex items-center space-x-1">
                          <span class="text-green-500">✓</span>
                          <span>Featured in homepage carousel</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <span class="text-green-500">✓</span>
                          <span>Higher search ranking</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <span class="text-green-500">✓</span>
                          <span>3-7 days of premium visibility</span>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {:else if data.profile?.subscription_tier !== 'premium'}
          <div class="border-t pt-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="flex items-start space-x-3">
                <div class="text-2xl">⭐</div>
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-800">Want More Visibility?</h3>
                  <p class="text-gray-600 text-sm mt-1">Upgrade to Premium for 10 monthly boosts and homepage features</p>
                  
                  <div class="mt-3">
                    <Button href="/dashboard/upgrade" variant="outline" size="sm">
                      View Premium Plans
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="border-t pt-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="text-center text-gray-600">
                <p class="text-sm">You've used all your premium boosts for this month.</p>
                <p class="text-xs mt-1">Boosts reset at the start of your next billing period.</p>
              </div>
            </div>
          </div>
        {/if}
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
    {/if}
  </div>
</div>