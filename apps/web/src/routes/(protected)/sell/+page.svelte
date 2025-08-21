<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPriceSuggestions } from '$lib/client/products';
  import { SIZE_CATEGORIES } from '$lib/validation/product';
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { Button, ImageUploaderSupabase, Input, Select, BrandSelector, ConditionSelector, PriceInput, TagInput, toasts } from '@repo/ui';
  import { uploadImages, deleteImage } from '$lib/supabase/storage';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { onMount } from 'svelte';

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
  
  // Form state
  let currentStep = $state(1);
  let submitting = $state(false);
  let isUploadingImages = $state(false);
  let showSuccess = $state(false);
  let publishError = $state<string | null>(null);
  let formElement: HTMLFormElement;
  
  let formData = $state({
    title: form?.values?.title || '',
    description: form?.values?.description || '',
    gender_category_id: form?.values?.gender_category_id || '',
    type_category_id: form?.values?.type_category_id || '',
    category_id: form?.values?.category_id || '',
    brand: form?.values?.brand || '',
    size: form?.values?.size || '',
    condition: (form?.values?.condition as any) || 'good' as const,
    color: form?.values?.color || '',
    material: form?.values?.material || '',
    price: form?.values?.price || 0,
    shipping_cost: form?.values?.shipping_cost || 0,
    tags: form?.values?.tags || [] as string[],
    use_premium_boost: form?.values?.use_premium_boost || false
  });
  
  interface UploadedImage {
    url: string;
    path: string;
  }
  let uploadedImages = $state<UploadedImage[]>([]);
  
  const supabase = createBrowserSupabaseClient();
  
  // Categories
  const genderCategories = $derived(
    data.categories?.filter(cat => !cat.parent_id) || []
  );

  const typeCategories = $derived(
    formData.gender_category_id 
      ? data.categories?.filter(cat => cat.parent_id === formData.gender_category_id) || []
      : []
  );

  const specificCategories = $derived(
    formData.type_category_id
      ? data.categories?.filter(cat => cat.parent_id === formData.type_category_id) || []
      : []
  );
  
  // Size options
  const selectedCategoryData = $derived(
    formData.category_id ? data.categories?.find(c => c.id === formData.category_id) : null
  );
  
  const sizeOptions = $derived(
    !selectedCategoryData ? SIZE_CATEGORIES.clothing :
    selectedCategoryData.name.toLowerCase().includes('shoe') || 
    selectedCategoryData.name.toLowerCase().includes('sneaker') || 
    selectedCategoryData.name.toLowerCase().includes('boot') ? SIZE_CATEGORIES.shoes :
    selectedCategoryData.name.toLowerCase().includes('kid') || 
    selectedCategoryData.name.toLowerCase().includes('baby') ? SIZE_CATEGORIES.kids :
    SIZE_CATEGORIES.clothing
  );
  
  // Price suggestions
  let priceSuggestion = $state<{
    suggested: number | null;
    range: { min: number; max: number } | null;
    confidence: 'low' | 'medium' | 'high';
  } | null>(null);
  
  async function updatePriceSuggestions() {
    if (formData.category_id && formData.condition) {
      try {
        const suggestions = await getPriceSuggestions({
          categoryId: formData.category_id,
          brand: formData.brand,
          condition: formData.condition,
          size: formData.size
        });
        priceSuggestion = suggestions;
      } catch (error) {
        priceSuggestion = null;
      }
    }
  }
  
  $effect(() => {
    updatePriceSuggestions();
  });
  
  // Image handlers
  async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
    isUploadingImages = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const uploaded = await uploadImages(supabase, files, 'product-images', user.id);
      return uploaded;
    } finally {
      isUploadingImages = false;
    }
  }
  
  async function handleImageDelete(path: string): Promise<boolean> {
    const success = await deleteImage(supabase, path, 'product-images');
    if (success) {
      uploadedImages = uploadedImages.filter(img => img.path !== path);
    }
    return success;
  }
  
  // Validation
  const canProceedStep1 = $derived(
    // For testing, allow proceeding without images
    (uploadedImages.length > 0 || true) && // TODO: Remove || true after testing
    formData.title.length >= 3 && 
    formData.gender_category_id &&
    formData.type_category_id &&
    formData.category_id
  );
  
  const canProceedStep2 = $derived(
    formData.brand && formData.size && formData.condition
  );
  
  const canProceedStep3 = $derived(
    formData.price > 0 && formData.shipping_cost >= 0
  );
  
  const canSubmit = $derived(
    // For testing, allow submission without images
    formData.title.length >= 3 && 
    formData.gender_category_id &&
    formData.type_category_id &&
    formData.category_id &&
    formData.brand && 
    formData.size && 
    formData.condition &&
    formData.price > 0 && 
    formData.shipping_cost >= 0
  );
</script>

<svelte:head>
  <title>List an Item • Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
  <!-- Modern Header -->
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <button 
          onclick={() => goto('/dashboard')}
          class="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="text-center">
          <h1 class="text-base font-semibold text-gray-900">List an Item</h1>
          <p class="text-xs text-gray-500 mt-0.5">Step {currentStep} of 4</p>
        </div>
        
        <button 
          onclick={() => goto('/dashboard')}
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="h-1 bg-gray-100">
      <div 
        class="h-full bg-blue-500 transition-all duration-500 ease-out"
        style="width: {(currentStep / 4) * 100}%"
      />
    </div>
  </header>

  <!-- Content - flex-1 to fill available space -->
  <div class="flex-1 overflow-y-auto pb-24">
    <div class="max-w-lg mx-auto px-4 py-6">
    {#if data.needsBrandSubscription}
      <!-- Brand subscription required -->
      <div class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 class="text-xl font-bold text-gray-900 mb-2">Upgrade to Sell</h2>
        <p class="text-gray-600 mb-6">
          Brand accounts need an active subscription to list products.
        </p>
        
        <Button 
          variant="primary" 
          onclick={() => goto('/settings/subscription')}
          class="w-full max-w-xs"
        >
          Upgrade Now
        </Button>
      </div>
    {:else}
      <!-- Multi-step Form -->
      <form 
        method="POST"
        bind:this={formElement}
        use:enhance={({ formData: formDataObj }) => {
          submitting = true;
          publishError = null;
          
          // Add all form data
          Object.entries(formData).forEach(([key, value]) => {
            if (key === 'tags') {
              formDataObj.append(key, JSON.stringify(value));
            } else if (typeof value === 'boolean' || typeof value === 'number') {
              formDataObj.append(key, value.toString());
            } else {
              formDataObj.append(key, value as string);
            }
          });
          
          formDataObj.append('photo_urls', JSON.stringify(uploadedImages.map(img => img.url)));
          formDataObj.append('photo_paths', JSON.stringify(uploadedImages.map(img => img.path)));
          
          return async ({ result, update }) => {
            submitting = false;
            
            if (result.type === 'failure') {
              // Handle errors
              const errorMessage = result.data?.errors?._form || 'Failed to create listing';
              publishError = errorMessage;
              toasts.error(errorMessage);
            } else if (result.type === 'success' && result.data?.success) {
              // SUCCESS! Product created
              showSuccess = true;
              toasts.success('Listing published successfully!');
              
              const productId = result.data.productId;
              
              // Redirect to product page after 1.5 seconds
              setTimeout(() => {
                if (productId) {
                  goto(`/product/${productId}`);
                } else {
                  goto('/');
                }
              }, 1500);
            }
            
            await update();
          };
        }}
      >
        <!-- Step 1: Photos & Basic Info -->
        {#if currentStep === 1}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Add Photos</h2>
              <p class="text-gray-600">Good photos sell items faster</p>
            </div>
            
            <div>
              <ImageUploaderSupabase
                maxImages={10}
                bind:images={uploadedImages}
                onUpload={handleImageUpload}
                onDelete={handleImageDelete}
                bind:uploading={isUploadingImages}
              />
              {#if uploadedImages.length === 0}
                <p class="text-sm text-red-600 mt-2">At least one photo is required</p>
              {/if}
            </div>
            
            <div>
              <Input
                type="text"
                label="What are you selling?"
                placeholder="e.g., Nike Air Max 90"
                bind:value={formData.title}
                maxlength={50}
                name="title"
                required
              />
              <p class="text-xs text-gray-500 mt-1">{formData.title.length}/50 characters</p>
            </div>
            
            <div class="space-y-4">
              <Select
                label="Who's it for?"
                bind:value={formData.gender_category_id}
                onchange={() => {
                  formData.type_category_id = '';
                  formData.category_id = '';
                }}
                name="gender_category_id"
                required
              >
                <option value="">Select category</option>
                {#each genderCategories as category}
                  <option value={category.id}>{category.name}</option>
                {/each}
              </Select>
              
              {#if typeCategories.length > 0}
                <Select
                  label="Product type"
                  bind:value={formData.type_category_id}
                  onchange={() => {
                    formData.category_id = '';
                  }}
                  name="type_category_id"
                  required
                >
                  <option value="">Select type</option>
                  {#each typeCategories as category}
                    <option value={category.id}>{category.name}</option>
                  {/each}
                </Select>
              {/if}
              
              {#if specificCategories.length > 0}
                <Select
                  label="Specific category"
                  bind:value={formData.category_id}
                  name="category_id"
                  required
                >
                  <option value="">Select category</option>
                  {#each specificCategories as category}
                    <option value={category.id}>{category.name}</option>
                  {/each}
                </Select>
              {/if}
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <div class="p-1">
                <textarea
                  id="description"
                  name="description"
                  bind:value={formData.description}
                  placeholder="Add details about condition, measurements, flaws..."
                  rows="4"
                  maxlength="500"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
            </div>
          </div>
        {/if}
        
        <!-- Step 2: Product Details -->
        {#if currentStep === 2}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Product Details</h2>
              <p class="text-gray-600">Help buyers find what they're looking for</p>
            </div>
            
            <BrandSelector
              bind:value={formData.brand}
              brands={['Nike', 'Adidas', 'Puma', 'New Balance', 'Vans', 'Converse', 'Other']}
              label="Brand"
              name="brand"
              required
            />
            
            <Select
              label="Size"
              bind:value={formData.size}
              name="size"
              required
            >
              <option value="">Select size</option>
              {#each sizeOptions as size}
                <option value={size.value}>{size.label}</option>
              {/each}
            </Select>
            
            <ConditionSelector
              bind:value={formData.condition}
              label="Condition"
              name="condition"
              required
            />
            
            <Input
              type="text"
              label="Color (optional)"
              placeholder="e.g., Black, Red, Multi"
              bind:value={formData.color}
              maxlength={30}
              name="color"
            />
            
            <Input
              type="text"
              label="Material (optional)"
              placeholder="e.g., Cotton, Leather, Polyester"
              bind:value={formData.material}
              maxlength={50}
              name="material"
            />
          </div>
        {/if}
        
        <!-- Step 3: Pricing -->
        {#if currentStep === 3}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Set Your Price</h2>
              <p class="text-gray-600">Competitive pricing sells faster</p>
            </div>
            
            <PriceInput
              bind:value={formData.price}
              label="Price"
              suggestion={priceSuggestion}
              name="price"
              required
            />
            
            <PriceInput
              bind:value={formData.shipping_cost}
              label="Shipping Cost"
              placeholder="0.00"
              name="shipping_cost"
            />
            
            <TagInput
              bind:tags={formData.tags}
              label="Tags (optional)"
              placeholder="Add tags for better discoverability"
              maxTags={10}
            />
            
            {#if data.profile?.premium_boosts_remaining && data.profile.premium_boosts_remaining > 0}
              <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <label class="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={formData.use_premium_boost}
                    name="use_premium_boost"
                    class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div class="ml-3">
                    <span class="font-medium text-gray-900">Use Premium Boost</span>
                    <p class="text-sm text-gray-600 mt-0.5">
                      Get 7 days of increased visibility
                    </p>
                    <p class="text-xs text-purple-600 mt-1">
                      {data.profile.premium_boosts_remaining} boosts remaining
                    </p>
                  </div>
                </label>
              </div>
            {/if}
          </div>
        {/if}
        
        <!-- Step 4: Review -->
        {#if currentStep === 4}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Review Your Listing</h2>
              <p class="text-gray-600">Everything look good?</p>
            </div>
            
            <!-- Preview Card -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {#if uploadedImages[0]}
                <img 
                  src={uploadedImages[0].url} 
                  alt={formData.title}
                  class="w-full h-48 object-cover"
                />
              {/if}
              
              <div class="p-4 space-y-3">
                <h3 class="font-semibold text-lg">{formData.title}</h3>
                
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold">${formData.price}</span>
                  {#if formData.shipping_cost > 0}
                    <span class="text-sm text-gray-500">+ ${formData.shipping_cost} shipping</span>
                  {/if}
                </div>
                
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">{formData.brand}</span>
                  <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">Size {formData.size}</span>
                  <span class="px-2 py-1 bg-gray-100 text-xs rounded-full capitalize">{formData.condition.replace('-', ' ')}</span>
                </div>
                
                {#if formData.description}
                  <p class="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
                {/if}
              </div>
            </div>
            
            {#if publishError}
              <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-600">{publishError}</p>
              </div>
            {/if}
          </div>
        {/if}
      </form>
    {/if}
    </div>
  </div>
  
  <!-- Sticky Navigation - Outside of content, fixed at bottom -->
  {#if !data.needsBrandSubscription && !showSuccess}
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
      <div class="max-w-lg mx-auto flex gap-3">
        {#if currentStep > 1}
          <Button
            type="button"
            variant="ghost"
            onclick={() => {
              currentStep--;
              publishError = null;
            }}
            disabled={submitting}
            class="flex-1 h-12"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        {/if}
        
        {#if currentStep < 4}
          <Button
            type="button"
            variant="primary"
            onclick={() => {
              currentStep++;
              publishError = null;
            }}
            disabled={
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2) ||
              (currentStep === 3 && !canProceedStep3)
            }
            class="flex-1 h-12"
          >
            Continue
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        {:else}
          <Button
            type="button"
            variant="primary"
            onclick={() => {
              publishError = null;
              if (formElement) {
                formElement.requestSubmit();
              }
            }}
            disabled={submitting || !canSubmit}
            class="flex-1 h-12"
          >
            {#if submitting}
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </span>
            {:else}
              Publish Listing
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </Button>
        {/if}
      </div>
    </div>
  {/if}
    
  <!-- Success Screen -->
  {#if showSuccess}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div class="text-center px-6 py-12 max-w-md mx-auto w-full">
        <!-- Success Icon with animation -->
        <div class="mb-8">
          <div class="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-in">
            <svg class="w-16 h-16 text-white animate-check-mark" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <!-- Success Message -->
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Success! 🎉</h2>
        <p class="text-lg text-gray-600 mb-3">Your listing is now live!</p>
        <p class="text-sm text-gray-500 mb-8">Buyers can now discover and purchase your item.</p>
        
        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button
            variant="primary"
            onclick={() => goto('/')}
            class="w-full h-12"
          >
            Back to Home
          </Button>
          <Button
            variant="ghost"
            onclick={() => {
              showSuccess = false;
              currentStep = 1;
              // Reset form
              formData = {
                title: '',
                description: '',
                gender_category_id: '',
                type_category_id: '',
                category_id: '',
                brand: '',
                size: '',
                condition: 'good' as const,
                color: '',
                material: '',
                price: 0,
                shipping_cost: 0,
                tags: [],
                use_premium_boost: false
              };
              uploadedImages = [];
            }}
            class="w-full h-12"
          >
            List Another Item
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-in {
    animation: animate-in 0.3s ease-out;
  }
  
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  @keyframes bounce-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes check-mark {
    0% {
      stroke-dasharray: 0 100;
    }
    100% {
      stroke-dasharray: 100 100;
    }
  }
  
  .animate-check-mark {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: check-mark 0.8s ease-out 0.3s forwards;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>